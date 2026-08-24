import { ROUTE } from './data/route';
import type { Supplies } from './types';
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

const SUPPLY_MAX: Record<keyof Supplies, number> = {
  food: TUNING.foodMax,
  water: TUNING.waterMax,
  fuel: TUNING.fuelTankMax,
  tires: TUNING.partsMax,
  belts: TUNING.partsMax,
  hoses: TUNING.partsMax,
};

function itemDef(item: StoreItemId): StoreItemDef {
  const def = STORE_ITEMS.find((i) => i.id === item);
  if (!def) throw new Error(`unknown store item ${item}`);
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

export function priceCentsAt(item: StoreItemId, stopIndex: number): number {
  const def = itemDef(item);
  const raw = def.baseCents * Math.pow(ESCALATION_PER_SHOP, shopNumber(stopIndex));
  return Math.round(raw / 5) * 5;
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
): PurchaseResult {
  const def = itemDef(item);
  const cost = priceCentsAt(item, stopIndex) * units;
  if (cost > cash) return { ok: false, reason: 'funds' };
  const nextQty = supplies[def.supplyKey] + def.qtyPerUnit * units;
  if (nextQty > SUPPLY_MAX[def.supplyKey]) return { ok: false, reason: 'capacity' };
  return {
    ok: true,
    cash: cash - cost,
    supplies: { ...supplies, [def.supplyKey]: nextQty },
  };
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
  const raw = points * REPAIR_CENTS_PER_POINT * Math.pow(ESCALATION_PER_SHOP, shopNumber(stopIndex));
  return { points, cents: Math.round(raw / 5) * 5 };
}

export function fmtCents(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rem = Math.abs(cents % 100);
  return `$${dollars}.${rem.toString().padStart(2, '0')}`;
}
