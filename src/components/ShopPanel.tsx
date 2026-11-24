import { potionHeal } from "../lib/combat";
import { getShopArt } from "../data/artLibrary";
import { useRun } from "../store/useRun";
import { STAT_LABEL } from "../types/game";
import { formatCharmEffects, formatStatBonuses } from "../lib/equipment";

export default function ShopPanel() {
  const {
    shopItems, shopCharms, shopkeeper, gold, weaponPower, armorPower, luck, maxHp, maxMp, stats,
    healthPotions, focusPotions, ownedWeapons, equippedWeaponId, ownedCharms, equippedCharmId,
    buyItem, buyCharm, equipWeapon, equipCharm, sellWeapon, closeShop,
  } = useRun();
  if (!shopItems) return null;
  const spirit = shopkeeper === "spirit";
  const equippedWeapon = ownedWeapons.find((weapon) => weapon.id === equippedWeaponId);
  const equippedCharm = ownedCharms.find((charm) => charm.id === equippedCharmId);

  return (
    <div className="action-panel shop-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{spirit ? "A WAYSTATION SPIRIT" : "WANDERING MERCHANT"}</span>
          <h2>{spirit ? "역의 정령" : "떠돌이 상인"}</h2>
          <p className="panel-description">
            {spirit ? "열차가 지나간 자리에 남은 정령이 작은 보급품을 내놓는다." : "막마다 더 나은 무기를 구할 수 있어요. 물약은 필요할 때 사용할 수 있어요."}
          </p>
          <p className="shop-current-bonuses">
            {equippedWeapon?.name ?? "맨손"} · 공격 피해 +{weaponPower} · 피격 피해 -{armorPower} · 행운 +{luck}
            {equippedCharm && ` · 부적 ${equippedCharm.name}`}
          </p>
        </div>
        <span className="shop-gold">{gold} G</span>
      </div>

      {([{ label: "물약", effects: ["heal", "mana"] }, { label: "장비", effects: ["weapon", "armor", "luck"] }, { label: "능력치 강화", effects: ["stat"] }]).map(group => {
        const items = shopItems.filter(item => group.effects.includes(item.effect));
        if (!items.length) return null;
        return <details className="shop-category" key={group.label} open={group.label === "물약"}>
          <summary>{group.label} <small>{items.length}종</small></summary>
          <div className="shop-category__items">{items.map((item) => {
        const bagFull = (item.effect === "heal" && healthPotions >= 5)
          || (item.effect === "mana" && focusPotions >= 5)
          || (item.effect === "weapon" && ownedWeapons.length >= 8);
        const maxed = (item.effect === "luck" && luck >= 1) || (item.effect === "armor" && armorPower >= 3);
        const outOfStock = item.stock !== undefined && item.stock <= 0;
        const art = getShopArt(item.id);
        const unavailable = outOfStock ? "품절" : bagFull ? "보관 한도 도달" : maxed ? "최대 강화 또는 보유 중" : gold < item.price ? "골드 부족" : null;
        const effect = item.effect === "heal" ? `체력 최대 ${potionHeal(maxHp, stats.charm)} 회복 · 보유 ${healthPotions}/5`
          : item.effect === "mana" ? `집중력 최대 ${Math.max(8, Math.ceil(maxMp / 5))} 회복 · 보유 ${focusPotions}/5`
          : item.effect === "stat" ? `${item.stat ? STAT_LABEL[item.stat] : "능력치"} +${item.amount}`
          : item.effect === "weapon" ? bagFull ? "무기 보관함이 가득 참" : `공격 피해 +${item.amount}${formatStatBonuses(item.statBonus).length ? ` · ${formatStatBonuses(item.statBonus).join(" · ")}` : ""} · 장착·판매 가능`
          : item.effect === "armor" ? maxed ? "최대 강화" : `피격 피해 -${item.amount}`
          : maxed ? "이미 소지 중" : "주사위 +1 · 판정 +4%";

        return (
          <button
            key={item.id}
            onClick={() => buyItem(item.id)}
            disabled={gold < item.price || bagFull || maxed || outOfStock}
            className="story-button shop-item"
          >
            <span className="shop-item__content">
              {art && <span className="shop-item__icon-frame"><img className="shop-item__icon" src={art.src} alt="" width="52" height="52" loading="lazy" decoding="async" /></span>}
              <span className="shop-item__details"><span className="shop-item__name">{item.name}</span><small className="shop-effect">{effect}{unavailable && <span className="shop-unavailable"> · {unavailable}</span>}</small></span>
            </span>
            <span className="shop-gold">{item.price} G</span>
          </button>
        );
          })}</div>
        </details>;
      })}

      {shopCharms && shopCharms.length > 0 && <details className="shop-category charm-market">
        <summary>떠돌이 부적 <small>{shopCharms.length}종</small></summary><div className="shop-category__items">
        {shopCharms.map((charm) => {
          const outOfStock = charm.stock <= 0;
          const art = getShopArt(charm.id);
          return (
            <button key={charm.id} onClick={() => buyCharm(charm.id)} disabled={gold < charm.price || outOfStock} className="story-button shop-item charm-offer">
              <span className="shop-item__content">
                {art && <span className="shop-item__icon-frame"><img className="shop-item__icon" src={art.src} alt="" width="52" height="52" loading="lazy" decoding="async" /></span>}
                <span className="shop-item__details"><span className="shop-item__name">{charm.name}</span><small className="shop-effect">{formatCharmEffects(charm.effects).join(" · ")}{(outOfStock || gold < charm.price) && <span className="shop-unavailable"> · {outOfStock ? "품절" : "골드 부족"}</span>}</small></span>
              </span>
              <span className="shop-gold">{charm.price} G</span>
            </button>
          );
        })}
      </div></details>}

      <details className="weapon-storage">
        <summary>무기 보관함 · {ownedWeapons.length}개</summary>
        {ownedWeapons.length === 0 ? <p className="weapon-storage__empty">무기는 전투에서 얻거나 상점에서 살 수 있어요.</p> : (
          <div className="weapon-storage__list">
            {ownedWeapons.map((weapon) => {
              const equipped = weapon.id === equippedWeaponId;
              return (
                <div className="weapon-row" key={weapon.id}>
                  <span className="weapon-row__copy"><strong>{weapon.name}</strong><small>공격 피해 +{weapon.power}{formatStatBonuses(weapon.statBonus).length ? ` · ${formatStatBonuses(weapon.statBonus).join(" · ")}` : ""} · 판매가 {weapon.value}G</small></span>
                  {equipped ? <span className="weapon-row__equipped">장착 중</span> : (
                    <span className="weapon-row__actions">
                      <button className="text-link" onClick={() => equipWeapon(weapon.id)}>장착</button>
                      <button className="text-link" onClick={() => sellWeapon(weapon.id)}>판매</button>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </details>

      <details className="weapon-storage" open={ownedCharms.length > 0 && !equippedCharmId}>
        <summary>부적 보관함 · {ownedCharms.length}개{equippedCharm ? ` · 장착 ${equippedCharm.name}` : ""}</summary>
        {ownedCharms.length === 0 ? <p className="weapon-storage__empty">상점에 무작위로 나타나는 부적을 모아 장착할 수 있어요.</p> : (
          <div className="weapon-storage__list">
            {ownedCharms.map((charm) => {
              const equipped = charm.id === equippedCharmId;
              return (
                <div className="weapon-row" key={charm.id}>
                  <span className="weapon-row__copy"><strong>{charm.name}</strong><small>{formatCharmEffects(charm.effects).join(" · ")}</small></span>
                  {equipped ? <span className="weapon-row__equipped">장착 중</span> : <button className="text-link" onClick={() => equipCharm(charm.id)}>장착</button>}
                </div>
              );
            })}
          </div>
        )}
      </details>

      <div className="shop-exit"><button onClick={closeShop} className="story-button story-button--primary justify-center">
        {spirit ? "정령 곁을 떠난다" : "상인을 떠난다"}
      </button></div>
    </div>
  );
}
