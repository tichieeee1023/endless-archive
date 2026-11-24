import type { Encounter } from "../types/encounter";

/** 《이름 없는 역》에서만 발생하는 고정 사건과 선택형 후속 장면. */
export const UNNAMED_STATION_ENCOUNTERS: Encounter[] = [
  {
    id: "station_timetable", storyId: "unnamed_station", kind: "event", title: "검게 지워진 시간표",
    minAct: 1, weight: 0,
    text: "객차 벽의 시간표에서 역 하나가 통째로 지워져 있다. 검은 잉크는 아직 마르지 않았다. 안쪽에서 종이를 긁는 소리가 난다. 간판에 남은 글자는 ‘새’뿐이다.",
    choices: [
      { text: "통찰로 잉크 아래의 글자를 읽는다", check: { stat: "insight", base: 35, difficulty: 45 }, result: {
        text: "번진 획 사이로 두 번째 글자가 드러난다. 새벽역. 잉크가 당신을 알아본 듯 움찔한다.",
        setFlags: ["station_event_route_clue"], nextId: "station_timetable_margin",
      }, fail: {
        text: "글자를 읽으려는 순간 잉크가 손등으로 튄다. 검은 흔적이 시간표 안쪽으로 도망친다.",
        reward: { mp: -7 }, setFlags: ["station_event_ink_alert"], nextId: "station_ink_guard",
      } },
      { text: "매력으로 차장에게 운행 기록을 보여 달라고 한다", check: { stat: "charm", base: 35, difficulty: 45 }, result: {
        text: "차장은 한참 망설이다 낡은 기록철을 건넨다. 지워진 역의 도착 시각에 당신의 서명이 있다.",
        setFlags: ["station_event_route_clue"], nextId: "station_timetable_margin",
      }, fail: {
        text: "차장은 기록철을 감춘다. 그 순간 시간표의 잉크가 길게 찢어지며 튀어나온다.",
        setFlags: ["station_event_ink_alert"], nextId: "station_ink_guard",
      } },
      { text: "힘으로 시간표의 봉인을 뜯는다", check: { stat: "body", base: 35, difficulty: 50 }, result: {
        text: "봉인이 뜯기며 안쪽에 숨겨 둔 운행 기록이 떨어진다. 마지막 승객 칸에는 당신의 이름이 있다.",
        setFlags: ["station_event_route_clue"], nextId: "station_timetable_margin",
      }, fail: {
        text: "봉인은 꼼짝도 하지 않는다. 대신 시간표를 덮고 있던 잉크가 형체를 만들기 시작한다.",
        reward: { hp: -8 }, setFlags: ["station_event_ink_alert"], nextId: "station_ink_guard",
      } },
    ],
  },
  {
    id: "station_timetable_margin", storyId: "unnamed_station", kind: "chain", title: "시간표의 마지막 여백",
    minAct: 1, weight: 0,
    text: "지워진 글씨가 있던 자리에 작은 여백이 남았다. 그 틈으로 승객의 목소리가 새어 나온다. ‘이번에는 길을 잊지 마.’",
    choices: [
      { text: "남은 글자를 읽어 첫 획을 수첩에 옮긴다", check: { stat: "insight", base: 35, difficulty: 45 }, result: {
        text: "첫 획을 옮기자 종이가 따뜻해진다. 역의 이름을 되찾을 단서를 얻었다.",
        setFlags: ["station_event_first_letter"], statUp: { insight: 1 },
      }, fail: {
        text: "획이 눈앞에서 흐려진다. 잉크가 다시 몸을 일으킨다.", nextId: "station_ink_guard",
      } },
      { text: "목소리에 답해 차표를 들어 보인다", check: { stat: "charm", base: 35, difficulty: 45 }, result: {
        text: "차표의 빈칸에 희미한 빛이 맺힌다. 다음에 굴리는 주사위가 당신에게 유리해진다.",
        setFlags: ["station_event_ticket_answered"], luck: 1,
      }, fail: {
        text: "대답은 돌아오지 않는다. 대신 검은 흔적이 출구를 막아선다.", nextId: "station_ink_guard",
      } },
      { text: "몸으로 문을 받치고 승객의 목소리를 기다린다", check: { stat: "will", base: 35, difficulty: 45 }, result: {
        text: "문이 열리는 동안 당신은 승객의 목소리를 끝까지 붙잡았다. 잠시 숨을 돌릴 여유도 생겼다.",
        setFlags: ["station_event_voice_kept"], reward: { hp: 12, mp: 8 },
      }, fail: {
        text: "문 너머의 힘이 당신을 밀쳐낸다. 어둠 속 무언가가 가까워진다.",
        reward: { hp: -6 }, nextId: "station_ink_guard",
      } },
    ],
  },
  {
    id: "station_ink_guard", storyId: "unnamed_station", kind: "chain", title: "잉크의 파수꾼",
    minAct: 1, weight: 0,
    text: "시간표에서 흘러나온 잉크가 사람의 형상을 취한다. 얼굴이 있어야 할 자리에 지워진 역명만 떠다닌다. 통로를 지나려면 맞서야 한다.",
    choices: [
      { text: "잉크의 파수꾼과 맞선다", result: {
        text: "파수꾼이 검은 팔을 휘두른다. 당신은 차표를 움켜쥐고 맞설 준비를 한다.",
        battle: { name: "잉크의 파수꾼" }, setFlags: ["station_event_ink_fought"],
      } },
      { text: "의지로 첫 페이지의 문장을 읽어 낸다", check: { stat: "will", base: 30, difficulty: 45 }, result: {
        text: "당신의 첫 문장이 잉크를 잠시 멈춰 세운다. 검은 형체는 길을 비켜 준다.",
        setFlags: ["station_event_ink_stilled"], reward: { mp: 12 },
      }, fail: {
        text: "문장은 잉크에 삼켜졌다. 파수꾼이 이제 당신을 향해 다가온다.",
        battle: { name: "잉크의 파수꾼" }, setFlags: ["station_event_ink_fought"],
      } },
      { text: "통찰로 파수꾼의 빈틈을 찾는다", check: { stat: "insight", base: 30, difficulty: 45 }, result: {
        text: "형체의 중심에는 작은 글자 하나가 박혀 있다. 그것을 빼내자 파수꾼은 조용히 흩어진다.",
        setFlags: ["station_event_ink_stilled"], statUp: { wisdom: 1 }, reward: { gold: 10 },
      }, fail: {
        text: "빈틈을 찾기도 전에 파수꾼이 덮쳐 온다.",
        battle: { name: "잉크의 파수꾼" }, setFlags: ["station_event_ink_fought"],
      } },
    ],
  },
  {
    id: "station_window_echo", storyId: "unnamed_station", kind: "event", title: "창문 너머의 승객",
    minAct: 2, weight: 0,
    text: "창문에 비친 객차는 지금 있는 곳과 다르다. 오래전의 당신이 누군가와 마주 앉아 있다. 둘 사이에는 반으로 찢긴 차표가 놓여 있다. 창밖의 승객이 유리에 손바닥을 댄다.",
    choices: [
      { text: "통찰로 유리에 비친 장면을 읽는다", check: { stat: "insight", base: 35, difficulty: 45 }, result: {
        text: "기억 속 당신은 차표의 절반을 상대에게 건넨다. ‘먼저 가서 기다려 줘.’",
        setFlags: ["station_event_old_promise"], nextId: "station_window_reply",
      }, fail: {
        text: "장면이 깨진 유리처럼 흩어진다. 창문 안쪽에서 그림자가 기어 나온다.",
        reward: { mp: -6 }, nextId: "station_window_shadow",
      } },
      { text: "의지로 손바닥을 맞대고 기억을 버틴다", check: { stat: "will", base: 35, difficulty: 45 }, result: {
        text: "유리에 손을 댄 순간, 상대의 온기가 손바닥에 돌아온다. 그 사람은 아직 당신을 기다린다.",
        setFlags: ["station_event_old_promise"], nextId: "station_window_reply",
      }, fail: {
        text: "손끝이 유리에 닿자 차가운 충격이 밀려온다. 창문 속 그림자가 움직인다.",
        reward: { hp: -6 }, nextId: "station_window_shadow",
      } },
      { text: "매력으로 승객에게 말을 건다", check: { stat: "charm", base: 35, difficulty: 45 }, result: {
        text: "승객은 입 모양으로 ‘기억해’라고 말한다. 차표 반쪽을 맞추면 오래된 장면도 열릴 것이다.",
        setFlags: ["station_event_old_promise"], nextId: "station_window_reply",
      }, fail: {
        text: "목소리가 유리에 막혀 되돌아온다. 창문 안쪽의 그림자가 당신을 향한다.",
        nextId: "station_window_shadow",
      } },
    ],
  },
  {
    id: "station_window_reply", storyId: "unnamed_station", kind: "chain", title: "반쪽 차표의 기억",
    minAct: 2, weight: 0,
    text: "창문에 닿은 차표가 안쪽의 오래된 장면과 포개진다. 상대는 당신을 붙잡지 않았다. 당신은 상대에게 먼저 신호소로 가서 돌아올 길을 밝혀 달라고 부탁했었다.",
    choices: [
      { text: "통찰로 차표 뒷면의 약속을 읽는다", check: { stat: "insight", base: 35, difficulty: 45 }, result: {
        text: "‘새벽역에서 기다릴게.’ 지워졌던 문장이 돌아온다. 당신은 약속을 지키러 떠난 것이었다.",
        setFlags: ["station_event_kept_promise"], statUp: { insight: 1 },
      }, fail: {
        text: "글자는 아직 흐릿하지만, 약속의 온기는 손에 남았다. 창문 속 그림자가 다시 다가온다.",
        nextId: "station_window_shadow",
      } },
      { text: "두 차표를 포개어 승객에게 보여 준다", check: { stat: "will", base: 35, difficulty: 45 }, result: {
        text: "차표 두 장이 맞물리며 행운의 눈금이 떠오른다. 다음 선택이 조금 수월해질 것이다.",
        setFlags: ["station_event_tickets_joined"], luck: 1,
      }, fail: {
        text: "차표가 서로 밀려나며 손끝을 베었다. 창밖의 승객은 멀어지고 있다.",
        reward: { hp: -7 }, nextId: "station_window_shadow",
      } },
      { text: "승객의 목소리를 기억해 이름을 불러 본다", check: { stat: "charm", base: 35, difficulty: 45 }, result: {
        text: "이름을 부르자 창문에 따뜻한 빛이 번진다. 그 사람의 대답이 다음 객차까지 따라온다.",
        setFlags: ["station_event_guest_answered"], reward: { hp: 12, mp: 10 },
      }, fail: {
        text: "목소리가 끝내 닿지 않는다. 유리 속 그림자가 통로를 막는다.",
        nextId: "station_window_shadow",
      } },
    ],
  },
  {
    id: "station_window_shadow", storyId: "unnamed_station", kind: "chain", title: "유리창의 그림자",
    minAct: 2, weight: 0,
    text: "유리창의 그림자가 객차 안으로 쏟아진다. 형체는 흐릿하지만 손에는 당신이 건넨 차표가 들려 있다. 승객에게 닿으려면 그림자를 지나야 한다.",
    choices: [
      { text: "창문 속 그림자와 맞선다", result: {
        text: "그림자가 차표를 움켜쥔다. 당신은 승객에게 닿기 위해 앞으로 나선다.",
        battle: { name: "유리창의 그림자" }, setFlags: ["station_event_shadow_fought"],
      } },
      { text: "매력으로 승객에게 마지막 신호를 보낸다", check: { stat: "charm", base: 30, difficulty: 45 }, result: {
        text: "승객의 손전등이 세 번 깜박인다. 그림자는 빛을 견디지 못하고 흩어진다.",
        setFlags: ["station_event_shadow_passed"], luck: 1,
      }, fail: {
        text: "신호가 닿기 전에 그림자가 덮쳐 온다.",
        battle: { name: "유리창의 그림자" }, setFlags: ["station_event_shadow_fought"],
      } },
      { text: "의지로 차표를 놓지 않고 버틴다", check: { stat: "will", base: 30, difficulty: 45 }, result: {
        text: "그림자가 차표를 잡아당기지만, 당신은 끝까지 손을 놓지 않는다. 빈칸에 희미한 이름이 남는다.",
        setFlags: ["station_event_shadow_passed"], statUp: { will: 1 },
      }, fail: {
        text: "차표가 찢어질 듯 팽팽해진다. 그림자가 당신을 향해 몸을 일으킨다.",
        battle: { name: "유리창의 그림자" }, setFlags: ["station_event_shadow_fought"],
      } },
    ],
  },
  {
    id: "station_gate_name", storyId: "unnamed_station", kind: "event", title: "새벽역의 닫힌 개찰구",
    minAct: 3, weight: 0,
    text: "새벽역이 가까워졌지만 개찰구는 굳게 닫혀 있다. 문 위에는 역명을 삼킨 검은 형체가 웅크리고 있다. 플랫폼에는 승객이 기다리고 있다.",
    choices: [
      { text: "통찰로 형체가 삼킨 역명을 찾는다", check: { stat: "insight", base: 35, difficulty: 50 }, result: {
        text: "형체의 몸 안에서 ‘새벽’이라는 글자가 빛난다. 약점이 보인다.",
        setFlags: ["station_event_gate_weakness"], nextId: "station_gate_answer",
      }, fail: {
        text: "검은 형체가 역명을 더 깊이 삼킨다. 바닥에 잉크가 쏟아진다.", nextId: "station_name_eater",
      } },
      { text: "의지로 승객을 지키며 개찰구 앞에 선다", check: { stat: "will", base: 35, difficulty: 50 }, result: {
        text: "당신이 앞을 막아서자 승객이 반쪽 차표를 높이 든다. 문에 틈이 생긴다.",
        setFlags: ["station_event_gate_weakness"], nextId: "station_gate_answer",
      }, fail: {
        text: "개찰구가 흔들리며 당신을 밀쳐 낸다. 검은 형체가 모습을 드러낸다.",
        reward: { hp: -8 }, nextId: "station_name_eater",
      } },
      { text: "힘으로 개찰구를 억지로 연다", check: { stat: "body", base: 35, difficulty: 55 }, result: {
        text: "개찰구가 열리자 승객의 차표가 당신 손에 돌아온다. 이제 마지막 글자를 되찾을 수 있다.",
        setFlags: ["station_event_gate_weakness"], nextId: "station_gate_answer",
      }, fail: {
        text: "금속 문이 꿈쩍도 하지 않는다. 검은 형체가 개찰구에서 떨어져 나온다.",
        nextId: "station_name_eater",
      } },
    ],
  },
  {
    id: "station_gate_answer", storyId: "unnamed_station", kind: "chain", title: "마지막 글자",
    minAct: 3, weight: 0,
    text: "개찰구 앞에 두 장의 차표가 나란히 놓인다. 역명은 거의 돌아왔다. 마지막 글자 하나가 당신의 대답을 기다린다.",
    choices: [
      { text: "매력으로 승객의 이름을 불러 역명을 완성한다", check: { stat: "charm", base: 35, difficulty: 50 }, result: {
        text: "승객이 대답하자 간판의 글자가 모두 돌아온다. 새벽역의 불빛이 켜진다.",
        setFlags: ["station_event_full_name"], statUp: { charm: 1 },
      }, fail: {
        text: "목소리가 검은 형체에 삼켜진다. 간판의 불빛이 꺼지기 시작한다.", nextId: "station_name_eater",
      } },
      { text: "의지로 불을 밝혀 승객을 먼저 안전하게 보낸다", check: { stat: "will", base: 35, difficulty: 50 }, result: {
        text: "당신이 든 불빛을 따라 승객이 개찰구를 빠져나온다. 그 뒤에 역명도 천천히 모습을 되찾는다.",
        setFlags: ["station_event_guest_safe"], reward: { hp: 16, mp: 10 },
      }, fail: {
        text: "불빛이 흔들리며 약해진다. 형체가 개찰구를 넘어온다.", nextId: "station_name_eater",
      } },
      { text: "힘으로 마지막 잠금쇠를 부순다", check: { stat: "body", base: 35, difficulty: 55 }, result: {
        text: "잠금쇠가 부서지며 통로가 열린다. 몸에 남은 긴장이 공격의 힘으로 바뀐다.",
        setFlags: ["station_event_gate_open"], weaponPower: 1,
      }, fail: {
        text: "잠금쇠가 버틴다. 소리에 이끌린 형체가 가까워진다.", nextId: "station_name_eater",
      } },
    ],
  },
  {
    id: "station_name_eater", storyId: "unnamed_station", kind: "chain", title: "역명을 삼킨 것",
    minAct: 3, weight: 0,
    text: "검은 형체가 개찰구를 넘어온다. 그 몸에는 지워진 역명이 뒤엉켜 있다. 형체를 멈추지 않으면 승객도, 새벽역도 다시 사라질 것이다.",
    choices: [
      { text: "역명을 삼킨 것과 맞선다", result: {
        text: "형체가 차표를 향해 달려든다. 당신은 마지막 페이지 앞에 선다.",
        battle: { name: "역명을 삼킨 것" }, setFlags: ["station_event_name_eater_fought"],
      } },
      { text: "통찰로 삼켜진 이름을 하나씩 불러낸다", check: { stat: "insight", base: 30, difficulty: 50 }, result: {
        text: "이름을 부를 때마다 형체가 작아진다. 마지막으로 남은 글자가 새벽역 간판에 돌아온다.",
        setFlags: ["station_event_full_name"], luck: 1,
      }, fail: {
        text: "이름들이 서로 얽혀 더 깊은 어둠을 만든다. 형체가 달려든다.",
        battle: { name: "역명을 삼킨 것" }, setFlags: ["station_event_name_eater_fought"],
      } },
      { text: "몸을 던져 승객을 보호한다", check: { stat: "body", base: 30, difficulty: 50 }, result: {
        text: "형체의 공격을 받아내자 승객이 개찰구를 빠져나온다. 두 사람은 역 이름을 함께 되찾는다.",
        setFlags: ["station_event_guest_safe"], reward: { hp: 14, mp: 10 },
      }, fail: {
        text: "충격에 무릎이 꺾인다. 형체가 마지막 차표를 노린다.",
        battle: { name: "역명을 삼킨 것" }, setFlags: ["station_event_name_eater_fought"],
      } },
    ],
  },
];
