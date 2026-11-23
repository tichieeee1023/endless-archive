import { useEffect } from "react";
import { useRun } from "../store/useRun";
import { bondProtection } from "../lib/bond";
import { formatNarrative } from "../lib/formatNarrative";

export default function BattlePanel() {
  const { battle, hp, mp, affinity, weaponPower, luck, playerAttack, playerSkill, autoBattle, toggleAutoBattle } = useRun();

  useEffect(() => {
    if (!battle || !autoBattle) return;
    const timer = window.setTimeout(() => {
      const state = useRun.getState();
      if (!state.autoBattle || state.status !== "battle" || !state.battle) return;
      if (state.mp >= 10) state.playerSkill();
      else state.playerAttack();
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [battle, autoBattle]);
  if (!battle) return null;

  const e = battle.enemy;
  const hpPct = Math.max(0, (e.hp / e.maxHp) * 100);
  const protection = bondProtection(affinity);

  return (
    <div className="action-panel battle-panel">
      <div className="panel-heading"><div><span className="eyebrow">A DANGEROUS PAGE</span><h2>{e.name}</h2></div><button className="auto-toggle" aria-pressed={autoBattle} onClick={toggleAutoBattle}>자동 전투 <b>{autoBattle ? "ON" : "OFF"}</b></button></div>
      <div className="enemy-status">
        <div className="enemy-status__label">
          <strong>상대 체력</strong>
          <span>{Math.max(0, e.hp)} / {e.maxHp}</span>
        </div>
        <div className="enemy-meter" role="progressbar" aria-label={`${e.name} 체력`} aria-valuemin={0} aria-valuemax={e.maxHp} aria-valuenow={Math.max(0, e.hp)}>
          <span style={{ width: `${hpPct}%` }} />
        </div>
        <div className="enemy-status__turn">{battle.turn}번째 행동</div>
      </div>

      <div className="battle-log" aria-live="polite">
        {battle.log.slice(-3).map((l, i) => <p key={i}>{formatNarrative(l)}</p>)}
      </div>

      <div className="battle-actions">
        <button data-sfx="custom" onClick={playerAttack} disabled={autoBattle} className="story-button justify-center disabled:opacity-40">
          공격
        </button>
        <button data-sfx="custom" onClick={playerSkill} disabled={autoBattle || mp < 10} className="story-button story-button--primary justify-center disabled:opacity-40">
          집중 공격 (집중력 10)
        </button>
      </div>

      <div className="battle-resources">체력 {Math.max(0, hp)} · 집중력 {mp} · 공격 피해 +{weaponPower} · 주사위 보정 +{luck}{protection > 0 && ` · 인연의 힘 +${protection}`}</div>
    </div>
  );
}
