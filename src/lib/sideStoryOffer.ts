import { MEMORY_ENCOUNTERS } from "../data/memories";
import { SIDE_STORIES, SIDE_STORY_ENCOUNTERS } from "../data/sideStories";
import { COMMON_CHAINS, INDEPENDENT_ENCOUNTERS } from "../data/independentEncounters";
import { EXPANDED_STORY } from "../data/mainStory";
import type { MapNode } from "../types/game";
import { eligibleEncounters } from "./encounterPool";

/** Optional continuation, offered only on exploration pages, never replaces existing nodes. */
export function sideStoryOffer(act: number, floor: number, flags: string[], seen: string[]): { node: MapNode; flag: string } | undefined {
  if (!(flags.includes(EXPANDED_STORY) ? [3, 6, 7, 8, 10] : [3, 6, 7]).includes(floor)) return;
  const eligible = eligibleEncounters([...SIDE_STORY_ENCOUNTERS, ...INDEPENDENT_ENCOUNTERS], act, flags, seen).filter(e => e.requiresAll?.length);
  const stories = [...SIDE_STORIES, ...COMMON_CHAINS.map(stages => ({ id: stages[0], title: [...MEMORY_ENCOUNTERS, ...INDEPENDENT_ENCOUNTERS].find(e => e.id === stages[0])!.title, stages }))];
  const candidates = stories.flatMap(story => {
    const encounter = eligible.find(e => story.stages.includes(e.id));
    // Count offers in the current act, so a new chapter does not punish an earlier missed chance.
    const offers = flags.filter(f => f.startsWith(`side_offer_${act}_`) && f.endsWith(`_${story.id}`)).length;
    return encounter ? [{ story, encounter, offers, stage: story.stages.indexOf(encounter.id) }] : [];
  });
  // Give a story's last chapter a chance, then rotate fairly among other open threads.
  const chosen = candidates.sort((a,b) => a.offers - b.offers || b.stage - a.stage || b.story.stages.length - a.story.stages.length)[0];
  if (!chosen) return;
  return { node: { id: `a${act}f${floor}side`, type: "event", encounterId: chosen.encounter.id, title: chosen.story.title,
    preview: `${chosen.encounter.title} · 승객의 이야기를 이어 읽는다.` }, flag: `side_offer_${act}_${floor}_${chosen.story.id}` };
}
