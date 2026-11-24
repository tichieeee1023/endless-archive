import type { Encounter } from "../types/encounter";
import type { NpcId } from "../types/npc";

type Scene = { npc: NpcId; key: string; title: string; text: string; join: string; result: string; leave: string; declined: string; echo: string };
const scenes: Scene[] = [
  {npc:"rael",key:"two_cups",title:"두 사람분의 차",text:"라엘은 차를 따르다 당신의 손을 바라본다. “오늘은 승객으로 모시는 것이 아니라, 연인과 차를 마시는 시간입니다. 아직 그 차이를 배우고 있습니다.” 그는 곁의 의자를 당겨 놓는다.",join:"그의 곁에 앉아 차를 마신다",result:"차가 식을 때까지 라엘은 시계를 꺼내지 않았다. 찻잔을 내려놓으며 다음에도 이 시간을 갖고 싶다고 말한다.",leave:"오늘은 혼자 쉬고 싶다고 말한다",declined:"라엘은 고개를 끄덕이며 찻잔을 덮어 둔다. “그럼 다음에 함께하시죠.”",echo:"라엘은 근무표 대신 두 사람만의 티타임을 기억해 두었다."},
  {npc:"rael",key:"next_ticket",title:"나란히 놓인 차표",text:"라엘이 빈 차표 두 장을 펼친다. “다음 목적지를 정하지 않으셔도 됩니다. 다만 서로의 여행에 자리를 마련해 두고 싶었습니다.”",join:"각자의 차표에 함께할 시간을 적는다",result:"라엘은 두 차표를 나란히 놓았다. “서로의 일정이 다르더라도, 다시 만날 시간은 정할 수 있겠군요.”",leave:"다음 여행은 나중에 정하자고 한다",declined:"라엘은 빈 차표를 간직한다. 무엇을 적을지 함께 정할 날을 기다리기로 했다.",echo:"두 장의 차표에는 서로의 자유와 다시 만날 약속이 함께 남았다."},
  {npc:"seon",key:"quiet_morning",title:"평범한 아침의 약속",text:"세온은 식당 칸에서 빵을 나누다가 당신에게 웃어 보인다. “연인이 되고 나니까 말이야, 거창한 일보다 이런 아침이 더 기다려져.”",join:"다음 아침에도 함께 먹자고 한다",result:"세온은 남은 빵을 종이에 싸 두었다. “좋아. 다음엔 내가 먼저 자리 잡아 놓을게.”",leave:"오늘은 각자 아침을 보내자고 한다",declined:"세온은 빵 한 조각을 건넨다. “그래. 네 시간도 소중하니까.”",echo:"세온은 싸움이 없는 평범한 아침도 함께 기다리게 되었다."},
  {npc:"seon",key:"hand_in_hand",title:"검 대신 맞잡은 손",text:"세온은 조용한 복도를 걷다가 당신에게 손을 내민다. “누굴 지키려고 잡는 손 말고, 그냥 좋아하는 사람 손을 잡아 보고 싶어. 괜찮아?”",join:"기꺼이 손을 잡는다",result:"두 사람은 한동안 나란히 걸었다. 세온은 아무것도 경계하지 않는 시간이 이렇게 따뜻할 줄 몰랐다고 말한다.",leave:"오늘은 나란히 걷는 것만으로 충분하다고 답한다",declined:"세온은 내밀었던 손을 거두고 보폭을 맞춘다. “그것도 좋아.”",echo:"세온에게는 검을 쥐지 않아도 안심할 수 있는 시간이 생겼다."},
  {npc:"kairu",key:"unwritten_date",title:"책에 없는 데이트",text:"카이루가 빈 수첩을 펴고 웃는다. “책에서는 연인이 되면 다음 장이 정해져 있던데, 우리는 뭘 할까? 네가 하고 싶은 것도 듣고 싶어.”",join:"둘이 하고 싶은 일을 하나씩 정한다",result:"카이루는 목록 맨 아래 빈칸을 남겼다. 계획에 없는 일도 함께 즐기고 싶다고 했다.",leave:"오늘은 계획 없이 각자 시간을 보내자고 한다",declined:"카이루는 수첩을 덮는다. “좋아. 빈칸도 우리 마음대로 쓰는 거니까.”",echo:"카이루는 책에 없는 데이트를 둘만의 기억으로 남겼다."},
  {npc:"kairu",key:"private_page",title:"서로에게 남긴 여백",text:"카이루는 당신에게 책갈피를 건네며 말한다. “좋아한다는 말이 네 모든 페이지를 읽어도 된다는 뜻은 아니잖아. 보여 주고 싶을 때 보여 줘.”",join:"서로 보여 주고 싶은 문장을 한 줄씩 적는다",result:"카이루는 당신의 문장을 읽고 자신의 문장을 내밀었다. 둘은 나머지 페이지를 각자의 몫으로 남겨 두었다.",leave:"문장은 다음에 나누자고 한다",declined:"카이루는 책갈피를 그대로 건넨다. “언제든 네가 원할 때.”",echo:"두 사람은 서로의 이야기를 사랑하되, 마지막 여백은 각자의 것으로 남겼다."},
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
