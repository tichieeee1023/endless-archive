import { useMemo, useState } from "react";
import { useMeta } from "../store/useMeta";
import { useRun } from "../store/useRun";
import { ENDING_CATALOG } from "../data/endings";
import { NPCS } from "../data/npcs";
import { shareUrl } from "../lib/seedFromUrl";
import SlotSwitcher from "./SlotSwitcher";
import EndingRecallModal from "./EndingRecallModal";
import archiveIllustration from "../assets/illustrations/archive.png";

interface Props { open: boolean; onClose: () => void; }

export default function ArchiveModal({ open, onClose }: Props) {
  const { endings, runCount, victories, deaths } = useMeta();
  const { seed, startRun } = useRun();
  const [seedInput, setSeedInput] = useState("");
  const [recallId, setRecallId] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState("");

  const unlocked = useMemo(() => new Set(endings), [endings]);
  const totalEndings = ENDING_CATALOG.length;
  const unlockedCount = ENDING_CATALOG.filter((e) => unlocked.has(e.id)).length;

  if (!open) return null;

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
    } catch {
      setShareMessage("공유하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
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
    <div className="archive-screen" role="dialog" aria-modal="true" aria-labelledby="archive-title">
      <header className="archive-header">
        <div><span className="eyebrow">THE ARCHIVE</span><h1 id="archive-title">서고의 기록</h1></div>
        <button onClick={onClose} className="icon-button" aria-label="닫기">✕</button>
      </header>

      <SlotSwitcher />

      <div className="archive-content">
        <div className="archive-illustration" aria-hidden="true">
          <img src={archiveIllustration} alt="" width="1672" height="941" loading="lazy" />
        </div>
        <section>
          <h2 className="archive-section-title">지나온 여정</h2>
          <div className="archive-stats">
            <Stat label="런" value={runCount} />
            <Stat label="클리어" value={victories} />
            <Stat label="사망" value={deaths} />
          </div>
        </section>

        <section>
          <h2 className="archive-section-title">
            모아 둔 결말 <span>{unlockedCount} / {totalEndings}</span>
          </h2>
          <div className="archive-endings">
            {ENDING_CATALOG.map((e) => {
              const isUnlocked = unlocked.has(e.id);
              const npc = e.npcId ? NPCS[e.npcId] : null;
              const isTrue = e.id === "true_end";

              return (
                <button
                  key={e.id}
                  onClick={() => isUnlocked && setRecallId(e.id)}
                  disabled={!isUnlocked}
                  className={`ending-card ${isUnlocked ? "is-unlocked" : "is-locked"} ${isTrue && isUnlocked ? "is-true" : ""}`}
                >
                  <div className="ending-card__heading">
                    <span>
                      {isUnlocked ? "◆" : "◇"}
                    </span>
                    <strong>
                      {isUnlocked ? e.title : "??? — 잠김"}
                    </strong>
                    {isTrue && isUnlocked && (
                      <span className="ending-card__badge">
                        TRUE
                      </span>
                    )}
                    {npc && <span className="ending-card__name">{npc.name}</span>}
                  </div>
                  <p>
                    {isUnlocked ? e.summary : e.hint}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="archive-section-title">여정 공유</h2>
          <div className="seed-current">
            <span>현재 시드</span>
            <span className="seed-value">#{seed}</span>
            <button onClick={copySeed} className="small-button">공유</button>
          </div>
          <p className="archive-note" aria-live="polite">{shareMessage || "같은 시드로 여정의 페이지 구성을 다시 만날 수 있어요."}</p>
          <div className="seed-entry">
            <input
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="시드 입력"
              maxLength={16}
              aria-label="여정 시드"
            />
            <button onClick={loadSeed} disabled={!seedInput.trim()}
              className="small-button small-button--dark">
              시작
            </button>
          </div>
        </section>

        <section className="archive-reset">
          <button onClick={resetAll}
            className="reset-button">
            모든 기록 초기화
          </button>
          <p className="archive-note">모든 슬롯의 여정과 도감이 삭제됩니다.</p>
        </section>
      </div>
      <EndingRecallModal endingId={recallId} onClose={() => setRecallId(null)} />
    </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="archive-stat">
      <div>{value}</div>
      <span>{label}</span>
    </div>
  );
}
