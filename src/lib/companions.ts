import { EXPANDED_STORY } from "../data/mainStory";
import type { Encounter } from "../types/encounter";
import type { MapNode } from "../types/game";
import type { NpcId } from "../types/npc";
import { ENCOUNTERS } from "../data/encounters";
import { NPCS } from "../data/npcs";
import { eligibleEncounters } from "./encounterPool";

export const BOSS_SUPPORT_AFFINITY = 8;
const NPC_ORDER: NpcId[] = ["rael", "seon", "kairu"];
const MEMORY_IDS = new Set(["rael_tea", "rael_watch", "seon_bandage", "seon_home", "kairu_name", "kairu_promise"]);
export function companionFor(affinity: Record<NpcId, number>, flags: string[]): NpcId | undefined {
  return NPC_ORDER.filter(npc => affinity[npc] >= BOSS_SUPPORT_AFFINITY && !flags.includes(`route_${npc}_bad`))
    .sort((a,b) => affinity[b] - affinity[a])[0];
}

/** Extra choice only, not a replacement for seeded map nodes. No first meetings are forced. */
export function reunionOffer(act: number, floor: number, flags: string[], seen: string[], storyId: string, affinity: Record<NpcId, number>): { node: MapNode; flag: string } | undefined {
  if (!(flags.includes(EXPANDED_STORY) ? (act === 3 ? [3, 6, 7, 8, 10] : [3, 6, 7, 10]) : [3, 6, 7]).includes(floor)) return;
  const eligible = eligibleEncounters(ENCOUNTERS, act, flags, seen, storyId, affinity).filter(e =>
    e.npcId && (e.kind === "chain" || MEMORY_IDS.has(e.id) || (e.companionKind === "special" || e.companionKind === "romance")) && !flags.includes(`route_${e.npcId}_bad`));
  const prefix = `reunion_offer_${act}_`;
  const count = (npc: NpcId) => flags.filter(f => f.startsWith(prefix) && f.endsWith(`_${npc}`)).length;
  const priority = (e: Encounter) => e.kind === "chain" ? 0 : MEMORY_IDS.has(e.id) ? 1 : 2;
  const romantic = eligible.filter(e => e.companionKind === "romance");
  const pool = act === 3 && floor === 10 && romantic.length ? romantic : eligible;
  const chosen = pool.sort((a,b) => count(a.npcId!) - count(b.npcId!) || priority(a)-priority(b)
    || (a.minAct ?? 1)-(b.minAct ?? 1) || NPC_ORDER.indexOf(a.npcId!) - NPC_ORDER.indexOf(b.npcId!))[0];
  if (!chosen?.npcId) return;
  const npc = NPCS[chosen.npcId];
  return { node: { id:`a${act}f${floor}reunion`, type:"event", encounterId:chosen.id, title:chosen.companionKind === "romance" ? `${npc.name}와 함께하는 시간` : `${npc.name}와의 재회`, preview:`${chosen.title} · 이 이야기를 이어 읽을 수 있다.` }, flag:`${prefix}${floor}_${npc.id}` };
}

