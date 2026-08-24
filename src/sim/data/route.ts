import type { Stop } from '../types';

// The 8 West Trail: Las Cruces to Ocean Beach, ~730 miles, seventeen stops.
// Mileage is road-trip-approximate, tuned for game cadence. Everything here
// is our own writing.

export const ROUTE: Stop[] = [
  {
    id: 'las-cruces',
    name: 'Las Cruces',
    mile: 0,
    kind: 'start',
    hasShop: true,
    flavor: 'Las Cruces, New Mexico. The pecan orchards of Mesilla at your back, 730 miles of desert ahead. The van — a 1985 Econoline the company refuses to replace — ticks in the morning heat.',
  },
  {
    id: 'deming',
    name: 'Deming',
    mile: 60,
    kind: 'town',
    hasShop: true,
    flavor: 'Deming. Home of the duck races and the last honest diner for a hundred miles. Truckers at the counter warn you about the dust between here and Lordsburg.',
  },
  {
    id: 'lordsburg',
    name: 'Lordsburg',
    mile: 120,
    kind: 'town',
    hasShop: true,
    flavor: 'Lordsburg. Wind-bent signs and a motel that has seen things. This stretch of the 10 is famous for dust storms that swallow the road whole.',
  },
  {
    id: 'texas-canyon',
    name: 'Texas Canyon',
    mile: 190,
    kind: 'landmark',
    hasShop: false,
    flavor: 'Texas Canyon. Giant boulders balanced like a god’s abandoned game of marbles. The crew insists on pictures. You allow it. Morale matters out here.',
  },
  {
    id: 'tucson',
    name: 'Tucson',
    mile: 275,
    kind: 'town',
    hasShop: true,
    flavor: 'Tucson. Saguaros stand over the valley like mile markers pointing at the sky. The crew cheers. The van backfires in celebration. The desert leg is behind you; the 8 is still ahead.',
  },
  {
    id: 'picacho-peak',
    name: 'Picacho Peak',
    mile: 315,
    kind: 'landmark',
    hasShop: false,
    flavor: 'Picacho Peak. A lone spire of rock standing over the interstate like it is waiting for a wagon train two centuries late. The crew argues about whether it looks like a thumb. It looks like a thumb.',
  },
  {
    id: 'casa-grande',
    name: 'Casa Grande',
    mile: 340,
    kind: 'town',
    hasShop: true,
    flavor: 'Casa Grande. Here the 10 lets go and the 8 begins — the highway with your company’s name on it, pointed straight at the ocean. Somebody honks. Somebody cries a little. The van backfires on cue.',
  },
  {
    id: 'gila-bend',
    name: 'Gila Bend',
    mile: 410,
    kind: 'crossing',
    hasShop: true,
    flavor: 'Gila Bend. A town that sells jerky, gas, and the last honest shade for eighty miles. Beyond it, the Gila River — usually a rumor, occasionally a monster. You will find out which on the way out of town.',
  },
  {
    id: 'dateland',
    name: 'Dateland',
    mile: 480,
    kind: 'landmark',
    hasShop: false,
    flavor: 'Dateland. A date-palm oasis in the middle of nothing, and a shake stand that has kept truckers alive since before the interstate. The date shakes are not optional. They are, technically, optional.',
  },
  {
    id: 'yuma',
    name: 'Yuma',
    mile: 550,
    kind: 'crossing',
    hasShop: true,
    flavor: 'Yuma. Sunniest city on Earth, the sign says, proudly, as if daring you. Below the bluffs the Colorado River runs green and cold and wide — the last real obstacle between you and California.',
  },
  {
    id: 'center-of-the-world',
    name: 'Center of the World',
    mile: 565,
    kind: 'landmark',
    hasShop: false,
    flavor: 'Felicity, California. Population: a few. Officially the Center of the World — a Frenchman declared it and the county agreed. There is a plaque. There is a pyramid. There is nothing else for thirty miles.',
  },
  {
    id: 'imperial-dunes',
    name: 'Imperial Dunes',
    mile: 585,
    kind: 'hazard',
    hasShop: false,
    flavor: 'The Imperial Sand Dunes. Forty miles of Sahara dropped on the border by a God with a sense of humor, and the wind moves them across the highway whenever it likes.',
  },
  {
    id: 'el-centro',
    name: 'El Centro',
    mile: 610,
    kind: 'town',
    hasShop: true,
    flavor: 'El Centro. Fifty feet below sea level, and the heat sits on the valley like a lid. Lettuce fields, canals, and a shop that charges what it wants because where else would you go?',
  },
  {
    id: 'in-ko-pah',
    name: 'In-Ko-Pah Grade',
    mile: 640,
    kind: 'hazard',
    hasShop: false,
    flavor: 'Ocotillo, and the In-Ko-Pah Grade rising ahead: three thousand feet of climb through a mountain of boulders, the wind farm turning slowly on top like it has all day. The van will remember this.',
  },
  {
    id: 'jacumba',
    name: 'Jacumba',
    mile: 660,
    kind: 'town',
    hasShop: true,
    flavor: 'Jacumba Hot Springs, clinging to the border hills with the fence in plain sight. The springs are warm, the motel is older than the van, and this is the last shop before the summit.',
  },
  {
    id: 'laguna-summit',
    name: 'Laguna Summit',
    mile: 690,
    kind: 'climax',
    hasShop: false,
    flavor: 'Laguna Summit, four thousand feet. Pines — actual pines — and cold air through the vents for the first time since New Mexico. Ahead, the sign: 6% GRADE, NEXT 6 MILES. TRUCKS USE LOW GEAR. Below that, the whole coast.',
  },
  {
    id: 'ocean-beach',
    name: 'Ocean Beach',
    mile: 730,
    kind: 'finish',
    hasShop: false,
    flavor: 'Ocean Beach, San Diego. Interstate 8 runs out of continent at Sunset Cliffs Boulevard, and you park where the road gives up and the Pacific begins. The 8 dead-ends here. So, gloriously, do you.',
  },
];

export function stopAt(index: number): Stop {
  const s = ROUTE[index];
  if (!s) throw new Error(`no stop at index ${index}`);
  return s;
}

export function stopIndexById(id: string): number {
  return ROUTE.findIndex((s) => s.id === id);
}
