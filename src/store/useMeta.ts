import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getEndingArt } from "../data/artLibrary";

interface EndingRecord {
  title: string;
  text: string;
  timestamp: number;
}

interface MetaState {
  runCount: number;
  deaths: number;
  victories: number;
  collectedPages: string[];
  endings: string[];
  endingLog: Record<string, EndingRecord>;

  addRun: (result: "death" | "victory") => void;
  collectPage: (id: string) => void;
  addEnding: (id: string, title: string, text: string) => void;
}

export const useMeta = create<MetaState>()(
  persist(
    (set) => ({
      runCount: 0, deaths: 0, victories: 0,
      collectedPages: [], endings: [], endingLog: {},

      addRun: (result) => set((s) => ({
        runCount: s.runCount + 1,
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
          endings: persisted?.endings ?? currentState.endings,
          endingLog: persisted?.endingLog ?? {},
        };
      },
    },
  ),
);
