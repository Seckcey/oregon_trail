import { describe, expect, it } from 'vitest';
import { cleanText, filterField, hasContactInfo, hasListedWord, normalise } from '../src/filter.ts';
import { WORDS } from '../src/words/list.ts';

describe('charset and collapse', () => {
  it('keeps A–Z 0–9 space . , \' ! ? - & and the curly apostrophe, drops the rest', () => {
    expect(cleanText("Rest easy, Dana! It's 730 mi & don't stop?", 60)).toBe("Rest easy, Dana! It's 730 mi & don't stop?");
    expect(cleanText('Ha ha <script>alert(1)</script> ok', 60)).toBe('Ha ha scriptalert1script ok');
    expect(cleanText('It’s fine', 60)).toBe('It’s fine');
    expect(cleanText('émoji 🌵 here', 60)).toBe('moji  here'.replace('  ', ' '));
  });
  it('collapses runs of the same character to two', () => {
    expect(cleanText('NOOOOOO!!!!!!', 60)).toBe('NOO!!');
    expect(cleanText('so    close', 60)).toBe('so close');
  });
  it('trims and cuts to the cap', () => {
    expect(cleanText('  x  ', 60)).toBe('x');
    expect(cleanText('a'.repeat(100), 60)).toHaveLength(2); // collapsed first, then cut
    expect(cleanText('abcdefghij'.repeat(10), 60)).toHaveLength(60);
  });
});

describe('contact-info reject', () => {
  it.each([
    'call 5551234567',
    'text 555-123-4567',
    '(555) 123 4567',
    'find me at example.com',
    'http://x.y',
    'https://8westit.com',
    'www.something',
    'me@example',
    'add me on snap',
    'insta: dana',
    'discord dana',
    'whatsapp me',
    'snapchat dana',
    'instagram dana',
  ])('rejects %s', (s) => {
    expect(hasContactInfo(s)).toBe(true);
  });
  it.each([
    'DAY 212, MILE 730',
    'THE 1985 VAN MADE 730 MILES',
    'SNAPPED A BELT AT DATELAND',
    'REST EASY, DANA',
    'WE WERE SO CLOSE',
    'INSTANT REGRET',
  ])('allows %s', (s) => {
    expect(hasContactInfo(s)).toBe(false);
  });
});

describe('normalisation', () => {
  it('lowercases and folds leetspeak', () => {
    expect(normalise('Sh1T')).toBe('shit');
    expect(normalise('4$$')).toBe('ass');
    expect(normalise('h3ll0')).toBe('hello');
    expect(normalise('7ru7h')).toBe('truth');
  });
  it('collapses spaced-out letters into a word', () => {
    expect(normalise('s h i t happens')).toBe('shit happens');
    expect(normalise('a s s')).toBe('ass');
  });
  it('strips non-letters', () => {
    expect(normalise('s.h.i.t')).toBe('shit');
    expect(normalise('s-h-i-t')).toBe('shit');
  });
});

describe('the word list', () => {
  it('has no duplicates and is all lowercase letters', () => {
    expect(new Set(WORDS).size).toBe(WORDS.length);
    for (const w of WORDS) expect(w).toMatch(/^[a-z]+$/);
  });
  it('every listed word hides, plain and in leet', () => {
    for (const w of WORDS) {
      expect(hasListedWord(`rest easy ${w}`), w).toBe(true);
      const leet = w.replace(/o/g, '0').replace(/i/g, '1').replace(/e/g, '3').replace(/a/g, '4').replace(/s/g, '5');
      expect(hasListedWord(`rest easy ${leet}`), leet).toBe(true);
      expect(hasListedWord(`rest easy ${w.split('').join(' ')}`), `spaced ${w}`).toBe(true);
    }
  });
  it('Scunthorpe passes; so do assassin, class, and hello', () => {
    expect(hasListedWord('SCUNTHORPE UNITED')).toBe(false);
    expect(hasListedWord('THE ASSASSIN')).toBe(false);
    expect(hasListedWord('CLASS OF 85')).toBe(false);
    expect(hasListedWord('HELLO')).toBe(false);
    expect(hasListedWord('SHITTY ROAD')).toBe(true);
  });
});

