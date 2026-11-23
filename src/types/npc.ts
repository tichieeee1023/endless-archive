import type { StatKey } from "./game";

export type NpcId = "rael" | "seon" | "kairu";

export interface Npc {
  id: NpcId;
  name: string;
  title: string;
  color: string;
  stat: StatKey;
  summary: string;
}

export interface RelChoice {
  text: string;
  require?: { stat?: StatKey; min?: number; flag?: string };
  check?: { stat: StatKey; base: number; difficulty: number };
  result: { text: string; affinity?: number; flag?: string; nextEventId?: string };
  fail?: { text: string; affinity?: number; flag?: string };
}

export interface RelEvent {
  id: string;
  npcId: NpcId;
  stage: 1 | 2 | 3;
  actMin: number;
  requires?: { flag?: string };
  title: string;
  text: string;
  choices: RelChoice[];
  isFinal?: boolean;
}