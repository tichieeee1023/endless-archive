import { create } from "zustand";
import { persist } from "zustand/middleware";
import { audio } from "../lib/audio";

interface AudioState {
  sfxEnabled: boolean;
  bgmEnabled: boolean;
  toggleSfx: () => void;
  toggleBgm: () => void;
}

export const useAudio = create<AudioState>()(
  persist(
    (set, get) => ({
      sfxEnabled: true,
      bgmEnabled: false,
      toggleSfx: () => {
        const next = !get().sfxEnabled;
        audio.setMuted(!next);
        set({ sfxEnabled: next });
      },
      toggleBgm: () => {
        const next = !get().bgmEnabled;
        if (next) audio.startBgm();
        else audio.stopBgm();
        set({ bgmEnabled: next });
      },
    }),
    { name: "endless-archive-audio", onRehydrateStorage: () => (state) => { if (state) audio.setMuted(!state.sfxEnabled); } },
  ),
);
