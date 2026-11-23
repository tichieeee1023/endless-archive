import { useEffect, useState } from "react";
import { useRun } from "../store/useRun";
import { bondProtection } from "../lib/bond";
import { formatNarrative } from "../lib/formatNarrative";
import { audio } from "../lib/audio";
import { isLastBossTelegraph } from "../lib/battlePattern";

export default function BattlePanel() {
  const {
    battle, hp, mp, affinity, stats, weaponPower, armorPower, luck,
    playerAttack, playerSkill, playerBrace,
    autoBattle, toggleAutoBattle,
  } = useRun();
  const openingRoll = battle?.openingRoll;
  const [displayedRoll, setDisplayedRoll] = useState(openingRoll?.rolled ?? 1);
  const [rollRevealed, setRollRevealed] = useState(!openingRoll);

  useEffect(() => {
    if (!openingRoll) {
      setRollRevealed(true);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interval = window.setInterval(() => {
      setDisplayedRoll(Math.floor(Math.random() * 20) + 1);
    }, reducedMotion ? 100 : 48);
    const timer = window.setTimeout(() => {
      window.clearInterval(interval);
      setDisplayedRoll(openingRoll.rolled);
      setRollRevealed(true);
      audio.sfx("dice");
    }, reducedMotion ? 300 : 1120);

    setRollRevealed(false);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [openingRoll]);

  useEffect(() => {
    if (!battle || !autoBattle || (openingRoll && !rollRevealed)) return;
    const timer = window.setTimeout(() => {
      const state = useRun.getState();
      if (!state.autoBattle || state.status !== "battle" || !state.battle) return;
      if (isLastBossTelegraph(state.battle)) state.playerBrace();
      else if (state.mp >= 10) state.playerSkill();
      else state.playerAttack();
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [battle, autoBattle, openingRoll, rollRevealed]);
  if (!battle) return null;

  const e = battle.enemy;
  const finalBoss = e.name.includes("마지막 장");
  const bossTelegraph = isLastBossTelegraph(battle);
  const hpPct = Math.max(0, (e.hp / e.maxHp) * 100);
  const protection = bondProtection(affinity);
  const openingLabel = openingRoll?.outcome === "great" ? "크리티컬!"
    : openingRoll?.outcome === "success" ? "성공!"
    : openingRoll?.outcome === "fumble" ? "대실패!" : "실패!";

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
        <div className="enemy-status__turn">{battle.turn}번째 행동{bossTelegraph ? " · 강공격 예고" : ""}</div>
      </div>

      {finalBoss && <div className={`boss-telegraph ${bossTelegraph ? "is-active" : ""}`} role="status" aria-live="polite">
        <strong>{bossTelegraph ? "마지막 장이 강공격을 준비한다" : "마지막 장의 움직임을 살핀다"}</strong>
        <small>{bossTelegraph ? "이번 턴에 강공격을 흘리면 피해를 피하고 다음 공격이 강해집니다." : "세 번째 행동마다 강공격을 예고합니다."}</small>
      </div>}

      {openingRoll && (
        <div className={`opening-roll opening-roll--${openingRoll.outcome} ${rollRevealed ? "is-revealed" : "is-rolling"}`} role="status" aria-live="polite">
          <span className="opening-roll__eyebrow">전투 전 주사위 판정</span>
          <span className="opening-roll__result-stack">
            <span className={`opening-roll__die ${rollRevealed ? "" : "opening-roll__die--rolling"}`} aria-hidden="true">{rollRevealed ? openingRoll.rolled : displayedRoll}</span>
            <strong className="opening-roll__result">{rollRevealed ? openingLabel : "굴러가는 중…"}</strong>
          </span>
          <span className="opening-roll__copy">
            <small>{rollRevealed ? `d20 ${openingRoll.rolled} + 힘 ${stats.body} + 행운 ${luck * 2} = ${openingRoll.total} / 난이도 ${openingRoll.difficulty}` : "주사위가 멈추기를 기다린다…"}</small>
            {rollRevealed && <small>{openingRoll.powerBonus > 0 ? `이번 전투 공격 피해 +${openingRoll.powerBonus}` : "이번 전투 공격 보정 없음"}</small>}
          </span>
        </div>
      )}

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
        {finalBoss && <button data-sfx="custom" onClick={playerBrace} disabled={autoBattle || !bossTelegraph} className="story-button boss-brace justify-center disabled:opacity-40">
          {bossTelegraph ? "강공격을 흘리고 다음 공격 준비" : "공격 흘리기 · 강공격 예고 때 사용"}
        </button>}
      </div>

      <div className="battle-resources">체력 {Math.max(0, hp)} · 집중력 {mp} · 공격 피해 +{weaponPower} · 피격 피해 -{armorPower} · 주사위 보정 +{luck}{protection > 0 && ` · 인연의 힘 +${protection}`}{battle.nextAttackBonus ? ` · 다음 공격 +${battle.nextAttackBonus}` : ""}</div>
    </div>
  );
}
