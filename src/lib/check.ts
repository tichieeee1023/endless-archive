import type { StatKey, Stats } from "../types/game";

export function successChance(
  stat: StatKey, stats: Stats,
  check: { base: number; difficulty: number },
  luck = 0,
): number {
  const raw = check.base + stats[stat] * 5 - check.difficulty + 50 + luck * 4;
  return Math.max(5, Math.min(95, raw));
}

export function rollBattleOpening(body: number, luck: number, difficulty: number, bonusCap = Infinity) {
  const rolled = Math.floor(Math.random() * 20) + 1;
  const modifier = body + luck * 2;
  const total = rolled + modifier;
  const outcome = rolled === 1 ? "fumble"
    : rolled === 20 || total >= difficulty + 6 ? "great"
    : total >= difficulty ? "success" : "failed";
  const powerBonus = outcome === "great"
    ? Math.max(8, Math.floor(body * 1.2) + 3)
    : outcome === "success" ? Math.max(4, Math.floor(body * 0.75) + 2) : 0;
  return { rolled, modifier, total, difficulty, outcome, powerBonus: Math.min(powerBonus, bonusCap) } as const;
}
