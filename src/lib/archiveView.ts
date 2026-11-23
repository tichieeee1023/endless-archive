import { ENDING_CATALOG, type EndingEntry, type EndingKind } from "../data/endings";
import type { NpcId } from "../types/npc";

/** Catalog-based counts preserve all previously unlocked IDs without changing save data. */
export function endingProgress(collected: Iterable<string>, kind?: Exclude<EndingKind, "legacy">) {
  const unlocked = new Set(collected);
  const entries = ENDING_CATALOG.filter((entry) => entry.kind !== "legacy" && (!kind || entry.kind === kind));
  return { collected: entries.filter((entry) => unlocked.has(entry.id)).length, total: entries.length };
}

export const ROUTE_GRADES = ["bad", "normal", "happy"] as const;
export type ArchiveGrade = (typeof ROUTE_GRADES)[number];
export const GRADE_LABELS: Record<ArchiveGrade, string> = { bad: "BAD", normal: "NORMAL", happy: "HAPPY" };

export function routeCatalogFor(npcId: NpcId): EndingEntry[] {
  return ROUTE_GRADES.map((grade) => ENDING_CATALOG.find((entry) => entry.id === `${npcId}_route_${grade}`))
    .filter((entry): entry is EndingEntry => Boolean(entry));
}

export function bonusCatalogFor(npcId: NpcId): EndingEntry | undefined {
  return ENDING_CATALOG.find((entry) => entry.id === `${npcId}_romance` && entry.kind === "bonus");
}

export function legacyCollected(collected: Iterable<string>): EndingEntry[] {
  const unlocked = new Set(collected);
  return ENDING_CATALOG.filter((entry) => entry.kind === "legacy" && unlocked.has(entry.id));
}
