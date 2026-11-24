import { EXPANDED_STORY } from "./mainStory";

export interface StoryBeatChoice {
  text: string;
  flag: string;
  log: string;
}

export interface StoryBeat {
  act: number;
  title: string;
  text: string;
  prompt: string;
  choices: StoryBeatChoice[];
}

export const UNNAMED_STATION_OPENING: StoryBeat = {
  act: 1,
  title: "차표에 적힌 약속",
  text: `책장을 펼치자, 비 냄새가 먼저 돌아온다. 당신은 오래된 역의 플랫폼에 서 있다. 누군가를 만나기로 했지만 얼굴도 이름도 떠오르지 않는다. 기억나는 건 하나뿐이다. 당신이 직접 쓴 문장.

“새벽이 오기 전에, 그 역에서 만나자.”

눈을 뜨자 열차 안이다. 차표의 도착역은 칼로 도려낸 듯 비어 있고, 뒷면에는 방금 읽은 문장과 같은 필체가 남아 있다. 창밖으로 역 하나가 스친다. 간판에는 ‘새’라는 글자만 희미하게 보인다.

이 책에서 당신이 해야 할 일은 분명하다. 사라진 역의 이름을 찾고, 그곳에서 기다리는 사람에게 약속의 답을 건네는 것.`,
  prompt: "무엇부터 확인할까?",
  choices: [
    { text: "차표 뒷면의 필체를 자세히 살핀다", flag: "station_opening_ticket", log: "차표의 글씨는 분명 당신의 필체였다. '새벽이 오기 전에'라는 약속도." },
    { text: "창밖 승객의 모습을 기억해 둔다", flag: "station_opening_passenger", log: "창밖의 승객은 당신과 똑같이 반쪽짜리 차표를 들고 있었다." },
    { text: "차장의 운행 기록을 찾아본다", flag: "station_opening_record", log: "운행 기록에는 '새벽역'이라는 이름 위로 검은 줄이 그어져 있었다." },
  ],
};

