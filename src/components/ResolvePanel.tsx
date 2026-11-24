import { npcAccent } from "../lib/npcAccent";
import { useRun } from "../store/useRun";
import raelPortrait from "../assets/illustrations/rael.webp";
import seonPortrait from "../assets/illustrations/seon.webp";
import kairuPortrait from "../assets/illustrations/kairu.webp";
import { NPCS } from "../data/npcs";
import type { NpcId } from "../types/npc";
import { formatNarrative } from "../lib/formatNarrative";

export default function ResolvePanel() {
  const { nodeResult, advanceFloor, flags } = useRun();
  if (!nodeResult) return null;
  const isDeath = nodeResult.endsRun === "death" || nodeResult.endsRun === "defeat";

  const rescuer = (Object.keys(NPCS) as NpcId[]).find(npc => flags.includes(`${nodeResult.endsRun === "defeat" ? "final_defeat" : "rescued"}_${npc}`));
  const portraits = {rael:raelPortrait,seon:seonPortrait,kairu:kairuPortrait};
  return (
    <div className="action-panel resolve-panel">
      <div className="panel-heading npc-heading" {...npcAccent(nodeResult.rescued || nodeResult.endsRun === "defeat" ? rescuer : undefined)}><div><span className="eyebrow">A PAGE TURNS</span><h2>{nodeResult.endsRun === "defeat" || nodeResult.rescued ? "내밀어진 손" : isDeath ? "이야기의 끝에서" : "한 페이지를 넘기며"}</h2></div><span className="heading-ornament">✦</span></div>
      {(nodeResult.rescued || nodeResult.endsRun === "defeat") && rescuer && <img className="companion-standing companion-standing--rescue" src={portraits[rescuer]} alt={`${NPCS[rescuer].name}의 스탠딩 일러스트`} />}
      <div className="resolution-copy">
        {nodeResult.logs.map((l, i) => <p key={i}>{formatNarrative(l)}</p>)}
      </div>
      <button
        data-sfx="page" onClick={advanceFloor}
        className="story-button story-button--primary w-full justify-center"
      >
        {isDeath ? "…페이지가 넘어간다" : "다음 페이지로"}
      </button>
    </div>
  );
}
