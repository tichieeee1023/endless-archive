import { useState } from "react";
import { useRun } from "../store/useRun";
import { useAudio } from "../store/useAudio";
import ArchiveModal from "./ArchiveModal";

export default function StatusBar() {
  const { hp, maxHp, mp, maxMp, gold, level, act, floor, startRun } = useRun();
  const { sfxEnabled, bgmEnabled, toggleSfx, toggleBgm } = useAudio();
  const [archiveOpen, setArchiveOpen] = useState(false);

  const reset = () => {
    if (!confirm("진행 중인 런을 포기하고 처음부터 시작할까요?\n(메타 기록은 유지됩니다)")) return;
    startRun();
  };

  return (
    <>
      <header className="app-header">
        <div className="header-top"><div className="brand-mark" aria-hidden="true">✳</div><div className="brand"><span>AN UNFINISHED STORY</span><strong>종점 없는 서고</strong></div>
          <div className="header-actions">
            <button onClick={toggleBgm} aria-label={bgmEnabled ? "배경음 끄기" : "배경음 켜기"} title="배경음" aria-pressed={bgmEnabled}>
              {bgmEnabled ? "♪" : "♪̸"}
            </button>
            <button onClick={toggleSfx} aria-label={sfxEnabled ? "효과음 끄기" : "효과음 켜기"} title="효과음" aria-pressed={sfxEnabled}>
              {sfxEnabled ? "◉" : "○"}
            </button>
            <button onClick={() => setArchiveOpen(true)} aria-label="서고 열기" title="서고">▤</button>
            <button onClick={reset} aria-label="새 여정 시작" title="새 여정">↺</button>
          </div>
        </div>
        <div className="journey-line"><span>CHAPTER 0{act}</span><span>제 {floor} 페이지 <i>/ 8</i></span><span>레벨 {level} &nbsp;·&nbsp; {gold} G</span></div>
        <div className="meters"><div><span>체력 <b>{Math.max(0, hp)} / {maxHp}</b></span><div className="meter" role="progressbar" aria-label="체력" aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={Math.max(0, hp)}><i style={{ width: `${Math.min(100, Math.max(0, hp / maxHp * 100))}%` }} /></div></div><div><span>내공 <b>{mp} / {maxMp}</b></span><div className="meter meter--mana" role="progressbar" aria-label="내공" aria-valuemin={0} aria-valuemax={maxMp} aria-valuenow={mp}><i style={{ width: `${Math.min(100, Math.max(0, mp / maxMp * 100))}%` }} /></div></div></div>
      </header>

      <ArchiveModal open={archiveOpen} onClose={() => setArchiveOpen(false)} />
    </>
  );
}
