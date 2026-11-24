import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getEndingArt } from "../data/artLibrary";

import { journeyEndings, type EndingRecord, type JourneyDraft, type JourneyRecord } from "../lib/journeyHistory";

interface MetaState {
  runCount: number;
  deaths: number;
  defeats: number;
  victories: number;
  collectedPages: string[];
  endings: string[];
  endingLog: Record<string, EndingRecord>;
  legacyEndingLog: Record<string, EndingRecord>;
  journeyHistory: JourneyRecord[];
  recordJourney: (draft: JourneyDraft) => void;

  addRun: (result: "death" | "victory" | "defeat") => void;
  collectPage: (id: string) => void;
  addEnding: (id: string, title: string, text: string) => void;
}

export const useMeta = create<MetaState>()(
  persist(
    (set) => ({
      runCount: 0, deaths: 0, defeats: 0, victories: 0,
      collectedPages: [], endings: [], endingLog: {}, legacyEndingLog: {}, journeyHistory: [],

      recordJourney: (draft) => set((s) => {
        if (s.journeyHistory.some((record) => record.id === draft.id)) return s;
        const timestamp = Date.now();
        const record: JourneyRecord = { ...draft, number: s.runCount + 1, timestamp,
          journey: { ...draft.journey }, routes: draft.routes.map((r) => ({ ...r })), bonuses: draft.bonuses.map((r) => ({ ...r })) };
        const endings = new Set(s.endings);
        const pages = new Set(s.collectedPages);
        const endingLog = { ...s.endingLog };
        for (const result of journeyEndings(record)) {
          endings.add(result.id);
          endingLog[result.id] = { title: result.title, text: result.text, timestamp };
          const art = getEndingArt(result.id);
          if (art) pages.add(`art:${art.id}`);
        }
        return {
          journeyHistory: [record, ...s.journeyHistory], endings: [...endings], collectedPages: [...pages], endingLog,
          runCount: record.number,
          victories: s.victories + Number(draft.outcome === "victory"),
          deaths: s.deaths + Number(draft.outcome === "death"),
          defeats: s.defeats + Number(draft.outcome === "defeat"),
        };
      }),

      addRun: (result) => set((s) => ({
        runCount: s.runCount + 1,
        defeats: s.defeats + (result === "defeat" ? 1 : 0),
        deaths: s.deaths + (result === "death" ? 1 : 0),
        victories: s.victories + (result === "victory" ? 1 : 0),
      })),
      collectPage: (id) => set((s) =>
        s.collectedPages.includes(id) ? s : { ...s, collectedPages: [...s.collectedPages, id] }
      ),
      addEnding: (id, title, text) => set((s) => {
        const already = s.endings.includes(id);
        const art = getEndingArt(id);
        const artKey = art ? `art:${art.id}` : null;
        return {
          endings: already ? s.endings : [...s.endings, id],
          endingLog: { ...s.endingLog, [id]: { title, text, timestamp: Date.now() } },
          collectedPages: artKey && !s.collectedPages.includes(artKey) ? [...s.collectedPages, artKey] : s.collectedPages,
        };
      }),
    }),
    {
      name: "endless-archive-meta",
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<MetaState> | undefined;
        return {
          ...currentState,
          ...persisted,
          defeats: persisted?.defeats ?? 0,
          endings: persisted?.endings ?? currentState.endings,
          endingLog: persisted?.endingLog ?? {},
          legacyEndingLog: persisted?.legacyEndingLog ?? persisted?.endingLog ?? {},
          journeyHistory: Array.isArray(persisted?.journeyHistory) ? persisted.journeyHistory : [],
        };
      },
    },
  ),
);