const REAL_EPITAPHS = [
  'REST EASY, DANA', 'THE BEACH WAS THAT WAY.', 'WE WERE SO CLOSE', 'GAS-STATION SUSHI, NEVER AGAIN',
  'SHOULD HAVE BOUGHT THE HOSE', 'TOLD YOU TO PACK WATER', 'THE SIX PERCENT GRADE WON', 'KANNON SAID PULL OVER',
  'DAY 41. MILE 612. NO REGRETS.', 'HERE LIES THE INTERN', 'THE VAN WAS FROM 1985 & SO WERE WE',
  'DATE SHAKES FOREVER', "DON'T FORD IT", 'BRAKES DON’T GET A VOTE', 'FIVE WENT OUT. NONE CAME BACK.',
  'SEE YOU AT SUNSET CLIFFS', 'IT WAS A DRY HEAT', 'THE DUNES HAD ALL DAY', 'NEXT TIME, THE FERRY',
  'MOM WAS RIGHT', 'HE SNAPPED A BELT AND A PROMISE', 'CEO OF NOTHING NOW', 'SYSADMIN, REBOOTED',
  'THE ROAD HAD OTHER PLANS', 'YUMA TAKES ITS TOLL', 'WE LAUGHED UNTIL PICACHO', 'STILL THIRSTY',
  'SO LONG, AND THANKS FOR THE TAMALES', 'RIP THE RADIATOR', 'BO, WES, DOT, PIPER, KIT', 'HANK DROVE',
  'ONE MORE MILE, HE SAID', 'IN-KO-PAH ATE US', 'CLASS OF 1985', 'NEVER TRUST A MOTEL ICE MACHINE',
  'LUPE HAD THE MAP UPSIDE DOWN', 'WHAT A RUN!', 'HOT? YES. DEAD? ALSO YES.', 'THE 8 WAS THE 80',
  'I SAID STEADY PACE', 'STOP FOR THE JUICE BOX', 'GRUELING WAS A MISTAKE', 'ROSA CALLED IT',
  'WE MADE 700 MILES ON HORCHATA', 'THE COOLER IS STILL OUT THERE', 'FELICITY WAS NOT', 'BEST WORST TRIP',
  'HERE LIES A BAD IDEA', 'SUNSET CLIFFS CAN WAIT', 'EL CENTRO, BELOW SEA LEVEL, BELOW US',
];

describe('a fixture of real-looking epitaphs', () => {
  it('has fifty and every one of them passes clean and visible', () => {
    expect(REAL_EPITAPHS.length).toBe(50);
    for (const e of REAL_EPITAPHS) {
      const r = filterField(e, { max: 60, min: 1 });
      expect(r, e).toEqual({ text: e, reject: null, hidden: false });
    }
  });
});

describe('filterField', () => {
  it('rejects contact info before anything else', () => {
    expect(filterField('call 555-123-4567', { max: 60, min: 1 })).toEqual({ text: 'call 555-123-4567', reject: 'no-contact', hidden: false });
  });
  it('rejects too-short results after cleaning', () => {
    expect(filterField('🌵🌵', { max: 60, min: 1 }).reject).toBe('too-short');
    expect(filterField('A', { max: 16, min: 2 }).reject).toBe('too-short');
  });
  it('hides on a listed word and still returns the text', () => {
    const r = filterField('SH1T HAPPENS', { max: 60, min: 1 });
    expect(r.hidden).toBe(true);
    expect(r.reject).toBeNull();
    expect(r.text).toBe('SH1T HAPPENS');
  });
  it('uppercases when asked', () => {
    expect(filterField('rest easy', { max: 60, min: 1, upper: true }).text).toBe('REST EASY');
  });
});
