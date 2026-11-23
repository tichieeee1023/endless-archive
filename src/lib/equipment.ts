import { STAT_LABEL } from "../types/game";
import type { Stats } from "../types/game";
import type { CharmEffect } from "../types/node";

function signed(amount: number) {
  return amount > 0 ? `+${amount}` : String(amount);
}

export function formatStatBonuses(bonus?: Partial<Stats>) {
  if (!bonus) return [];
  return Object.entries(bonus).flatMap(([key, amount]) => amount
    ? [`${STAT_LABEL[key as keyof Stats]} ${signed(amount)}`]
    : []);
}

export function formatCharmEffects(effects: CharmEffect[]) {
  return effects.map((effect) => {
    if (effect.kind === "stat") return `${STAT_LABEL[effect.stat]} ${signed(effect.amount)}`;
    if (effect.kind === "maxHp") return `최대 체력 ${signed(effect.amount)}`;
    if (effect.kind === "maxMp") return `최대 집중력 ${signed(effect.amount)}`;
    return `행운 ${signed(effect.amount)}`;
  });
}
