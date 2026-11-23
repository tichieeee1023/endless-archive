import ArtGallery from "./ArtGallery";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMeta } from "../store/useMeta";
import { useRun } from "../store/useRun";
import { ENDING_CATALOG, type EndingEntry } from "../data/endings";
import { NPCS } from "../data/npcs";
import type { NpcId } from "../types/npc";
import { bonusCatalogFor, endingProgress, legacyCollected, routeCatalogFor } from "../lib/archiveView";
import { shareUrl } from "../lib/seedFromUrl";
import SlotSwitcher from "./SlotSwitcher";
import EndingRecallModal from "./EndingRecallModal";
import archiveIllustration from "../assets/illustrations/archive.png";

interface Props { open: boolean; onClose: () => void; }
const NPC_ORDER: NpcId[] = ["rael", "seon", "kairu"];

export default function ArchiveModal({ open, onClose }: Props) {
  const { endings, runCount, victories, deaths } = useMeta();
  const { seed, startRun } = useRun();
  const [seedInput, setSeedInput] = useState("");
  const [recallId, setRecallId] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const unlocked = useMemo(() => new Set(endings), [endings]);
  const progress = endingProgress(endings);
  const journeyProgress = endingProgress(endings, "journey");
  const routeProgress = endingProgress(endings, "route");
  const bonusProgress = endingProgress(endings, "bonus");
  const preserved = legacyCollected(endings);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => { lastFocus.current?.focus(); };
  }, [open]);

  useEffect(() => {
    if (!open || recallId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, recallId, onClose]);

  if (!open) return null;

  const renderEnding = (entry: EndingEntry) => {
    const isUnlocked = unlocked.has(entry.id);
    const npc = entry.npcId ? NPCS[entry.npcId] : null;
    const grade = entry.kind === "route" ? entry.id.split("_").at(-1)?.toUpperCase() : null;
    return (
      <button
        key={entry.id}
        type="button"
        onClick={() => isUnlocked && setRecallId(entry.id)}
        disabled={!isUnlocked}
        aria-label={`${grade ? `${grade} · ` : ""}${isUnlocked ? entry.title : "미발견 결말"}${npc ? `, ${npc.name}` : ""}${isUnlocked ? ", 다시 읽기" : `, 힌트: ${entry.hint}`}`}
        className={`ending-card ${isUnlocked ? "is-unlocked" : "is-locked"} ${entry.id === "true_end" && isUnlocked ? "is-true" : ""}`}
      >
        <div className="ending-card__heading">
          <span className="ending-card__mark" aria-hidden="true">{isUnlocked ? "◆" : "◇"}</span>
          {grade && <span className={`ending-card__grade ending-card__grade--${grade.toLowerCase()}`}>{grade}</span>}
          {entry.kind === "bonus" && <span className="ending-card__grade ending-card__grade--bonus">추가</span>}
          <strong>{isUnlocked ? entry.title : "아직 발견하지 못한 결말"}</strong>
          {entry.id === "true_end" && isUnlocked && <span className="ending-card__badge">TRUE</span>}
          {npc && entry.kind !== "route" && <span className="ending-card__name">{npc.name}</span>}
        </div>
        <p>{isUnlocked ? entry.summary : entry.hint}</p>
        {isUnlocked && <span className="ending-card__read">다시 읽기 →</span>}
      </button>
    );
  };

  const copySeed = async () => {
    const url = shareUrl(seed);
    try {
      if (navigator.share) {
        await navigator.share({ url, title: "종점 없는 서고" });
        setShareMessage("여정의 주소를 공유했어요.");
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage("여정의 주소를 복사했어요.");
      }
    } catch { setShareMessage("공유하지 못했어요. 잠시 후 다시 시도해 주세요."); }
  };

  const loadSeed = () => {
    if (!seedInput.trim()) return;
    startRun(seedInput.trim().slice(0, 16));
    setSeedInput("");
    onClose();
  };

  const resetAll = () => {
    if (!confirm("모든 기록을 초기화합니다. 되돌릴 수 없습니다.\n계속할까요?")) return;
    for (const slot of [1, 2, 3]) localStorage.removeItem(`endless-archive-run_slot${slot}`);
    useMeta.setState({ runCount: 0, deaths: 0, victories: 0, collectedPages: [], endings: [], endingLog: {} });
    startRun();
    onClose();
  };

  return (
    <div className="archive-overlay">
      <div className="archive-screen" role="dialog" aria-modal={recallId ? undefined : true} aria-labelledby="archive-title"
        onKeyDown={(event) => {
          if (event.key !== "Tab" || recallId) return;
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled)"));
          const first = controls[0], last = controls.at(-1);
          if (!first || !last) return;
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }}
      >
        <header className="archive-header">
          <div><span className="eyebrow">THE ARCHIVE</span><h1 id="archive-title">서고의 기록</h1></div>
          <button ref={closeRef} onClick={onClose} className="icon-button" aria-label="서고 닫기">✕</button>
        </header>
        <SlotSwitcher />
        <div className="archive-content">
          <div className="archive-illustration" aria-hidden="true">
            <img src={archiveIllustration} alt="" width="1672" height="941" loading="lazy" />
          </div>
          <section>
            <h2 className="archive-section-title">지나온 여정</h2>
            <div className="archive-stats">
              <Stat label="도전" value={runCount} />
              <Stat label="클리어" value={victories} />
              <Stat label="사망" value={deaths} />
            </div>
          </section>
          <section aria-labelledby="archive-collection-heading">
            <div className="archive-collection-heading">
              <h2 id="archive-collection-heading" className="archive-section-title">발견한 결말</h2>
              <strong>{progress.collected} / {progress.total}</strong>
            </div>
            <p className="archive-note archive-intro">사건의 결말은 연애 여부와 관계없이 수집할 수 있습니다. 특별한 관계는 그 뒤에 더해지는 후일담이에요.</p>
            <div className="archive-progress-grid" aria-label="결말 종류별 수집 현황">
              <Progress label="여정" {...journeyProgress} />
              <Progress label="인물 사건" {...routeProgress} />
              <Progress label="특별한 관계" {...bonusProgress} />
            </div>
            <h3 className="archive-subtitle">열차에서 맞이한 결말 <span>{journeyProgress.collected}/{journeyProgress.total}</span></h3>
            <div className="archive-endings">
              {ENDING_CATALOG.filter((entry) => entry.kind === "journey").map(renderEnding)}
            </div>
            <h3 className="archive-subtitle">인물들의 이야기 <span>{routeProgress.collected}/{routeProgress.total}</span></h3>
            <p className="archive-note">각 인물의 사건은 BAD · NORMAL · HAPPY로 갈립니다. 한 결말을 얻어도 다른 결말은 다음 여정에서 발견할 수 있어요.</p>
            <div className="archive-route-groups">
              {NPC_ORDER.map((id) => {
                const entries = routeCatalogFor(id);
                const found = entries.filter((entry) => unlocked.has(entry.id)).length;
                return (
                  <section className="archive-route-group" key={id} aria-label={`${NPCS[id].name}의 사건 결말`}>
                    <div className="archive-route-header">
                      <div><strong>{NPCS[id].name}</strong><span>{NPCS[id].title}</span></div>
                      <span className="archive-route-counter">{found} / {entries.length}</span>
                    </div>
                    <div className="archive-endings">{entries.map(renderEnding)}</div>
                  </section>
                );
              })}
            </div>
            <h3 className="archive-subtitle">선택적으로 맺은 인연 <span>{bonusProgress.collected}/{bonusProgress.total}</span></h3>
            <p className="archive-note">사건 HAPPY와 특별한 관계는 별개입니다. 관계 후일담을 보지 않아도 그 인물의 사건은 완결됩니다.</p>
            <div className="archive-endings">
              {NPC_ORDER.map(bonusCatalogFor).filter((entry): entry is EndingEntry => Boolean(entry)).map(renderEnding)}
            </div>
            {preserved.length > 0 && (
              <section className="archive-legacy" aria-labelledby="archive-legacy-heading">
                <h3 id="archive-legacy-heading" className="archive-subtitle">이전 버전의 수집 기록</h3>
                <p className="archive-note">기존에 발견한 결말을 삭제하거나 새 결말로 임의 변환하지 않고 보관합니다.</p>
                <div className="archive-endings">{preserved.map(renderEnding)}</div>
              </section>
            )}
          </section>
          <section>
            <h2 className="archive-section-title">여정 공유</h2>
            <div className="seed-current"><span>현재 시드</span><span className="seed-value">#{seed}</span><button onClick={copySeed} className="small-button">공유</button></div>
            <p className="archive-note" aria-live="polite">{shareMessage || "같은 시드로 여정의 페이지 구성을 다시 만날 수 있어요."}</p>
            <div className="seed-entry">
              <input value={seedInput} onChange={(e) => setSeedInput(e.target.value)} placeholder="시드 입력" maxLength={16} aria-label="여정 시드" />
              <button onClick={loadSeed} disabled={!seedInput.trim()} className="small-button small-button--dark">시작</button>
            </div>
          </section>
          <ArtGallery endings={endings} />
          <section className="archive-reset">
            <button onClick={resetAll} className="reset-button">모든 기록 초기화</button>
            <p className="archive-note">모든 슬롯의 여정과 도감이 삭제됩니다.</p>
          </section>
        </div>
        <EndingRecallModal endingId={recallId} onClose={() => setRecallId(null)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="archive-stat"><div>{value}</div><span>{label}</span></div>;
}
function Progress({ label, collected, total }: { label: string; collected: number; total: number }) {
  return (
    <div className="archive-progress-item">
      <div><strong>{label}</strong><span>{collected}/{total}</span></div>
      <div className="archive-progress-track" role="progressbar" aria-label={`${label} 결말 수집`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={collected}>
        <span style={{ width: `${total ? (collected / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
