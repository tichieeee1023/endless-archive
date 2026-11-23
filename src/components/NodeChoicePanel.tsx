import { useRun } from "../store/useRun";
import type { NodeType } from "../types/game";

const TYPE_STYLE: Record<NodeType, string> = {
  battle: "위험", elite: "강한 적", event: "만남과 이야기", shop: "서적상",
  rest: "잠시 휴식", treasure: "발견", boss: "마지막 장",
};

export default function NodeChoicePanel() {
  const { choices, selectNode } = useRun();
  if (choices.length === 0) return null;

  return (
    <div className="action-panel">
      <div className="panel-heading"><div><span className="eyebrow">THE NEXT PAGE</span><h2>다음 페이지를 고른다</h2><p className="panel-description">발걸음에 따라 만나는 이야기가 달라집니다.</p></div><span className="heading-ornament">✳</span></div>
      {choices.map((n) => {
        const t = TYPE_STYLE[n.type];
        return (
          <button
            key={n.id}
            onClick={() => selectNode(n)}
            className="destination"
          >
            <span className="destination__icon">{n.type === "event" ? "✧" : n.type === "rest" ? "☾" : n.type === "battle" || n.type === "elite" || n.type === "boss" ? "†" : "◇"}</span>
            <span className="destination__body"><span className="destination__tag">{t}</span><strong>{n.title}</strong><small>{n.preview}</small></span>
            <span className="destination__arrow">↗</span>
          </button>
        );
      })}
    </div>
  );
}
