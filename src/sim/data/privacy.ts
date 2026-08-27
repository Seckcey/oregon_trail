// The privacy note (docs/PHASE4-PLAN.md §5.2), verbatim. It is meant to be
// read by a twelve-year-old and their parent. Shown on the About screen;
// public/privacy.html carries the same words at /privacy.

export const PRIVACY_MAILBOX = 'privacy@8westit.com';

export const PRIVACY_NOTE: readonly string[] = [
  'What The 8 West Trail keeps',
  'The game runs in your browser. Your saved run and your crew’s memorials are stored on your own device, and you can clear them any time by clearing your browser data.',
  'If you’re online when your crew dies, the game posts your memorial — the crew’s nicknames, the mile, the cause, and your epitaph — so other players pass it on the road. That’s the whole idea. Don’t put real names, phone numbers, or anything private in there; the game will stop you from posting contact details, and anyone can report a memorial that shouldn’t be up.',
  'If you make it to Sunset Cliffs, you can put a nickname on the leaderboard. That’s all that shows.',
  'Giving us your email is optional, and it’s for grown-ups: it’s how 8 West IT sends occasional news about the company and the game. Every email has an unsubscribe link, and so does the screen where you signed up. Your email is never shown to anyone and never sold.',
  'Google Analytics stays off unless you choose “Accept analytics.” If you accept, it counts visits, game outcomes, and which ending button you use. It never receives crew nicknames, leaderboard names, email addresses, or epitaphs. Your choice is stored on this device; clear your site data to reset it. To stop bots, the game uses Cloudflare Turnstile when you post. To stop spam, we keep a scrambled version of your internet address for 30 days and then delete it; nobody can turn it back into you.',
  `Want something removed, or your email gone? Write to ${PRIVACY_MAILBOX} and say which memorial or which address. We’ll do it within a week.`,
  '8 West Ventures, LLC · updated August 2026',
];
