import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Slot = 1 | 2 | 3;

export const slotRef = { current: 1 as Slot };

interface SlotState {
  active: Slot;
  labels: Record<Slot, string>;
  setActive: (s: Slot) => void;
  setLabel: (s: Slot, label: string) => void;
}

export const useSaveSlots = create<SlotState>()(
  persist(
    (set) => ({
      active: 1,
      labels: { 1: "슬롯 1", 2: "슬롯 2", 3: "슬롯 3" },
      setActive: (s) => { slotRef.current = s; set({ active: s }); },
      setLabel: (s, l) => set((st) => ({ labels: { ...st.labels, [s]: l } })),
    }),
    {
      name: "endless-archive-slot-meta",
      onRehydrateStorage: () => (state) => {
        if (state) slotRef.current = state.active;
      },
    },
  ),
);