/** A route opens through observation, not through affection. */
export const STORY_PROGRESS: Record<string, string> = {
  rael_encounter_1: "story_rael_met", rael_encounter_2: "story_rael_clue",
  seon_1: "story_seon_met", seon_2: "story_seon_clue",
  kairu_1: "story_kairu_met", kairu_2: "story_kairu_clue",
};

/** Upgrade old v6 saves conservatively. Never invent a grade from an old love ending. */
export function migrateStoryProgress(flags: string[], seen: string[]): string[] {
  const result = new Set(flags);
  for (const [encounter, progress] of Object.entries(STORY_PROGRESS)) {
    const npc = encounter.startsWith("rael") ? "rael" : encounter.startsWith("seon") ? "seon" : "kairu";
    const stage = encounter.endsWith("_2") ? 2 : 1;
    if (seen.includes(encounter) || result.has(`bond_${npc}_${stage}`)) result.add(progress);
  }
  return [...result];
}
