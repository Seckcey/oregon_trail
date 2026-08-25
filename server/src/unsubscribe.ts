// GET /unsubscribe/:token (docs/PHASE4-PLAN.md §3, §6): one click, no
// confirmation, idempotent, and the same page whether or not the token was
// ever real — nothing to probe.

export const UNSUBSCRIBE_COPY = {
  title: 'You’re off the list.',
  body: 'No more email from 8 West IT. The leaderboard keeps your nickname and score; write to privacy@8westit.com if you want those gone too.',
} as const;

export function unsubscribePage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${UNSUBSCRIBE_COPY.title}</title>
  <style>
    html { background: #f3ebd3; color: #1a1408; }
    body { margin: 0; font: 18px/1.5 Georgia, "Times New Roman", serif; }
    main { max-width: 36rem; margin: 0 auto; padding: 3rem 1.25rem; }
    h1 { font-family: Impact, "Arial Black", sans-serif; font-size: 2rem; margin: 0 0 1rem; }
    a { color: #7a2e00; }
  </style>
</head>
<body>
  <main>
    <h1>${UNSUBSCRIBE_COPY.title}</h1>
    <p>${UNSUBSCRIBE_COPY.body}</p>
    <p><a href="/">Back to the road</a></p>
  </main>
</body>
</html>
`;
}
