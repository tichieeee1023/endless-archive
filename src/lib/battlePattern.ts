import type { BattleState } from "../types/battle";

/** The final boss telegraphs a heavy counter every third player turn. */
export function isLastBossTelegraph(battle: BattleState | null | undefined): boolean {
  return Boolean(battle
    && battle.enemy.name.includes("마지막 장")
    && battle.turn % 3 === 0);
}
