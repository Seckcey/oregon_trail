import { ROUTE } from './data/route';
import { addCondition } from './health';
import { chance, nextInt, pick } from './rng';
import type { GameState } from './types';
import { TUNING } from './types';

// Pool events: the road's daily menu of trouble and small mercies.
// Each fires against the draft state and returns the notice text.
// Storms and running dry are handled separately in game.ts — everything
// here is a "notice" event with its effects applied on the spot.

export interface PoolEvent {
  id: string;
  once?: boolean;
  when(s: GameState): boolean;
  weight(s: GameState): number;
  fire(s: GameState): string[];
}

/** Mile of the last shop-stop at or behind the given mile. */
export function lastShopMile(mile: number): number {
  let best = 0;
  for (const stop of ROUTE) {
    if (stop.hasShop && stop.mile <= mile) best = stop.mile;
  }
  return best;
}

function aliveIndices(s: GameState): number[] {
  return s.crew.map((m, i) => (m.alive ? i : -1)).filter((i) => i >= 0);
}

function randomAlive(s: GameState): number {
  const idxs = aliveIndices(s);
  return idxs[nextInt(s.rng, 0, idxs.length - 1)]!;
}

function segmentBounds(s: GameState): { lo: number; hi: number } {
  const next = ROUTE[s.nextStopIndex];
  const prev = ROUTE[s.nextStopIndex - 1];
  return { lo: prev ? prev.mile : 0, hi: next ? next.mile - 1 : s.mile };
}

function healAll(s: GameState, points: number): void {
  for (let i = 0; i < s.crew.length; i++) {
    const m = s.crew[i]!;
    if (m.alive) s.crew[i] = { ...m, health: Math.min(100, m.health + points) };
  }
}

