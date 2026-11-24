import { PERSONALITY_ENCOUNTERS } from "./personalityEncounters";
import { ROMANCE_ENCOUNTERS } from "./romanceEncounters";
import { SIDE_STORY_ENCOUNTERS } from "./sideStories";
import { MAIN_STORY_ENCOUNTERS } from "./mainStory";
import type { Encounter } from "../types/encounter";
import { COMPANION_ENCOUNTERS, BOSS_COMPANION_ENCOUNTERS } from "./companionEncounters";
import { MEMORY_ENCOUNTERS } from "./memories";
import { INDEPENDENT_ENCOUNTERS } from "./independentEncounters";
import { UNNAMED_STATION_ENCOUNTERS } from "./unnamedStationEncounters";

// 핵심 사건 3회 + 선택적 단서 1회 + 짧은 결말 1회.
// 조사/선택의 결과는 story_*, 인연은 bond_* 및 romance_*로 분리한다.
// 단서 사건을 놓쳐도 NORMAL/BAD로 이야기를 마무리할 수 있다.
// 짧게 쓰는 것은 사건 로그이며, 별도의 관계 특별 이벤트(memories.ts)는 축약하지 않는다.
export const ENCOUNTERS: Encounter[] = [
  /* 라엘 — 반복되는 차장의 기록 */
  {
    id: "rael_encounter_1", npcId: "rael", kind: "npc", title: "복도 끝의 남자", minAct: 1, weight: 10,
    text: "객차 사이 복도에서 차장이 텅 빈 창을 보고 있다. 은빛 회중시계의 초침은 거꾸로 흐른다.\n“승객께서는 이곳에 계시면 안 됩니다. 안내문을 읽지 않으셨습니까, 아니면 읽고도 오신 겁니까? 어느 쪽이든 길 찾는 재주는 별로 없으시군요.”",
    choices: [
      { text: "곁에 서서 창밖을 본다", result: {
        text: "라엘은 당신을 잠시 관찰한 뒤 창가에서 반 발짝 물러난다. “좋습니다. 이번 한 번만 눈감아 드리지요. 저 창에서 무엇이 보이십니까?”", affinity: 8,
      } },
      { text: "“시계가 거꾸로 가네요.”", check: { stat: "insight", base: 30, difficulty: 40 }, result: {
        text: "초침이 멎는다. 라엘이 시계를 감싸 쥔다. “그것까지 보셨군요.”", affinity: 12, setFlags: ["rael_first_smile"],
      }, fail: { text: "“고장이라고 하기에는 지나치게 규칙적입니다만, 승객께서 걱정하실 일은 아닙니다.” 라엘은 시계를 소매 안으로 감춘다.", affinity: 2 } },
      { text: "지나간다", result: { text: "그는 당신을 막지 않는다. 뒤에서 짧은 시계 소리만 들린다.", affinity: -2 } },
    ],
  },
  {
    id: "rael_encounter_2", npcId: "rael", kind: "chain", title: "손목의 번호", minAct: 1,
    requiresAll: ["story_rael_met"], weight: 20,
    text: "열차가 흔들리자 라엘이 당신을 붙잡는다. 걷힌 소매 아래에 낡은 번호가 새겨져 있다.\n“보셨다면 잊어 주십시오. 제 손목은 승객 열람 대상에 포함되지 않습니다.”",
    choices: [
      { text: "“이 번호는 무슨 뜻인가요?”", check: { stat: "insight", base: 40, difficulty: 45 }, result: {
        text: "“차장을 새로 쓰는 횟수입니다. 정확한 숫자를 아는 쪽이 저보다 이 열차라는 사실은 꽤 불쾌하군요.” 라엘은 자기가 여기까지 말한 것이 뜻밖인 듯 입을 다문다.", affinity: 10, setFlags: ["rael_saw_scar"],
      }, fail: { text: "“알아도 좋을 일이 아닙니다.” 그는 소매를 내린다.", affinity: 0 } },
      { text: "소매를 조용히 여며 준다", result: {
        text: "라엘은 잠시 손을 멈춘다. “……감사합니다.”", affinity: 6, setFlags: ["rael_noticed_scar"],
      } },
      { text: "번호만 수첩에 적는다", result: {
        text: "당신이 숫자를 옮기는 동안 라엘은 말리지 않는다. 마지막 자릿수에 긁힌 흔적이 있다.", setFlags: ["rael_number_copied"],
      } },
    ],
  },
  {
    id: "rael_registry", npcId: "rael", kind: "chain", title: "찢긴 운행 규정", minAct: 2,
    requiresAll: ["story_rael_clue"], requiresNone: ["route_rael_bad", "route_rael_normal", "route_rael_happy"], weight: 24,
    text: "표 검사대 밑에 찢긴 규정이 끼어 있다. ‘차장은 운행마다 갱신한다.’\n그 아래에 누군가 연필로 적었다. ‘본인의 동의 없는 갱신은 무효.’",
    choices: [
      { text: "예외 조항을 수첩에 옮긴다", result: {
        text: "문장을 베껴 쓰자 종이의 글자가 희미해진다. 이제 증거는 수첩에만 남았다.", setFlags: ["story_rael_exception"],
      } },
      { text: "라엘과 함께 규정을 확인한다", result: {
        text: "라엘이 글자를 천천히 읽는다. “제게도 거절권이 있었다는 말입니까. 그렇다면 지금까지의 운행 기록을 전부 다시 검토해야겠군요.”", affinity: 5, setFlags: ["story_rael_exception"],
      } },
      { text: "규정을 제자리에 두고 떠난다", result: {
        text: "종이 위로 검은 잉크가 번진다. 내일도 같은 글자가 남아 있을지는 알 수 없다.",
      } },
    ],
  },
  {
    id: "rael_encounter_3", npcId: "rael", kind: "chain", title: "기관실의 문", minAct: 3,
    requiresAll: ["story_rael_clue"], requiresNone: ["route_rael_bad", "route_rael_normal", "route_rael_happy"], weight: 30,
    text: "기관실 문 앞에서 라엘이 발을 멈춘다. 안쪽에서는 그의 목소리가 수십 겹 겹쳐 들린다.\n“제 권한으로는 열 수 없는 문입니다. 승객에게 부탁하는 일은 원칙상 부적절하지만…… 방법이 없군요. 도와주시겠습니까?”",
    choices: [
      { text: "문을 힘껏 밀어 연다", check: { stat: "will", base: 30, difficulty: 55 }, result: {
        text: "안에는 같은 이름이 반복된 장부가 있다. 라엘이 중얼거린다. “저는 계속 다시 쓰이고 있었군요.”",
        setFlags: ["rael_truth"], nextId: "rael_final", affinity: 6,
      }, fail: {
        text: "문은 열리지 않는다. 라엘이 회중시계를 감춘다. “이번에는 제가 거절해 보겠습니다.” 작은 저항만이 남았다.",
        setFlags: ["route_rael_normal"],
      } },
      { text: "운행 규정의 예외 조항을 읽어 준다", require: { flag: "story_rael_exception" }, result: {
        text: "라엘이 조항을 끝까지 읽자 잠금쇠가 풀린다. “제가 동의하지 않는다면, 더는 갱신할 수 없겠군요.”",
        setFlags: ["rael_truth"], nextId: "rael_final", affinity: 5,
      } },
      { text: "문을 두고 라엘의 뜻부터 묻는다", result: {
        text: "“떠나고 싶습니다. 하지만 아직 방법을 모릅니다.” 라엘이 장부를 문틈으로 끌어낸다.",
        setFlags: ["rael_hand"], nextId: "rael_final", affinity: 4,
      } },
      { text: "모른 척 자리를 떠난다", result: {
        text: "문이 닫힌다. 다음 운행 안내가 울리고, 라엘의 시계가 다시 거꾸로 움직인다.",
        setFlags: ["rael_abandoned", "route_rael_bad"], affinity: -10,
      } },
    ],
  },
  {
    id: "rael_final", npcId: "rael", kind: "chain", title: "차장의 다음 역", weight: 0,
    text: "문틈으로 낡은 운행 장부가 밀려 나왔다. 라엘의 이름이 수백 번 반복되어 있다.\n“다음 줄을 채우는 것이 제 의무라고 배웠습니다. 하지만 의무와 의사는 구분해야겠군요. 이번만큼은.”",
    choices: [
      { text: "예외 조항을 근거로 갱신을 거부하게 한다", require: { flagsAll: ["rael_truth", "story_rael_exception"] }, result: {
        text: "라엘이 장부에 ‘갱신 거부’라고 적는다. 회중시계가 앞으로 움직인다. 이제 다음 역은 그가 고른다.",
        setFlags: ["route_rael_happy"],
      } },
      { text: "장부를 덮고 선택을 라엘에게 맡긴다", result: {
        text: "라엘이 장부를 덮는다. 아직 떠날 수 없지만, 이번에는 스스로 운행을 멈춘다.",
        setFlags: ["route_rael_normal"],
      } },
      { text: "“자유로워진 뒤에도 당신과 함께하고 싶어요.”", require: { flagsAll: ["rael_truth", "story_rael_exception", "rael_walk_together"] }, result: {
        text: "라엘이 장부의 마지막 줄에 ‘갱신 거부’라고 적는다. 회중시계는 앞으로 흐른다.\n\n그가 객차 문을 열고 당신에게 손을 내민다. “이번에는 운행 명령도, 승객의 요청도 아닙니다. 제가 먼저 청하지요. 함께 가 주시겠습니까?”",
        setFlags: ["route_rael_happy", "romance_rael_promise"], nextId: "romance_scene_rael_two_cups",
      } },
    ],
  },

  /* 세온 — 아르겐으로 돌아가는 길 */
  {
    id: "seon_1", npcId: "seon", kind: "npc", title: "금이 간 검", minAct: 1, weight: 10,
    text: "객차 구석에서 세온이 금이 간 검을 닦고 있다. 칼날에는 낯선 나라의 문장이 남아 있다.\n“조심해. 그렇게 빤히 보면 검이 말을 걸어 줄 것 같나?” 세온은 칼날을 천으로 감싸고 당신에게 자리를 내준다. “궁금한 게 있으면 물어. 팔지는 않을 테지만.”",
    choices: [
      { text: "검의 문장을 살펴본다", check: { stat: "insight", base: 30, difficulty: 45 }, result: {
        text: "“아르겐의 문장이야. 눈이 좋군.” 세온이 검을 돌려 보여 준다. “이름은 기억해 둬. 한때 꽤 살 만한 곳이었거든.”",
        setFlags: ["seon_shared_name"], affinity: 10,
      }, fail: { text: "문장이 마모되어 읽을 수 없다. 세온은 검을 다시 거둔다.", affinity: 2 } },
      { text: "“왜 아직 가지고 있나요?”", result: {
        text: "“검이 멀쩡하다고 전부 지킬 수 있는 건 아니더군.” 그는 칼집을 고쳐 쥔다. “그래도 이걸 버리면 지킨 날까지 없던 일이 될 것 같아.”", affinity: 8,
      } },
      { text: "그의 휴식을 방해하지 않는다", result: {
        text: "세온은 고개를 들지 않는다. 칼날을 닦는 소리만 이어진다.", affinity: -2,
      } },
    ],
  },
  {
    id: "seon_2", npcId: "seon", kind: "chain", title: "멸망한 세계의 이름", minAct: 2,
    requiresAll: ["story_seon_met"], weight: 20,
    text: "창문에 무너진 성벽이 비친다. 세온이 그곳을 가리킨다.\n“아르겐이야. 왕은 마지막까지 성문을 지키라 명령했지.”",
    choices: [
      { text: "마지막 명령에 관해 묻는다", check: { stat: "insight", base: 30, difficulty: 45 }, result: {
        text: "“백성이 빠져나갈 시간을 벌라는 명령이었어.” 세온이 검을 내려놓는다.", affinity: 10, setFlags: ["seon_world_name"],
      }, fail: { text: "“그날 얘기는 여기까지만 하자.” 세온은 오래 창을 바라보다 당신 쪽으로 고개를 돌린다. “괜한 마음 쓰진 마. 내가 아직 말을 못 하는 것뿐이야.”", affinity: 2 } },
      { text: "“살아남은 사람이 있을까요?”", result: {
        text: "“전사 명단에 없는 사람은 전사자로 치지 않아. 확인하지 못한 사람도 마찬가지야. 나는 그렇게 믿고 싶어.” 세온이 먼 창을 바라본다.", setFlags: ["seon_world_name"], affinity: 5,
      } },
      { text: "말없이 풍경을 함께 본다", result: {
        text: "세온이 숨을 고른다. “다시 볼 줄은 몰랐어.”", affinity: 4,
      } },
    ],
  },
  {
    id: "seon_signal", npcId: "seon", kind: "chain", title: "폐허의 신호", minAct: 2,
    requiresAll: ["story_seon_clue"], requiresNone: ["route_seon_bad", "route_seon_normal", "route_seon_happy"], weight: 24,
    text: "창문에 작은 불빛이 세 번 깜빡인다. 세온이 눈을 가늘게 뜨고 다음 신호를 기다린다.\n“아르겐의 구조 신호야. 동쪽 성문 아래군.” 그는 문 쪽을 확인하고 다시 창가로 돌아온다. “달리는 열차에서 뛰어내릴 순 없지. 위치부터 기억해 둬.”",
    choices: [
      { text: "불빛의 방향을 수첩에 기록한다", result: {
        text: "불빛은 동쪽 성문 아래에서 반복된다. 길을 잊지 않도록 표시해 두었다.",
        setFlags: ["story_seon_signal"],
      } },
      { text: "세온에게 신호를 해독해 달라고 한다", result: {
        text: "“동쪽으로 세 번. 구조 요청이야.” 세온이 무너진 성문을 향해 고개를 든다.",
        setFlags: ["story_seon_signal"], affinity: 5,
      } },
      { text: "함정일 수 있으니 신호를 외면한다", result: {
        text: "“함정일 수도 있지. 그렇다고 확인도 안 할 이유는 없어.” 세온의 목소리가 낮아진다. 열차가 폐허를 지나친 뒤에도 그는 한동안 창을 떠나지 않는다.",
        setFlags: ["seon_signal_ignored"], affinity: -2,
      } },
    ],
  },
  {
    id: "seon_3", npcId: "seon", kind: "chain", title: "마지막 기사", minAct: 3,
    requiresAll: ["story_seon_clue"], requiresNone: ["route_seon_bad", "route_seon_normal", "route_seon_happy"], weight: 30,
    text: "마지막 객차 밖에 아르겐의 성문이 나타난다. 문 너머는 여전히 폐허다.\n“이 문으로 몇 번이나 사람들을 내보냈는지 모르겠군.” 세온은 익숙한 성벽을 오래 바라본다. “그때는 뒤돌아볼 틈도 없었어. 오늘은 좀 천천히 봐도 되겠지.”",
    choices: [
      { text: "성문을 힘으로 열어 준다", check: { stat: "resonance", base: 30, difficulty: 55 }, result: {
        text: "문이 열리자 폐허에 바람이 분다. 세온이 검을 거둔다. “한 번만 더 확인하고 싶어.”",
        setFlags: ["seon_travel_world"], nextId: "seon_final_choice", affinity: 5,
      }, fail: { text: "문은 무너져 길을 막는다. 세온은 금 간 검을 내려놓고 폐허에 마지막 인사를 건넨다.",
        setFlags: ["route_seon_normal"] } },
      { text: "기록해 둔 구조 신호를 따라 우회한다", require: { flag: "story_seon_signal" }, result: {
        text: "동쪽 성문 아래, 무너진 벽 사이로 좁은 길이 나타난다. “여기였어.” 세온이 먼저 길을 살핀다.",
        setFlags: ["seon_travel_world"], nextId: "seon_final_choice", affinity: 5,
      } },
      { text: "그가 결정할 시간을 준다", result: {
        text: "세온이 오래 바라보다 발길을 돌린다. “돌아갈 수 없더라도, 잊지는 않을게.”",
        setFlags: ["seon_independent", "route_seon_normal"],
      } },
      { text: "돌아갈 문을 봉인한다", result: {
        text: "빛이 사라진다. 세온은 검을 떨어뜨린 채, 더는 문이 있던 자리를 바라보지 못한다.",
        setFlags: ["route_seon_bad"], affinity: -10,
      } },
    ],
  },
  {
    id: "seon_final_choice", npcId: "seon", kind: "chain", title: "기사의 선택", weight: 0,
    text: "금이 간 성문 너머에 쓰러진 종탑이 보인다. 세온이 오래된 검을 거둔다.\n“끝난 전쟁을 되풀이하고 싶지는 않아.”",
    choices: [
      { text: "아르겐에 마지막 작별을 하게 한다", result: {
        text: "세온은 아르겐의 문장을 땅에 묻고 돌아선다. 전쟁은 끝났지만 그의 여정은 계속된다.",
        setFlags: ["route_seon_normal"],
      } },
      { text: "구조 신호를 따라 생존자를 찾는다", require: { flagsAll: ["seon_travel_world", "story_seon_signal"] }, result: {
        text: "폐허의 어둠에서 다시 세 번의 불빛이 답한다. 세온은 검 대신 등불을 들고 달려간다.",
        setFlags: ["route_seon_happy"],
      } },
      { text: "“그들을 찾은 뒤에도, 당신과 함께 걷고 싶어요.”", require: { flagsAll: ["seon_travel_world", "story_seon_signal", "seon_find_home"] }, result: {
        text: "폐허의 어둠에서 세 번의 불빛이 다시 답한다. 세온이 등불을 들고 달려가다 걸음을 멈추고 당신을 바라본다.\n\n“그래? 나도 같은 생각이었어.” 그가 웃으며 손을 내민다. “돌아갈 곳이 생기면 제일 먼저 네게 알려 주지. 그때도 같이 와.”",
        setFlags: ["route_seon_happy", "romance_seon_promise"], nextId: "romance_scene_seon_quiet_morning",
      } },
    ],
  },

  /* 카이루 — 스스로 쓰는 이름 */
  {
    id: "kairu_1", npcId: "kairu", kind: "npc", title: "여백의 목소리", minAct: 1, weight: 10,
    text: "빈 페이지에서 웃음 섞인 목소리가 들린다. “잠깐, 지금 나오는 주인공은 별로 재미없는데. 다른 이야기를 읽어 보지 않을래? 가령 내 이야기라든가.”\n책장을 넘기자 여백 한구석이 웃는 얼굴처럼 접힌다.",
    choices: [
      { text: "“당신은 누구예요?”", result: {
        text: "“이름부터 묻는 건가? 꽤 성급하네. 아직 없어. 이름이 생기면 누군가 나를 찾을 테니까.”", affinity: 8, setFlags: ["kairu_heard_voice"],
      } },
      { text: "목소리가 난 곳을 살펴본다", check: { stat: "insight", base: 30, difficulty: 50 }, result: {
        text: "여백 사이에 글자가 가득한 손이 보인다. “이런, 독자가 제법 눈썰미가 좋은데. 여기까지 찾아낸 사람은 드물거든.”", affinity: 10, setFlags: ["kairu_heard_voice"],
      }, fail: { text: "“거기까지. 무대 뒤편은 관람 금지야.” 웃는 목소리와 달리 책장이 단단히 닫힌다.", affinity: 0 } },
      { text: "책을 덮는다", result: {
        text: "덮인 책 안에서 웃음소리가 난다. “다음 페이지에서 보자.”", affinity: -2,
      } },
    ],
  },
  {
    id: "kairu_2", npcId: "kairu", kind: "chain", title: "읽히지 않은 페이지", minAct: 2,
    requiresAll: ["story_kairu_met"], weight: 20,
    text: "여백의 목소리가 사람의 모습으로 나타난다. 손등에는 빽빽한 글자가 새겨져 있다.\n“멋진 이름을 선물받으면 멋진 운명도 따라올 것 같지? 실은 남이 붙인 이름에는 그 사람의 명령까지 딸려 와. 참 형편없는 선물이지.”",
    choices: [
      { text: "“그럼 스스로 이름을 고르면 되잖아요.”", result: {
        text: "카이루는 반사적으로 웃으려다 멈춘다. “내가 직접? ……잠깐. 왜 그 생각은 못 했지?” 처음으로 제 손등을 자세히 살핀다.", affinity: 10, setFlags: ["kairu_true_name"],
      } },
      { text: "손등의 문장을 읽어 본다", check: { stat: "insight", base: 40, difficulty: 50 }, result: {
        text: "글자 사이로 ‘소유자’라는 단어가 보인다. 카이루가 서둘러 소매를 내린다.", affinity: 5, setFlags: ["kairu_true_name"],
      }, fail: { text: "잉크가 움직여 글자를 가린다. “이건 나도 읽기 싫어.”", affinity: 1 } },
      { text: "그에게 이야기의 다음 장을 묻는다", result: {
        text: "“아직 쓰이지 않았어.” 카이루가 빈 페이지를 두드린다. “그래서 조금 기대돼.”", affinity: 5,
      } },
    ],
  },
  {
    id: "kairu_colophon", npcId: "kairu", kind: "chain", title: "금서의 판권", minAct: 2,
    requiresAll: ["story_kairu_clue"], requiresNone: ["route_kairu_bad", "route_kairu_normal", "route_kairu_happy"], weight: 24,
    text: "금서의 뒤표지에서 희미한 문장이 드러난다. ‘타인이 적은 이름은 소유를 뜻한다.’\n그 아래는 지워졌다. 빈칸에 펜촉 자국이 남아 있다.",
    choices: [
      { text: "지워진 문장을 복원한다", check: { stat: "wisdom", base: 40, difficulty: 45 }, result: {
        text: "‘자신이 적은 이름은 누구에게도 귀속되지 않는다.’ 이 문장을 카이루에게 보여 줘야겠다.",
        setFlags: ["story_kairu_authorship"],
      }, fail: { text: "잉크는 번져 읽히지 않는다. 대신 빈칸의 모양을 수첩에 그려 둔다." } },
      { text: "빈칸과 펜촉 자국을 카이루에게 보여 준다", result: {
        text: "카이루가 종이를 문질러 본다. “아하, 작가가 자기 함정에 빠졌네. 여기에는 내가 직접 쓸 자리가 남아 있어.”",
        setFlags: ["story_kairu_authorship"], affinity: 5,
      } },
      { text: "책을 그대로 덮는다", result: {
        text: "뒤표지의 글자가 다시 흐려진다. 책은 조용히 잠긴다.",
      } },
    ],
  },
  {
    id: "kairu_3", npcId: "kairu", kind: "chain", title: "쓰이지 않은 결말", minAct: 3,
    requiresAll: ["story_kairu_clue"], requiresNone: ["route_kairu_bad", "route_kairu_normal", "route_kairu_happy"], weight: 30,
    text: "카이루의 몸에 손등의 글자가 번지고 있다. 책이 그를 다시 끌어당기는 것이다.\n“또 정해 둔 결말로 끌고 가겠다는 건가. 질리지도 않나 봐.” 카이루는 웃으려 하지만 손끝이 떨린다. “이번에는 내가 정할 거야.”",
    choices: [
      { text: "카이루가 고른 이름을 크게 부른다", check: { stat: "will", base: 30, difficulty: 60 }, result: {
        text: "잉크가 멈춘다. 카이루가 책 밖으로 발을 내딛는다. “아직 끝난 건 아니구나.”",
        setFlags: ["kairu_stayed"], nextId: "kairu_final_choice", affinity: 5,
      }, fail: {
        text: "책장이 당신의 목소리를 삼킨다. 카이루는 스스로 마지막 페이지에 자신의 이름을 남기고 책으로 돌아간다.",
        setFlags: ["kairu_returned", "route_kairu_normal"],
      } },
      { text: "“책으로 돌아가더라도, 당신이 결정하세요.”", result: {
        text: "“그렇게 할게.” 카이루는 책으로 돌아가지만 마지막 장에 자신의 이름을 직접 적는다.",
        setFlags: ["kairu_returned", "route_kairu_normal"], affinity: 4,
      } },
      { text: "빈칸과 펜을 카이루에게 건넨다", require: { flag: "story_kairu_authorship" }, result: {
        text: "카이루가 ‘내 이름은 내 것’이라고 적는다. 잉크가 멎고 책의 손아귀가 풀린다.",
        setFlags: ["kairu_stayed"], nextId: "kairu_final_choice", affinity: 5,
      } },
      { text: "그의 이름을 지워 책을 봉인한다", result: {
        text: "마지막 글자가 지워지자 목소리도 끊긴다. 빈 페이지는 다시 열리지 않는다.",
        setFlags: ["route_kairu_bad"], affinity: -10,
      } },
    ],
  },
  {
    id: "kairu_final_choice", npcId: "kairu", kind: "chain", title: "여백의 주인", weight: 0,
    text: "카이루가 마지막 페이지에 선다. 새 이름을 적을 수 있는 빈칸이 하나 있다.\n“이번 문장은 내가 쓰고 싶어.”",
    choices: [
      { text: "그가 자신의 이름을 직접 적도록 한다", require: { flagsAll: ["kairu_stayed", "story_kairu_authorship"] }, result: {
        text: "카이루가 자신의 이름을 적는다. 그는 책 밖에서도 다음 문장을 쓸 수 있게 되었다.",
        setFlags: ["route_kairu_happy"],
      } },
      { text: "여백을 남겨 두고 책을 덮는다", result: {
        text: "카이루가 아직 결론을 내리지 못한 채 책갈피를 남긴다. 다음 장은 그가 원할 때 열릴 것이다.",
        setFlags: ["route_kairu_normal"],
      } },
      { text: "“당신이 자유롭다면, 함께 이야기를 쓰고 싶어요.”", require: { flagsAll: ["kairu_stayed", "story_kairu_authorship", "kairu_asked"] }, result: {
        text: "카이루가 마지막 페이지에 자신의 이름을 적는다. 아무도 그에게 다음 문장을 명령하지 않는다.\n\n그가 펜을 당신에게 건넨다. “작가도 독자도 없는 이야기라. 꽤 마음에 드는데.” 카이루는 웃으며 당신에게 묻는다. “그럼 첫 문장은 둘이 정할까?”",
        setFlags: ["route_kairu_happy", "romance_kairu_promise"], nextId: "romance_scene_kairu_unwritten_date",
      } },
    ],
  },
  ...MEMORY_ENCOUNTERS,
  ...COMPANION_ENCOUNTERS,
  ...BOSS_COMPANION_ENCOUNTERS,
  ...ROMANCE_ENCOUNTERS,
  ...INDEPENDENT_ENCOUNTERS,
  ...UNNAMED_STATION_ENCOUNTERS,
  ...MAIN_STORY_ENCOUNTERS,
  ...SIDE_STORY_ENCOUNTERS,
  ...PERSONALITY_ENCOUNTERS,
];
