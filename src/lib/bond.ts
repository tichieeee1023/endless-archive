import type { NpcId } from "../types/npc";

/** 가까운 인연의 기억이 위험한 순간에 받는 피해를 줄여 준다. */
export function bondProtection(affinity: Record<NpcId, number>): number {
  return Math.min(24, Math.floor(Math.max(0, ...Object.values(affinity)) / 2));
}
