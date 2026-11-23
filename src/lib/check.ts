import type { StatKey, Stats } from "../types/game";

export function successChance(
  stat: StatKey, stats: Stats,
  check: { base: number; difficulty: number },
): number {
  const raw = check.base + stats[stat] * 5 - check.difficulty + 50;
  return Math.max(5, Math.min(95, raw));
}