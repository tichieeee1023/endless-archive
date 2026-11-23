import type { Npc, NpcId } from "../types/npc";

export const NPCS: Record<NpcId, Npc> = {
  rael: {
    id: "rael", name: "라엘", title: "열차의 차장",
    color: "#7aa2ff", stat: "insight",
    summary: "규칙의 집행자. 감정을 읽을 수 없는 남자.",
  },
  seon: {
    id: "seon", name: "세온", title: "표류한 기사",
    color: "#ff9a6b", stat: "body",
    summary: "멸망한 세계의 마지막 기사. 거칠지만 따뜻하다.",
  },
  kairu: {
    id: "kairu", name: "카이루", title: "책에서 나온 존재",
    color: "#c07aff", stat: "resonance",
    summary: "금서의 존재. 달콤하고 위험하다.",
  },
};

// Each stage unlocks at the lowest affinity reachable on a valid prior route.
export const NPC_AFFINITY_GATES = [0, 8, 18] as const;
