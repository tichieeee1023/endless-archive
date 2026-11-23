import type { StatKey, Stats } from "../types/game";

export function successChance(
  stat: StatKey, stats: Stats,
  check: { base: number; difficulty: number },
  luck = 0,
): number {
  const raw = check.base + stats[stat] * 5 - check.difficulty + 50 + luck * 4;
  return Math.max(5, Math.min(95, raw));
}

export function rollBattleDamage(base: number, weaponPower: number, luck: number) {
  const rolled = Math.floor(Math.random() * 6) + 1;
  const total = Math.min(6, rolled + luck);
  const critical = total === 6;
  const damage = Math.max(1, base + total - 3 + weaponPower + (critical ? Math.max(3, Math.floor(base * 0.25)) : 0));
  return { rolled, total, critical, damage };
}
