export type StatKey = "wisdom" | "insight" | "will" | "resonance" | "body" | "charm";

export const STAT_KEYS: StatKey[] = ["wisdom", "insight", "will", "resonance", "body", "charm"];

export const STAT_LABEL: Record<StatKey, string> = {
  wisdom: "지혜",
  insight: "통찰",
  will: "의지",
  resonance: "감수성",
  body: "힘",
  charm: "매력",
};

export const STAT_DESCRIPTION: Record<StatKey, string> = {
  wisdom: "지혜 판정 성공률 +5%p/점 · 4 초과 2점마다 집중 공격 소모 -1(최소 6) · 4 초과 점당 집중 피해 +1(최대 +14)",
  insight: "통찰 판정 성공률 +5%p/점 · 4 초과 1점마다 반격 회피 +3%(최대 30%)",
  will: "의지 판정 성공률 +5%p/점 · 피격 피해 -0.7/점",
  resonance: "집중 피해: 기본 4점까지 +2.5/점, 5~14점 +1.8/점, 이후 +1.2/점 · 힘보다 높으면 전투 시작 판정에 사용",
  body: "기본 공격 기본 피해 +1.8/점 · 감수성보다 높으면 전투 시작 판정에 사용",
  charm: "매력 판정 성공률 +5%p/점 · 4 초과 1점마다 체력 물약 회복 +2",
};

export type Stats = Record<StatKey, number>;

export type NodeType = "battle" | "elite" | "event" | "shop" | "rest" | "treasure" | "boss";

export interface MapNode {
  id: string;
  type: NodeType;
  title: string;
  preview: string;
  encounterId?: string;
}

export type LogType = "sys" | "dmg" | "heal" | "loot" | "title";

export interface LogEntry {
  id: number;
  text: string;
  type: LogType;
}

export type Status =
  | "prologue"
  | "storySelect"
  | "storyOpening"
  | "interlude"
  | "finalChoice"
  | "choosing"
  | "battle"
  | "shop"
  | "rel"
  | "resolving"
  | "levelup"
  | "ended";
