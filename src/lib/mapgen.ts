import type { MapNode, NodeType } from "../types/game";
import { mulberry32, hashSeed } from "./rng";

const NODE_POOL: NodeType[] = [
  "battle", "battle", "battle",
  "event", "event", "event", "event", "event",
  "elite", "shop", "rest", "treasure",
];

const FLAVOR: Record<NodeType, { titles: string[]; previews: string[] }> = {
  battle: {
    titles: ["뒤틀린 문장들", "페이지의 그림자", "활자를 삼킨 것"],
    previews: [
      "책장 사이에서 무언가 움직인다.",
      "글자들이 들썩인다. 살아있는 것 같다.",
      "이 페이지는 누군가의 기억이다. 침입자를 경계한다.",
    ],
  },
  elite: {
    titles: ["지배당한 사서", "금서의 수호자"],
    previews: ["이 세계의 주인이 길을 막는다.", "낡은 사슬이 끊어지고, 사서가 일어선다."],
  },
  event: {
    titles: ["낯선 삽화", "말을 거는 여백", "이름 없는 등장인물"],
    previews: [
      "페이지에 갇힌 무언가가 말을 건다.",
      "선택의 기로. 이 세계는 대답을 요구한다.",
      "누군가 이 이야기를 쓰고 있다.",
    ],
  },
  shop: {
    titles: ["행상인의 마차", "떠돌이 서적상"],
    previews: ["책 사이에 낯선 마차가 멈춰 있다.", "세계와 세계 사이에 작은 상점이 열렸다."],
  },
  rest: {
    titles: ["빈 페이지", "여백"],
    previews: ["아무것도 없는 여백. 잠시 쉴 수 있다.", "아무 글도 없는 페이지. 숨을 고른다."],
  },
  treasure: {
    titles: ["잠긴 서고", "봉인된 책장"],
    previews: ["봉인된 책장이 보인다.", "누군가 숨긴 페이지가 반짝인다."],
  },
  boss: {
    titles: ["이야기의 끝", "마지막 장"],
    previews: ["이 책의 마지막 장이 기다린다.", "결말을 쓰는 자가 문 앞에 서 있다."],
  },
};

const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];

function makeNode(rng: () => number, type: NodeType, act: number, floor: number, i: number): MapNode {
  const f = FLAVOR[type];
  return {
    id: `a${act}f${floor}n${i}`,
    type,
    title: pick(rng, f.titles),
    preview: pick(rng, f.previews),
  };
}

export function generateChoices(
  seed: string, act: number, floor: number, maxFloor: number,
): MapNode[] {
  const rng = mulberry32(hashSeed(`${seed}-${act}-${floor}`));
  if (floor === maxFloor) return [makeNode(rng, "boss", act, floor, 0)];

  const mid = Math.floor(maxFloor / 2);
  const forced: NodeType | null = floor === mid ? "shop" : floor === mid + 1 ? "rest"
    : [1, 3, 6].includes(floor) ? "event" : null;

  const count = floor === 1 ? 2 : rng() < 0.5 ? 2 : 3;
  const types: NodeType[] = forced ? [forced] : [];

  while (types.length < count) {
    const t = pick(rng, NODE_POOL);
    if (t !== "battle" && types.includes(t)) continue;
    types.push(t);
  }

  return types.map((t, i) => makeNode(rng, t, act, floor, i));
}
