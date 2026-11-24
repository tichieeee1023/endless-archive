import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PresentationState {
  motionEnabled: boolean;
  toggleMotion: () => void;
}

// Global preference, independent of run slots and archive resets.
export const usePresentation = create<PresentationState>()(
  persist(
    (set, get) => ({
      motionEnabled: true,
      toggleMotion: () => set({ motionEnabled: !get().motionEnabled }),
    }),
    { name: "endless-archive-presentation" },
  ),
);
