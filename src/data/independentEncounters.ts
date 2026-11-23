import type { Encounter } from "../types/encounter";

/**
 * 서고의 독립 사건. 세 인물의 호감도·연애·고유 사건 루트와 무관하다.
 * 한 번의 조우에서 짧게 끝나거나, 선택에 따라 작은 후속 사건이 열린다.
 * 기존 공통 사건(train_letter / train_empty_seat)은 memories.ts에 보존한다.
 */
export const INDEPENDENT_ENCOUNTERS: Encounter[] = [
  {
    id: "train_letter_echo", kind: "event", title: "편지의 답장", minAct: 2,
    requiresAll: ["letter_remembered"], weight: 20,
    text: "수첩에 옮겨 적은 편지의 문장 아래로 새 글씨가 번졌다. ‘잘 도착했어.’ 받는 이의 이름은 끝내 나타나지 않았다.",
    choices: [
      { text: "문장 아래에 날짜를 적는다", result: {
        text: "날짜를 적자 잉크가 마른다. 적어도 이 편지는 어딘가에 닿았다.", setFlags: ["event_letter_delivered"], reward: { mp: 7 },
      } },
      { text: "수첩을 덮고 비밀로 남긴다", result: {
        text: "모르는 사람의 마지막 안부는 더 이상 열차 안을 떠돌지 않는다.", setFlags: ["event_letter_kept_secret"],
      } },
    ],
  },
  {
    id: "train_seat_owner", kind: "event", title: "돌아온 외투의 주인", minAct: 2,
    requiresAll: ["seat_kept"], weight: 20,
    text: "외투를 남겨 둔 자리에 노인이 서 있다. 그는 빈 좌석을 보고 안도의 한숨을 쉰다. “여기가 맞았군요.”",
    choices: [
      { text: "접어 둔 외투를 건넨다", result: {
        text: "노인은 주머니에서 오래된 동전 몇 닢을 꺼내 건넨다. “고맙습니다.”", reward: { gold: 14 }, setFlags: ["event_seat_reunited"],
      } },
      { text: "“오랫동안 기다리셨나요?”", result: {
        text: "“한 정거장쯤요. 그런데 어느 정거장인지는 모르겠군요.” 노인은 외투를 걸치고 웃는다.", reward: { mp: 6 }, setFlags: ["event_seat_reunited"],
      } },
    ],
  },
  {
    id: "train_wrong_ticket", kind: "event", title: "잘못 배달된 차표", minAct: 1, weight: 10,
    text: "당신의 좌석에 다른 사람의 차표가 놓여 있다. 목적지는 ‘아직 없는 역’. 차표 뒷면에는 작은 화살표가 그려져 있다.",
    choices: [
      { text: "화살표와 역 이름을 적어 둔다", result: {
        text: "차표를 수첩에 끼운다. 화살표는 다음 객차 쪽을 가리킨다.", setFlags: ["event_ticket_clue"],
      } },
      { text: "분실물함에 넣는다", result: {
        text: "분실물함이 잠기며 작은 종소리가 난다. 안쪽에 누군가 사례로 남긴 동전이 있다.", reward: { gold: 8 }, setFlags: ["event_ticket_returned"],
      } },
      { text: "잘못된 차표는 무시한다", result: {
        text: "다음에 돌아보았을 때 차표는 사라져 있다.",
      } },
    ],
  },
  {
    id: "train_ticket_station", kind: "event", title: "존재하지 않는 승강장", minAct: 2,
    requiresAll: ["event_ticket_clue"], weight: 20,
    text: "차표의 화살표를 따라가자 빈 승강장 표지가 나타났다. 안내판은 아직 아무 역명도 표시하지 않는다.",
    choices: [
      { text: "차표를 표지 아래 꽂는다", result: {
        text: "안내판에 ‘다음에 다시’라는 글자가 켜진다. 벤치 밑에는 주인 잃은 동전 주머니가 놓여 있다.", reward: { gold: 16 }, setFlags: ["event_ticket_station_found"],
      } },
      { text: "안전한 객차로 돌아간다", result: {
        text: "뒤돌아보자 승강장 표지는 사라졌다. 주머니 속 차표만 아직 따뜻하다.", reward: { mp: 5 }, setFlags: ["event_ticket_station_left"],
      } },
    ],
  },
  {
    id: "train_reverse_schedule", kind: "event", title: "거꾸로 인쇄된 시간표", minAct: 1, weight: 10,
    text: "벽에 붙은 시간표에서 출발과 도착 순서가 뒤집혀 있다. 맨 아래에는 아직 오지 않은 시간이 하나 적혀 있다.",
    choices: [
      { text: "이상한 시간을 수첩에 옮긴다", result: {
        text: "마지막 숫자를 적자 시간표가 원래대로 돌아온다. 수첩의 숫자는 그대로다.", setFlags: ["event_schedule_copied"],
      } },
      { text: "시간표를 뜯어 버린다", result: {
        text: "종이가 사라지자 객차의 시계도 한 박자 늦게 움직인다. 마음이 조금 불안하다.", reward: { mp: -4 }, setFlags: ["event_schedule_torn"],
      } },
      { text: "시계가 정상인지 먼저 확인한다", result: {
        text: "주머니 시계는 멀쩡하다. 잘못된 것은 벽의 시간표뿐인 듯하다.", reward: { mp: 3 },
      } },
    ],
  },
  {
    id: "train_missing_minute", kind: "event", title: "사라진 일 분", minAct: 3,
    requiresAll: ["event_schedule_copied"], weight: 22,
    text: "수첩에 적힌 시각이 되자 열차가 조용해진다. 모든 시계의 초침이 멈추고, 복도 끝에 작은 열쇠가 떨어진다.",
    choices: [
      { text: "열쇠를 집어 안내함에 돌려놓는다", result: {
        text: "열차가 다시 움직인다. 안내함 속에서 작은 사례금 봉투가 밀려 나온다.", reward: { gold: 18 }, setFlags: ["event_minute_restored"],
      } },
      { text: "시계가 다시 움직일 때까지 기다린다", result: {
        text: "멈춘 시간은 생각보다 길었다. 깨어나 보니 몸의 피로가 조금 가셨다.", reward: { hp: 10 }, setFlags: ["event_minute_waited"],
      } },
    ],
  },
  {
    id: "train_spilled_ink", kind: "event", title: "쏟아진 잉크", minAct: 1, weight: 11,
    text: "열차가 급히 기울며 서고의 잉크병이 넘어졌다. 검은 잉크가 아직 쓰이지 않은 원고로 번지고 있다.",
    choices: [
      { text: "원고를 먼저 끌어낸다", check: { stat: "insight", base: 35, difficulty: 45 }, result: {
        text: "마지막 장을 구해 내자 지나가던 사서가 감사의 표시로 동전을 건넨다.", reward: { gold: 12 }, setFlags: ["event_manuscript_saved"],
      }, fail: {
        text: "원고의 끝 몇 줄이 번졌다. 잉크를 닦느라 손끝이 얼얼하다.", reward: { mp: -5 }, setFlags: ["event_manuscript_damaged"],
      } },
      { text: "잉크병부터 바로 세운다", result: {
        text: "남은 잉크는 지켰다. 사서는 젖은 원고를 말리며 고개를 끄덕인다.", reward: { mp: 5 },
      } },
      { text: "그대로 지나친다", result: {
        text: "뒤에서 종이를 걷어 올리는 소리가 들린다. 바닥에는 발자국이 남았다.",
      } },
    ],
  },
  {
    id: "train_lost_luggage", kind: "event", title: "주인 없는 여행 가방", minAct: 1, weight: 10,
    text: "통로에 낡은 여행 가방이 놓여 있다. 손잡이에 ‘다음 역에서 찾아갈 것’이라는 쪽지가 묶여 있다.",
    choices: [
      { text: "가방을 분실물칸으로 옮긴다", result: {
        text: "분실물 담당자가 감사하며 작은 사례금을 건넨다.", reward: { gold: 10 }, setFlags: ["event_luggage_returned"],
      } },
      { text: "안에 위험한 물건이 없는지 살핀다", check: { stat: "insight", base: 35, difficulty: 50 }, result: {
        text: "안에는 말린 약초와 붕대가 있다. 가방의 이름표를 확인하고 다시 닫는다.", reward: { hp: 10 }, setFlags: ["event_luggage_checked"],
      }, fail: {
        text: "자물쇠가 손가락을 찌른다. 가방은 좀처럼 열리지 않는다.", reward: { hp: -5 },
      } },
      { text: "쪽지를 그대로 두고 지나간다", result: {
        text: "다음 객차에 들어설 때쯤 가방은 누군가 가져간 듯 보이지 않는다.",
      } },
    ],
  },
  {
    id: "train_unfinished_book", kind: "event", title: "마지막 문장이 없는 책", minAct: 2, weight: 10,
    text: "책장에 한 권만 책등이 비어 있는 책이 있다. 마지막 장에는 잉크 대신 연필로 점 하나가 찍혀 있다.",
    choices: [
      { text: "책의 마지막 문장을 상상해 적는다", result: {
        text: "문장을 완성하자 책등에 작은 제목이 나타난다. 책갈피 아래에서 동전이 반짝인다.", reward: { gold: 14 }, setFlags: ["event_book_finished"],
      } },
      { text: "다음 독자를 위해 마지막 장을 비워 둔다", result: {
        text: "책이 조용히 덮인다. 새 표지가 생겼지만 제목은 여전히 빈칸이다.", reward: { mp: 8 }, setFlags: ["event_book_open_end"],
      } },
      { text: "책을 다시 꽂아 둔다", result: {
        text: "다른 책들 사이로 책등이 스며든다. 어디에 꽂았는지 곧 잊어버렸다.",
      } },
    ],
  },
  {
    id: "train_platform_lamp", kind: "event", title: "꺼져 가는 플랫폼 등불", minAct: 2, weight: 10,
    text: "정차하지 않는 역의 플랫폼에서 등불 하나가 깜빡인다. 열차가 지나가면 누구도 불을 다시 켜지 못할 것 같다.",
    choices: [
      { text: "손잡이를 돌려 등불을 밝힌다", check: { stat: "will", base: 40, difficulty: 45 }, result: {
        text: "등불이 다시 켜진다. 불빛 아래에 놓인 작은 꾸러미에서 회복약 냄새가 난다.", reward: { hp: 14 }, setFlags: ["event_lamp_lit"],
      }, fail: {
        text: "손잡이가 헛돈다. 다시 시도하기 전에 열차가 움직여 버렸다.", reward: { mp: -4 },
      } },
      { text: "객차의 창으로 불빛을 비춘다", result: {
        text: "창에 비친 빛을 따라 플랫폼의 표지판이 잠깐 드러난다. 길을 잃은 누군가에게는 도움이 되겠다.", reward: { mp: 6 }, setFlags: ["event_lamp_guided"],
      } },
      { text: "불이 꺼지는 모습을 지켜본다", result: {
        text: "마지막 빛이 사라진다. 열차는 조용히 다음 페이지로 넘어간다.",
      } },
    ],
  },
];
