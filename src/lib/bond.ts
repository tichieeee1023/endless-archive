import type { NpcId } from "../types/npc";

/** 가까운 인연의 기억이 위험한 순간에 받는 피해를 줄여 준다. (호감도 4점당 -1, 최대 -8) */
export function bondProtection(affinity: Record<NpcId, number>, flags: readonly string[] = []): number {
  return Math.min(8, Math.floor(Math.max(0, ...Object.entries(affinity).filter(([npc]) => !flags.includes(`route_${npc}_bad`)).map(([,value]) => value)) / 4));
}
