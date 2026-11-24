import type { NpcId } from "../types/npc";

/** 패배했을 때 인연이 손을 내밀기 위한 최소 호감도. 첫 사건 단계가 열리는 값(8)과 같다. */
export const RESCUE_AFFINITY = 8;
/** 마지막 장에서 쓰러졌을 때 '구원 결말'로 이어지는 최소 호감도. */
export const FINAL_RESCUE_AFFINITY = 12;
/** 여정 중 구조 시 남는 체력 비율과 잃는 골드 비율. */
export const RESCUE_HP_RATIO = 0.4;
export const RESCUE_GOLD_LOSS = 0.5;

const NPC_ORDER: NpcId[] = ["rael", "seon", "kairu"];

/** 가장 가까운 인물(호감도 동률이면 라엘 > 세온 > 카이루). */
export function closestBond(affinity: Record<NpcId, number>, flags: string[] = []): { npc: NpcId; value: number } {
  const available = NPC_ORDER.filter(npc => !flags.includes(`route_${npc}_bad`));
  const best = available.sort((a,b) => (affinity[b] ?? 0) - (affinity[a] ?? 0))[0];
  return best ? { npc: best, value: affinity[best] ?? 0 } : { npc: "rael", value: 0 };
}

export const RESCUE_TEXT: Record<NpcId, string> = {
  rael: "쓰러지기 직전, 열차가 날카롭게 멈춰 선다. 라엘이 회중시계를 되감아 당신을 한 칸 앞의 객차에 내려놓는다. “규정의 예외 조항입니다. 한 번뿐입니다.”",
  seon: "세온이 부서진 검을 들고 앞을 막아서더니 당신을 어깨에 둘러메고 달린다. “숨부터 골라. 살아 있으면 다시 해 볼 수 있어. 이번에는 내가 데려다줄 테니.”",
  kairu: "카이루가 책장 모서리를 접어 도망칠 길을 만든다. “쉬운 길은 아니야. 이번 한 번만 접어 줄게. 다음 장은 네가 넘겨.”",
};
