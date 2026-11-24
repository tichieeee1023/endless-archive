import type { Encounter } from "../types/encounter";
import type { NpcId } from "../types/npc";

type Scene = { npc: NpcId; key: string; title: string; text: string; join: string; result: string; leave: string; declined: string; echo: string };
const scenes: Scene[] = [
  {npc:"rael",key:"two_cups",title:"두 사람분의 차",text:"라엘이 두 잔의 차를 준비하고 회중시계를 닫는다. “업무 종료 후입니다. 이 시간에는 제가 차장이 아니라는 점을 유념해 주십시오.” 당신이 무슨 차이가 있느냐고 묻자 그가 대답한다. “손님께는 사적인 이야기를 하지 않습니다. 연인께는 할 생각입니다. 특별 대우가 싫으시다면 미리 말씀하시지요.”",join:"그의 곁에 앉아 차를 마신다",result:"라엘은 차가 식을 때까지 시계를 보지 않는다. 두 번째 잔을 따르며 “이 시간을 정기적으로 마련하고 싶습니다. 업무가 아니라 제 희망 사항입니다”라고 덧붙인다.",leave:"오늘은 혼자 쉬고 싶다고 말한다",declined:"“알겠습니다. 그럼 제 몫의 차는 제가 마시지요.” 라엘은 잔을 덮으며 다음 시간은 당신과 함께 정하겠다고 말한다.",echo:"라엘은 근무표 대신 두 사람만의 티타임을 기억해 두었다."},
  {npc:"rael",key:"next_ticket",title:"나란히 놓인 차표",text:"라엘이 빈 차표 두 장을 정확히 나란히 놓는다. “연인이라는 이유로 승객의 목적지를 지정하는 일은 직권 남용에 해당합니다. 그러니 목적지는 각자 적으십시오. 재회 시각만큼은 함께 정하고 싶군요.”",join:"각자의 차표에 함께할 시간을 적는다",result:"두 차표의 목적지는 서로 다르지만, 다시 만나기로 한 시간은 같다. 라엘이 차표를 들며 말한다. “이 정도의 약속은 꽤 합리적이군요. 개인적으로도 마음에 듭니다.”",leave:"다음 여행은 나중에 정하자고 한다",declined:"라엘은 빈 차표를 거둔다. “미정으로 남겨 두겠습니다. 미정도 엄연한 상태입니다.”",echo:"두 장의 차표에는 서로의 자유와 다시 만날 약속이 함께 남았다."},
  {npc:"seon",key:"quiet_morning",title:"평범한 아침의 약속",text:"세온은 식당 칸에서 빵을 자르고 있다. 당신이 다가오자 따뜻한 차를 밀어 준다. “잘 잤어? 이리 앉아. 네 몫은 따뜻할 때 챙겨 뒀지.” 당신이 왜 이렇게 일찍 왔느냐고 묻자 그가 웃는다. “보고 싶은 얼굴이 있으니까.”",join:"다음 아침에도 함께 먹자고 한다",result:"그는 빵을 하나 더 집어 들며 웃는다. “좋지. 늦어도 괜찮아. 다만 빵이 식기 전에 얼굴은 보여 줘. 기다리는 게 싫지는 않지만.”",leave:"오늘은 각자 아침을 보내자고 한다",declined:"“그래. 그럼 다음번에 보자.” 세온은 당신 몫으로 골라 둔 빵을 종이에 싸서 건넨다.",echo:"세온은 싸움이 없는 평범한 아침도 함께 기다리게 되었다."},
  {npc:"seon",key:"hand_in_hand",title:"검 대신 맞잡은 손",text:"세온이 창밖을 보며 걷다가 당신 쪽으로 손을 내민다. “손 잡을래?” 당신이 무슨 일 있느냐는 얼굴을 하자 그가 느긋하게 웃는다. “그냥 좋으니까. 특별한 이유가 더 필요한가?”",join:"기꺼이 손을 잡는다",result:"당신이 손을 맞잡자 세온은 엄지로 손등을 가볍게 쓸어 준다. “이런 건 아무리 오래 해도 질리지 않겠는데.” 두 사람은 지나치는 객차를 세는 것도 잊은 채 걸어간다.",leave:"오늘은 나란히 걷는 것만으로 충분하다고 답한다",declined:"세온은 손을 내리고 어깨를 으쓱한다. “그래. 오늘은 풍경이나 실컷 보자.” 그는 평소보다 조금 느린 속도로 걸어간다.",echo:"세온에게는 검을 쥐지 않아도 안심할 수 있는 시간이 생겼다."},
  {npc:"kairu",key:"unwritten_date",title:"책에 없는 데이트",text:"카이루가 빈 수첩에 ‘연인이 된 뒤의 필수 사건’이라고 적고 큼직한 가위표를 친다. “달빛 아래 고백, 오해, 극적인 화해…… 참 지루하지 않아? 나랑 데이트할래? 너하고는 좀 다른 전개를 보고 싶은데. 어디부터 갈까?”",join:"둘이 하고 싶은 일을 하나씩 정한다",result:"카이루는 하고 싶은 일 두 가지를 적고 마지막 줄은 비워 둔다. “이건 반전용이야. 뭐가 일어날지 나도 모르거든.” 그가 신이 난 듯 펜을 돌린다.",leave:"오늘은 계획 없이 각자 시간을 보내자고 한다",declined:"“좋아. 데이트 취소라니, 벌써 예상 밖의 전개네.” 카이루는 수첩을 닫고 다음 약속은 다음에 정하기로 한다.",echo:"카이루는 책에 없는 데이트를 둘만의 기억으로 남겼다."},
  {npc:"kairu",key:"private_page",title:"서로에게 남긴 여백",text:"카이루가 책갈피를 흔든다. “연인이 된다고 독점 판권이 생기는 건 아니더라고. 아주 다행이지.” 그가 당신에게 책갈피를 건넨다. “네가 보여 주고 싶은 문장 하나만 읽어도 좋아. 나도 하나 줄게.”",join:"서로 보여 주고 싶은 문장을 한 줄씩 적는다",result:"카이루는 당신의 문장을 읽고 자신의 문장을 내민다. 그 뒤의 페이지를 슬쩍 접어 가리며 웃는다. “속편은 내 허락을 받고. 너도 그렇게 해.”",leave:"문장은 다음에 나누자고 한다",declined:"카이루가 제 문장을 책 사이에 넣는다. “예고편도 없는 거야? 궁금하지만 좋아. 나중에 네가 공개하고 싶을 때 보자.”",echo:"두 사람은 서로의 이야기를 사랑하되, 마지막 여백은 각자의 것으로 남겼다."},
];
export const ROMANCE_ENCOUNTERS: Encounter[] = scenes.map(s => ({
  id:`romance_scene_${s.npc}_${s.key}`, npcId:s.npc, kind:"npc", companionKind:"romance", title:s.title, text:s.text,
  minAct:3, weight:6, requiresAll:[`route_${s.npc}_happy`, `romance_${s.npc}_promise`],
  requiresNone:[`route_${s.npc}_bad`, ...(s.npc === "kairu" ? ["kairu_returned"] : [])],
  choices:[{text:s.join,result:{text:s.result,setFlags:[`romance_memory_${s.npc}_${s.key}`]}},{text:s.leave,result:{text:s.declined}}],
}));
export function romanceEchoes(npc: NpcId, flags: ReadonlySet<string>): string[] {
  return scenes.filter(s => s.npc === npc && flags.has(`romance_memory_${s.npc}_${s.key}`)).map(s => s.echo);
}
