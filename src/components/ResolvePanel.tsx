import { useRun } from "../store/useRun";

export default function ResolvePanel() {
  const { nodeResult, advanceFloor } = useRun();
  if (!nodeResult) return null;
  const isDeath = nodeResult.endsRun === "death";

  return (
    <div className="action-panel resolve-panel">
      <div className="panel-heading"><div><span className="eyebrow">A PAGE TURNS</span><h2>{isDeath ? "이야기의 끝에서" : "한 페이지를 넘기며"}</h2></div><span className="heading-ornament">✦</span></div>
      <div className="resolution-copy">
        {nodeResult.logs.map((l, i) => <p key={i}>{l}</p>)}
      </div>
      <button
        onClick={advanceFloor}
        className="story-button story-button--primary w-full justify-center"
      >
        {isDeath ? "…페이지가 넘어간다" : "다음 페이지로"}
      </button>
    </div>
  );
}
