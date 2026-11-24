import { romanceEchoes } from "../data/romanceEncounters";
import { sideStoryEchoes } from "../data/sideStories";
import { EXPANDED_STORY, mainStoryComplete } from "../data/mainStory";
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

export const FINAL_DESTINATIONS = ["return", "stay", "depart", "archive"] as const;
export type FinalDestination = (typeof FINAL_DESTINATIONS)[number];

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
const ARCHIVE: EndingResult = {
  ...JOURNEY,
  text: "당신은 기다리던 사람에게 인사를 건네고 열차로 돌아온다. 아직 이름을 찾지 못한 이야기들이 서가에 남아 있다. 이번에는 그 이야기를 읽기 위해, 스스로 이곳에 남기로 했다.\n\n창가의 서가에 빈 책 한 권을 꽂는다. 다음에 누군가 이 열차에 오면 그 사람의 이야기도 놓일 자리가 있을 것이다.\n\n이제 당신은 서고의 주인이다. 언제 책을 펼치고 언제 여행을 떠날지, 그 결정은 당신의 몫이다.",
};
const TRUTH: EndingResult = {
  id: "true_end", npcId: null, title: "쓰이지 않은 첫 문장",
  text: "새벽역의 간판에 이름이 돌아온다. 두 장의 차표가 맞물리고, 오래전 당신이 남긴 약속도 온전한 문장이 된다. 당신은 누군가를 찾아 이 열차에 올랐다. 그 이유를 잊게 된 건 도망치기 위해서가 아니라, 다시 만나 직접 답하기 위해서였다.\n\n플랫폼에 선 사람은 당신이 늦었다고 탓하지 않는다. 당신은 그날 끝내 하지 못했던 말을 건넨다. 이제 새벽역은 누구도 지워지지 않고 도착할 수 있는 곳이 된다.\n\n당신은 차표에 역 이름을 적는다. 이번에는 두 사람이 함께 내린다.",
};

const FINAL_DEFEAT: Record<NpcId, EndingResult> = {
  rael: {
    id: "rael_defeat", npcId: "rael", title: "비상 정차",
    text: "마지막 장의 문장이 당신을 덮치는 순간, 열차가 날카로운 소리를 내며 멈춘다. 회중시계의 뚜껑이 열리고, 라엘이 당신과 페이지 사이에 선다.\n\n“운행 규정 제9조. 승객이 치명상을 입을 우려가 있을 때, 차장은 열차를 정차시킬 수 있습니다.”\n\n그는 시계를 거꾸로 돌려 당신이 쓰러지기 전의 객차로 데려다 놓는다. “규정에 따른 조치입니다.” 목소리는 평소처럼 건조하지만, 시계를 쥔 손끝이 떨리고 있다.\n\n마지막 장은 아직 넘어가지 않았다. 다음 열차가 오면, 이번에는 다른 방식으로 맞설 수 있을 것이다.",
  },
  seon: {
    id: "seon_defeat", npcId: "seon", title: "부러진 검 곁에서",
    text: "무릎이 꺾이는 순간, 익숙한 손이 당신의 어깨를 붙잡는다. 세온이 금이 간 검을 뽑아 들고 마지막 장의 그림자 앞을 가로막는다.\n\n“여기서 끝나면 안 되지. 너한테 아직 못 들은 얘기가 많아.”\n\n그는 이를 악물고 당신을 객차 밖으로 끌어낸다. 검날의 균열이 한 줄 더 늘었지만, 그는 웃고 있다. “다음엔 같이 서자. 이번엔 내가 뒤에서 받쳐 줄게.”\n\n마지막 장은 아직 끝나지 않았다. 다음 열차에서 다시 도전할 수 있다.",
  },
  kairu: {
    id: "kairu_defeat", npcId: "kairu", title: "여백에 적힌 이름",
    text: "페이지가 찢어지려는 찰나, 책장 가장자리에서 낯익은 목소리가 들린다. ‘아직이야. 여기서 끝나는 문장은 쓴 적 없어.’\n\n카이루가 손등의 글자를 걷어 올려 당신의 이름을 여백에 적는다. 빈칸에 이름이 들어가자 마지막 장이 한 박자 물러선다.\n\n“이번엔 내가 먼저 썼어. 네 결말은 이렇게 끝나지 않아.” 그는 웃지만 잉크가 번진 손끝이 조금 떨린다.\n\n이야기는 중단됐을 뿐이다. 다음 열차에서, 이어서 쓸 수 있다.",
  },
};

