export interface InterludeChoice {
  text: string;
  flag: string;
  log: string;
}

export interface InterludeContent {
  act: number;
  title: string;
  text: string;
  prompt?: string;
  choices: InterludeChoice[];
}

export function interludeFor(nextAct: number, flags: readonly string[]): InterludeContent {
  if (nextAct === 2) {
    const memory = flags.includes("prologue_insight") || flags.includes("prologue_listen")
      ? "수첩의 첫 줄을 읽자, 객차의 소음 사이로 누군가 당신을 부르는 듯한 작은 목소리가 스친다."
      : flags.includes("prologue_strength")
        ? "주먹을 쥐자 손바닥에 남은 잉크 자국이 차표 위로 번진다. 이번에는 어떤 문이 앞을 막아도 직접 열 수 있을 것 같다."
      : flags.includes("prologue_reach")
        ? "차표의 빈칸을 문지르자 종이 아래에서 희미한 온기가 전해진다. 누군가의 손을 잡았던 기억이 잠깐 되살아난다."
        : flags.includes("prologue_gold")
          ? "주머니 속 동전이 차표와 부딪힌다. 이유는 아직 흐릿해도, 당장 필요한 것을 챙겼다는 감각은 분명하다."
        : flags.includes("prologue_will")
          ? "수첩의 첫 줄 아래로 잉크가 번진다. ‘끝까지 답을 찾겠다.’ 당신은 그 문장을 지우지 않는다."
        : "수첩의 첫 줄 아래로 잉크가 번진다. ‘이번에는 네가 정해.’ 당신의 필체와 꼭 닮은 문장이다.";
    const clue = flags.includes("event_window_marked")
      ? "수첩에 그려 둔 역의 모습이 차표에 번진 잉크와 겹친다. 빈칸에는 아직 읽을 수 없는 역명의 첫 획이 남았다."
      : flags.includes("event_blank_page_copied")
      ? "좌석 밑에서 옮겨 적은 쪽지의 글씨가 차표 뒷면에도 희미하게 떠오른다."
      : flags.includes("event_ticket_clue")
        ? "수첩에 끼워 둔 차표 조각이 진동한다. 화살표는 방금 빠져나온 책을 가리킨다."
        : flags.includes("event_schedule_copied")
          ? "수첩에 적힌 시간표의 마지막 숫자가 차표의 빈칸에 겹쳐 보인다."
          : "차표 한쪽에 낯선 잉크 자국이 떠오른다. 오래된 글씨인데, 어딘가 당신의 필체와 닮았다.";
    return {
      act: nextAct,
      title: "차표에 남은 글씨",
      text: `첫 번째 책의 마지막 장이 닫힌다. 열차의 흔들림이 돌아오고, 차장은 말없이 빈 차표를 내민다.\n\n${memory}\n\n${clue}\n\n차장은 글씨를 알아본 듯 입을 다문다. “아직은 말씀드릴 수 없습니다. 다음 책에서 직접 확인하시는 편이 좋겠군요.”\n\n이번에는 무엇을 할까?`,
      choices: [
        { text: "차표의 글씨를 자세히 살핀다", flag: "interlude_act1_examined", log: "당신은 차표의 잉크 자국을 수첩에 옮겨 적었다." },
        { text: "차장에게 알고 있는 것을 묻는다", flag: "interlude_act1_asked", log: "당신은 차장에게 답을 재촉했다. 그는 다음 책의 이름만 알려 주었다." },
        { text: "차표를 접어 품에 넣는다", flag: "interlude_act1_kept", log: "당신은 차표를 접어 넣었다. 답을 정할 때까지 간직하기로 했다." },
      ],
    };
  }

  const clue = flags.includes("event_window_station_named")
    ? "창문에는 당신이 이름을 불러 준 역의 불빛이 아직 남아 있다."
    : flags.includes("event_page_reader_met")
      ? "기다리던 독자가 남긴 문장이 수첩의 여백에서 이어진다. ‘기다리는 동안에도 이야기는 계속된다.’"
      : flags.includes("event_minute_restored")
        ? "되돌려 놓은 일 분이 열차의 시계마다 다시 흐르기 시작한다."
        : "두 번째 책에서 만난 얼굴과 목소리가 한 장의 종이처럼 수첩 사이에 포개진다.";
  const firstChoice = flags.includes("interlude_act1_asked")
    ? "차장에게 재촉했던 질문이 떠오른다. 그는 이번에는 시선을 피하지 않는다."
    : flags.includes("interlude_act1_examined")
      ? "차표를 살펴본 기록이 수첩에 남아 있다. 글씨는 이제 숨지 않는다."
      : flags.includes("interlude_act1_kept")
        ? "접어 둔 차표는 품 안에서 조용히 온기를 되찾는다."
        : "차표에는 빈칸이 남아 있지만, 그 글씨가 누구의 것인지는 알 것 같다.";
  return {
    act: nextAct,
    title: "당신의 책",
    text: `두 번째 책을 덮자 책장 위에서 낡은 책 한 권이 떨어진다. 책등에는 제목이 없다. 펼쳐진 첫 장에는 당신이 열차에 오르기 전의 풍경이 희미하게 그려져 있다.\n\n${clue}\n\n${firstChoice}\n\n기억은 아직 완전하지 않다. 그래도 이 책이 누구의 것인지는 알 것 같다. 당신은 마지막 장을 어떻게 마주할까?`,
    choices: [
      { text: "첫 장부터 차근차근 읽는다", flag: "interlude_act2_read", log: "당신은 자신의 책을 첫 장부터 읽기로 했다." },
      { text: "마지막 장을 먼저 펼친다", flag: "interlude_act2_last", log: "당신은 자신의 책에서 마지막 장을 먼저 펼쳤다." },
      { text: "아직은 덮어 두고 품에 넣는다", flag: "interlude_act2_waited", log: "당신은 자신의 책을 덮었다. 마지막 장은 준비가 되었을 때 읽기로 했다." },
    ],
  };
}
