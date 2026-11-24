import { useEffect, useRef } from "react";
import { useRun } from "../store/useRun";
import { potionHeal } from "../lib/combat";
import { formatCharmEffects, formatStatBonuses } from "../lib/equipment";

export default function InventoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    status, hp, maxHp, mp, maxMp, healthPotions, focusPotions, stats, nodeResult,
    ownedWeapons, equippedWeaponId, weaponPower, armorPower, luck,
    ownedCharms, equippedCharmId,
    autoBattle, useHealingPotion: restoreHealth, useFocusPotion: restoreFocus,
    equipWeapon, equipCharm,
  } = useRun();
  const closeRef = useRef<HTMLButtonElement>(null);
  const inBattle = status === "battle";
  const equippedWeapon = ownedWeapons.find((weapon) => weapon.id === equippedWeaponId);
  const equippedCharm = ownedCharms.find((charm) => charm.id === equippedCharmId);

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); trigger?.focus(); };
  }, [open, onClose]);

  if (!open) return null;

  const drinkHealthPotion = () => { restoreHealth(); onClose(); };
  const drinkFocusPotion = () => { restoreFocus(); onClose(); };

  return (
    <div className="story-overlay inventory-overlay" onClick={onClose}>
      <section className="story-sheet inventory-sheet" role="dialog" aria-modal="true" aria-labelledby="inventory-title"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
          const first = buttons[0], last = buttons.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}>
        <div className="inventory-heading">
          <div><span className="eyebrow">YOUR BELONGINGS</span><h2 id="inventory-title">소지품</h2></div>
          <button ref={closeRef} type="button" className="icon-button" aria-label="소지품 닫기" onClick={onClose}>✕</button>
        </div>

        <div className="inventory-vitals">
          <span><b>체력</b> {Math.max(0, hp)} / {maxHp}</span>
          <span><b>집중력</b> {mp} / {maxMp}</span>
        </div>

        <section className="inventory-section" aria-labelledby="inventory-potions-title">
          <h3 id="inventory-potions-title">물약 · {healthPotions + focusPotions}개</h3>
          <div className="inventory-potions">
            <article className="inventory-item">
              <span className="inventory-item__mark inventory-item__mark--health" aria-hidden="true">♥</span>
              <span className="inventory-item__copy"><strong>체력 물약</strong><small>체력 최대 {potionHeal(maxHp, stats.charm)} 회복 · 보유 {healthPotions}개</small></span>
              <button type="button" className="inventory-use" onClick={drinkHealthPotion}
                disabled={status === "ended" || status === "finalChoice" || Boolean(nodeResult?.endsRun && status === "resolving") || (inBattle && autoBattle) || healthPotions <= 0 || hp >= maxHp}>
                사용
              </button>
            </article>
            <article className="inventory-item">
              <span className="inventory-item__mark inventory-item__mark--focus" aria-hidden="true">✦</span>
              <span className="inventory-item__copy"><strong>집중력 물약</strong><small>집중력 최대 {Math.max(8, Math.ceil(maxMp / 5))} 회복 · 보유 {focusPotions}개</small></span>
              <button type="button" className="inventory-use" onClick={drinkFocusPotion}
                disabled={status === "ended" || status === "finalChoice" || Boolean(nodeResult?.endsRun && status === "resolving") || (inBattle && autoBattle) || focusPotions <= 0 || mp >= maxMp}>
                사용
              </button>
            </article>
          </div>
          {inBattle && autoBattle && <p className="inventory-note">자동 전투 중에는 위험할 때 물약을 알아서 마셔요. 직접 쓰려면 자동 전투를 끄세요.</p>}
          {inBattle && !autoBattle && <p className="inventory-note">전투 중 물약은 턴을 소모하지 않아요.</p>}
          {!inBattle && <p className="inventory-note">전투 중이 아니어도 사용할 수 있어요. 체력이 가득 차면 체력 물약은 사용할 수 없습니다.</p>}
        </section>

        <section className="inventory-section" aria-labelledby="inventory-gear-title">
          <h3 id="inventory-gear-title">장비</h3>
          <div className="inventory-gear-row">
            <span><strong>무기</strong><small>{equippedWeapon?.name ?? "맨손"} · 공격 피해 +{weaponPower}{formatStatBonuses(equippedWeapon?.statBonus).length ? ` · ${formatStatBonuses(equippedWeapon?.statBonus).join(" · ")}` : ""}</small></span>
            <span><strong>부적</strong><small>{equippedCharm?.name ?? "없음"}</small></span>
            <span><strong>방어구</strong><small>피격 피해 -{armorPower}</small></span>
            <span><strong>행운</strong><small>주사위 보정 +{luck}</small></span>
          </div>
          {ownedWeapons.length > 0 && <>
            <h4 className="inventory-weapons__title">보유 무기 · {ownedWeapons.length}개</h4>
            <ul className="inventory-weapons">
              {ownedWeapons.map((weapon) => <li key={weapon.id}>
                <span className="inventory-charm-copy"><strong>{weapon.name}</strong><small>공격 피해 +{weapon.power}{formatStatBonuses(weapon.statBonus).length ? ` · ${formatStatBonuses(weapon.statBonus).join(" · ")}` : ""}</small></span>
                {weapon.id === equippedWeaponId
                  ? <span className="inventory-equipped">장착 중</span>
                  : <button type="button" className="inventory-use" onClick={() => equipWeapon(weapon.id)} disabled={inBattle}>장착</button>}
              </li>)}
            </ul>
            <p className="inventory-note">무기는 가방에서 교체하고, 판매는 떠돌이 상인이나 정령에게서 할 수 있어요.</p>
            {inBattle && <p className="inventory-note">전투 중에는 장비를 교체할 수 없어요.</p>}
          </>}
        </section>

        {ownedCharms.length > 0 && <section className="inventory-section" aria-labelledby="inventory-charms-title">
          <h3 id="inventory-charms-title">부적 보관함 · {ownedCharms.length}개</h3>
          <ul className="inventory-weapons">
            {ownedCharms.map((charm) => <li key={charm.id}>
              <span className="inventory-charm-copy"><strong>{charm.name}</strong><small>{formatCharmEffects(charm.effects).join(" · ")}</small></span>
              {charm.id === equippedCharmId
                ? <span className="inventory-equipped">장착 중</span>
                : <button type="button" className="inventory-use" onClick={() => equipCharm(charm.id)} disabled={inBattle}>장착</button>}
            </li>)}
          </ul>
          {inBattle && <p className="inventory-note">부적은 전투가 끝난 뒤 교체할 수 있어요.</p>}
        </section>}
      </section>
    </div>
  );
}
