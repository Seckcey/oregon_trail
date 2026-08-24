// Flavor text pools. Everything here is our own writing — the homage lives
// in the mechanics and the tone, never in borrowed names or assets.

export const CREW_NAME_POOL = [
  'Wes', 'Dot', 'Cache', 'Piper', 'Ruby', 'Sol', 'Marge', 'Ping',
  'Dusty', 'Fern', 'Bo', 'Sky', 'Kit', 'Rosa', 'Hank', 'Lupe',
];

export const SNACK_WORDS = [
  'CARNE', 'ASADA', 'BURRITO', 'TORTA', 'HORCHATA', 'TAMALE', 'CHILE',
  'SALSA', 'QUESO', 'PECAN', 'VERDE', 'ROJO', 'TACO', 'ELOTE', 'CHURRO',
  'FRIJOLES', 'CARNITAS', 'MENUDO', 'POSOLE', 'BIRRIA',
];

/** Rotating advice heard at stops — the "talk to people" of our trail. */
export const TOWN_TALK = [
  'A trucker stirs his coffee: "Dust season, you see the wall coming — you get OFF the road. Every year somebody doesn’t."',
  'The waitress refills your water jugs without asking. "Out there, water’s worth more than the van."',
  'A retiree in a bolo tie: "This road used to be the 80, you know. The 8 was the 80. Same dirt, faster fools."',
  'A kid at the gas pumps stares at the van. "Is that thing from 1985?" You nod. "Does it run?" You nod slower.',
  'The mechanic wipes his hands: "Radiator hose. Belt. Spare tire. Carry all three or carry regrets."',
  'A woman with a parrot on her shoulder: "Grueling pace saves days and spends people. Your call, captain."',
  'The motel clerk: "Gas-station sushi took a man from Ohio last month. Prettiest funeral. Dumbest cause."',
  'A rockhound near the counter: "Rest a day when they’re sick. The road will still be there. They might not."',
  'Sign on the register: IN GOD WE TRUST. EVERYONE ELSE PAYS CASH. Prices are higher out here and climbing.',
  'An old-timer nods at the horizon: "Monsoon builds all afternoon, then owns the evening. Cross the washes early."',
];

export const REST_LINES = [
  'You circle the van into shade and let the day go. The crew sleeps like the dead, which is the goal — like, not as.',
  'A rest day. Cards on the cooler lid, tortillas on the tailgate, nobody says the word "deadline."',
  'You rest. The desert does not. But today you and it call a truce.',
];

export const DRIVE_LINES = [
  'The white line unspools. Creosote and heat shimmer.',
  'Mile markers tick past like a slow metronome.',
  'Somebody finds a radio station that is only static and preaching. It stays on.',
  'The van settles into its one good speed.',
  'A hawk rides the thermals overhead, going the same way for free.',
  'Saguaro country creeps closer, one tall silhouette at a time.',
  'The horizon does its trick where it never gets any closer.',
];

export const DEATH_CAUSES = {
  'food-poisoning': 'GAS-STATION SUSHI',
  heatstroke: 'HEATSTROKE',
  snakebite: 'SNAKEBITE',
  injury: 'THE ROAD',
  thirst: 'THIRST',
  hunger: 'HUNGER',
} as const;

export const EPITAPH_DEFAULT = 'THE BEACH WAS THAT WAY.';