export const POOL_EVENTS: PoolEvent[] = [
  {
    id: 'flat-tire',
    when: () => true,
    weight: (s) => (s.pace === 'grueling' ? 2.5 : 1.5),
    fire: (s) => {
      if (s.supplies.tires > 0) {
        s.supplies.tires -= 1;
        return [
          'BANG. A rear tire gives up on the shoulder.',
          'You swap in the spare in the gravel while trucks shake the van in passing. Twenty hot minutes. Could have been worse.',
        ];
      }
      s.van.condition = Math.max(5, s.van.condition - 10);
      return [
        'BANG. A rear tire gives up — and there is no spare.',
        'You limp on the donut for the rest of the day. The van takes it personally.',
      ];
    },
  },
  {
    id: 'radiator',
    when: (s) => (s.weatherToday?.heat ?? 0) >= 2,
    weight: () => 1.5,
    fire: (s) => {
      if (s.supplies.hoses > 0) {
        s.supplies.hoses -= 1;
        s.supplies.water = Math.max(0, s.supplies.water - 3);
        return [
          'Steam from under the hood: the radiator hose has split in the heat.',
          'You fit the spare hose, sacrifice three gallons of drinking water to the radiator gods, and roll on.',
        ];
      }
      s.van.condition = Math.max(5, s.van.condition - 15);
      s.supplies.water = Math.max(0, s.supplies.water - 5);
      return [
        'Steam from under the hood: the radiator hose has split, and you have no spare.',
        'Duct tape, a prayer, five gallons of water. The van forgives nothing.',
      ];
    },
  },
  {
    id: 'belt',
    when: () => true,
    weight: (s) => (s.van.condition < 70 ? 1.5 : 0.8),
    fire: (s) => {
      if (s.supplies.belts > 0) {
        s.supplies.belts -= 1;
        return [
          'A shriek, then silence from the alternator: the serpentine belt has shredded.',
          'You had a spare. The desert is briefly disappointed in its luck.',
        ];
      }
      s.van.condition = Math.max(5, s.van.condition - 15);
      return [
        'A shriek from the engine bay: the serpentine belt has shredded, and the spare is a memory.',
        'You rig it and drive gently, electrics flickering like a bad omen.',
      ];
    },
  },
  {
    id: 'sushi',
    when: (s) => s.mile - lastShopMile(s.mile) < 20 && aliveIndices(s).length > 0,
    weight: () => 2,
    fire: (s) => {
      const i = randomAlive(s);
      s.crew[i] = addCondition(s.crew[i]!, 'food-poisoning', 3);
      return [
        `${s.crew[i]!.name} bought sushi. At a gas station. In the desert.`,
        `${s.crew[i]!.name} has food poisoning. The next few days will be long, and the van has one bathroom, which is the desert.`,
      ];
    },
  },
  {
    id: 'heatstroke',
    when: (s) => (s.weatherToday?.heat ?? 0) === 3 && aliveIndices(s).length > 0,
    weight: () => 1.5,
    fire: (s) => {
      const i = randomAlive(s);
      s.crew[i] = addCondition(s.crew[i]!, 'heatstroke', 2);
      return [
        `The heat gets inside ${s.crew[i]!.name} at a rest stop and will not leave.`,
        `${s.crew[i]!.name} has heatstroke. Shade, water, and no arguments.`,
      ];
    },
  },
  {
    id: 'snake',
    when: (s) => aliveIndices(s).length > 0,
    weight: () => 0.8,
    fire: (s) => {
      const i = randomAlive(s);
      s.crew[i] = addCondition(s.crew[i]!, 'snakebite', 3);
      return [
        `${s.crew[i]!.name} reached into the wrong shade at a rest stop.`,
        `Rattlesnake. ${s.crew[i]!.name} is bitten — swelling, chills, a bad stretch coming. Rest would help.`,
      ];
    },
  },
  {
    id: 'speed-trap',
    when: (s) => s.pace === 'grueling' && s.cash > 0,
    weight: () => 1.5,
    fire: (s) => {
      const fine = Math.min(s.cash, 8500);
      s.cash -= fine;
      return [
        'Lights in the mirror. The trooper looks at the van, then at you, then at the van again.',
        `Eighty-five dollars for the pace you were keeping. He wishes you a safe trip to the beach.`,
      ];
    },
  },
  {
    id: 'thief',
    when: (s) => s.mile - lastShopMile(s.mile) < 15,
    weight: () => 0.8,
    fire: (s) => {
      const foodLost = Math.round(s.supplies.food * 0.1);
      const waterLost = Math.round(s.supplies.water * 0.1);
      s.supplies.food = Math.max(0, s.supplies.food - foodLost);
      s.supplies.water = Math.max(0, s.supplies.water - waterLost);
      return [
        'Someone went through the van in the motel lot last night.',
        `Gone: ${foodLost} lbs of food and ${waterLost} gallons of water. Left behind: a lesson about locking up.`,
      ];
    },
  },
  {
    id: 'ransomware',
    once: true,
    when: (s) => s.mile > 40,
    weight: () => 2,
    fire: (s) => {
      const fee = Math.min(s.cash, 18500);
      s.cash -= fee;
      return [
        'The work laptop pings on truck-stop wifi: every file encrypted, a countdown, a wallet address.',
        'A guy two booths over "knows computers." He charges $185 and mostly fixes it.',
        '8 West IT 365 customers would’ve been fine.',
      ];
    },
  },
  {
    id: 'wrong-turn',
    when: () => true,
    weight: () => 1,
    fire: (s) => {
      const { lo } = segmentBounds(s);
      const back = Math.min(15, s.mile - lo);
      s.mile -= back;
      return [
        'The shortcut was not a shortcut.',
        `An argument about the map ends ${back} miles behind where it started.`,
      ];
    },
  },
  {
    id: 'tailwind',
    when: () => true,
    weight: () => 1,
    fire: (s) => {
      const { hi } = segmentBounds(s);
      const bonus = Math.min(10, Math.max(0, hi - s.mile));
      s.mile += bonus;
      return [
        'A tailwind, an empty road, and every light in town green.',
        `The van finds ${bonus} bonus miles it has been hiding since 1985.`,
      ];
    },
  },
  {
    id: 'pecan-stand',
    once: true,
    when: (s) => s.mile < 60,
    weight: () => 1.5,
    fire: (s) => {
      s.supplies.food = Math.min(TUNING.foodMax, s.supplies.food + 30);
      return [
        'A roadside stand outside Mesilla: pecans, green chile, and a woman who refuses to let you pay full price.',
        'Thirty pounds of provisions ride shotgun. The van smells incredible.',
      ];
    },
  },
  {
    id: 'historic-80',
    once: true,
    when: (s) => s.mile >= 100 && s.mile <= 190,
    weight: () => 1.5,
    fire: (s) => {
      healAll(s, 3);
      return [
        'A brown sign by a forgotten frontage road: HISTORIC US ROUTE 80.',
        'The 8 was the 80, once — the same dirt that ran clear to the coast. The crew goes quiet in a good way. Everyone feels a little better about the mission.',
      ];
    },
  },
  {
    id: 'border-checkpoint',
    once: true,
    when: (s) => s.mile >= 590 && s.mile <= 700,
    weight: () => 1.5,
    fire: () => [
      'A Border Patrol checkpoint across every lane of the 8. The dog takes a professional interest in the carnitas.',
      'Twenty minutes, a few questions, a wave-through. The dog looks personally disappointed.',
    ],
  },
  {
    id: 'sea-level',
    once: true,
    when: (s) => s.mile >= 600 && s.mile <= 635,
    weight: () => 1.5,
    fire: (s) => {
      s.supplies.water = Math.max(0, s.supplies.water - 2);
      healAll(s, 2);
      return [
        'A green sign on the shoulder: SEA LEVEL. You are below it, and still dropping.',
        'Someone passes the jug around on principle. Everyone drinks. Everyone feels, briefly, like a submarine.',
      ];
    },
  },
];

/**
 * Maybe fire one pool event for the day. Returns the event id and its notice lines, or null.
 * Consumes RNG deterministically.
 */
export interface FiredEvent {
  id: string;
  lines: string[];
}

export function rollPoolEvent(s: GameState): FiredEvent | null {
  if (!chance(s.rng, 0.3)) return null;
  const eligible = POOL_EVENTS.filter(
    (e) => e.when(s) && !(e.once && s.usedEventIds.includes(e.id)),
  );
  if (eligible.length === 0) return null;
  const weights = eligible.map((e) => e.weight(s));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = (nextInt(s.rng, 0, 9999) / 10000) * total;
  let chosen = eligible[eligible.length - 1]!;
  for (let i = 0; i < eligible.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) {
      chosen = eligible[i]!;
      break;
    }
  }
  if (chosen.once) s.usedEventIds.push(chosen.id);
  return { id: chosen.id, lines: chosen.fire(s) };
}

export { pick };
