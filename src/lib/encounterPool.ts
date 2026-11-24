import type { NpcId } from "../types/npc";
import type { Encounter } from "../types/encounter";
import { SIDE_STORIES } from "../data/sideStories";

/** 사건 해금은 이야기/선택 플래그로 판정한다. 관계 플래그는 특별 만남에만 사용한다. */
export function eligibleEncounters(
  encounters: Encounter[], act: number, flags: string[], seenEncounters: string[], storyId?: string, affinity?: Record<NpcId, number>,
): Encounter[] {
  const known = new Set(flags);
  const seen = new Set(seenEncounters);
  return encounters.filter((enc) =>
    enc.weight > 0
    && (!enc.npcId || !known.has(`route_${enc.npcId}_bad`))
    && (!enc.minAffinity || (enc.npcId && (affinity?.[enc.npcId] ?? 0) >= enc.minAffinity))
    && (!enc.minAct || act >= enc.minAct)
    && (!enc.storyId || enc.storyId === storyId)
    && (enc.once === false || !seen.has(enc.id))
    && !enc.requiresAll?.some((flag) => !known.has(flag))
    && !enc.requiresNone?.some((flag) => known.has(flag)),
  );
}

/**
 * 인물 첫 조우는 우연을 유지하되, 진행 중인 사건의 다음 장은 덜 놓치도록 보정한다.
 * 특정 인물, 로맨스 플래그, 일일 확정 출현에 의존하지 않는다.
 */
export function encounterWeight(enc: Encounter, storyId?: string): number {
  if (enc.storyId && enc.storyId === storyId) return enc.weight * 2.5;
  if (enc.npcId && enc.kind === "chain") return enc.weight * 2;
  if (enc.npcId && enc.kind === "npc" && !enc.requiresAll?.length) return enc.weight * 1.5;
  if (!enc.npcId && enc.requiresAll?.length) return enc.weight * 1.5;
  return enc.weight;
}

const LONG_STARTS = new Set(SIDE_STORIES.filter(s => s.stages.length > 1).map(s => s.stages[0]));

/** A random exploration choice is distinct from the visible, optional reunion choices. */
export function explorationPool(pool: Encounter[], offeredIds: readonly string[]): Encounter[] {
  const offered = new Set(offeredIds);
  return pool.filter(e => !offered.has(e.id));
}

/** Contextual odds, not guaranteed meetings. Keep room for both passengers and companions. */
export function explorationWeights(pool: Encounter[], act: number, seen: readonly string[], storyId?: string): number[] {
  const recentlyMet = seen.slice(-8);
  const weights = pool.map(e => {
    let w = encounterWeight(e, storyId);
    if (LONG_STARTS.has(e.id)) w *= act === 1 ? 2.5 : act === 2 ? 1.5 : 1;
    if (e.npcId && e.kind === "npc" && !e.requiresAll?.length) w *= act === 1 ? 2 : 1.4;
    // Nonessential conversations with the same person should not crowd out new discoveries.
    if (e.npcId && e.companionKind && e.companionKind !== "special" && recentlyMet.filter(id => id.startsWith(`companion_${e.npcId}_`)).length >= 2) w *= 0.6;
    return w;
  });
  const npcTotal = weights.reduce((sum, w, i) => sum + (pool[i].npcId ? w : 0), 0);
  const otherTotal = weights.reduce((sum, w, i) => sum + (pool[i].npcId ? 0 : w), 0);
  if (!npcTotal || !otherTotal) return weights;
  const share = npcTotal / (npcTotal + otherTotal);
  const target = Math.max(act === 1 ? 0.25 : 0.22, Math.min(0.50, share));
  const scale = target * otherTotal / ((1 - target) * npcTotal);
  return weights.map((w, i) => pool[i].npcId ? w * scale : w);
}

export function pickWeightedEncounter(
  encounters: Encounter[], act: number, flags: string[], seenEncounters: string[],
  random: () => number = Math.random, storyId?: string, affinity?: Record<NpcId, number>,
  offeredIds: readonly string[] = [],
): string | null {
  const pool = explorationPool(eligibleEncounters(encounters, act, flags, seenEncounters, storyId, affinity), offeredIds);
  if (!pool.length) return null;
  const weights = explorationWeights(pool, act, seenEncounters, storyId);
  let roll = random() * weights.reduce((total, w) => total + w, 0);
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll < 0) return pool[i].id;
  }
  return pool[pool.length - 1].id;
}
