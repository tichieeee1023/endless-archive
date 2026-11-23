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
  wisdom: "지혜 판정 성공률 +5%p/점",
  insight: "통찰 판정 성공률 +5%p/점",
  will: "의지 판정 성공률 +5%p/점 · 피격 피해 감소",
  resonance: "집중 공격 기본 피해 +2.5/점",
  body: "기본 공격 기본 피해 +1.8/점",
  charm: "매력 판정 성공률 +5%p/점",
};

export type Stats = Record<StatKey, number>;

export type NodeType = "battle" | "elite" | "event" | "shop" | "rest" | "treasure" | "boss";

export interface MapNode {
  id: string;
  type: NodeType;
  title: string;
  preview: string;
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
