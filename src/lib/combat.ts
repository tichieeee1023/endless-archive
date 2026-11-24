import type { Stats } from "../types/game";
import type { BattleState } from "../types/battle";
import type { NpcId } from "../types/npc";
import { isLastBossTelegraph } from "./battlePattern";
import { bondProtection } from "./bond";

export const BASE_SKILL_COST = 10;

/** 지혜 4 초과 2점마다 집중 공격 소모가 1 줄어든다(최소 6). 시작값 4에서는 10. */
export function skillCost(wisdom: number): number {
  return Math.max(6, BASE_SKILL_COST - Math.floor(Math.max(0, wisdom - 4) / 2));
}

/** 의지: 점당 피격 피해 -0.7. */
export function willReduction(will: number): number {
  return Math.floor(will * 0.7);
}

/** 통찰: 시작값(4) 초과 1점마다 반격을 3%씩 피한다(최대 30%). */
export function evadeChance(insight: number): number {
  return Math.min(0.3, Math.max(0, insight - 4) * 0.03);
}

/** 체력 물약 회복량. 매력이 시작값을 넘으면 점당 +2. */
export function potionHeal(maxHp: number, charm: number): number {
  return Math.max(16, Math.ceil(maxHp * 0.25)) + Math.max(0, charm - 4) * 2;
}

/** 기본 공격 기본 피해(전투 시작 판정·반격 보너스 제외). */
export function basicDamage(stats: Stats, weaponPower: number): number {
  return Math.floor(stats.body * 1.8) + weaponPower + 1;
}

/** 집중 공격 기본 피해(전투 시작 판정·반격 보너스 제외). */
export function skillDamage(stats: Stats, weaponPower: number): number {
  // Specialized resonance still leads, but late stacking has diminishing returns.
  const resonancePower = Math.min(4, stats.resonance) * 2.5 + Math.min(10, Math.max(0, stats.resonance - 4)) * 1.8 + Math.max(0, stats.resonance - 14) * 1.2;
  const wisdomPower = Math.min(14, Math.max(0, stats.wisdom - 4));
  return Math.floor(resonancePower + wisdomPower) + 10 + weaponPower + 1;
}

/** 적의 다음 반격이 낼 수 있는 최대 피해(무작위 +1 포함, 강공격 예고는 제외). */
export function worstCounter(
  atk: number, stats: Stats, armorPower: number, affinity: Record<NpcId, number>, finalBoss = false, flags: readonly string[] = [],
): number {
  return Math.max(counterFloor(atk, finalBoss), atk - willReduction(stats.will) - bondProtection(affinity, flags) - armorPower + 1);
}

/** The final boss retains a small minimum counter even against stacked defense. Evasion and guard still work. */
export function counterFloor(atk: number, finalBoss = false): number {
  return finalBoss ? Math.max(1, Math.ceil(atk * 0.25)) : 1;
}
export function openingStat(stats: Stats): number { return Math.max(stats.body, stats.resonance); }
export function braceBonus(stats: Stats, weaponPower: number): number {
  return Math.max(8, Math.floor(Math.max(basicDamage(stats, weaponPower), skillDamage(stats, weaponPower)) * 0.65));
}
export type AutoAction = "brace" | "potion" | "focusPotion" | "skill" | "attack";

export interface AutoState {
  hp: number; maxHp: number; mp: number; maxMp: number;
  healthPotions: number; focusPotions: number;
  stats: Stats; weaponPower: number; armorPower: number;
  affinity: Record<NpcId, number>; flags?: string[];
}

/**
 * 자동전투의 한 번의 판단.
 * 물약은 턴을 쓰지 않으므로 "다음 반격에 쓰러질 수 있을 때만" 마시고(낭비 없음), 같은 턴 안에서 다시 판단한다.
 *  1) 지금 공격으로 적을 쓰러뜨릴 수 있으면 곧바로 공격한다(반격이 오지 않는다).
 *  2) 마지막 장의 강공격 예고 턴에는 흘려내기(피해 없음 + 다음 공격 강화).
 *  3) 다음 반격에 쓰러질 수 있고 물약이 있으면 체력 물약. 최대 체력이 아니라면 치명타 위험을 우선한다.
 *  4) 집중 공격이 기본 공격보다 강할 때만 집중 공격을 쓰고, 집중력이 모자라면 집중력 물약을 마신다.
 *  5) 그 외에는 기본 공격.
 */
export function autoBattleAction(battle: BattleState, s: AutoState): AutoAction {
  const bonus = (battle.openingRoll?.powerBonus ?? 0) + (battle.nextAttackBonus ?? 0);
  const basic = Math.max(1, basicDamage(s.stats, s.weaponPower) + bonus);
  const skill = Math.max(1, skillDamage(s.stats, s.weaponPower) + bonus);
  const cost = skillCost(s.stats.wisdom);
  const skillBetter = skill > basic;
  const canSkill = skillBetter && s.mp >= cost;
  const best = canSkill ? skill : basic;

  if (basic >= battle.enemy.hp) return "attack";
  if (best >= battle.enemy.hp) return "skill";

  if (isLastBossTelegraph(battle)) return "brace";

  const danger = worstCounter(battle.enemy.atk, s.stats, s.armorPower, s.affinity, battle.enemy.name.includes("마지막 장"), s.flags);
  if (!battle.companionGuard && s.healthPotions > 0 && s.hp <= danger) {
    if (s.hp < s.maxHp) return "potion";
  }

  if (skillBetter && s.mp < cost && s.focusPotions > 0 && skill - basic >= 4
      && s.maxMp - s.mp >= Math.max(8, Math.ceil(s.maxMp / 5)) * 0.5) return "focusPotion";
  return canSkill ? "skill" : "attack";
}
