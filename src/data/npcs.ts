import type { Npc, NpcId } from "../types/npc";

export const NPCS: Record<NpcId, Npc> = {
  rael: {
    id: "rael", name: "라엘", title: "열차의 차장",
    color: "#59788d", stat: "insight",
    summary: "규칙의 집행자. 냉철하고 우아하며, 존댓말로 상대의 허점을 찌른다.",
  },
  seon: {
    id: "seon", name: "세온", title: "표류한 기사",
    color: "#a46c50", stat: "body",
    summary: "멸망한 세계의 마지막 기사. 노련하고 담담하며, 상대를 편하게 해 주는 여유가 있다. 자신의 몫을 홀로 짊어지는 버릇이 남아 있다.",
  },
  kairu: {
    id: "kairu", name: "카이루", title: "책에서 나온 존재",
    color: "#806a99", stat: "resonance",
    summary: "금서의 존재. 능청스럽고 예측하기 어려우며, 자신의 자유와 남이 고른 뜻밖의 대답을 좋아한다.",
  },
};

// Each stage unlocks at the lowest affinity reachable on a valid prior route.
export const NPC_AFFINITY_GATES = [0, 8, 18] as const;