/** High affinity changes trust, never implies romance. Only an explicit promise unlocks romantic text. */
const CORE_REPLIES: Record<string, string> = {
  rael_encounter_2: "라엘은 당신을 알아보고 손목을 감추려던 손을 멈춘다. “당신께는 숨기는 것이 더 어려워졌군요.”",
  rael_registry: "라엘이 장부를 당신 앞에 펼친다. “이번에는 함께 확인해 주시겠습니까?”",
  rael_encounter_3: "라엘은 문 앞에서 당신의 발걸음을 기다린다. “이 선택만큼은 제 뜻을 말씀드리고 싶습니다.”",
  seon_2: "세온은 무너진 성벽을 바라보다 당신 쪽으로 몸을 돌린다. “네가 묻는다면, 이번엔 좀 더 말할 수 있을 것 같아.”",
  seon_signal: "세온은 신호를 놓치지 않으려는 듯 당신을 부른다. “같이 확인해 줄래? 혼자서는 보고 싶은 것만 볼지도 몰라.”",
  seon_3: "세온이 검을 고쳐 쥐며 말한다. “네가 여기까지 와 준 건 알아. 이제 내가 결정할 차례야.”",
  kairu_2: "카이루는 당신이 다가오자 책을 펼쳐 보인다. “이 부분은 네게도 읽어 달라고 하고 싶었어.”",
  kairu_colophon: "카이루가 빈칸을 가리킨다. “같이 읽되, 내 이름은 내가 쓰고 싶어.”",
  kairu_3: "카이루는 책장의 가장자리를 붙잡고 당신을 바라본다. “내 선택을 듣고 기다려 줄 수 있지?”",
  rael_tea: "라엘이 당신의 자리를 미리 비워 둔다. “오늘은 차가 식기 전에 오셨군요.”",
  rael_watch: "라엘은 시계를 손에 쥔 채 당신에게 다가온다. “이번에는 이 침묵이 두렵지 않습니다.”",
  seon_bandage: "세온이 당신을 보자 멋쩍게 웃는다. “이번엔 도움을 청하는 게 좀 빠르지?”",
  seon_home: "세온은 창가 자리를 내어 주며 말한다. “오늘은 고향 이야기를 네게 들려주고 싶었어.”",
  kairu_name: "카이루의 목소리가 당신의 발소리를 알아듣는다. “왔구나. 네가 부르는 이름은 이제 낯설지 않아.”",
  kairu_promise: "카이루는 닫힌 수첩을 당신에게 돌려준다. “네가 말할 때까지 기다리는 것도 이제 꽤 좋아.”",
};
const ROMANCE_DAILY_REPLIES: Record<string, string> = {
  companion_rael_tea_taste: "라엘이 당신 쪽으로 찻잔을 옮긴다. “연인께 추천할 차라면 조금 더 고민하게 되는군요.”",
  companion_rael_day_off: "“오늘은 연인과 보내는 휴일이라 적어도 되겠습니까?” 라엘은 당신의 대답을 기다린다.",
  companion_rael_passenger: "라엘은 당신 곁의 자리를 가리킨다. “오늘은 여기 앉고 싶습니다. 괜찮으시다면요.”",
  companion_seon_bread: "세온은 웃으며 빵을 건넨다. “좋아하는 사람이랑 먹으면 고향 맛도 조금 달라지는 것 같아.”",
  companion_seon_no_sword: "“연인하고 산책하는데 검까지 챙길 필요는 없겠지.” 세온이 가볍게 웃는다.",
  companion_seon_birthday: "세온은 달력에 작은 동그라미를 그린다. “우리가 서로 마음을 말한 날도 기억해 둘까?”",
  companion_kairu_taste: "카이루는 당신의 표정을 살핀다. “좋아하는 사람과 나누는 맛이라고 책에 적으면, 이런 기분까지 전해질까?”",
  companion_kairu_handwriting: "카이루가 당신 쪽으로 펜을 내민다. “연인한테 편지를 쓸 때도 내 글씨로 쓰고 싶어.”",
  companion_kairu_blank_day: "“오늘은 우리가 연인이라는 것 말고는 아무것도 정해 두지 않을래.” 카이루가 창밖을 바라보며 웃는다.",
};
export function encounterDialogue(e: Encounter, affinity: Record<NpcId, number>, flags: string[]): string {
  if (!e.npcId) return e.text;
  const npc = e.npcId;
  if (e.id === "boss_companion_kairu" && flags.includes("kairu_returned")) return "마지막 장 앞에서 책 속의 목소리가 당신을 부른다. “나는 이 안에 있지만, 네가 쓸 이야기를 응원할 수는 있어. 잠깐 숨을 돌릴래?”";
  if (flags.includes(`romance_${npc}_promise`) && e.dialogue?.romance) return e.dialogue.romance;
  if (flags.includes(`romance_${npc}_promise`) && flags.includes(`route_${npc}_happy`) && ROMANCE_DAILY_REPLIES[e.id]) {
    return `${e.dialogue?.high ?? e.text}\n\n${ROMANCE_DAILY_REPLIES[e.id]}`;
  }
  if (affinity[npc] >= 18) {
    if (e.dialogue?.high) return e.dialogue.high;
    if (CORE_REPLIES[e.id]) return `${e.text}\n\n${CORE_REPLIES[e.id]}`;
  }
  return e.text;
}