export function unnamedStationInterludeFor(nextAct: number, flags: readonly string[]): StoryBeat {
  if (flags.includes(EXPANDED_STORY)) {
    if (nextAct === 2) return {
      act: 2, title: "기록에서 사라진 승객",
      text: `첫 번째 책이 닫히고 열차의 흔들림이 돌아온다. ${flags.includes("main_manifest_proof") ? "수첩에는 두 사람의 승차 기록이 나란히 남아 있다." : "두 사람이 함께 탔다는 사실을 이제 알고 있다."} ${flags.includes("main_signal_proof") ? "창밖의 불빛이 당신의 대답을 기억한다." : "창밖의 불빛은 아직 사라지지 않았다."}\n\n차장은 다음 책을 내민다. “역이 지워진 날의 기록입니다. 이 책에는 떠나셨던 이유가 남아 있을 겁니다.”\n\n누가 두 사람을 갈라놓았는지, 그날 어떤 약속을 했는지 알아낼 차례다.`,
      prompt: "다음 책을 펼치기 전 무엇을 간직할까?",
      choices: [
        {text:"두 사람의 승차 기록을 정리한다",flag:"station_act1_copy_record",log:"수첩의 기록을 정리했다."},
        {text:"차장에게 다음 책의 기록을 묻는다",flag:"station_act1_ask_conductor",log:"차장은 비가 내리던 밤의 기록이 남아 있다고 답했다."},
        {text:"창밖을 향해 차표를 들어 보인다",flag:"station_act1_show_ticket",log:"창밖의 불빛이 짧게 응답했다."},
      ],
    };
    return {
      act: 3,title:"돌아오지 못한 약속",
      text:`두 번째 책을 덮자 끊어진 선로가 차창 너머에 나타난다. 당신은 그날 길을 열기 위해 떠났고, 다른 사람은 신호를 보내기 위해 남았다. ${flags.includes("main_reason_proof") ? "두 사람의 선택을 수첩에 나란히 기록했다." : "그날의 기억을 전부 붙잡지는 못했지만, 다시 답할 기회는 남아 있다."}\n\n새벽역이 가까워지고 있다. 마지막 장은 도착하지 못한 이야기를 닫으려 한다. 이번에는 그 문장을 넘어 두 사람이 직접 다음 목적지를 결정해야 한다.`,
      prompt:"마지막 책을 어떤 마음으로 펼칠까?",
      choices:[
        {text:"새벽역의 이름을 소리 내어 읽는다",flag:"station_act2_speak_name",log:"돌아갈 역의 이름을 기억했다."},
        {text:"두 사람의 차표를 기억한다",flag:"station_act2_hold_ticket",log:"두 사람의 여정은 아직 끝나지 않았다."},
        {text:"떠났던 이유를 잊지 않기로 한다",flag:"station_act2_recall_reason",log:"그날의 선택을 잊지 않기로 했다."},
      ],
    };
  }
  if (nextAct === 2) {
    const clue = flags.includes("station_opening_record")
      ? "차장의 기록에서 본 검은 줄은 한 사람의 이름을 가리고 있었다. 지워진 역에서 내리지 못한 마지막 승객."
      : flags.includes("station_opening_passenger")
        ? "창밖의 승객은 객차가 바뀔 때마다 같은 자리에 서 있었다. 그 손에는 당신의 차표와 맞물릴 반쪽이 들려 있었다."
      : "차표 뒷면의 약속 아래, 지워진 글씨가 조금씩 떠올랐다. ‘새벽역에서 기다릴게.’ 당신의 필체였다.";

    return {
      act: nextAct,
      title: "기록에서 사라진 승객",
      text: `첫 번째 막의 마지막 객차에서, 오래된 승차 기록 한 장을 발견한다. 열차가 출발한 밤, 승객은 둘이었다. 한 사람은 당신. 다른 한 사람의 도착지는 이름이 지워진 역이다.

${clue}

차장은 기록을 덮으려 한다. “그 역에 닿으면 잊었던 일을 전부 기억하게 될 겁니다. 그래도 찾으시겠습니까?”

차표에는 아직 빈칸이 남아 있다. 다음 막에서는 그 승객이 왜 혼자 남겨졌는지 밝혀야 한다.`,
      prompt: "기록의 빈칸을 어떻게 남길까?",
      choices: [
        { text: "승차 기록을 베껴 수첩에 남긴다", flag: "station_act1_copy_record", log: "당신은 두 승객의 기록을 수첩에 옮겼다. 자신이 이 역에 온 이유를 모른 척하지 않기로 했다." },
        { text: "차장에게 지워진 이름을 묻는다", flag: "station_act1_ask_conductor", log: "차장은 대답 대신 오래된 차표 반쪽을 건넸다. 뒷면에는 '기다릴게'라는 글씨가 남아 있었다." },
        { text: "창밖 승객에게 차표를 보여준다", flag: "station_act1_show_ticket", log: "창밖의 승객이 차표를 알아보고 고개를 끄덕였다. 두 장은 한 쌍이었다." },
      ],
    };
  }

  const clue = flags.includes("station_act1_ask_conductor")
    ? "차장이 건넨 반쪽 차표에는 당신의 서명과 함께 ‘이번에는 같이 내리자’고 적혀 있다."
    : flags.includes("station_act1_show_ticket")
      ? "두 반쪽 차표가 맞닿자 지워졌던 역 이름이 드러난다. 새벽역. 당신은 그곳에서 누군가와 함께 내리기로 약속했다."
      : "수첩에 옮긴 기록의 뒷면에서 한 문장이 발견된다. ‘이번에는 꼭 같이 내리자.’ 당신의 서명이 그 아래 남아 있다.";

  return {
    act: nextAct,
    title: "돌아오지 못한 약속",
    text: `두 번째 막에서 당신은 승객의 반쪽 차표와 오래된 운행 기록을 맞춰 본다. 기록 속 마지막 승객은 다른 사람이 아니었다. 기억을 잃기 전의 당신이, 누군가를 새벽역에 남겨 둔 채 혼자 열차에 올랐다.

${clue}

왜 그날 혼자 떠났는지는 아직 기억나지 않는다. 하지만 기다리는 사람은 떠난 일을 탓하지 않는다. 차표 뒷면에 남은 문장은 짧다.

“이름을 잊어도 괜찮아. 이번에는 네가 오기만 하면 돼.”

세 번째 막의 목적지는 새벽역이다. 마지막 페이지를 넘기기 전에, 당신은 약속을 어떤 마음으로 마주할지 정해야 한다.`,
    prompt: "약속을 어떤 마음으로 마주할까?",
    choices: [
      { text: "역의 이름을 잊지 않도록 소리 내어 읽는다", flag: "station_act2_speak_name", log: "당신은 새벽역이라는 이름을 소리 내어 읽었다. 이제 어디로 가야 하는지 안다." },
      { text: "기다리는 사람의 차표를 꼭 쥔다", flag: "station_act2_hold_ticket", log: "두 장의 차표를 함께 쥐었다. 이번에는 혼자 내리지 않겠다고 마음먹었다." },
      { text: "떠났던 이유까지 기억하겠다고 다짐한다", flag: "station_act2_recall_reason", log: "당신은 떠났던 이유도 피하지 않기로 했다. 약속을 지키는 일은 기억을 되찾는 일과 같았다." },
    ],
  };
}