const RETURN_HOME: EndingResult = {
  id: "journey_return", npcId: null, title: "다시 돌아갈 역",
  text: "새벽역의 이름을 차표에 적는다. 플랫폼에는 누군가가 기다리고 있지만, 얼굴과 약속의 마지막 문장은 아직 흐릿하다. 기억을 전부 되찾지 못했어도 이번에는 모른 척 지나치지 않기로 한다.\n\n열차는 당신이 내린 뒤에도 다음 이야기를 향해 달린다.",
};
const STAY_ABOARD: EndingResult = {
  id: "journey_stay", npcId: null, title: "이야기를 잇는 사람",
  text: "당신은 새벽역에 남아 낡은 간판의 불을 켠다. 이름을 잃고 헤매는 승객이 다음에 찾아오면, 이번에는 혼자 기다리지 않도록.\n\n열차가 떠난 뒤에도 역에는 따뜻한 불빛 하나가 남는다.",
};
const NEW_DESTINATION: EndingResult = {
  id: "journey_depart", npcId: null, title: "아직 없는 목적지",
  text: "당신은 새벽역의 간판을 다시 비워 둔다. 약속의 끝은 지키되, 누군가가 반드시 한 곳에 머물러야 하는 건 아니라고 생각한다. 빈 차표에는 역 이름 대신 새로운 방향을 적는다.\n\n플랫폼을 떠난 뒤, 지도에 없던 길이 천천히 모습을 드러낸다.",
};

const EVENT_ECHOES: [string, string][] = [
  ["event_window_station_named", "창문 너머의 역은 아직 멀리 있지만, 이번에는 그 이름을 잊지 않도록 차표에 적어 둔다."],
  ["event_page_reader_met", "기다리던 독자가 남긴 문장이 수첩에서 다시 이어진다. ‘기다리는 동안에도 이야기는 계속된다.’"],
  ["event_letter_delivered", "차표 사이에 끼워 둔 편지에는 마침내 도착 날짜가 적혔다."],
  ["event_ticket_station_found", "차표의 화살표가 가리킨 승강장에는 누군가 돌아올 자리가 남아 있다."],
  ["event_minute_restored", "되돌려 놓은 일 분이 열차의 시계마다 흐른다."],
  ["event_lamp_guided", "어딘가에서 누군가가 당신이 비춘 불빛을 따라 길을 찾는다."],
  ["event_parcel_delivered", "첫차를 놓친 이에게 맡긴 소포에는 ‘도착’이라는 도장이 남았다."],
  ["event_silent_car_answered", "창문에 적은 안부가 객차 안의 목소리를 되돌려 놓았다."],
  ["event_book_open_end", "다음 독자를 위해 비워 둔 페이지가 새로운 문장을 기다린다."],
  ["event_book_finished", "당신이 끝맺은 책에는 마침내 제목이 생겼다."],
  ["event_schedule_torn", "찢어 버린 시간표의 마지막 숫자는 끝내 돌아오지 않았다."],
  ["event_manuscript_damaged", "번져 버린 원고의 끝 몇 줄은 읽을 수 없게 되었지만, 남은 페이지는 살아남았다."],
  ["station_event_first_letter", "시간표 여백에서 옮겨 둔 첫 획이 차표의 빈칸과 맞아떨어진다."],
  ["station_event_kept_promise", "창문에 비친 약속을 되찾았다. 당신은 도망친 게 아니라 길을 찾으러 떠났었다."],
  ["station_event_full_name", "새벽역의 이름을 삼킨 형체는 사라졌다. 이제 그곳의 간판은 다시 빛난다."],
  ["station_event_guest_safe", "개찰구 너머로 승객을 먼저 보냈다. 두 사람은 같은 플랫폼에 도착했다."],
];

