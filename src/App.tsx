import { useEffect } from "react";
import { useRun, useRunHydrated } from "./store/useRun";
import { useSaveSlots } from "./store/useSaveSlots";
import StatusBar from "./components/StatusBar";
import AffinityBar from "./components/AffinityBar";
import SceneView from "./components/SceneView";
import ActionPanel from "./components/ActionPanel";
import EventModal from "./components/EventModal";
import LevelUpModal from "./components/LevelUpModal";
import EndingScreen from "./components/EndingScreen";
import Prologue from "./components/Prologue";
import StorySelect from "./components/StorySelect";
import StoryOpeningScreen from "./components/StoryOpeningScreen";
import InterludeScreen from "./components/InterludeScreen";
import FinalChoiceScreen from "./components/FinalChoiceScreen";
import { seedFromUrl } from "./lib/seedFromUrl";
import { audio } from "./lib/audio";
import { useAudio } from "./store/useAudio";

export default function App() {
  const status = useRun((s) => s.status);
  const activeSlot = useSaveSlots((s) => s.active);
  const startRun = useRun((s) => s.startRun);
  const hydrated = useRunHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const urlSeed = seedFromUrl();
    if (urlSeed) {
      startRun(urlSeed);
      window.history.replaceState({}, "", window.location.pathname + window.location.hash);
    } else if (!useRun.getState().seed) {
      startRun();
    }
  }, [hydrated, startRun]);

  useEffect(() => {
    const activate = () => { audio.warmup(); if (useAudio.getState().bgmEnabled) audio.startBgm(); window.removeEventListener("pointerdown", activate); };
    window.addEventListener("pointerdown", activate);
    return () => window.removeEventListener("pointerdown", activate);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest("button");
      if (!button || button.dataset.sfx === "custom") return;
      audio.sfx("click");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
        열차에 오르는 중…
      </div>
    );
  }

  if (status === "ended") return <EndingScreen key={activeSlot} />;
  if (status === "prologue") return <Prologue />;
  if (status === "storySelect") return <StorySelect />;
  if (status === "storyOpening") return <StoryOpeningScreen />;
  if (status === "interlude") return <InterludeScreen />;
  if (status === "finalChoice") return <FinalChoiceScreen />;

  return (
    <div className="app-frame">
      <StatusBar />
      <AffinityBar />
      <main className="adventure-layout">
        {status === "rel" ? <EventModal /> : <><SceneView /><ActionPanel /></>}
      </main>
      <LevelUpModal />
    </div>
  );
}