export function unnamedStationChapterText(act: number, flags: readonly string[]): string {
  if (act === 2) {
    const echo = flags.includes("station_act1_show_ticket")
      ? "두 장의 차표가 맞물린 감각이 손끝에 남아 있다."
      : flags.includes("station_act1_ask_conductor")
        ? "차장은 대답을 아꼈지만, 건넨 차표 반쪽은 거짓말을 하지 않았다."
        : "수첩에 베껴 둔 두 사람의 승차 기록이 자꾸 눈에 밟힌다.";
    return `기록에서 사라진 마지막 승객은 당신과 함께 타고 있었다. 이제 그 사람이 왜 새벽역에 남았는지, 당신이 왜 혼자 떠났는지를 찾아야 한다.

${echo}`;
  }
  if (act === 3) {
    const eventEcho = flags.includes("station_event_full_name")
      ? "개찰구에서 되찾은 역명은 이제 누구도 지울 수 없다."
      : flags.includes("station_event_kept_promise")
        ? "창문에 비친 약속의 문장을 기억한다. 당신은 도망친 게 아니라 길을 찾으러 떠났었다."
        : flags.includes("station_event_first_letter")
          ? "시간표 여백에서 옮겨 둔 첫 획이 차표의 빈칸과 맞아떨어진다."
          : "";
    const echo = flags.includes("station_act2_hold_ticket")
      ? "두 장의 차표를 품에 넣었다. 이번에는 반드시 함께 내리겠다고 약속했다."
      : flags.includes("station_act2_recall_reason")
        ? "떠났던 이유를 기억할 준비가 됐다. 약속을 지키는 일은 그날의 자신을 마주하는 일이기도 하다."
        : "새벽역이라는 이름을 잊지 않도록, 수첩 첫 장에 적어 두었다.";
    return [
      "차창 밖 어둠이 푸르게 밝아 온다. 다음 역은 새벽역. 빈 차표에 남은 마지막 칸이 천천히 채워진다.",
      echo,
      eventEcho,
      "플랫폼에 누군가 서 있다. 이제는 그 사람에게 어떤 답을 건넬지 선택해야 한다.",
    ].filter(Boolean).join("\n\n");
  }
  const approach = flags.includes("station_opening_passenger")
    ? "창밖에서 마주친 승객의 반쪽 차표가 마음에 걸린다."
    : flags.includes("station_opening_record")
      ? "운행 기록에서 지워진 ‘새벽역’이라는 이름이 마음에 걸린다."
      : "차표 뒷면에 남은 ‘새벽이 오기 전에’라는 약속이 마음에 걸린다.";
  return `이 책에서 당신은 사라진 역의 이름을 찾고, 그곳에서 기다리는 사람에게 약속의 답을 건네야 한다.

${approach}`;
}
