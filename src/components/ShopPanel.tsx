import { getShopArt } from "../data/artLibrary";
import { useRun } from "../store/useRun";
import { STAT_LABEL } from "../types/game";

export default function ShopPanel() {
  const { shopItems, gold, weaponPower, luck, buyItem, closeShop } = useRun();
  if (!shopItems) return null;

  return (
    <div className="action-panel shop-panel">
      <div className="panel-heading"><div><span className="eyebrow">THE BOOKSELLER</span><h2>떠돌이 서적상</h2><p className="panel-description">필요한 것을 고르세요. 구입 즉시 적용됩니다.</p><p className="shop-current-bonuses">무기 피해 +{weaponPower} · 행운 주사위 +{luck}</p></div><span className="shop-gold">{gold} G</span></div>
      {shopItems.map((it) => {
        const owned = (it.effect === "luck" && luck >= 1) || (it.effect === "weapon" && weaponPower >= 6);
        const art = getShopArt(it.id);
        const effect = it.effect === "heal" ? `체력 +${it.amount}`
          : it.effect === "mana" ? `집중력 +${it.amount}`
          : it.effect === "stat" ? `${it.stat ? STAT_LABEL[it.stat] : "능력치"} +${it.amount}`
          : it.effect === "weapon" ? owned ? "최대 강화" : `공격 피해 +${it.amount}`
          : owned ? "이미 소지 중" : "주사위 +1 · 판정 +4%";
        return (
          <button
            key={it.id}
            onClick={() => buyItem(it.id)}
            disabled={gold < it.price || owned}
            className="story-button shop-item"
          >
            <span className="shop-item__content">
              {art && <span className="shop-item__icon-frame"><img className="shop-item__icon" src={art.src} alt="" width="52" height="52" loading="lazy" decoding="async" /></span>}
              <span className="shop-item__details"><span className="shop-item__name">{it.name}</span><small className="shop-effect">{effect}</small></span>
            </span>
            <span className="shop-gold">{it.price} G</span>
          </button>
        );
      })}
      <button onClick={closeShop} className="story-button story-button--primary justify-center">
        상점을 떠난다
      </button>
    </div>
  );
}
