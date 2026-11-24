import { npcAccent } from "../lib/npcAccent";
import { useEffect, useRef } from "react";
import { getEndingArt } from "../data/artLibrary";
import { NPCS } from "../data/npcs";
import { formatNarrative } from "../lib/formatNarrative";
import { JOURNEY_OUTCOME_LABEL, type JourneyRecord } from "../lib/journeyHistory";
import ArtFrame from "./ArtFrame";

export default function JourneyRecallModal({ record, onClose }: { record: JourneyRecord; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => previous?.focus();
  }, [record.id]);

  return (
    <div className="story-overlay recall-overlay" role="dialog" aria-modal="true" aria-labelledby="journey-recall-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
        if (event.key === "Tab") {
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
          const first = controls[0], last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <div className="story-sheet recall-sheet journey-recall-sheet">
        <div className="recall-topline"><span className="eyebrow">A REMEMBERED JOURNEY</span><button ref={closeRef} onClick={onClose} className="icon-button" aria-label="여정 회상 닫기">✕</button></div>
        <p className="recall-category">{record.number}번째 여정 · {JOURNEY_OUTCOME_LABEL[record.outcome]}</p>
        <h2 id="journey-recall-title" className="story-sheet__title npc-heading" {...npcAccent(record.journey.npcId)}>{record.journey.title}</h2>
        <p className="recall-date">{new Date(record.timestamp).toLocaleString("ko-KR")} · 슬롯 {record.slot} · {record.act}막 {record.floor}페이지</p>
        <p className="archive-note">시드 #{record.seed}</p>
        <ArtFrame art={getEndingArt(record.journey.id)} variant="recall" eager />
        <p className="story-prose">{formatNarrative(record.journey.text)}</p>
        {record.routes.length > 0 && <section className="ending-summary" aria-label="인물 사건 결말">
          <h2>인물들의 사건 결말</h2>
          {record.routes.map((route) => <article key={route.id} className="ending-summary__item npc-heading" {...npcAccent(route.npcId)}>
            <div className="ending-summary__heading"><span className={`ending-card__grade ending-card__grade--${route.grade}`}>{route.grade.toUpperCase()}</span><strong>{NPCS[route.npcId].name} · {route.title}</strong></div>
            <ArtFrame art={getEndingArt(route.id)} variant="recall" />
            <p>{formatNarrative(route.text)}</p>
          </article>)}
        </section>}
        {record.bonuses.length > 0 && <section className="ending-summary ending-summary--bonus" aria-label="관계 후일담">
          <h2>특별한 인연 · 추가 후일담</h2>
          {record.bonuses.map((bonus) => <article key={bonus.id} className="ending-summary__item npc-heading" {...npcAccent(bonus.npcId)}>
            <div className="ending-summary__heading"><span className="ending-card__grade ending-card__grade--bonus">추가</span><strong>{bonus.title}</strong></div>
            <ArtFrame art={getEndingArt(bonus.id)} variant="recall" />
            <p>{formatNarrative(bonus.text)}</p>
          </article>)}
        </section>}
        <button onClick={onClose} className="story-button story-button--primary justify-center">기록으로 돌아가기</button>
      </div>
    </div>
  );
}
