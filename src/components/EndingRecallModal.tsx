import { getEndingArt } from "../data/artLibrary";
import ArtFrame from "./ArtFrame";
import { useEffect, useRef, useState } from "react";
import { useMeta } from "../store/useMeta";
import { ENDING_CATALOG } from "../data/endings";
import { NPCS } from "../data/npcs";
import { formatNarrative } from "../lib/formatNarrative";
import { journeyEndings } from "../lib/journeyHistory";

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
  const latest = useMeta((s) => (endingId ? s.endingLog[endingId] : undefined));
  const legacy = useMeta((s) => (endingId ? s.legacyEndingLog[endingId] : undefined));
  const history = useMeta((s) => s.journeyHistory);
  const [selected, setSelected] = useState("latest");
  const versions = history.flatMap((journey) => {
    const result = journeyEndings(journey).find((ending) => ending.id === endingId);
    return result ? [{ id: journey.id, number: journey.number, timestamp: journey.timestamp, title: result.title, text: result.text }] : [];
  });
  const record = selected === "legacy" ? legacy ?? latest : versions.find((version) => version.id === selected) ?? latest;
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
          // Keep keyboard focus inside the upper dialog.
          const focusables = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), select:not(:disabled)"));
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
          <h2 id="recall-title" className="story-sheet__title">{record?.title ?? catalog.title}</h2>
          {npc && <p className="muted-copy">{npc.name} · {npc.title}</p>}
        </div>
        {(versions.length > 0 || legacy) && <label className="journey-version-picker">읽을 기록
          <select value={selected} onChange={(event) => setSelected(event.target.value)}>
            <option value="latest">가장 최근에 발견한 결말</option>
            {versions.map((version) => <option key={version.id} value={version.id}>{version.number}번째 여정 · {new Date(version.timestamp).toLocaleDateString("ko-KR")}</option>)}
            {legacy && <option value="legacy">이전 버전에서 보관된 결말</option>}
          </select>
        </label>}
        <ArtFrame art={getEndingArt(endingId)} variant="recall" eager />
        <p className="story-prose">{formatNarrative(record?.text ?? catalog.summary)}</p>
        {recordedAt && !Number.isNaN(recordedAt.getTime()) && (
          <p className="recall-date">발견한 날짜 · {recordedAt.toLocaleString("ko-KR")}</p>
        )}
        <button onClick={onClose} className="story-button story-button--primary justify-center">기록으로 돌아가기</button>
      </div>
    </div>
  );
}
