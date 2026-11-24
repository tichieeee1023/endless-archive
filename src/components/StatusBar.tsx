import { chapterLength } from "../data/mainStory";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRun } from "../store/useRun";
import { useAudio } from "../store/useAudio";
import { usePresentation } from "../store/usePresentation";
import { STAT_KEYS, STAT_LABEL, STAT_DESCRIPTION, type StatKey } from "../types/game";
import ArchiveModal from "./ArchiveModal";
import InventoryModal from "./InventoryModal";
import JourneyNotebookButton from "./JourneyNotebook";

type MeterTone = "health" | "focus" | StatKey;

function DotMeter({ label, value, max, showMax = false, tone = "default" }: {
  label: string; value: number; max: number; showMax?: boolean; tone?: MeterTone | "default";
}) {
  const [open, setOpen] = useState(false);
  const safeValue = Math.max(0, value);
  const filled = max > 0 && safeValue > 0 ? Math.min(5, Math.max(1, Math.round((safeValue / max) * 5))) : 0;
  if (showMax) return <div className={`resource-meter resource-meter--${tone}`} aria-label={`${label} ${safeValue} / ${max}`}><span>{label}</span><strong>{safeValue}<small> / {max}</small></strong><span className="resource-meter__track" aria-hidden="true"><i style={{width: `${max > 0 ? Math.min(100, safeValue / max * 100) : 0}%`}} /></span></div>;
  return (
    <div className="dot-meter-wrap">
      <button type="button" className={`dot-meter dot-meter--${tone}`} onClick={() => setOpen(!open)}
        aria-label={`${label} ${safeValue}${showMax ? ` / ${max}` : ""}`} aria-expanded={open}>
        <span className="dot-meter__label">{label}</span>
        <span className="dot-meter__dots" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => (
          <i key={i} className={i < filled ? "is-filled" : undefined}>{i < filled ? "●" : "○"}</i>
        ))}</span>
      </button>
      {open && <span className="dot-meter__value" role="status">{label} {safeValue}{showMax ? ` / ${max}` : ""}</span>}
    </div>
  );
}

export default function StatusBar() {
  const { hp, maxHp, mp, maxMp, gold, level, act, floor, flags, stats, healthPotions, focusPotions, ownedWeapons, ownedCharms, startRun } = useRun();
  const { sfxEnabled, bgmEnabled, toggleSfx, toggleBgm } = useAudio();
  const { motionEnabled, toggleMotion } = usePresentation();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const closeInventory = useCallback(() => setInventoryOpen(false), []);

  useEffect(() => {
    if (!settingsOpen) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setSettingsOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); trigger?.focus(); };
  }, [settingsOpen]);

  const reset = () => {
    if (!confirm("진행 중인 여정을 마치고 새로 시작할까요?\n서고에 모은 기록은 유지됩니다.")) return;
    setSettingsOpen(false);
    startRun();
  };

  return (
    <>
      <header className="app-header">
        <div className="header-top">
          <div className="brand-mark" aria-hidden="true">✳</div>
          <div className="brand"><span>AN UNFINISHED STORY</span><strong>종점 없는 서고</strong></div>
          <div className="header-actions">
            <button type="button" className="stats-shortcut" onClick={() => setSettingsOpen(true)} aria-label="능력치 보기" title="능력치">능력</button>
            <button type="button" className="inventory-shortcut" onClick={() => setInventoryOpen(true)} aria-label={`소지품 열기, 아이템 ${healthPotions + focusPotions + ownedWeapons.length + ownedCharms.length}개`} title="소지품">가방 <small>{healthPotions + focusPotions + ownedWeapons.length + ownedCharms.length}</small></button>
            <button type="button" onClick={() => setArchiveOpen(true)} aria-label="서고 열기" title="서고">▤</button>
            <button type="button" onClick={() => setSettingsOpen(true)} aria-label="설정 열기" title="설정">⚙</button>
          </div>
        </div>
        <div className="header-overview">
          <div className="journey-line"><span>CHAPTER 0{act}</span><span>제 {floor} 페이지 <i>/ {chapterLength(flags)}</i></span>
            <span className="journey-meta"><span className="journey-level">레벨 {level}</span><span className="journey-gold"><i aria-hidden="true">◉</i> {gold} G</span></span>
          </div>
          <div className="resource-dots" aria-label="여행 상태">
            <DotMeter label="체력" value={hp} max={maxHp} showMax tone="health" />
            <DotMeter label="집중력" value={mp} max={maxMp} showMax tone="focus" />
            <JourneyNotebookButton />
          </div>
        </div>
      </header>

      {settingsOpen && (
        <div className="story-overlay settings-overlay" onClick={() => setSettingsOpen(false)}>
          <section className="story-sheet settings-sheet" role="dialog" aria-modal="true" aria-labelledby="settings-title"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
              const first = buttons[0], last = buttons.at(-1);
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }}>
            <div className="settings-heading"><div><span className="eyebrow">SETTINGS</span><h2 id="settings-title">설정과 능력</h2></div>
              <button ref={closeButton} type="button" className="icon-button" aria-label="설정 닫기" onClick={() => setSettingsOpen(false)}>✕</button></div>
            <section className="settings-section"><h3>여행자의 능력</h3>
              <p>판정은 능력치 1당 성공률이 5%p 오르며, 최대 95%까지 적용됩니다.</p>
              <div className="stat-dots">
                {STAT_KEYS.map((key) => {
                  return (
                    <div className="stat-entry" key={key}>
                      <DotMeter label={STAT_LABEL[key]} value={stats[key]} max={20} tone={key} />
                      <p className="stat-entry__description">{STAT_DESCRIPTION[key]}</p>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="settings-section"><h3>소리</h3>
              <button type="button" className="settings-row" onClick={toggleBgm} aria-pressed={bgmEnabled}><span>배경음</span><strong>{bgmEnabled ? "켜짐" : "꺼짐"}</strong></button>
              <button type="button" className="settings-row" onClick={toggleSfx} aria-pressed={sfxEnabled}><span>효과음</span><strong>{sfxEnabled ? "켜짐" : "꺼짐"}</strong></button>
            </section>
            <section className="settings-section"><h3>연출</h3>
              <button type="button" className="settings-row" onClick={toggleMotion} aria-pressed={motionEnabled}><span>페이지·주사위 연출</span><strong>{motionEnabled ? "기본" : "빠르게"}</strong></button>
              <p>빠르게 모드에서는 장면 효과와 주사위 연출을 생략합니다. 기기의 동작 줄이기 설정도 존중합니다.</p>
            </section>
            <section className="settings-section"><h3>여정</h3>
              <button type="button" className="settings-row settings-row--restart" onClick={reset}><span>새 여정 시작</span><span>↗</span></button>
              <p>진행 중인 여정이 초기화되며 서고에 모은 기록은 남습니다.</p>
              <button type="button" className="settings-row" onClick={() => { setSettingsOpen(false); setArchiveOpen(true); }}><span>서고와 저장 슬롯</span><span>↗</span></button>
            </section>
          </section>
        </div>
      )}
      <InventoryModal open={inventoryOpen} onClose={closeInventory} />
      <ArchiveModal open={archiveOpen} onClose={() => setArchiveOpen(false)} />
    </>
  );
}

