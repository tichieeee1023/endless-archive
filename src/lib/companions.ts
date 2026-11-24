import { PERSONALITY_ENCOUNTERS } from "../data/personalityEncounters";
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

/** An optional quiet visit on the shop page. No core route or rest choice is replaced. */
export function personalityOffer(act: number, floor: number, flags: string[], seen: string[], affinity: Record<NpcId, number>): MapNode | undefined {
  if (floor !== 4 || !flags.includes(EXPANDED_STORY)) return;
  const pool = eligibleEncounters(PERSONALITY_ENCOUNTERS, act, flags, seen, undefined, affinity);
  const shared = pool.find(e => !e.npcId);
  const count = (npc: NpcId) => seen.filter(id => id.startsWith(`companion_${npc}_personality_`)).length;
  const chosen = shared ?? pool.filter(e => e.npcId).sort((a,b) => count(a.npcId!) - count(b.npcId!) || affinity[b.npcId!] - affinity[a.npcId!])[0];
  if (!chosen) return;
  return { id:`a${act}f${floor}personality`, type:"event", encounterId:chosen.id,
    title:chosen.npcId ? `${NPCS[chosen.npcId].name}${chosen.npcId === "kairu" ? "와" : "과"} 잠시 쉬어 간다` : "식당 칸의 사람들", preview:"일상의 한 장면 · 선택 사항" };
}

/** High affinity changes trust, never implies romance. Only an explicit promise unlocks romantic text. */
const CORE_REPLIES: Record<string, string> = {
  rael_encounter_2: "라엘은 당신을 알아보고 손목을 감추려던 손을 멈춘다. “당신께는 아무리 둘러대도 소용이 없겠군요. 이번에는 사실대로 말씀드리겠습니다.”",
  rael_registry: "라엘이 장부를 당신 앞에 펼친다. “두 사람이 대조하면 오류가 줄어듭니다. 이번에는 당신의 판단도 듣겠습니다.”",
  rael_encounter_3: "라엘은 문 앞에서 당신의 발걸음을 기다린다. “이 선택만큼은 제 뜻을 말씀드리고 싶습니다.”",
  seon_2: "세온은 무너진 성벽을 바라보다 당신 쪽으로 몸을 돌린다. “네가 묻는 거라면 말할게. 다만 위로부터 하지는 마. 사실을 먼저 들어 줘.”",
  seon_signal: "세온은 신호를 놓치지 않으려는 듯 당신을 부른다. “동쪽이 맞는지 네 눈으로도 봐 줘. 내 기억이 틀렸을 가능성까지 확인하고 싶어.”",
  seon_3: "세온이 검을 고쳐 쥐며 말한다. “네가 여기까지 와 준 건 알아. 이제 내가 결정할 차례야.”",
  kairu_2: "카이루는 당신이 다가오자 책을 펼쳐 보인다. “너라면 이 문장에서 뭘 찾아낼까? 이번엔 내가 답을 숨기지 않을게.”",
  kairu_colophon: "카이루가 빈칸을 가리킨다. “공동 집필은 환영이야. 단, 내 이름 부분은 수정 금지. 그 정도는 계약서 없이 믿어도 되겠지?”",
  kairu_3: "카이루는 책장의 가장자리를 붙잡고 당신을 바라본다. “내 선택을 듣고 기다려 줄 수 있지?”",
  rael_tea: "라엘이 당신의 자리를 미리 비워 둔다. “오늘은 차가 식기 전에 오셨군요.”",
  rael_watch: "라엘은 시계를 손에 쥔 채 당신에게 다가온다. “명령이 들리지 않는데도 별다른 이상은 없습니다. 그 사실에 익숙해지고 있군요.”",
  seon_bandage: "세온이 당신을 보자 붕대를 내밀며 웃는다. “이번엔 먼저 부탁하지. 한 손보다는 네 손까지 있는 게 낫더군.”",
  seon_home: "세온은 창가 자리를 내어 주며 말한다. “오늘은 전쟁 얘기 말고 고향 얘기를 해 볼까. 아르겐에 그것만 있었던 건 아니니까.”",
  kairu_name: "카이루의 목소리가 당신의 발소리를 알아듣는다. “왔구나. 네가 부르는 이름은 이제 낯설지 않아.”",
  kairu_promise: "카이루는 닫힌 수첩을 당신에게 돌려준다. “기다리다가 내가 상상한 답이 열 개쯤 됐어. 네가 들려줄 열한 번째 답이 궁금하네.”",
};
const ROMANCE_DAILY_REPLIES: Record<string, string> = {
  companion_rael_tea_taste: "라엘이 당신 쪽으로 찻잔을 옮긴다. “지난번에 이 차는 두 번이나 드셨지요. 기억할 만한 일이었습니다. 제 기억력이 부담스러우십니까?”",
  companion_rael_day_off: "“연인과 보내는 휴일입니다. 근무표에는 기입하지 않았습니다. 드물게 적법한 무단 휴가군요.” 라엘은 당신의 대답을 기다린다.",
  companion_rael_passenger: "라엘은 당신 곁의 자리를 가리킨다. “오늘은 여기 앉고 싶습니다. 근무는 끝났으니, 제 사적인 청으로 받아 주십시오.”",
  companion_seon_bread: "세온은 웃으며 빵을 건넨다. “네 몫은 남겨 뒀어. 자, 이쪽으로 와. 얼굴 보면서 먹는 게 훨씬 맛있더군.”",
  companion_seon_no_sword: "“연인하고 산책하는데 검까지 챙길 필요는 없겠지.” 세온이 가볍게 웃는다.",
  companion_seon_birthday: "세온은 달력에 작은 동그라미를 그린다. “고백한 날도 적어 둘까. 잊을 일은 없겠지만, 그날을 핑계로 너한테 꽃을 줄 수 있잖아.”",
  companion_kairu_taste: "카이루는 당신의 표정을 살핀다. “이 맛을 두고 사랑의 맛이라고 쓰면 과일한테 실례겠지? 그래도 너랑 먹으니 꽤 괜찮네.”",
  companion_kairu_handwriting: "카이루가 당신 쪽으로 펜을 내민다. “연애편지를 인쇄본으로 주면 재미없잖아. 삐뚤어도 내 글씨로 쓸게.”",
  companion_kairu_blank_day: "“보고 싶었다고 한 번만 해 봐. 그러면 내가 오늘 하루 착한 연인이 되어 줄지도 모르잖아. 아, 웃는 건 대답으로 안 쳐.” 카이루가 창밖을 바라보며 웃는다.",
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
