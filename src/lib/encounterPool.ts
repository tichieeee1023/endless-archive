import type { Encounter } from "../types/encounter";

/** 사건 해금은 이야기/선택 플래그로 판정한다. 관계 플래그는 특별 만남에만 사용한다. */
export function eligibleEncounters(
  encounters: Encounter[], act: number, flags: string[], seenEncounters: string[], storyId?: string,
): Encounter[] {
  const known = new Set(flags);
  const seen = new Set(seenEncounters);
  return encounters.filter((enc) =>
    enc.weight > 0
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

export function pickWeightedEncounter(
  encounters: Encounter[], act: number, flags: string[], seenEncounters: string[],
  random: () => number = Math.random, storyId?: string,
): string | null {
  const pool = eligibleEncounters(encounters, act, flags, seenEncounters, storyId);
  if (!pool.length) return null;
  let roll = random() * pool.reduce((total, encounter) => total + encounterWeight(encounter, storyId), 0);
  for (const encounter of pool) {
    roll -= encounterWeight(encounter, storyId);
    if (roll < 0) return encounter.id;
  }
  return pool[pool.length - 1].id;
}
