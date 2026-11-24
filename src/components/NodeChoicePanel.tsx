import { useRun } from "../store/useRun";
import type { NodeType } from "../types/game";
import { nodeArt } from "../data/extraArtMapping";
import ExtraArt from "./ExtraArt";

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
        const main = n.id.endsWith("main");
        return (
          <button
            key={n.id}
            data-sfx={n.type === "event" ? "custom" : "page"}
            onClick={() => selectNode(n)}
            className={`destination${n.encounterId && !main ? " destination--reunion" : ""}`}
          >
            <span className="destination__icon" aria-hidden="true">✧<ExtraArt src={nodeArt(n.type)} className="extra-art--node" /></span>
            <span className="destination__body"><span className="destination__tag">{main ? "메인 이야기 · 필수" : n.id.endsWith("side") ? "승객의 이야기 · 선택" : n.encounterId ? "이어지는 인연 · 선택" : t}</span><strong>{n.title}</strong><small>{n.preview}</small></span>
            <span className="destination__arrow">↗</span>
          </button>
        );
      })}
    </div>
  );
}
