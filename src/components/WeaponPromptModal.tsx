import { useEffect, useRef } from "react";
import { useRun } from "../store/useRun";
import { formatStatBonuses } from "../lib/equipment";

export default function WeaponPromptModal() {
  const {
    pendingWeaponPrompt, ownedWeapons, equippedWeaponId, weaponPower, equipWeapon, dismissWeaponPrompt,
  } = useRun();
  const closeRef = useRef<HTMLButtonElement>(null);
  const weapon = ownedWeapons.find((item) => item.id === pendingWeaponPrompt?.weaponId);

  useEffect(() => {
    if (!pendingWeaponPrompt || !weapon) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); dismissWeaponPrompt(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); trigger?.focus(); };
  }, [pendingWeaponPrompt, weapon, dismissWeaponPrompt]);

  if (!pendingWeaponPrompt || !weapon) return null;

  const bought = pendingWeaponPrompt.source === "purchase";
  const currentWeapon = ownedWeapons.find((item) => item.id === equippedWeaponId);

  return (
    <div className="story-overlay weapon-prompt-overlay" onClick={dismissWeaponPrompt}>
      <section className="story-sheet weapon-prompt-sheet" role="dialog" aria-modal="true" aria-labelledby="weapon-prompt-title"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
          const first = buttons[0], last = buttons.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}>
        <div className="weapon-prompt-heading">
          <span className="eyebrow">{bought ? "NEW WEAPON" : "LOOT FOUND"}</span>
          <button ref={closeRef} type="button" className="icon-button" aria-label="현재 무기 유지" onClick={dismissWeaponPrompt}>✕</button>
        </div>
        <h2 id="weapon-prompt-title">{bought ? "구입한 무기를 착용할까요?" : "더 강한 무기를 찾았다!"}</h2>
        <p className="weapon-prompt-name">{weapon.name}</p>
        <p className="weapon-prompt-stats">
          현재 {currentWeapon?.name ?? "맨손"} · 공격 피해 +{weaponPower}{formatStatBonuses(currentWeapon?.statBonus).length ? ` · ${formatStatBonuses(currentWeapon?.statBonus).join(" · ")}` : ""}<br />
          새 무기 · 공격 피해 +{weapon.power}{formatStatBonuses(weapon.statBonus).length ? ` · ${formatStatBonuses(weapon.statBonus).join(" · ")}` : ""}
        </p>
        <div className="weapon-prompt-actions">
          <button type="button" className="story-button story-button--primary justify-center" onClick={() => equipWeapon(weapon.id)}>
            지금 장착한다
          </button>
          <button type="button" className="story-button justify-center" onClick={dismissWeaponPrompt}>
            현재 무기를 유지한다
          </button>
        </div>
        <p className="weapon-prompt-note">보관한 무기는 가방에서 확인하고 상점에서 판매할 수 있어요.</p>
      </section>
    </div>
  );
}
