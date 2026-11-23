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
  {
    id: "train_window_station", kind: "event", title: "창문에 비친 역", minAct: 1, weight: 14,
    text: "창밖은 캄캄한데 유리 한쪽에만 작은 역이 비친다. 플랫폼의 등불 아래 선 사람이 열차를 향해 손을 흔든다. 실제로 창문을 열어 보아도 바람만 스친다.",
    choices: [
      { text: "손바닥으로 유리를 세 번 두드린다", check: { stat: "insight", base: 40, difficulty: 45 }, result: {
        text: "유리 너머의 사람이 같은 횟수로 답한다. 역의 표지판에는 아직 이름이 없지만, 당신은 그 위치를 수첩에 남긴다.", reward: { mp: 7 }, setFlags: ["event_window_marked"],
      }, fail: {
        text: "손끝이 유리에 닿는 순간 역이 어둠 속으로 미끄러진다. 창문에는 당신의 손자국만 남는다.", reward: { mp: -4 },
      } },
      { text: "역의 모양을 수첩에 그린다", result: {
        text: "플랫폼의 등불과 세 개의 창문을 그려 둔다. 그림을 마치자 유리 너머의 사람이 천천히 고개를 끄덕인다.", setFlags: ["event_window_marked"],
      } },
      { text: "커튼을 닫고 자리를 떠난다", result: {
        text: "커튼을 닫자 객차의 불빛이 조금 따뜻해진다. 창문에 남은 역은 보이지 않는다.", reward: { hp: 4 },
      } },
    ],
  },
  {
    id: "train_blank_page", kind: "event", title: "당신의 필체로 쓰인 쪽지", minAct: 1, weight: 14,
    text: "좌석 밑에서 접힌 쪽지를 찾는다. 짧은 문장은 분명 당신의 필체다. ‘다음 객차에서 기다릴게.’ 아래에는 날짜도 서명도 없다.",
    choices: [
      { text: "쪽지를 수첩에 옮겨 적는다", check: { stat: "wisdom", base: 40, difficulty: 45 }, result: {
        text: "문장을 베껴 쓰자 잉크가 종이 뒤편에서 한 번 번진다. 글씨 끝에 다음 객차의 번호가 드러난다.", reward: { mp: 6 }, setFlags: ["event_blank_page_copied"],
      }, fail: {
        text: "글씨를 따라 쓰려는 순간 글자가 흐려진다. 마지막 획이 손끝에 묻어 지워진다.", reward: { mp: -3 },
      } },
      { text: "쪽지를 접어 제자리에 둔다", result: {
        text: "누군가 찾을 수 있도록 좌석 밑에 다시 넣는다. 접힌 모서리가 작은 화살표처럼 다음 객차를 가리킨다.", setFlags: ["event_blank_page_copied"],
      } },
      { text: "남겨진 쪽지를 분실물함에 넣는다", result: {
        text: "분실물함 안에서 동전 두 닢이 굴러 나온다. 쪽지는 이름 없는 보관표와 함께 잠긴다.", reward: { gold: 9 },
      } },
    ],
  },
  {
    id: "train_paper_moth", kind: "event", title: "종이 나방", minAct: 1, weight: 13,
    text: "책장 사이로 종이 조각 같은 나방이 날아든다. 나방은 글자가 적힌 페이지에 앉을 때마다 한 글자씩 뜯어 먹는다. 마지막 빈 페이지 앞에서 날개를 접는다.",
    choices: [
      { text: "빈 페이지를 펼쳐 쉴 곳을 내준다", result: {
        text: "나방은 빈 종이 위에서 잠든다. 뜯겨 나간 글자들은 작은 검은 점이 되어 페이지 귀퉁이에 모인다.", reward: { mp: 8 }, setFlags: ["event_moth_sheltered"],
      } },
      { text: "책장을 닫아 안에 가둔다", check: { stat: "body", base: 35, difficulty: 45 }, result: {
        text: "책을 덮자 나방이 안쪽에서 한 번 날갯짓한다. 책등의 제목이 잠깐 빛난다.", reward: { gold: 11 },
      }, fail: {
        text: "나방이 손등을 스치며 날아간다. 살갗에 잉크 자국만 남는다.", reward: { hp: -4 },
      } },
      { text: "나방이 향하는 곳을 따라간다", result: {
        text: "나방은 빈 서가 앞에서 사라진다. 선반 뒤에서 누군가 오래전에 숨긴 작은 약병을 찾는다.", reward: { hp: 8 },
      } },
    ],
  },
  {
    id: "train_red_thread", kind: "event", title: "좌석에 묶인 붉은 실", minAct: 2, weight: 13,
    text: "좌석 손잡이에 붉은 실 한 가닥이 묶여 있다. 실은 문 아래로 이어져 다음 객차의 어둠 속으로 사라진다. 당기면 멀리서 종소리가 한 번 울린다.",
    choices: [
      { text: "실을 천천히 따라간다", check: { stat: "will", base: 40, difficulty: 50 }, result: {
        text: "실 끝에는 작은 종과 이름 없는 열쇠가 매달려 있다. 누군가 길을 잃지 않도록 묶어 둔 표식 같다.", reward: { gold: 13 }, setFlags: ["event_red_thread_followed"],
      }, fail: {
        text: "실이 갑자기 팽팽해지며 끊어진다. 종소리가 멎고, 객차의 문이 한동안 열리지 않는다.", reward: { hp: -5 },
      } },
      { text: "실을 풀어 손잡이에 가지런히 둔다", result: {
        text: "실을 풀자 문 너머에서 종이 한 번 울린다. 누군가 이제 집으로 돌아갈 수 있을 것 같다.", reward: { mp: 7 },
      } },
      { text: "실을 잘라 주머니에 넣는다", result: {
        text: "실은 손가락을 감싸며 따뜻해진다. 작은 매듭 하나가 손안에 남는다.", reward: { hp: 5 },
      } },
    ],
  },
  {
    id: "train_sealed_parcel", kind: "event", title: "봉인된 소포", minAct: 2, weight: 13,
    text: "차장실 앞에 작은 소포가 놓여 있다. 받는 사람은 ‘첫차를 놓친 사람’. 봉인은 아직 따뜻하고, 안에서 무언가 천천히 움직인다.",
    choices: [
      { text: "봉인을 살펴 조심스럽게 연다", check: { stat: "insight", base: 35, difficulty: 50 }, result: {
        text: "안에는 마른 붕대와 약초가 가지런히 들어 있다. 맨 아래에 ‘필요한 사람에게’라는 메모가 놓여 있다.", reward: { hp: 12 }, setFlags: ["event_parcel_opened"],
      }, fail: {
        text: "봉인이 터지며 먼지가 흩날린다. 소포 안은 비어 있고 손끝에 종이 가루만 묻는다.", reward: { mp: -4 },
      } },
      { text: "차장에게 소포를 맡긴다", result: {
        text: "차장은 봉투에 작은 도장을 찍는다. 도장에는 ‘도착’이라는 글자가 희미하게 남는다.", reward: { gold: 10 }, setFlags: ["event_parcel_delivered"],
      } },
      { text: "받는 사람이 올 때까지 옆에 둔다", result: {
        text: "소포는 움직임을 멈춘다. 당신이 자리를 뜰 때쯤 누군가 조용히 그것을 가져간다.", reward: { mp: 5 },
      } },
    ],
  },
  {
    id: "train_silent_car", kind: "event", title: "목소리가 사라진 객차", minAct: 2, weight: 13,
    text: "객차 안 사람들의 입은 움직이지만 아무 소리도 들리지 않는다. 창밖의 풍경도 멈춘 듯 고요하다. 당신이 숨을 내쉴 때만 유리에 옅은 김이 맺힌다.",
    choices: [
      { text: "창문에 짧은 문장을 쓴다", result: {
        text: "‘괜찮으세요?’라고 쓰자 맞은편 승객이 고개를 끄덕인다. 객차에 작은 숨소리들이 돌아온다.", reward: { mp: 8 }, setFlags: ["event_silent_car_answered"],
      } },
      { text: "종을 찾아 한 번 울린다", check: { stat: "resonance", base: 40, difficulty: 45 }, result: {
        text: "맑은 종소리가 천천히 객차를 채운다. 승객들은 각자 자기 목소리를 되찾는다.", reward: { hp: 6, mp: 5 },
      }, fail: {
        text: "종은 울리지 않는다. 대신 당신의 숨결이 유리에 길게 남았다가 사라진다.", reward: { mp: -3 },
      } },
      { text: "누구도 재촉하지 않고 잠시 앉아 있는다", result: {
        text: "침묵이 조금씩 편안해진다. 객차가 다시 움직이자 승객 하나가 당신에게 고개를 숙인다.", reward: { hp: 7 },
      } },
    ],
  },
  {
    id: "train_window_station_echo", kind: "event", title: "유리 너머의 도착 안내", minAct: 3,
    requiresAll: ["event_window_marked"], weight: 24,
    text: "수첩에 그려 둔 역의 풍경이 창문에 다시 나타난다. 이번에는 플랫폼의 표지판에 당신이 적어 둔 선들이 겹쳐 보인다. 그 아래의 사람이 입 모양으로 무엇인가 말한다.",
    choices: [
      { text: "표지판의 이름을 소리 내어 읽는다", check: { stat: "charm", base: 40, difficulty: 45 }, result: {
        text: "이름을 부르자 플랫폼의 사람이 미소 짓는다. 열차가 지나간 뒤에도 창문에는 작은 불빛 하나가 남는다.", reward: { mp: 12 }, setFlags: ["event_window_station_named"],
      }, fail: {
        text: "발음이 끝나기 전에 열차가 곡선을 돈다. 역은 사라졌지만, 당신이 적은 이름은 수첩에 남는다.", reward: { mp: -2 },
      } },
      { text: "유리에 손을 대고 작별 인사를 한다", result: {
        text: "유리 너머의 사람이 같은 곳에 손을 댄다. 두 손은 닿지 않지만, 이번에는 누군가 배웅을 받았다.", reward: { hp: 10 }, setFlags: ["event_window_station_named"],
      } },
    ],
  },
  {
    id: "train_page_reader", kind: "event", title: "쪽지를 기다린 독자", minAct: 3,
    requiresAll: ["event_blank_page_copied"], weight: 24,
    text: "수첩의 쪽지와 똑같은 필체가 객차 안내판에 적혀 있다. 글씨 아래에서 낡은 책을 든 승객이 당신을 기다린다. “그 문장을 어디서 보셨나요?”",
    choices: [
      { text: "쪽지를 보여 주며 다음 문장을 묻는다", result: {
        text: "그는 오래 생각한 뒤 한 문장을 적는다. ‘기다리는 동안에도 이야기는 계속된다.’ 수첩의 글씨가 처음으로 당신의 필체처럼 보인다.", reward: { mp: 12 }, setFlags: ["event_page_reader_met"],
      } },
      { text: "쪽지는 우연히 찾았다고 답한다", result: {
        text: "승객은 고개를 끄덕인다. “그럼 아직 주인을 찾을 수 있겠군요.” 그는 책을 품에 안고 다음 칸으로 간다.", reward: { gold: 12 }, setFlags: ["event_page_reader_met"],
      } },
      { text: "대답하지 않고 쪽지를 접는다", result: {
        text: "승객은 더 묻지 않는다. 책 속에서 종이 한 장이 바닥으로 미끄러져 나온다.", reward: { mp: 6 },
      } },
    ],
  },
  {
    id: "train_last_broadcast", kind: "event", title: "마지막 안내 방송", minAct: 3, weight: 14,
    text: "스피커에서 잡음이 끊긴 뒤 누군가의 목소리가 들린다. “이름을 기억하는 분은 다음 역에서 알려 주세요.” 잠시 침묵이 흐르고, 당신의 이름과 닮은 소리가 이어진다.",
    choices: [
      { text: "“여기 있어요.”라고 대답한다", result: {
        text: "스피커가 짧게 울린다. “확인했습니다.” 그 한마디 뒤로 열차 안의 불빛이 조금 밝아진다.", reward: { hp: 8, mp: 8 }, setFlags: ["event_broadcast_answered"],
      } },
      { text: "방송이 어디에서 오는지 찾는다", check: { stat: "insight", base: 35, difficulty: 50 }, result: {
        text: "낡은 안내실 뒤에서 작은 녹음기가 발견된다. 마지막 재생 시각은 오늘이 아니라 오래전 날짜다.", reward: { gold: 15 }, setFlags: ["event_broadcast_recording"],
      }, fail: {
        text: "안내실 문은 열리지 않는다. 돌아오는 길에 방송은 이미 끝나 있다.", reward: { mp: -4 },
      } },
      { text: "이름을 듣지 못한 척한다", result: {
        text: "스피커는 더 이상 말하지 않는다. 잠시 뒤, 누군가 당신의 자리에 따뜻한 차를 두고 간다.", reward: { hp: 6 },
      } },
    ],
  },
];
