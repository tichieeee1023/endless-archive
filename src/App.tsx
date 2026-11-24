import { useEffect, useLayoutEffect } from "react";
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
import WeaponPromptModal from "./components/WeaponPromptModal";
import { seedFromUrl } from "./lib/seedFromUrl";
import { audio } from "./lib/audio";
import { useAudio } from "./store/useAudio";
import { usePresentation } from "./store/usePresentation";

export default function App() {
  const status = useRun((s) => s.status);
  const pageKey = useRun((s) => `${s.act}:${s.floor}`);
  const activeSlot = useSaveSlots((s) => s.active);
  const startRun = useRun((s) => s.startRun);
  const hydrated = useRunHydrated();
  const motionEnabled = usePresentation((s) => s.motionEnabled);

  useLayoutEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? "full" : "quick";
    return () => { delete document.documentElement.dataset.motion; };
  }, [motionEnabled]);

  useEffect(() => {
    if (!hydrated) return;
    const urlSeed = seedFromUrl();
    if (urlSeed) {
      const run = useRun.getState();
      window.history.replaceState({}, "", window.location.pathname + window.location.hash);
      if (!run.seed || run.status === "ended" || window.confirm("공유받은 여정을 시작하면 현재 슬롯의 진행 중인 여정이 대체됩니다. 계속할까요?")) {
        startRun(urlSeed);
      }
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
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!button || button.disabled || button.dataset.sfx === "custom") return;
      audio.sfx(button.dataset.sfx === "page" ? "page" : "click");
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
      <main key={`${activeSlot}:${status}:${pageKey}`} className={`adventure-layout adventure-layout--${status}`}>
        {status === "rel" ? <EventModal /> : <><SceneView /><ActionPanel /></>}
      </main>
      <LevelUpModal />
      <WeaponPromptModal />
    </div>
  );
}
