import { useEffect, useRef, useState } from "react";
import { useRun } from "../store/useRun";
import { closestBond, RESCUE_AFFINITY, FINAL_RESCUE_AFFINITY } from "../lib/defeat";
import { bondProtection } from "../lib/bond";
import { autoBattleAction, skillCost, basicDamage, skillDamage, counterFloor } from "../lib/combat";
import { formatNarrative } from "../lib/formatNarrative";
import { audio } from "../lib/audio";
import SceneView from "./SceneView";
import { isLastBossTelegraph } from "../lib/battlePattern";
import { usePresentation } from "../store/usePresentation";
import { openingRevealMs, previewDie } from "../lib/presentation";

export default function BattlePanel() {
  const {
    battle, current, act, hp, mp, maxHp, maxMp, healthPotions, focusPotions, useHealingPotion, useFocusPotion, affinity, stats, weaponPower, armorPower, luck, flags,
    playerAttack, playerSkill, playerBrace,
    autoBattle, toggleAutoBattle,
  } = useRun();
  const openingRoll = battle?.openingRoll;
  const battleBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { battleBodyRef.current?.scrollTo({top: 0}); }, [battle?.turn, battle?.log.length]);
  const motionEnabled = usePresentation((s) => s.motionEnabled);
  const [displayedRoll, setDisplayedRoll] = useState(openingRoll?.rolled ?? 1);
  const [rollRevealed, setRollRevealed] = useState(() => openingRevealMs(motionEnabled, window.matchMedia("(prefers-reduced-motion: reduce)").matches, battle?.turn ?? 1, Boolean(openingRoll)) === 0);
  const hasRevealed = useRef(false);
  const turn = battle?.turn ?? 1;

  useEffect(() => {
    if (!openingRoll) { setRollRevealed(true); return; }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const duration = openingRevealMs(motionEnabled, preference.matches, turn, true);
    if (!duration || hasRevealed.current) {
      hasRevealed.current = true;
      setDisplayedRoll(openingRoll.rolled);
      setRollRevealed(true);
      return;
    }
    let step = 0;
    setRollRevealed(false);
    const interval = window.setInterval(() => setDisplayedRoll(previewDie(step++)), 70);
    const finish = (sound: boolean) => {
      if (hasRevealed.current) return;
      hasRevealed.current = true;
      window.clearInterval(interval);
      window.clearTimeout(timer);
      setDisplayedRoll(openingRoll.rolled);
      setRollRevealed(true);
      if (sound) audio.sfx("dice");
    };
    const timer = window.setTimeout(() => finish(true), duration);
    const onPreference = () => { if (preference.matches) finish(false); };
    preference.addEventListener("change", onPreference);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
      preference.removeEventListener("change", onPreference);
    };
  }, [openingRoll, motionEnabled, turn]);

  useEffect(() => {
    if (!battle || !autoBattle || (openingRoll && !rollRevealed)) return;
    const timer = window.setTimeout(() => {
      const state = useRun.getState();
      if (!state.autoBattle || state.status !== "battle" || !state.battle) return;
      // 물약은 턴을 쓰지 않으므로, 행동 전에 필요한 만큼 먼저 마시고 같은 턴에 다시 판단한다.
      for (let i = 0; i < state.healthPotions + state.focusPotions + 1; i++) {
        const cur = useRun.getState();
        if (!cur.battle || cur.status !== "battle") return;
        const action = autoBattleAction(cur.battle, cur);
        if (action === "potion") cur.autoHealingPotion();
        else if (action === "focusPotion") cur.autoFocusPotion();
        else {
          if (action === "brace") cur.playerBrace();
          else if (action === "skill") cur.playerSkill();
          else cur.playerAttack();
          return;
        }
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [battle, autoBattle, openingRoll, rollRevealed]);
  if (!battle) return null;

  const e = battle.enemy;
  const finalBoss = e.name.includes("마지막 장");
  const chapterBoss = current?.type === "boss" || e.name.startsWith("이야기의 끝 —");
  const bossTelegraph = isLastBossTelegraph(battle);
  const hpPct = Math.max(0, (e.hp / e.maxHp) * 100);
  const protection = bondProtection(affinity, flags);
  const bond = closestBond(affinity, flags);
  const rescueAvailable = finalBoss ? bond.value >= FINAL_RESCUE_AFFINITY : bond.value >= RESCUE_AFFINITY && !flags.some(f => f.startsWith("rescued_"));
  const openingLabel = openingRoll?.outcome === "great" ? "크리티컬!"
    : openingRoll?.outcome === "success" ? "성공!"
    : openingRoll?.outcome === "fumble" ? "대실패!" : "실패!";

  return (
    <div className={`action-panel battle-panel${chapterBoss ? " battle-panel--boss" : ""}`}>
      <div className="panel-heading"><div><span className="eyebrow">{chapterBoss ? `CHAPTER 0${act} · ${finalBoss ? "THE LAST PAGE" : "THE GUARDIAN"}` : "A DANGEROUS PAGE"}</span><h2>{e.name}</h2></div><button className="auto-toggle" aria-pressed={autoBattle} onClick={toggleAutoBattle}>자동 전투 <b>{autoBattle ? "ON" : "OFF"}</b></button></div>
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

      <div className={`battle-body${battle.turn > 1 ? " battle-body--ongoing" : ""}`} ref={battleBodyRef} role="region" tabIndex={0} aria-label="전투 상세 기록">
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
            <small>{rollRevealed ? `d20 ${openingRoll.rolled} + 전투 능력 ${openingRoll.modifier - luck * 2} + 행운 ${luck * 2} = ${openingRoll.total} / 난이도 ${openingRoll.difficulty}` : "주사위가 멈추기를 기다린다…"}</small>
            {rollRevealed && <small>{openingRoll.powerBonus > 0 ? `이번 전투 공격 피해 +${openingRoll.powerBonus}` : "이번 전투 공격 보정 없음"}</small>}
          </span>
        </div>
      )}

      <div className="battle-log" aria-live="polite">
        {battle.log.slice(-3).map((l, i, lines) => <p key={battle.log.length - lines.length + i} className={i === lines.length - 1 ? "battle-log__latest" : undefined}>{formatNarrative(l)}</p>)}
      </div>

      <div className="battle-mobile-scene"><SceneView /></div>
      {finalBoss && <p className="panel-description">마지막 장의 반격은 방어 후에도 최소 {counterFloor(e.atk, true)} 피해를 입힙니다. 회피와 지원은 예외입니다.</p>}
      {battle.companionGuard && <p className="panel-description">세온의 지원 · 첫 피격 피해 무효 (남은 1회)</p>}
      {rescueAvailable && <p className="panel-description">{finalBoss ? "쌓아 온 인연이 마지막 순간에도 당신을 지켜 줄 수 있습니다." : "위험한 순간, 가까운 인연이 이번 여정에서 한 번 손을 내밀 수 있습니다."}</p>}
      <div className="battle-resources">체력 {Math.max(0, hp)} · 집중력 {mp} · 공격 피해 +{weaponPower} · 피격 피해 -{armorPower} · 주사위 보정 +{luck}{protection > 0 && ` · 인연의 보호 -${protection}`}{battle.nextAttackBonus ? ` · 다음 공격 +${battle.nextAttackBonus}` : ""}</div>
      </div>
      <div className="battle-dock">
        {bossTelegraph && <p className="battle-dock__warning" role="status">강공격 예고 · 흘리기로 피해를 피할 수 있어요.</p>}
      <div className="battle-actions">
        <button data-sfx="custom" onClick={playerAttack} disabled={autoBattle} className="story-button justify-center disabled:opacity-40">
          공격 ({basicDamage(stats, weaponPower) + (battle.openingRoll?.powerBonus ?? 0) + (battle.nextAttackBonus ?? 0)})
        </button>
        <button data-sfx="custom" onClick={playerSkill} disabled={autoBattle || mp < skillCost(stats.wisdom)} className="story-button story-button--primary justify-center disabled:opacity-40">
          집중 공격 ({skillDamage(stats, weaponPower) + (battle.openingRoll?.powerBonus ?? 0) + (battle.nextAttackBonus ?? 0)} 피해 · 집중력 {skillCost(stats.wisdom)})
        </button>
        {finalBoss && <button data-sfx="custom" onClick={playerBrace} disabled={autoBattle || !bossTelegraph} className="story-button boss-brace justify-center disabled:opacity-40">
          {bossTelegraph ? "강공격을 흘리고 다음 공격 준비" : "공격 흘리기 · 강공격 예고 때 사용"}
        </button>}
      </div>

        <div className="battle-potions" aria-label="물약 바로 사용">
          <button type="button" data-sfx="custom" onClick={useHealingPotion} disabled={autoBattle || healthPotions <= 0 || hp >= maxHp} className="story-button">체력 물약 <b>{healthPotions}</b></button>
          <button type="button" data-sfx="custom" onClick={useFocusPotion} disabled={autoBattle || focusPotions <= 0 || mp >= maxMp} className="story-button">집중력 물약 <b>{focusPotions}</b></button>
        </div>
      </div>
    </div>
  );
}
