import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_ART, artIsUnlocked, getEncounterArt, getEndingArt, type ArtEntry } from "../data/artLibrary";
import { useRun } from "../store/useRun";
import { useMeta } from "../store/useMeta";

type Category = "events" | "characters" | "items";
const CATEGORY_LABEL: Record<Category, string> = {
  events: "사건·배경 삽화",
  characters: "인물 이벤트 CG",
  items: "아이템·소품",
};
const CATEGORY_COUNT: Record<Category, number> = {
  events: ALL_ART.filter(art => art.type === "events").length,
  characters: ALL_ART.filter(art => art.type === "characters").length,
  items: ALL_ART.filter(art => art.type === "items").length,
};

// Preserve access to the original ending illustrations for existing ending records.
const LEGACY_ENDING_ART: Readonly<Record<string, string>> = {
  rael_defeat: "planned_02_4_night_train_window",
  seon_defeat: "planned_03_1_cracked_sword",
  kairu_defeat: "planned_04_1_voice_margin",
  true_end: "planned_04_4_book_notebook",
  journey_return: "planned_06_1_letter_reply",
  journey_stay: "planned_02_2_conductors_logbook",
};

/** Art exists independently of game state; hidden ending CGs only unlock with collected endings. */
export default function ArtGallery({ endings }: { endings: readonly string[] }) {
  const collected = useMemo(() => new Set(endings), [endings]);
  const pages = useMeta((state) => state.collectedPages);
  const seen = useRun((state) => state.seenEncounters);
  const flags = useRun((state) => state.flags);
  const discovered = useMemo(() => {
    const ids = new Set(pages.filter((id) => id.startsWith("art:")).map((id) => id.slice(4)));
    const includeSeen = (encounters: string[], runFlags: string[]) => {
      for (const id of encounters) {
        const scene = getEncounterArt(id);
        if (scene) ids.add(scene.id);
        const result = getEncounterArt(id, runFlags, true);
        if (result) ids.add(result.id);
      }
    };
    includeSeen(seen, flags);
    for (const slot of [1, 2, 3]) {
      try {
        const raw = localStorage.getItem(`endless-archive-run_slot${slot}`);
        const state = raw ? JSON.parse(raw).state : null;
        if (Array.isArray(state?.seenEncounters)) {
          includeSeen(state.seenEncounters, Array.isArray(state.flags) ? state.flags : []);
        }
      } catch { /* 다른 슬롯의 손상된 데이터는 건너뛴다. */ }
    }
    for (const id of endings) {
      const art = getEndingArt(id);
      if (art) ids.add(art.id);
      const legacy = LEGACY_ENDING_ART[id];
      if (legacy) ids.add(legacy);
    }
    return ids;
  }, [pages, seen, flags, endings]);
  const [category, setCategory] = useState<Category>("events");
  const [onlyDiscovered, setOnlyDiscovered] = useState(false);
  const [selected, setSelected] = useState<ArtEntry | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!selected) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => { previousFocus.current?.focus(); };
  }, [selected]);
  const list = ALL_ART.filter((art) => art.type === category);
  const visibleCount = list.filter((art) => artIsUnlocked(art, collected, discovered)).length;
  const displayed = onlyDiscovered ? list.filter(art => artIsUnlocked(art, collected, discovered)) : list;
  return (
    <section className="art-gallery" aria-labelledby="art-gallery-heading">
      <h2 id="art-gallery-heading" className="archive-section-title">삽화 보관함</h2>
      <p className="archive-note">여정에서 직접 만난 장면과 소품만 보관됩니다.</p>
      <div className="art-gallery__tabs" role="group" aria-label="삽화 종류 선택">
        {(["events", "characters", "items"] as Category[]).map((key) => (
          <button type="button" key={key} onClick={() => { setCategory(key); setSelected(null); }}
            aria-pressed={category === key} className={category === key ? "is-active" : ""}>
            {CATEGORY_LABEL[key]} <small>{CATEGORY_COUNT[key]}</small>
          </button>
        ))}
      </div>
      <p className="art-gallery__status" aria-live="polite">{CATEGORY_LABEL[category]} · {visibleCount}/{list.length}장 보기 가능</p>
      <label className="art-gallery__filter"><input type="checkbox" checked={onlyDiscovered} onChange={e => setOnlyDiscovered(e.target.checked)} /> 발견한 삽화만 보기</label>
      {displayed.length === 0 && <p className="archive-note">아직 이 분류에서 발견한 삽화가 없습니다.</p>}
      <div className={`art-gallery__grid ${category === "items" ? "art-gallery__grid--items" : ""}`}>
        {displayed.map((art) => {
          const unlocked = artIsUnlocked(art, collected, discovered);
          return unlocked ? (
            <button type="button" key={art.id} className="art-gallery__item"
              title={art.title} onClick={() => setSelected(art)}>
              <img src={art.src} alt="" loading="lazy" width={category === "items" ? 256 : 768} height={category === "items" ? 256 : 384} />
              <span>{art.title}</span>
            </button>
          ) : (
            <div key={art.id} className="art-gallery__item art-gallery__item--locked"
              aria-label="아직 발견하지 못한 삽화">
              <div className="art-gallery__unknown" aria-hidden="true">◇</div>
              <span>아직 발견하지 못한 삽화</span>
            </div>
          );
        })}
      </div>
      {selected && (
        <div className="art-gallery__viewer" role="dialog" aria-modal="true" aria-label={`${selected.title} 확대 보기`}
          onClick={() => setSelected(null)}
          onKeyDown={(ev) => {
            if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); setSelected(null); }
            if (ev.key === "Tab") { ev.preventDefault(); closeRef.current?.focus(); }
          }}>
          <div className="art-gallery__viewer-content" onClick={(ev) => ev.stopPropagation()}>
            <button ref={closeRef} type="button" className="art-gallery__close" onClick={() => setSelected(null)}>닫기 ✕</button>
            <img src={selected.src} alt={selected.title} width="768" height="384" />
            <p>{selected.title}</p>
          </div>
        </div>
      )}
    </section>
  );
}
