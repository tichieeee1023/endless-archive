import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_ART, artIsUnlocked, type ArtEntry } from "../data/artLibrary";

type Category = "events" | "characters" | "items";
const CATEGORY_LABEL: Record<Category, string> = {
  events: "사건·배경 삽화",
  characters: "인물 이벤트 CG",
  items: "아이템·소품",
};
const CATEGORY_COUNT: Record<Category, number> = {
  events: 40,
  characters: 12,
  items: 12,
};

/** Art exists independently of game state; hidden ending CGs only unlock with collected endings. */
export default function ArtGallery({ endings }: { endings: readonly string[] }) {
  const collected = useMemo(() => new Set(endings), [endings]);
  const [category, setCategory] = useState<Category>("events");
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
  const visibleCount = list.filter((art) => artIsUnlocked(art, collected)).length;
  return (
    <section className="art-gallery" aria-labelledby="art-gallery-heading">
      <h2 id="art-gallery-heading" className="archive-section-title">삽화 보관함</h2>
      <p className="archive-note">열차에서 발견한 장면과 소품을 모아 두었습니다. 엔딩 CG는 해당 결말을 획득해야 열립니다.</p>
      <div className="art-gallery__tabs" role="group" aria-label="삽화 종류 선택">
        {(["events", "characters", "items"] as Category[]).map((key) => (
          <button type="button" key={key} onClick={() => { setCategory(key); setSelected(null); }}
            aria-pressed={category === key} className={category === key ? "is-active" : ""}>
            {CATEGORY_LABEL[key]} <small>{CATEGORY_COUNT[key]}</small>
          </button>
        ))}
      </div>
      <p className="art-gallery__status" aria-live="polite">{CATEGORY_LABEL[category]} · {visibleCount}/{list.length}장 보기 가능</p>
      <div className={`art-gallery__grid ${category === "items" ? "art-gallery__grid--items" : ""}`}>
        {list.map((art) => {
          const unlocked = artIsUnlocked(art, collected);
          return unlocked ? (
            <button type="button" key={art.id} className="art-gallery__item"
              title={art.title} onClick={() => setSelected(art)}>
              <img src={art.src} alt="" loading="lazy" width={category === "items" ? 256 : 768} height={category === "items" ? 256 : 384} />
              <span>{art.title}</span>
            </button>
          ) : (
            <div key={art.id} className="art-gallery__item art-gallery__item--locked"
              aria-label="발견하지 않은 엔딩 CG">
              <div className="art-gallery__unknown" aria-hidden="true">◇</div>
              <span>아직 발견하지 못한 CG</span>
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
