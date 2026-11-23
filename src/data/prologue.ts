import type { StatKey } from "../types/game";

export const PROLOGUE_PAGES = [
  {
    title: "달리는 열차에서 눈을 뜨다",
    text: "눈을 떴을 때, 열차는 이미 달리고 있었다.\n\n창밖으로 낯선 역들이 스쳐 갔지만, 역 이름은 읽기도 전에 어둠 속으로 사라졌다. 마지막으로 기억나는 건 비 냄새였다. 나는 어딘가로 가고 있었다. 누군가를 만나려 했는지, 꼭 전해야 할 말이 있었는지는 흐릿하다.\n\n다만 그 일을 더 미루면 안 된다는 마음만 선명하게 남아 있다.",
  },
  {
    title: "목적지가 비어 있는 차표",
    text: "손안에는 젖은 차표 한 장이 구겨져 있다. 출발지도, 도착지도 비어 있다. 차표를 들여다보던 차장이 잠시 망설이다 입을 연다.\n\n“이 열차에는 끝나지 못한 이야기들이 실려 있습니다. 책을 펼치면 그 안으로 들어갈 수 있지요.”\n\n그는 빈칸을 손끝으로 짚는다. “어디로 갈지는 직접 고르셔도 됩니다.”",
  },
  {
    title: "책장 사이의 불빛",
    text: "객차 안쪽에는 천장까지 닿는 책장이 이어져 있다. 책등마다 이름 없는 역, 불 꺼진 서점, 누군가의 마지막 약속이 적혀 있다.\n\n차장은 그 책들을 끝나지 못한 이야기라고 부른다. 문을 열면 책 안으로 들어갈 수 있고, 그곳에서 내린 선택은 이야기의 결말을 바꾼다고 한다.\n\n당신의 차표에는 아직 목적지가 없다. 손끝에는 길을 열 힘, 작은 단서를 읽을 통찰, 끝까지 버틸 의지, 그리고 당장 쓸 골드 중 하나를 챙기고 싶은 마음이 남아 있다.",
  },
] as const;

export interface PrologueChoice {
  text: string;
  stat?: StatKey;
  amount?: number;
  gold?: number;
  flag: string;
  log: string;
}

export const PROLOGUE_CHOICES: PrologueChoice[] = [
  { text: "힘으로 앞에 놓인 길을 연다", stat: "body", amount: 5, flag: "prologue_strength", log: "당신은 수첩에 적었다. ‘힘으로 앞에 놓인 길을 연다.’" },
  { text: "작은 단서도 놓치지 않는다", stat: "insight", amount: 5, flag: "prologue_insight", log: "당신은 수첩에 적었다. ‘작은 단서도 놓치지 않는다.’" },
  { text: "끝까지 버티며 나만의 답을 찾는다", stat: "will", amount: 5, flag: "prologue_will", log: "당신은 수첩에 적었다. ‘끝까지 버티며 나만의 답을 찾는다.’" },
  { text: "마음은 나중에 정리하고, 골드부터 챙긴다", gold: 30, flag: "prologue_gold", log: "차표를 펼치자 접혀 있던 30G가 손에 남았다. 우선 지금 쓸 수 있는 것부터 챙기기로 했다." },
];
