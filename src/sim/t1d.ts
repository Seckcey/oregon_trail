// Kannon rides with the crew and lives with Type 1 diabetes. This module
// holds the rules and the words for that, in one place, so the design stays
// what it was meant to be: awareness, handled the way a kid who lives with
// it handles it — competently, and without making it the whole story.
//
// The hard rule: Type 1 never kills Kannon in this game. The road can, the
// same as anyone. His diabetes is something he manages.
//
// Medical copy checked against the American Diabetes Association's guidance
// on hypoglycemia (the "rule of 15": 15 grams of fast-acting carbohydrate,
// recheck in 15 minutes, repeat until the number comes back) and the CDC's
// description of Type 1 (an autoimmune condition where the pancreas makes
// little or no insulin). CGMs like the Dexcom G7 warn about falling glucose.

import type { CrewMember, EventChoice, GameState } from './types';

export const KANNON = 'Kannon';

/** Bare domains, as printed on screen; the renderers add https://. */
export const T1D_LINKS = {
  ada: 'diabetes.org',
  breakthrough: 'breakthrought1d.org',
} as const;

export const T1D_RULES = {
  /** Chance per driving day, once Kannon is aboard and past the first stretch. */
  dailyChance: 0.12,
  /** The alert waits until the run has actually begun. */
  minMile: 20,
  /** Miles lost by pulling over for fifteen minutes (a little). */
  pullOverMiles: 10,
  /** Miles lost by pretending it's fine, then pulling over anyway (more). */
  lateMiles: 25,
  /** Health Kannon loses when the low gets ahead of him — never below 1. */
  lateHealth: 5,
} as const;

export function isKannon(member: CrewMember): boolean {
  return member.name.trim().toLowerCase() === KANNON.toLowerCase();
}

export function kannonIndex(s: GameState): number {
  return s.crew.findIndex(isKannon);
}

export function kannonAboard(s: GameState): boolean {
  const k = kannonIndex(s);
  return k >= 0 && (s.crew[k]?.alive ?? false);
}

const LINKS_LINE = `Learn more, or help: American Diabetes Association (${T1D_LINKS.ada}) · Breakthrough T1D, formerly JDRF (${T1D_LINKS.breakthrough}).`;

export const DEXCOM = {
  title: 'A BUZZ FROM THE BACK SEAT',
  alert: [
    'Kannon’s phone buzzes twice, and then his arm buzzes with it: the Dexcom sensor on the back of his arm says LOW, with an arrow pointing down.',
    'Type 1 diabetes — his pancreas makes no insulin, so he runs the numbers himself: a sensor on his arm, a dose for every meal, and a juice box for moments exactly like this one. He has done this a thousand times. The van is also doing sixty.',
  ],
  choices: [{ label: 'Pull over. Juice box and fifteen minutes.' }, { label: 'He says he’s fine. Keep rolling.' }] as EventChoice[],
  pullOverLine:
    'You pull off at the next wide spot. Juice box, fifteen grams of fast sugar, fifteen minutes on the tailgate while the sensor catches up. The arrow turns around. Kannon rolls his eyes at the fuss, which is how you know he’s fine.',
  lesson15: [
    'The rule of 15: fifteen grams of fast-acting carbs, wait fifteen minutes, check again. Repeat until the number comes back. Everybody in the van knows it now.',
    'Kannon lives with Type 1 diabetes. He handles it like it’s nothing. It isn’t nothing.',
    LINKS_LINE,
  ],
  lateLine:
    'Twenty minutes later he’s shaky and sweating and quiet, which is worse than talking. You pull over anyway — it always ends with pulling over — and it takes longer this way. Juice box, fifteen minutes, then fifteen more.',
  lessonLate: [
    'The alert is the whole point. The next time it buzzes, that IS the emergency, and the fix is a juice box and fifteen minutes — before he feels it, not after.',
    'The rule of 15: fifteen grams of fast-acting carbs, wait fifteen minutes, check again. Kannon lives with Type 1 diabetes, and he handles it — when the van lets him.',
    LINKS_LINE,
  ],
} as const;

export const INSULIN_COOLER_LINES = [
  'Kannon moves his insulin from the glove box to the cooler, next to the horchata. Insulin doesn’t survive a 110-degree van, and neither does the argument about whose turn it is to buy ice.',
  'Piper takes a picture of the cooler. Dot writes ICE on the clipboard. The desert, briefly, is outvoted.',
] as const;

export const SNACK_CARB_LINE =
  'Kannon counts the carbs on the tortas and doses for them without looking up. Carb counting is a superpower. He just has it.';

export const ABOUT_T1D_LINES = [
  'KANNON — in the van, on the crew, and in the family — lives with Type 1 diabetes: an autoimmune condition where the pancreas makes little or no insulin. He manages it with a sensor on his arm, insulin for every meal, and a juice box for the lows. He handles it like it’s nothing. It isn’t nothing.',
  LINKS_LINE,
] as const;