function addJourneyEchoes(ending: EndingResult, flags: Set<string>): EndingResult {
  const stationEchoes = EVENT_ECHOES.filter(([flag]) => flag.startsWith("station_event_") && flags.has(flag));
  const commonEchoes = EVENT_ECHOES.filter(([flag]) => !flag.startsWith("station_event_") && flags.has(flag));
  const echoes = [...stationEchoes, ...commonEchoes].slice(0, 2).map(([, text]) => text);
  const firstInterlude = flags.has("station_act1_show_ticket")
    ? "맞물린 차표 두 장이 새벽역의 이름을 되살렸다."
    : flags.has("station_act1_ask_conductor")
      ? "차장이 건넨 차표 반쪽에는 당신이 떠났던 밤의 기록이 남아 있었다."
      : flags.has("station_act1_copy_record")
        ? "수첩에 옮겨 적은 승차 기록은 당신이 왜 이 열차에 올랐는지 잊지 않게 했다."
        : flags.has("interlude_act1_asked")
          ? "차장에게 답을 재촉했던 질문은 끝내 사라지지 않았다."
          : "";
  const interlude = flags.has("station_act2_hold_ticket")
    ? "두 장의 차표를 꼭 쥐고, 이번에는 함께 내리겠다고 다짐했다."
    : flags.has("station_act2_recall_reason")
      ? "떠났던 이유를 기억할 준비를 마쳤다. 약속을 지키려면 그날의 자신도 마주해야 했다."
      : flags.has("station_act2_speak_name")
        ? "새벽역이라는 이름을 소리 내어 불렀다. 이제 길을 잃지 않을 것이다."
        : flags.has("interlude_act2_read")
          ? "자신의 책을 첫 장부터 읽은 끝에, 비 오는 밤의 장면이 조금 더 또렷해졌다."
          : "";
  const mainEcho = flags.has(EXPANDED_STORY) && flags.has("main_reason_proof") ? "그날 두 사람이 각자 맡았던 일을 기억한다. 이제 기다림도 출발도 서로의 선택으로 남길 수 있다." : "";
  return { ...ending, text: [ending.text, ...(flags.has(EXPANDED_STORY) ? [] : [firstInterlude, interlude]), mainEcho, ...echoes].filter(Boolean).join("\n\n") };
}

/** Only mutually-exclusive, explicitly chosen story flags can finish a route. */
export function resolveRouteEndings(flags: string[]): RouteEnding[] {
  const known = new Set(flags);
  return NPC_IDS.flatMap((npcId) => {
    const grade = (["happy", "normal", "bad"] as const).find((value) => known.has(`route_${npcId}_${value}`));
    if (!grade) return [];
    return [{ ...ROUTE_ENDINGS[npcId][grade], npcId, grade }];
  });
}

export function resolveRunEndings(flags: string[], victory: boolean): RunEndings {
  const known = new Set(flags);
  const routes = resolveRouteEndings(flags);
  const bonuses = routes.flatMap((route) =>
    route.grade === "happy" && known.has(`romance_${route.npcId}_promise`)
      ? [{ ...BONUS_ENDINGS[route.npcId], text: [BONUS_ENDINGS[route.npcId].text, ...romanceEchoes(route.npcId, known)].join("\n\n") }] : [],
  );
  let journey = DEATH;
  if (!victory) {
    const rescuer = NPC_IDS.find((npcId) => known.has(`final_defeat_${npcId}`));
    if (rescuer) journey = FINAL_DEFEAT[rescuer];
  }
  if (victory) {
    if (known.has("ending_stay")) journey = STAY_ABOARD;
    else if (known.has("ending_depart")) journey = NEW_DESTINATION;
    else if (known.has("ending_return")) {
      const foundThePromise = (
        known.has("station_act1_show_ticket") && known.has("station_act2_hold_ticket")
      ) || (
        known.has("station_act1_ask_conductor") && known.has("station_act2_speak_name")
      ) || (
        known.has("station_act1_copy_record") && known.has("station_act2_recall_reason")
      ) || (
        known.has("station_event_old_promise") && known.has("station_event_full_name")
      );
      journey = (known.has(EXPANDED_STORY) ? mainStoryComplete(known) : foundThePromise) ? TRUTH : RETURN_HOME;
    } else if (known.has("ending_archive")) journey = ARCHIVE;
    else journey = JOURNEY;
    if (journey.id !== "death" && (journey.id !== "solo" || known.has("ending_archive"))) journey = addJourneyEchoes(journey, known);
  }
  const passengerEchoes = sideStoryEchoes(known);
  if (passengerEchoes.length) journey = { ...journey, text: [journey.text, ...passengerEchoes].join("\n\n") };
  return { journey, routes, bonuses };
}
