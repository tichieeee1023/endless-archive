import { ENCOUNTERS } from "../data/encounters";
import { NPCS } from "../data/npcs";
import { COMMON_CHAINS } from "../data/independentEncounters";
import { SIDE_STORIES } from "../data/sideStories";
import { UNNAMED_STATION_OPENING, unnamedStationInterludeFor } from "../data/unnamedStation";
import { eligibleEncounters } from "./encounterPool";
import type { Encounter } from "../types/encounter";
import type { LogEntry, MapNode, Status } from "../types/game";
import type { NpcId } from "../types/npc";

export interface NotebookSource {
  storyId: string; act: number; status: Status; flags: string[]; seenEncounters: string[];
  activeEncounter: string | null; affinity: Record<NpcId, number>; choices: MapNode[]; logs: LogEntry[];
}
export interface NotebookEntry { id: string; title: string; result?: string; current?: boolean }
export interface NotebookGroup { id: string; title: string; status: string; entries: NotebookEntry[]; note?: string }
export interface NotebookView { main: NotebookGroup[]; people: NotebookGroup[]; passengers: NotebookGroup[]; clues: string[] }

// Only acquired facts, never an ending recipe or the names of missing clues.
const CLUES: [string, string][] = [
  ["station_event_first_letter", "시간표의 여백에서 역 이름의 첫 획을 옮겼다."],
  ["main_manifest_proof", "두 사람이 함께 탔던 승차 기록을 수첩에 남겼다."],
  ["main_map_proof", "지도 표찰을 차표와 함께 보관했다."],
  ["main_signal_proof", "기다리는 사람에게 답하겠다는 약속을 전했다."],
  ["station_event_kept_promise", "창문 너머의 약속을 되새겼다."],
  ["main_mail_proof", "떠났던 이유가 적힌 편지를 보관했다."],
  ["main_switch_proof", "폐쇄된 선로를 다시 열 수 있는 지침의 예외를 기록했다."],
  ["main_reason_proof", "떠났던 이유와 상대가 내렸던 선택을 함께 기록했다."],
  ["main_platform_proof", "새벽역이라는 이름을 차표에 적었다."],
  ["main_lamp_proof", "두 사람의 결말은 당사자가 정하기로 했다."],
  ["station_event_full_name", "역의 이름을 되찾았다."],
  ["main_final_proof", "기억과 약속을 간직한 채 마지막 장으로 향했다."],
];
const byId = new Map(ENCOUNTERS.map(e => [e.id, e]));

