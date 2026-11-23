import { useEffect, useRef } from "react";
import { useRun } from "../store/useRun";
import { ENCOUNTERS } from "../data/encounters";
import { NPCS } from "../data/npcs";
import { STAT_LABEL } from "../types/game";
import type { NpcId } from "../types/npc";
import { successChance } from "../lib/check";
import raelPortrait from "../assets/illustrations/rael.png";
import seonPortrait from "../assets/illustrations/seon.png";
import kairuPortrait from "../assets/illustrations/kairu.png";

const portraits: Record<NpcId, string> = {
  rael: raelPortrait,
  seon: seonPortrait,
  kairu: kairuPortrait,
};

export default function EventModal() {
  const { activeEncounter, encounterOutcome, stats, flags, resolveEncounterChoice, continueEncounter } = useRun();
  const sheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    sheetRef.current?.scrollTo({ top: 0 });
  }, [activeEncounter, encounterOutcome]);
  if (!activeEncounter) return null;
  const ev = ENCOUNTERS.find((e) => e.id === activeEncounter);
  if (!ev) return null;
  const npc = ev.npcId ? NPCS[ev.npcId] : null;

  return (
    <div className="story-overlay" role="dialog" aria-modal="true" aria-labelledby="encounter-title">
      <div className="story-sheet" ref={sheetRef}>
        <div className="story-sheet__eyebrow">
          <span>✦ &nbsp;{npc ? "뜻밖의 만남" : "한 장의 이야기"}</span>
          {npc && <span>{npc.title} · {npc.name}</span>}
        </div>
        <div className="encounter-intro">
          <h2 id="encounter-title" className="story-sheet__title">{ev.title}</h2>
          {npc && (
            <img
              className="encounter-portrait"
              src={portraits[npc.id]}
              alt={`${npc.name}의 펜화 초상`}
              width="120"
              height="132"
            />
          )}
        </div>
        <div className="story-rule" />
        <p className="story-prose" aria-live="polite">{encounterOutcome ? encounterOutcome.text : ev.text}</p>

        <div className="story-options">
          {encounterOutcome ? (
            <button className="story-button story-button--primary" onClick={continueEncounter}>계속 읽기 <span>→</span></button>
          ) : ev.choices.map((c, i) => {
            const reqOk = !c.require
              || (!c.require.flag || flags.includes(c.require.flag))
              && (!c.require.min || (c.require.stat && stats[c.require.stat] >= c.require.min));

            const chance = c.check && c.fail ? successChance(c.check.stat, stats, c.check) : null;

            return (
              <button
                key={i}
                disabled={!reqOk}
                onClick={() => resolveEncounterChoice(i)}
                className="story-button"
              >
                <span className="choice-copy">
                  <span>{c.text}</span>
                  {chance !== null && (
                    <span className="choice-chance">
                      {STAT_LABEL[c.check!.stat]} · {chance}%
                    </span>
                  )}
                </span>
                {!reqOk && (
                  <span className="choice-unavailable">아직 선택할 수 없어요</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
