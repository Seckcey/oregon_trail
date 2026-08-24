// The twelve original crew characters (docs/ASSET-LIST.md §4). The sim
// lets players name their five however they like; the comic casts each
// named slot with one of these faces. Looks are the tokens the placeholder
// headshots draw from until Frank's art lands.

export type HairStyle =
  | 'bandana'
  | 'natural'
  | 'trucker-cap'
  | 'straw-hat'
  | 'braid'
  | 'bald-beard'
  | 'undercut'
  | 'tousled'
  | 'long'
  | 'buzz'
  | 'sun-hat'
  | 'backwards-cap';

export type Accessory =
  | 'aviators'
  | 'round-glasses'
  | 'headphones'
  | 'mustache'
  | 'camera'
  | 'reading-glasses'
  | 'nose-ring'
  | 'rag'
  | 'earrings'
  | 'big-grin'
  | 'binoculars'
  | 'braces';

export interface CastMember {
  id: number;
  name: string;
  /** One line from the asset list, for alt text and tooltips. */
  role: string;
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  shirt: string;
  accessory: Accessory;
}

export const CAST: readonly CastMember[] = [
  { id: 1, name: 'Wes', role: 'the road boss, unflappable', skin: '#E8B892', hair: '#2B2B2B', hairStyle: 'bandana', shirt: '#4A78B5', accessory: 'aviators' },
  { id: 2, name: 'Dot', role: 'the planner, holds the clipboard', skin: '#6B4226', hair: '#1A1A1A', hairStyle: 'natural', shirt: '#FFC72C', accessory: 'round-glasses' },
  { id: 3, name: 'Cache', role: 'the sysadmin, permanently mildly alarmed', skin: '#F4D3B0', hair: '#C4552A', hairStyle: 'trucker-cap', shirt: '#8E8E8E', accessory: 'headphones' },
  { id: 4, name: 'Sol', role: 'knows every diner, laughs with his whole face', skin: '#C68B5E', hair: '#3A2418', hairStyle: 'straw-hat', shirt: '#F58220', accessory: 'mustache' },
  { id: 5, name: 'Piper', role: 'the photographer, always leaning out a window', skin: '#A9744F', hair: '#1A1A1A', hairStyle: 'braid', shirt: '#FFC72C', accessory: 'camera' },
  { id: 6, name: 'Hank', role: 'came for the beach', skin: '#F1C9A5', hair: '#EDEDED', hairStyle: 'bald-beard', shirt: '#C41E2A', accessory: 'reading-glasses' },
  { id: 7, name: 'Sky', role: 'the intern who types 140 words a minute', skin: '#EFC4A0', hair: '#2AB7A9', hairStyle: 'undercut', shirt: '#111111', accessory: 'nose-ring' },
  { id: 8, name: 'Ping', role: 'the mechanic', skin: '#F1D0A5', hair: '#1A1A1A', hairStyle: 'tousled', shirt: '#FFFFFF', accessory: 'rag' },
  { id: 9, name: 'Rosa', role: 'the navigator', skin: '#B97A57', hair: '#1F1A17', hairStyle: 'long', shirt: '#1F8FD6', accessory: 'earrings' },
  { id: 10, name: 'Bo', role: 'the new hire, eats everything', skin: '#F6D5BE', hair: '#8A5A2B', hairStyle: 'buzz', shirt: '#0C1830', accessory: 'big-grin' },
  { id: 11, name: 'Marge', role: 'the birder, notices everything', skin: '#EAC0A3', hair: '#B5B5B5', hairStyle: 'sun-hat', shirt: '#B8A77A', accessory: 'binoculars' },
  { id: 12, name: 'Kit', role: "somebody's kid, insisted on coming", skin: '#D9A377', hair: '#3B2A1A', hairStyle: 'backwards-cap', shirt: '#6A4C93', accessory: 'braces' },
];

export function castMember(id: number): CastMember {
  const idx = ((Math.round(id) - 1) % CAST.length + CAST.length) % CAST.length;
  return CAST[idx]!;
}
