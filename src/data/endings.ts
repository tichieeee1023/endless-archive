import type { NpcId } from "../types/npc";

export interface EndingEntry {
  id: string;
  title: string;
  npcId: NpcId | null;
  hint: string;
  summary: string;
}

export const ENDING_CATALOG: EndingEntry[] = [
  {
    id: "death", title: "찢어진 페이지", npcId: null,
    hint: "…어딘가에서, 이야기가 끝났다.",
    summary: "당신의 이야기는 여기서 끝났다. 그러나 열차는 다시 당신을 기다린다.",
  },
  {
    id: "solo", title: "서고의 주인", npcId: null,
    hint: "누구의 손도 잡지 않은 채, 끝까지 갔다.",
    summary: "아무도 곁에 없지만, 이제 이 열차는 당신의 것이다.",
  },
  {
    id: "rael_end", title: "정거장 없는 두 사람", npcId: "rael",
    hint: "규칙을 어긴 차장과, 그 옆자리.",
    summary: "끝나지 않는 여행은 이제 두 사람의 것이다.",
  },
  {
    id: "seon_end", title: "귀향", npcId: "seon",
    hint: "재가 된 세계와, 마지막 기사의 선택.",
    summary: "세온은 돌아갈 곳을 찾았다. 그것이 고향인지, 당신인지는 그만 알 것이다.",
  },
  {
    id: "kairu_end", title: "쓰이지 않은 결말", npcId: "kairu",
    hint: "이름을 가진 존재와, 부르지 못한 이름.",
    summary: "결말은 아직 쓰이지 않았다. 그게 이 이야기의 결말이다.",
  },
  {
    id: "true_end", title: "쓰이지 않은 첫 문장", npcId: null,
    hint: "세 사람의 이야기를 모두 들은 자만이 도달한다.",
    summary:
      "당신은 열차의 첫 페이지로 돌아갔다. 이번엔, 스스로 쓰기 위해. " +
      "— 그리고 열차의 가장 깊은 곳에서, 누군가가 아주 조용히 웃었다.",
  },
];