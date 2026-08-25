import { ROUTE } from './data/route';
import type { Supplies, UpgradeId, Upgrades } from './types';
import { TUNING } from './types';

export type StoreItemId = 'food' | 'water' | 'fuel' | 'tire' | 'belt' | 'hose';

export interface StoreItemDef {
  id: StoreItemId;
  label: string;
  unitLabel: string;
  baseCents: number;
  qtyPerUnit: number;
  supplyKey: keyof Supplies;
}

// Every base price at the Las Cruces outfitter ends in .85. House rule.
export const STORE_ITEMS: StoreItemDef[] = [
  { id: 'food', label: 'Food', unitLabel: 'case (25 lbs)', baseCents: 1285, qtyPerUnit: 25, supplyKey: 'food' },
  { id: 'water', label: 'Water', unitLabel: 'jug (5 gal)', baseCents: 285, qtyPerUnit: 5, supplyKey: 'water' },
  { id: 'fuel', label: 'Gasoline', unitLabel: 'gallon', baseCents: 185, qtyPerUnit: 1, supplyKey: 'fuel' },
  { id: 'tire', label: 'Spare tire', unitLabel: 'tire', baseCents: 3485, qtyPerUnit: 1, supplyKey: 'tires' },
  { id: 'belt', label: 'Serpentine belt', unitLabel: 'belt', baseCents: 1185, qtyPerUnit: 1, supplyKey: 'belts' },
  { id: 'hose', label: 'Radiator hose', unitLabel: 'hose', baseCents: 985, qtyPerUnit: 1, supplyKey: 'hoses' },
];

export interface UpgradeDef {
  id: UpgradeId;
  label: string;
  /** What it does, in the player's words. */
  blurb: string;
  baseCents: number;
}

// The other counter: what a CEO's money is for. Bought once, kept for the run.
export const UPGRADE_ITEMS: UpgradeDef[] = [
  { id: 'waterTank', label: 'Bigger water tank', blurb: `carry ${TUNING.waterMax + TUNING.upgradeWaterGallons} gal instead of ${TUNING.waterMax}`, baseCents: 18485 },
  { id: 'fuelTank', label: 'Auxiliary gas tank', blurb: `carry ${TUNING.fuelTankMax + TUNING.upgradeFuelGallons} gal instead of ${TUNING.fuelTankMax}`, baseCents: 24485 },
  { id: 'cargo', label: 'Roof cargo rack', blurb: `carry ${TUNING.foodMax + TUNING.upgradeFoodLbs} lbs of food instead of ${TUNING.foodMax}`, baseCents: 12485 },
  { id: 'ac', label: 'Air conditioning', blurb: 'every day feels one heat tier cooler (the crew still drinks the same)', baseCents: 38485 },
];

export const NO_UPGRADES: Upgrades = { waterTank: false, fuelTank: false, cargo: false, ac: false };

export type Capacities = Record<keyof Supplies, number>;

/** How much the van holds, given what has been bolted onto it. */
export function capacities(upgrades: Upgrades): Capacities {
  return {
    food: TUNING.foodMax + (upgrades.cargo ? TUNING.upgradeFoodLbs : 0),
    water: TUNING.waterMax + (upgrades.waterTank ? TUNING.upgradeWaterGallons : 0),
    fuel: TUNING.fuelTankMax + (upgrades.fuelTank ? TUNING.upgradeFuelGallons : 0),
    tires: TUNING.partsMax,
    belts: TUNING.partsMax,
    hoses: TUNING.partsMax,
  };
}

function itemDef(item: StoreItemId): StoreItemDef {
  const def = STORE_ITEMS.find((i) => i.id === item);
  if (!def) throw new Error(`unknown store item ${item}`);
  return def;
}

function upgradeDef(id: UpgradeId): UpgradeDef {
  const def = UPGRADE_ITEMS.find((u) => u.id === id);
  if (!def) throw new Error(`unknown upgrade ${id}`);
  return def;
}

/** How many shops precede this stop — drives the price escalation. */
function shopNumber(stopIndex: number): number {
  let n = 0;
  for (let i = 0; i < stopIndex && i < ROUTE.length; i++) {
    if (ROUTE[i]?.hasShop) n++;
  }
  return n;
}

const ESCALATION_PER_SHOP = 1.2;

function escalate(baseCents: number, stopIndex: number): number {
  const raw = baseCents * Math.pow(ESCALATION_PER_SHOP, shopNumber(stopIndex));
  return Math.round(raw / 5) * 5;
}

function isUpgrade(item: StoreItemId | UpgradeId): item is UpgradeId {
  return UPGRADE_ITEMS.some((u) => u.id === item);
}

export function priceCentsAt(item: StoreItemId | UpgradeId, stopIndex: number): number {
  return escalate(isUpgrade(item) ? upgradeDef(item).baseCents : itemDef(item).baseCents, stopIndex);
}

export type PurchaseResult =
  | { ok: true; cash: number; supplies: Supplies }
  | { ok: false; reason: 'funds' | 'capacity' };

export function purchase(
  cash: number,
  supplies: Supplies,
  item: StoreItemId,
  units: number,
  stopIndex: number,
  caps: Capacities = capacities(NO_UPGRADES),
): PurchaseResult {
  const def = itemDef(item);
  const cost = priceCentsAt(item, stopIndex) * units;
  if (cost > cash) return { ok: false, reason: 'funds' };
  const nextQty = supplies[def.supplyKey] + def.qtyPerUnit * units;
  if (nextQty > caps[def.supplyKey]) return { ok: false, reason: 'capacity' };
  return {
    ok: true,
    cash: cash - cost,
    supplies: { ...supplies, [def.supplyKey]: nextQty },
  };
}

export type UpgradeResult =
  | { ok: true; cash: number; upgrades: Upgrades }
  | { ok: false; reason: 'funds' | 'owned' };

export function purchaseUpgrade(cash: number, upgrades: Upgrades, id: UpgradeId, stopIndex: number): UpgradeResult {
  if (upgrades[id]) return { ok: false, reason: 'owned' };
  const cost = priceCentsAt(id, stopIndex);
  if (cost > cash) return { ok: false, reason: 'funds' };
  return { ok: true, cash: cash - cost, upgrades: { ...upgrades, [id]: true } };
}

// ---------------------------------------------------------------------------
// The tune-up: cash for van condition, 25 points at a time, priced like
// everything else — higher the farther west you are.
// ---------------------------------------------------------------------------

const REPAIR_CENTS_PER_POINT = 150;
const REPAIR_MAX_POINTS = 25;
const REPAIR_MIN_POINTS = 5; // under this the mechanic won't bother

export interface RepairQuote {
  points: number;
  cents: number;
}

/** What the shop will do for the van, or null if there's nothing worth fixing. */
export function repairQuote(condition: number, stopIndex: number): RepairQuote | null {
  const points = Math.min(REPAIR_MAX_POINTS, Math.max(0, Math.round(100 - condition)));
  if (points < REPAIR_MIN_POINTS) return null;
  return { points, cents: escalate(points * REPAIR_CENTS_PER_POINT, stopIndex) };
}

export function fmtCents(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rem = Math.abs(cents % 100);
  return `$${dollars}.${rem.toString().padStart(2, '0')}`;
}
