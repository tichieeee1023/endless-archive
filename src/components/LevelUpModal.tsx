import { useRun } from "../store/useRun";
import { STAT_KEYS, STAT_LABEL, STAT_DESCRIPTION, type StatKey } from "../types/game";
import { levelArt } from "../data/extraArtMapping";
import ExtraArt from "./ExtraArt";

export default function LevelUpModal() {
  const { status, level, statPoints, stats, distributeStat, closeLevelUp } = useRun();
  if (status !== "levelup") return null;

  return (
    <div className="story-overlay" role="dialog" aria-modal="true" aria-labelledby="level-title">
      <div className="story-sheet level-sheet">
        <div className="level-heading">
          <div className="eyebrow">A LITTLE STRONGER</div>
          <h2 id="level-title" className="story-sheet__title">여정이 당신을 바꾸었다</h2>
          <p className="muted-copy">
            레벨 {level} · 남은 포인트 <b>{statPoints}</b>
          </p>
        </div>
        <ExtraArt src={levelArt(level)} className="extra-art--level" />
        <div className="stat-grid">
          {STAT_KEYS.map((k: StatKey) => (
            <button
              key={k}
              onClick={() => distributeStat(k)}
              disabled={statPoints <= 0}
              className="story-button disabled:opacity-40"
            >
              <span>{STAT_LABEL[k]}<small style={{display:"block",fontSize:"0.7rem",fontWeight:400,whiteSpace:"normal"}}>{STAT_DESCRIPTION[k]}</small></span>
              <span>{stats[k]} <b>+</b></span>
            </button>
          ))}
        </div>
        <button
          onClick={closeLevelUp}
          disabled={statPoints > 0}
          className="story-button story-button--primary justify-center disabled:opacity-40"
        >
          {statPoints > 0 ? `포인트 ${statPoints}개를 모두 분배하세요` : "계속"}
        </button>
      </div>
    </div>
  );
}