/** Read-only projection of the active slot. No extra persistence or encounter mutations. */
export function buildNotebook(source: NotebookSource): NotebookView {
  const { flags, seenEncounters, activeEncounter, status, logs, storyId, affinity, act } = source;
  const known = new Set(flags);
  const active = status === "rel" ? activeEncounter : null;
  const visited = [...new Set([...seenEncounters, ...(active ? [active] : [])])];
  const visitedSet = new Set(visited);
  const actual = new Map<string, string>();
  // Logs record exactly the selected option and outcome, including failed checks.
  for (const log of logs) {
    if (log.type !== "sys") continue;
    const match = /^【([^\n]+)】\n([\s\S]+)$/.exec(log.text);
    if (match) actual.set(match[1], match[2]);
  }
  const entry = (e: Encounter): NotebookEntry => ({id:e.id, title:e.title, result:actual.get(e.title), current:e.id === active && !seenEncounters.includes(e.id)});
  const entries = (ids: readonly string[]) => visited.flatMap(id => {
    const e = byId.get(id); return e && ids.includes(id) ? [entry(e)] : [];
  });
  const offered = new Set(status === "choosing" ? source.choices.map(n => n.encounterId) : []);
  // Future eligibility is used only to distinguish an unfinished thread, not to disclose future content.
  const eligible = new Set(eligibleEncounters(ENCOUNTERS, 3, flags, seenEncounters, storyId, affinity).map(e => e.id));
  const progress = (ids: readonly string[], records: NotebookEntry[]) => {
    if (records.some(r => r.current)) return "읽는 중";
    if (ids.some(id => offered.has(id) && !visitedSet.has(id))) return "이번 페이지에서 재회 가능";
    if (ids.some(id => eligible.has(id) && !visitedSet.has(id))) return status === "finalChoice" || status === "ended" ? "미완의 이야기" : "이야기가 이어질 수 있음";
    return "이번 이야기를 마침";
  };
  const main: NotebookGroup[] = [];
  if (storyId === "unnamed_station") {
    for (let chapter = 1; chapter <= Math.min(3, act); chapter++) {
      const scenes = visited.flatMap(id => {
        const e = byId.get(id); return e?.storyId === storyId && (e.minAct ?? 1) === chapter ? [entry(e)] : [];
      });
      const beat = chapter === 1 ? UNNAMED_STATION_OPENING : unnamedStationInterludeFor(chapter, flags);
      const chosen = beat.choices.find(c => known.has(c.flag));
      if (chosen) scenes.unshift({id:`opening-${chapter}`, title:beat.title, result:`${chosen.text}\n\n${chosen.log}`});
      if (scenes.length) main.push({id:`chapter-${chapter}`,title:`제 ${chapter}막의 기록`,status:chapter < act ? "지나온 이야기" : "현재 이야기",entries:scenes});
    }
  }
  const people: NotebookGroup[] = Object.values(NPCS).flatMap(npc => {
    const ids = ENCOUNTERS.filter(e => e.npcId === npc.id).map(e => e.id);
    const records = entries(ids);
    const resolved = ["bad","normal","happy"].some(grade => known.has(`route_${npc.id}_${grade}`));
    if (!records.length && !known.has(`story_${npc.id}_met`) && !resolved && affinity[npc.id] <= 0) return [];
    const relationship = known.has(`route_${npc.id}_bad`) ? "엇갈린 인연" : known.has(`romance_${npc.id}_promise`) ? "마음을 나눈 사이" : affinity[npc.id] >= 18 ? "가까워진 사이" : "알아가는 중";
    const state = records.some(r => r.current) ? "읽는 중" : ids.some(id => offered.has(id)) ? "이번 페이지에서 재회 가능" : resolved ? "핵심 사건 마무리" : status === "finalChoice" || status === "ended" ? "미완의 이야기" : "이야기 진행 중";
    return [{id:npc.id,title:npc.name,status:state,note:`${relationship} · 호감도 ${affinity[npc.id]}`,entries:records}];
  });
  const shared = byId.get("personality_shared_table");
  if (shared && visitedSet.has(shared.id)) people.push({id:"shared-companions",title:"함께한 사람들",status:shared.id === active && !seenEncounters.includes(shared.id) ? "읽는 중" : "이번 이야기를 마침",entries:[entry(shared)]});
  const passengers: NotebookGroup[] = [];
  const grouped = new Set<string>();
  const addGroup = (id: string, title: string, ids: string[]) => {
    ids.forEach(x => grouped.add(x));
    const records = entries(ids);
    if (records.length) passengers.push({id,title,status:progress(ids,records),entries:records});
  };
  for (const story of SIDE_STORIES) addGroup(`side-${story.id}`,story.title,story.stages);
  for (const ids of COMMON_CHAINS) addGroup(ids[0],byId.get(ids[0])!.title,ids);
  for (const id of visited) {
    const e = byId.get(id);
    if (!e || e.npcId || e.storyId || grouped.has(id) || id === "personality_shared_table") continue;
    addGroup(id,e.title,[id]);
  }
  // Sort by last actual encounter, with current threads first; do not sort or mutate source arrays.
  passengers.sort((a,b) => Number(b.status === "이번 페이지에서 재회 가능") - Number(a.status === "이번 페이지에서 재회 가능") ||
    visited.indexOf(b.entries.at(-1)!.id) - visited.indexOf(a.entries.at(-1)!.id));
  return {main,people,passengers,clues:CLUES.filter(([flag])=>known.has(flag)).map(([,text])=>text)};
}
