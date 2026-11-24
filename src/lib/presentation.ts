/** Cosmetic timing only. Never roll gameplay dice or change run state here. */
export function openingRevealMs(enabled: boolean, reducedMotion: boolean, turn: number, hasRoll: boolean): number {
  return enabled && !reducedMotion && turn === 1 && hasRoll ? 420 : 0;
}

/** A deterministic preview avoids consuming the gameplay RNG. */
export function previewDie(step: number): number {
  return ((step * 7 + 3) % 20) + 1;
}
