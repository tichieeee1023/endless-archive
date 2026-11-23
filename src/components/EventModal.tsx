import { useEffect, useRef } from "react";
import { useRun } from "../store/useRun";
import { ENCOUNTERS } from "../data/encounters";
import { getEncounterArt } from "../data/artLibrary";
import ArtFrame from "./ArtFrame";
import { NPCS } from "../data/npcs";
import { STAT_LABEL } from "../types/game";
import type { NpcId } from "../types/npc";
import { successChance } from "../lib/check";
import { isChoiceAvailable } from "../lib/encounterChoice";
import raelPortrait from "../assets/illustrations/rael.png";
import seonPortrait from "../assets/illustrations/seon.png";
import kairuPortrait from "../assets/illustrations/kairu.png";

const portraits: Record<NpcId, string> = { rael: raelPortrait, seon: seonPortrait, kairu: kairuPortrait };

export default function EventModal() {
  const { activeEncounter, encounterOutcome, stats, flags, resolveEncounterChoice, continueEncounter } = useRun();
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    sheetRef.current?.scrollTo({ top: 0 });
  }, [activeEncounter, encounterOutcome]);

  useEffect(() => {
    if (activeEncounter) titleRef.current?.focus({ preventScroll: true });
  }, [activeEncounter, encounterOutcome]);

  if (!activeEncounter) return null;
  const ev = ENCOUNTERS.find((entry) => entry.id === activeEncounter);
  if (!ev) return null;
  const npc = ev.npcId ? NPCS[ev.npcId] : null;

  return (
    <div className="story-overlay" role="dialog" aria-modal="true" aria-labelledby="encounter-title"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
        const first = buttons[0], last = buttons.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }}
    >
      <div className="story-sheet encounter-sheet" ref={sheetRef}>
        <div className="story-sheet__eyebrow">
          <span>✦ &nbsp;{npc ? "뜻밖의 만남" : "한 장의 이야기"}</span>
          {npc && <span>{npc.title} · {npc.name}</span>}
        </div>
        <div className="encounter-intro">
          <h2 ref={titleRef} tabIndex={-1} id="encounter-title" className="story-sheet__title">{ev.title}</h2>
          {npc && <img className="encounter-portrait" src={portraits[npc.id]} alt={`${npc.name}의 펜화 초상`} width="120" height="132" />}
        </div>
        <div className="story-rule" />
        <ArtFrame art={getEncounterArt(ev.id, flags, Boolean(encounterOutcome))} variant="scene" eager />
        {encounterOutcome && <p className="encounter-section-label">선택의 결과</p>}
        <p className="story-prose" aria-live="polite">{encounterOutcome ? encounterOutcome.text : ev.text}</p>
        {encounterOutcome?.effects && encounterOutcome.effects.length > 0 && (
          <div className="encounter-effects" aria-label="이번 선택의 변화">
            {encounterOutcome.effects.map((effect, index) => <span key={`${effect}-${index}`}>{effect}</span>)}
          </div>
        )}
        {!encounterOutcome && <p className="encounter-section-label">어떻게 할까요?</p>}
        <div className="story-options">
          {encounterOutcome ? (
            <button className="story-button story-button--primary" onClick={continueEncounter}>계속 읽기 <span aria-hidden="true">→</span></button>
          ) : ev.choices.map((choice, index) => {
            const available = isChoiceAvailable(choice, flags, stats);
            const chance = choice.check && choice.fail ? successChance(choice.check.stat, stats, choice.check) : null;
            return (
              <button key={index} disabled={!available} onClick={() => resolveEncounterChoice(index)} className="story-button">
                <span className="choice-copy">
                  <span>{choice.text}</span>
                  {chance !== null && <span className="choice-chance">{STAT_LABEL[choice.check!.stat]} · {chance}%</span>}
                </span>
                {!available && <span className="choice-unavailable">아직 선택할 수 없어요</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
