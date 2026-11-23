import type { StatKey } from "./game";
import type { NpcId } from "./npc";

export interface EncounterChoice {
  text: string;
  /** 조건: 특정 스탯 수치 또는 플래그 보유 시에만 표시 */
  require?: { stat?: StatKey; min?: number; flag?: string };
  /** 판정: 성공 확률 = base + stat*5 - difficulty + 50 */
  check?: { stat: StatKey; base: number; difficulty: number };
  /** 성공/확정 결과 */
  result: EncounterOutcome;
  /** 판정 실패 시 결과 (없으면 result 그대로) */
  fail?: EncounterOutcome;
}

export interface EncounterOutcome {
  text: string;
  affinity?: number;
  /** 이 선택으로 부여되는 플래그 */
  setFlags?: string[];
  /** 이 선택으로 제거되는 플래그 */
  clearFlags?: string[];
  /** 다음 인카운트로 강제 연결 */
  nextId?: string;
}

export interface Encounter {
  id: string;
  npcId?: NpcId;
  /** 표시용 분류 */
  kind: "npc" | "event" | "chain";
  title: string;
  text: string;
  /** 등장 조건 */
  minAct?: number;
  requiresAll?: string[];   // 전부 보유해야 등장
  requiresNone?: string[];  // 하나라도 있으면 제외
  /** 랜덤 풀 가중치 */
  weight: number;
  /** 1회성 (본 뒤 풀에서 제거). 기본 true */
  once?: boolean;
  choices: EncounterChoice[];
}