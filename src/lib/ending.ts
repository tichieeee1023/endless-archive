import type { NpcId } from "../types/npc";

export interface EndingResult {
  id: string;
  title: string;
  text: string;
  npcId: NpcId | null;
}

export function resolveEnding(
  affinity: Record<NpcId, number>,
  flags: string[],
  victory: boolean,
  metaEndings: string[] = [],
): EndingResult {
  const entries = (Object.entries(affinity) as [NpcId, number][]).sort((a, b) => b[1] - a[1]);
  const completed = entries.filter(([npc]) => flags.includes(`${npc}_end_confirmed`));
  const [topNpc] = completed[0] ?? entries[0];

  if (!victory) {
    return {
      id: "death", npcId: null, title: "찢어진 페이지",
      text: "손끝에서 수첩이 미끄러진다. 차가운 바닥에 닿기 전에, 누군가 마지막 장을 붙잡는다.\n\n‘이 이야기가 여기서 끝나는 건가요?’\n\n대답은 들리지 않는다. 대신 멀리서 기적 소리가 울린다. 당신이 남긴 문장들이 책장 사이로 흩어지고, 빈 차표 한 장이 다시 손안에 놓인다.\n\n아직 돌아오지 못한 이야기가 있다. 다음 열차가 올 때, 당신은 다시 선택할 수 있다.",
    };
  }

  const allThree = ["rael_end", "seon_end", "kairu_end"].every((id) => metaEndings.includes(id));
  if (allThree && completed.length > 0) {
    return {
      id: "true_end", npcId: null, title: "쓰이지 않은 첫 문장",
      text:
        "처음 눈을 떴던 플랫폼에 세 사람의 목소리가 차례로 닿는다. 그들이 남긴 약속은 서로 다른 페이지에 있지만, 모두 당신이 직접 고른 문장이었다.\n\n" +
        "차표의 빈칸에 더는 목적지를 적을 필요가 없다. 돌아갈 수 있는 곳이 하나가 아니라는 것을 이제 알기 때문이다.\n\n" +
        "수첩의 마지막 장 너머에서 누군가 조용히 웃는다.\n\n" +
        "“이제 어떤 이야기를 쓰시겠습니까?”\n\n당신은 펜을 든다. 첫 문장은 아직 쓰이지 않았다.",
    };
  }

  if (completed.length === 0) {
    return {
      id: "solo", npcId: null, title: "서고의 주인",
      text: "당신은 열차의 마지막 페이지를 넘긴다. 창밖에 처음 보는 역이 나타난다.\n\n어떤 이야기는 끝까지 듣지 못했고, 어떤 인사는 다음으로 미뤄 두었다. 그렇다고 이 여정이 비어 있었던 것은 아니다. 수첩에는 당신이 직접 고른 문장들이 남아 있다.\n\n문이 열리자 서늘한 바람이 불어온다. 당신은 차표를 주머니에 넣고 한 발을 내딛는다.\n\n돌아올 곳도, 새로 찾아갈 곳도 이제 당신이 정할 수 있다.",
    };
  }

  const endings: Record<NpcId, EndingResult> = {
    rael: {
      id: "rael_end", npcId: "rael", title: "정거장 없는 두 사람",
      text: (flags.includes("rael_hand")
        ? "기관실의 문이 천천히 닫힌다. 라엘은 규칙을 적은 장부 대신 당신의 손을 잡고 객차로 돌아온다."
        : "기관실에서 나온 라엘은 한동안 말을 잇지 못한다. 당신이 재촉하지 않고 곁에 서 있자, 그가 먼저 손을 내민다.") +
        "\n\n“이제 어디로 가시겠습니까?”\n\n“라엘은요?”\n\n그가 회중시계를 연다. 초침은 더 이상 거꾸로 돌지 않는다. " +
        (flags.includes("rael_tea_together") ? "식어 버린 차를 함께 마시던 창가 자리, " : "두 사람이 처음 마주쳤던 복도, ") +
        "당신과 보낸 시간들을 떠올리듯 그가 작게 웃는다.\n\n“당신 옆자리라면, 어느 역이든 괜찮습니다.”\n\n열차는 달린다. 이번 여행의 속도는 두 사람이 함께 정한다.",
    },
    seon: {
      id: "seon_end", npcId: "seon", title: "귀향",
      text: (flags.includes("seon_stayed")
        ? "세온은 열차의 문을 닫고 당신 곁으로 돌아온다. 창밖에 아르겐의 마지막 풍경이 멀어지지만, 그의 손은 검이 아닌 당신을 향한다."
        : flags.includes("seon_travel_world")
          ? "아르겐의 무너진 성문 앞에서 세온이 당신을 돌아본다. 이곳은 여전히 폐허지만, 두 사람에게 남은 시간을 무엇으로 채울지는 아직 정해지지 않았다."
          : "세온은 열차의 문 앞에서 멈춰 선다. 창밖으로 아르겐의 풍경이 비친다. 그는 한참을 바라보다 당신에게 고개를 돌린다.") +
        "\n\n“전에는 돌아갈 곳만 있으면 된다고 생각했어.”\n\n그가 당신의 손을 잡는다. " +
        (flags.includes("seon_bandaged") ? "예전에 붕대를 감아 주었던 손이다. " : "거칠고 따뜻한 손이다. ") +
        "“이제는 누구와 돌아가는지도 중요해.”\n\n당신이 손을 마주 잡자 그가 조심스럽게 당신을 끌어안는다. 갑옷 너머로 고른 숨소리가 들린다.\n\n“다음엔 네 이야기를 들려줘. 천천히, 얼마든지 기다릴게.”",
    },
    kairu: {
      id: "kairu_end", npcId: "kairu", title: "쓰이지 않은 결말",
      text: (flags.includes("kairu_stayed")
        ? "카이루의 손등에서 마지막 글자가 사라진다. 그는 자신의 손을 내려다보다 당신에게 보여 준다. “나, 아직 여기 있네.”"
        : "카이루는 책의 마지막 장으로 돌아간다. 당신이 표지를 닫으려는 순간, 책갈피 하나가 손가락 사이로 빠져나온다.") +
        "\n\n“내 결말은 네가 정해 줄 줄 알았어.”\n“당신이 고를 수 있어요.”\n\n그가 웃는다. 처음 만났을 때처럼 다정하고, 조금은 위험한 웃음이다. " +
        (flags.includes("kairu_asked") ? "하지만 이번에는 당신의 대답을 기다린다. " : "하지만 이번에는 당신을 지나치지 않는다. ") +
        "\n\n“그럼 나는, 네가 다음 페이지를 펼칠 때 다시 만나고 싶어.”\n\n당신이 그의 이름을 부르자 여백에 새로운 문장이 생긴다. 아직 누구도 읽지 않은 이야기다.",
    },
  };

  return endings[topNpc];
}
