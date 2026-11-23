export type StatKey = "wisdom" | "insight" | "will" | "resonance" | "body" | "charm";

export const STAT_KEYS: StatKey[] = ["wisdom", "insight", "will", "resonance", "body", "charm"];

export const STAT_LABEL: Record<StatKey, string> = {
  wisdom: "지혜",
  insight: "통찰",
  will: "의지",
  resonance: "감응",
  body: "신체",
  charm: "매력",
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
  | "choosing"
  | "battle"
  | "shop"
  | "rel"
  | "resolving"
  | "levelup"
  | "ended";
