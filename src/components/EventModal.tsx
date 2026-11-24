import { npcAccent } from "../lib/npcAccent";
import { useEffect, useRef } from "react";
import { useRun } from "../store/useRun";
import { useMeta } from "../store/useMeta";
import { ENCOUNTERS } from "../data/encounters";
import { getEncounterArt } from "../data/artLibrary";
import ArtFrame from "./ArtFrame";
import { NPCS } from "../data/npcs";
import { STAT_LABEL } from "../types/game";
import type { NpcId } from "../types/npc";
import { successChance } from "../lib/check";
import { isChoiceAvailable } from "../lib/encounterChoice";
import { encounterDialogue } from "../lib/companions";
import { formatNarrative } from "../lib/formatNarrative";
import raelPortrait from "../assets/illustrations/rael.webp";
import seonPortrait from "../assets/illustrations/seon.webp";
import kairuPortrait from "../assets/illustrations/kairu.webp";

const portraits: Record<NpcId, string> = { rael: raelPortrait, seon: seonPortrait, kairu: kairuPortrait };

export default function EventModal() {
  const { activeEncounter, encounterOutcome, stats, flags, luck, affinity, current, resolveEncounterChoice, continueEncounter } = useRun();
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    sheetRef.current?.scrollTo({ top: 0 });
    sheetRef.current?.closest(".adventure-layout")?.scrollTo({ top: 0 });
  }, [activeEncounter, encounterOutcome]);

  useEffect(() => {
    if (activeEncounter) titleRef.current?.focus({ preventScroll: true });
  }, [activeEncounter, encounterOutcome]);

  useEffect(() => {
    if (!activeEncounter) return;
    const art = getEncounterArt(activeEncounter, flags, Boolean(encounterOutcome));
    if (art) useMeta.getState().collectPage(`art:${art.id}`);
  }, [activeEncounter, flags, encounterOutcome]);

  if (!activeEncounter) return null;
  const ev = ENCOUNTERS.find((entry) => entry.id === activeEncounter);
  if (!ev) return null;
  const npc = ev.npcId ? NPCS[ev.npcId] : null;
  const sceneArt = getEncounterArt(ev.id, flags, Boolean(encounterOutcome));
  const standing = Boolean(npc && ev.companionKind && !sceneArt);

  return (
    <div className="story-page" aria-labelledby="encounter-title">
      <div className="story-sheet encounter-sheet" {...npcAccent(npc?.id)} ref={sheetRef}>
        <div className="story-sheet__eyebrow">
          <span>✦ &nbsp;{ev.companionKind === "romance" ? "연인이 된 뒤" : ev.companionKind === "boss" ? "마지막 장 앞에서" : ev.companionKind === "memory" ? "기억의 한 조각" : ev.companionKind === "special" ? "특별한 인연" : current?.id.endsWith("main") ? "이름 없는 역 · 메인 이야기" : ev.id === "personality_shared_table" ? "함께한 사람들" : ev.id.startsWith("side_") ? "승객의 이야기" : current?.encounterId ? "다시 만난 이야기" : npc ? "뜻밖의 만남" : ev.storyId ? "이 책에서만 만나는 사건" : "한 장의 이야기"}</span>
          {npc && <span>{npc.title} · {npc.name}</span>}
        </div>
        <div className="encounter-intro npc-heading" {...npcAccent(npc?.id)} key={ev.id}>
          <h2 ref={titleRef} tabIndex={-1} id="encounter-title" className="story-sheet__title">{ev.title}</h2>
          {npc && !sceneArt && !standing && <img className="encounter-portrait" src={portraits[npc.id]} alt={`${npc.name}의 펜화 초상`} width="120" height="132" />}
        </div>
        <div className="story-rule" />
        <ArtFrame art={sceneArt} key={sceneArt?.id} variant="scene" eager />
        {standing && npc && <img key={ev.id} className="companion-standing" src={portraits[npc.id]} alt={`${npc.name}의 스탠딩 일러스트`} decoding="async" />}
        {encounterOutcome && <p className="encounter-section-label">선택의 결과</p>}
        <p key={`${ev.id}:${encounterOutcome ? "result" : "intro"}`} className="story-prose story-prose--reveal" aria-live="polite">{formatNarrative(encounterOutcome ? encounterOutcome.text : encounterDialogue(ev, affinity, flags))}</p>
        {encounterOutcome?.effects && encounterOutcome.effects.length > 0 && (
          <div className="encounter-effects" aria-label="이번 선택의 변화">
            {encounterOutcome.effects.map((effect, index) => <span key={`${effect}-${index}`}>{effect}</span>)}
          </div>
        )}
        {!encounterOutcome && <p className="encounter-section-label">어떻게 할까요?</p>}
        <div className="story-options">
          {encounterOutcome ? (
            <button className="story-button story-button--primary" data-sfx="page" onClick={continueEncounter}>{ev.companionKind === "boss" ? "마지막 장으로" : "계속 읽기"} <span aria-hidden="true">→</span></button>
          ) : ev.choices.map((choice, index) => {
            const available = isChoiceAvailable(choice, flags, stats);
            const chance = choice.check && choice.fail ? successChance(choice.check.stat, stats, choice.check, luck) : null;
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
