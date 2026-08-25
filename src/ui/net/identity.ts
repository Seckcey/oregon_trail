// Identity without accounts (docs/PHASE4-PLAN.md §7): a run id minted when a
// game is created, kept in the save envelope beside the state. It is the
// idempotency key for the memorial post. (The per-browser player token comes
// with the leaderboard in 4B.)

export function newRunId(): string {
  return crypto.randomUUID();
}
