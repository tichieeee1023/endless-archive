import { useEffect, useRef, useState } from "react";
import { useRun } from "../store/useRun";
import { useMeta } from "../store/useMeta";
import { resolveRunEndings } from "../lib/ending";
import { NPCS } from "../data/npcs";
import { audio } from "../lib/audio";
import ArchiveModal from "./ArchiveModal";
import { getEndingArt } from "../data/artLibrary";
import ArtFrame from "./ArtFrame";
import { formatNarrative } from "../lib/formatNarrative";

export default function EndingScreen() {
  const startRun = useRun((s) => s.startRun);
  const { addRun, addEnding } = useMeta();
  const [resolution] = useState(() => {
    const run = useRun.getState();
    return resolveRunEndings(run.flags, run.nodeResult?.endsRun === "victory");
  });
  // An old saved ending is kept readable after the v6 → v7 migration.
  const [ending] = useState(() => useRun.getState().endingResult ?? resolution.journey);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current || useRun.getState().endingRecorded) return;
    recorded.current = true;
    audio.sfx("ending");
    for (const result of [...resolution.routes, ...resolution.bonuses, ending]) {
      addEnding(result.id, result.title, result.text);
    }
    addRun(useRun.getState().nodeResult?.endsRun === "victory" ? "victory" : "death");
    useRun.getState().markEndingRecorded(ending);
    // Resolve only once from the persisted end-of-run snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="ending-screen">
      <div className="ending-ornament" aria-hidden="true">✧</div>
      <div className="eyebrow">THE END OF A JOURNEY</div>
      <p className="ending-kind">여정의 결말</p>
      <h1>{ending.title}</h1>
      <div className="ending-rule" aria-hidden="true">✦</div>
      <ArtFrame art={getEndingArt(ending.id)} variant="ending" eager />
      <p className="ending-main-copy">{formatNarrative(ending.text)}</p>
      {resolution.routes.length > 0 ? (
        <section className="ending-summary" aria-label="이번 여정의 인물 사건">
          <h2>인물들의 사건 결말</h2>
          <p className="ending-summary__intro">사건에서 선택한 결과입니다. 연애 여부와는 관계없이 기록돼요.</p>
          {resolution.routes.map((route) => (
            <article className="ending-summary__item" key={route.id}>
              <div className="ending-summary__heading"><span className={`ending-card__grade ending-card__grade--${route.grade}`}>{route.grade.toUpperCase()}</span><strong>{NPCS[route.npcId].name} · {route.title}</strong></div>
              <ArtFrame art={getEndingArt(route.id)} variant="ending" />
              <p>{formatNarrative(route.text)}</p>
            </article>
          ))}
        </section>
      ) : (
        <p className="ending-empty-route">이번 여정에서는 완결된 인물 사건이 없었습니다. 다른 여정에서는 새로운 이야기를 만날 수 있어요.</p>
      )}
      {resolution.bonuses.length > 0 && (
        <section className="ending-summary ending-summary--bonus" aria-label="선택적 관계 후일담">
          <h2>특별한 인연 · 추가 후일담</h2>
          <p className="ending-summary__intro">사건 결말에 더해진 작은 약속입니다.</p>
          {resolution.bonuses.map((bonus) => (
            <article className="ending-summary__item" key={bonus.id}>
              <div className="ending-summary__heading"><span className="ending-card__grade ending-card__grade--bonus">추가</span><strong>{bonus.title}</strong></div>
              <ArtFrame art={getEndingArt(bonus.id)} variant="ending" />
              <p>{formatNarrative(bonus.text)}</p>
            </article>
          ))}
        </section>
      )}
      <div className="ending-actions">
        <button onClick={() => startRun()} className="story-button story-button--primary justify-center">다시 열차에 오른다</button>
        <button className="ending-archive" onClick={() => setArchiveOpen(true)}>서고에서 결말 다시 읽기 →</button>
      </div>
      <ArchiveModal open={archiveOpen} onClose={() => setArchiveOpen(false)} />
    </main>
  );
}
