import type { EndingResult, RouteEnding } from "./ending";
import type { Slot } from "../store/useSaveSlots";

export type JourneyOutcome = "victory" | "death" | "defeat";
export interface EndingRecord { title: string; text: string; timestamp: number; }
export interface JourneyRecord {
  id: string;
  number: number;
  timestamp: number;
  slot: Slot;
  seed: string;
  storyId: string;
  act: number;
  floor: number;
  outcome: JourneyOutcome;
  journey: EndingResult;
  routes: RouteEnding[];
  bonuses: EndingResult[];
}
export type JourneyDraft = Omit<JourneyRecord, "number" | "timestamp">;

export function newJourneyId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function journeyEndings(record: JourneyDraft): EndingResult[] {
  return [record.journey, ...record.routes, ...record.bonuses];
}

export const JOURNEY_OUTCOME_LABEL: Record<JourneyOutcome, string> = { victory: "클리어", death: "사망", defeat: "구원 결말" };
