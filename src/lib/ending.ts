import type { NpcId } from "../types/npc";

export interface EndingResult {
  id: string;
  title: string;
  text: string;
  npcId: NpcId | null;
}

/** An NPC's story outcome is independent of the journey and of romance. */
export type RouteGrade = "bad" | "normal" | "happy";
export interface RouteEnding extends EndingResult {
  npcId: NpcId;
  grade: RouteGrade;
}
export interface RunEndings {
  journey: EndingResult;
  routes: RouteEnding[];
  bonuses: EndingResult[];
}

const NPC_IDS: NpcId[] = ["rael", "seon", "kairu"];

const ROUTE_ENDINGS: Record<NpcId, Record<RouteGrade, Omit<RouteEnding, "npcId" | "grade">>> = {
  rael: {
    bad: { id: "rael_route_bad", title: "반복되는 시간", text: "기관실 문은 닫혔다. 회중시계의 초침은 다시 거꾸로 돌아간다. 라엘은 다음 운행의 차장으로 남았다." },
    normal: { id: "rael_route_normal", title: "잠깐의 정차", text: "라엘은 당장 열차를 떠나지 못한다. 그러나 이제 그는 처음으로 명령이 아닌 자신의 뜻으로 시계를 닫는다." },
    happy: { id: "rael_route_happy", title: "멈출 수 있는 사람", text: "되풀이되는 차장의 기록이 끝났다. 라엘은 열차의 부품이 아닌 한 사람으로 객차에 돌아왔다. 다음 역은 그가 직접 고른다." },
  },
  seon: {
    bad: { id: "seon_route_bad", title: "돌아오지 못한 기사", text: "귀향의 문이 닫혔다. 세온은 끝내 아르겐의 폐허에 붙잡힌 채 자신의 이름을 놓아 버린다." },
    normal: { id: "seon_route_normal", title: "마지막 인사", text: "세온은 부서진 검을 거두고 아르겐의 마지막 풍경에 작별을 고한다. 고향은 되돌릴 수 없지만, 그의 발걸음은 계속된다." },
    happy: { id: "seon_route_happy", title: "다시 걷는 길", text: "세온은 돌아갈 길을 찾았다. 아르겐은 여전히 폐허지만, 남은 것들을 지킬 선택은 그의 손에 있다." },
  },
  kairu: {
    bad: { id: "kairu_route_bad", title: "닫힌 여백", text: "이름이 지워졌다. 책을 펼쳐도 여백에서는 더 이상 아무 목소리도 들리지 않는다." },
    normal: { id: "kairu_route_normal", title: "책갈피 하나", text: "카이루는 책으로 돌아갔다. 마지막 페이지에 남은 이름은 그의 것이다. 언젠가 다시 쓰일 문장이 남아 있다." },
    happy: { id: "kairu_route_happy", title: "스스로 쓰는 결말", text: "손등의 글자가 사라졌다. 카이루는 책 밖에 서서 처음으로 자기 다음 문장을 쓴다." },
  },
};

const BONUS_ENDINGS: Record<NpcId, EndingResult> = {
  rael: { id: "rael_romance", npcId: "rael", title: "옆자리의 약속", text: "라엘이 회중시계를 닫고 손을 내민다. “이번에는 근무가 아닙니다. 당신과 함께 가고 싶습니다.”" },
  seon: { id: "seon_romance", npcId: "seon", title: "귀향의 동행", text: "세온은 검을 집어넣고 웃는다. “이번엔 네 이야기도 들려줘. 오래 걸려도 괜찮아.”" },
  kairu: { id: "kairu_romance", npcId: "kairu", title: "둘이 쓰는 여백", text: "카이루가 빈 페이지를 펼친다. “네가 허락한다면, 다음 이야기는 나와 함께 써 줄래?”" },
};

const DEATH: EndingResult = {
  id: "death", npcId: null, title: "찢어진 페이지",
  text: "손끝에서 수첩이 미끄러진다. 차가운 바닥에 닿기 전에, 누군가 마지막 장을 붙잡는다.\n\n‘이 이야기가 여기서 끝나는 건가요?’\n\n대답은 들리지 않는다. 대신 멀리서 기적 소리가 울린다. 당신이 남긴 문장들이 책장 사이로 흩어지고, 빈 차표 한 장이 다시 손안에 놓인다.\n\n아직 돌아오지 못한 이야기가 있다. 다음 열차가 올 때, 당신은 다시 선택할 수 있다.",
};
const JOURNEY: EndingResult = {
  id: "solo", npcId: null, title: "서고의 주인",
  text: "당신은 열차의 마지막 페이지를 넘긴다. 창밖에 처음 보는 역이 나타난다.\n\n어떤 이야기는 끝까지 듣지 못했고, 어떤 인사는 다음으로 미뤄 두었다. 그렇다고 이 여정이 비어 있었던 것은 아니다. 수첩에는 당신이 직접 고른 문장들이 남아 있다.\n\n문이 열리자 서늘한 바람이 불어온다. 당신은 차표를 주머니에 넣고 한 발을 내딛는다.\n\n돌아올 곳도, 새로 찾아갈 곳도 이제 당신이 정할 수 있다.",
};
const TRUTH: EndingResult = {
  id: "true_end", npcId: null, title: "쓰이지 않은 첫 문장",
  text: "처음 눈을 떴던 플랫폼에 세 사람의 목소리가 차례로 닿는다. 그들이 택한 결말은 서로 다른 페이지에 있지만, 모두 당신과 그들이 직접 고른 문장이었다.\n\n차표의 빈칸에 더는 목적지를 적을 필요가 없다. 돌아갈 수 있는 곳이 하나가 아니라는 것을 이제 알기 때문이다.\n\n수첩의 마지막 장 너머에서 누군가 조용히 웃는다.\n\n“이제 어떤 이야기를 쓰시겠습니까?”\n\n당신은 펜을 든다. 첫 문장은 아직 쓰이지 않았다.",
};

/** Only mutually-exclusive, explicitly chosen story flags can finish a route. */
export function resolveRouteEndings(flags: string[]): RouteEnding[] {
  const known = new Set(flags);
  return NPC_IDS.flatMap((npcId) => {
    const grade = (["happy", "normal", "bad"] as const).find((value) => known.has(`route_${npcId}_${value}`));
    if (!grade) return [];
    return [{ ...ROUTE_ENDINGS[npcId][grade], npcId, grade }];
  });
}

export function resolveRunEndings(flags: string[], victory: boolean, previouslyCollected: string[] = []): RunEndings {
  const known = new Set(flags);
  const routes = resolveRouteEndings(flags);
  const bonuses = routes.flatMap((route) =>
    route.grade === "happy" && known.has(`romance_${route.npcId}_promise`)
      ? [BONUS_ENDINGS[route.npcId]] : [],
  );
  const collected = new Set([...previouslyCollected, ...routes.map((route) => route.id)]);
  const allHappy = NPC_IDS.every((npcId) => collected.has(`${npcId}_route_happy`));
  const journey = !victory ? DEATH : allHappy ? TRUTH : JOURNEY;
  return { journey, routes, bonuses };
}
