// Identity without accounts (docs/PHASE4-PLAN.md §7): a run id minted when a
// game is created (kept in the save envelope; the idempotency key for the
// posts), and a per-browser player token that lets the same browser ask
// "which of these runs are mine?". Neither proves anything about a person.

export const PLAYER_TOKEN_KEY = '8wt.player.v1';

export function newRunId(): string {
  return crypto.randomUUID();
}

function mintPlayerToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/;

/** The browser's player token, minted once and kept; a fresh one when storage is missing or corrupt. */
export function loadPlayerToken(storage: Storage | null): string {
  try {
    const stored = storage?.getItem(PLAYER_TOKEN_KEY);
    if (stored && TOKEN_SHAPE.test(stored)) return stored;
    const token = mintPlayerToken();
    storage?.setItem(PLAYER_TOKEN_KEY, token);
    return token;
  } catch {
    return mintPlayerToken();
  }
}
