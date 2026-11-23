import type { StatKey, Stats } from "./game";
import type { NpcId } from "./npc";

export interface EncounterChoice {
  text: string;
  /** 조건: 특정 스탯 수치 또는 플래그 보유 시에만 표시 */
  require?: { stat?: StatKey; min?: number; flag?: string; flagsAll?: string[] };
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
  /** 공통 사건에서 얻거나 잃는 소규모 자원. 범위를 초과하지 않도록 스토어에서 제한한다. */
  reward?: { gold?: number; hp?: number; mp?: number };
  /** 이 선택으로 부여되는 플래그 */
  setFlags?: string[];
  /** 이 선택으로 제거되는 플래그 */
  clearFlags?: string[];
  /** 다음 인카운트로 강제 연결 */
  nextId?: string;
  /** 이벤트 뒤 전투로 이어진다. */
  battle?: { name: string };
  /** 능력치, 행운, 무기 강화처럼 이번 여정 동안 유지되는 보정 */
  statUp?: Partial<Stats>;
  luck?: number;
  weaponPower?: number;
}

export interface Encounter {
  id: string;
  /** 지정된 책을 선택한 플레이에서만 등장한다. */
  storyId?: string;
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
