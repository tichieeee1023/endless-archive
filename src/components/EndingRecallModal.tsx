import { getEndingArt } from "../data/artLibrary";
import ArtFrame from "./ArtFrame";
import { useEffect, useRef } from "react";
import { useMeta } from "../store/useMeta";
import { ENDING_CATALOG } from "../data/endings";
import { NPCS } from "../data/npcs";

interface Props {
  endingId: string | null;
  onClose: () => void;
}

const KIND_LABEL = {
  journey: "여정의 결말",
  route: "인물 사건의 결말",
  bonus: "특별한 관계 · 추가 후일담",
  legacy: "이전 버전의 기록",
};

export default function EndingRecallModal({ endingId, onClose }: Props) {
  const record = useMeta((s) => (endingId ? s.endingLog[endingId] : undefined));
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!endingId) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => previousFocus.current?.focus();
  }, [endingId]);

  if (!endingId) return null;
  const catalog = ENDING_CATALOG.find((e) => e.id === endingId);
  if (!catalog) return null;
  const npc = catalog.npcId ? NPCS[catalog.npcId] : null;
  const grade = catalog.kind === "route" ? catalog.id.split("_").at(-1)?.toUpperCase() : null;
  const recordedAt = record?.timestamp && Number.isFinite(record.timestamp) ? new Date(record.timestamp) : null;

  return (
    <div className="story-overlay recall-overlay" role="dialog" aria-modal="true" aria-labelledby="recall-title"
      aria-describedby="recall-category"
      onKeyDown={(event) => {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
        if (event.key === "Tab") {
          // Both actions are closing controls; keep keyboard focus inside the upper dialog.
          const focusables = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
          const first = focusables[0];
          const last = focusables.at(-1);
          if (!first || !last) return;
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }}
    >
      <div className="story-sheet recall-sheet">
        <div className="recall-topline">
          <span className="eyebrow">A REMEMBERED ENDING</span>
          <button ref={closeRef} onClick={onClose} className="icon-button" aria-label="회상 닫기">✕</button>
        </div>
        <p className="recall-category" id="recall-category">{KIND_LABEL[catalog.kind]}{grade ? ` · ${grade}` : ""}</p>
        <div>
          <h2 id="recall-title" className="story-sheet__title">{catalog.title}</h2>
          {npc && <p className="muted-copy">{npc.name} · {npc.title}</p>}
        </div>
        <ArtFrame art={getEndingArt(endingId)} variant="recall" eager />
        <p className="story-prose">{record?.text ?? catalog.summary}</p>
        {recordedAt && !Number.isNaN(recordedAt.getTime()) && (
          <p className="recall-date">발견한 날짜 · {recordedAt.toLocaleString("ko-KR")}</p>
        )}
        <button onClick={onClose} className="story-button story-button--primary justify-center">기록으로 돌아가기</button>
      </div>
    </div>
  );
}
