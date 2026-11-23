import { getShopArt } from "../data/artLibrary";
import { useRun } from "../store/useRun";

export default function ShopPanel() {
  const { shopItems, gold, buyItem, closeShop } = useRun();
  if (!shopItems) return null;

  return (
    <div className="action-panel shop-panel">
      <div className="panel-heading"><div><span className="eyebrow">THE BOOKSELLER</span><h2>떠돌이 서적상</h2><p className="panel-description">필요한 것을 고르세요. 구입 즉시 적용됩니다.</p></div><span className="shop-gold">{gold} G</span></div>
      {shopItems.map((it) => (
        <button
          key={it.id}
          onClick={() => buyItem(it.id)}
          disabled={gold < it.price}
          className="story-button disabled:opacity-40"
        >
          {getShopArt(it.id) && <img className="shop-item__icon" src={getShopArt(it.id)?.src} alt="" width="52" height="52" loading="lazy" />}
          <span>{it.name}<small className="shop-effect">{it.effect === "heal" ? `체력 +${it.amount}` : it.effect === "mana" ? `내공 +${it.amount}` : "능력치 +1"}</small></span>
          <span className="shop-gold">{it.price} G</span>
        </button>
      ))}
      <button onClick={closeShop} className="story-button story-button--primary justify-center">
        상점을 떠난다
      </button>
    </div>
  );
}
