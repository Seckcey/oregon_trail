// The word list behind the automatic filter (docs/PHASE4-PLAN.md §4.1.3).
// Matched after normalisation (lowercase, leet folded, spaced letters
// collapsed, non-letters stripped): words of three letters or fewer must be
// the whole token; longer words match as a prefix ("shitty", "fucker").
// A hit hides the row for Frank's queue; the player is never told which word.
// Keep it lowercase, letters only, no duplicates — the tests check.
//
// Deliberately absent: mild oaths (damn, hell, crap) — the audience grew up
// on the original and "keep it clean" is about strangers, not sailors — and
// short words that are also names or ordinary English (dick, cock, coon).

export const WORDS: readonly string[] = [
  // profanity and its spellings
  'fuck', 'fuk', 'fck', 'fvck', 'phuck', 'fuq', 'feck',
  'shit', 'shyt', 'bullshit', 'dipshit',
  'asshole', 'arsehole', 'azz',
  'bitch', 'biatch', 'beotch', 'bytch',
  'bastard', 'motherfuck', 'cunt', 'twat', 'wanker', 'prick', 'douche',
  'piss', 'pissed', 'goddamn',
  // sexual
  'cocksuck', 'blowjob', 'handjob', 'dildo', 'penis', 'vagina', 'pussy', 'pussies',
  'boob', 'tits', 'titties', 'nipple', 'porn', 'porno', 'sex', 'sexy', 'sexual', 'horny', 'orgasm',
  'masturbat', 'cum', 'jizz', 'whore', 'slut', 'hooker', 'rape', 'rapist', 'pedo', 'pedophile',
  // slurs
  'nigg', 'negro', 'chink', 'gook', 'spic', 'wetback', 'beaner', 'kike', 'raghead', 'towelhead',
  'faggot', 'fag', 'fags', 'dyke', 'tranny', 'shemale', 'retard', 'retarded', 'spaz', 'cripple',
  'nazi', 'hitler', 'kkk', 'lynch',
  // self-harm and violence aimed at a reader
  'kys', 'killyourself', 'suicide',
];
