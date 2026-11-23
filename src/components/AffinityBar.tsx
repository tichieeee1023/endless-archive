import { useRun } from "../store/useRun";
import { NPCS } from "../data/npcs";

export default function AffinityBar() {
  const affinity = useRun((s) => s.affinity);
  const flags = useRun((s) => s.flags);
  return (
    <div className="affinity-row" aria-label="인물들과의 관계"><span className="affinity-label">인연의 기록</span>
      {Object.values(NPCS).map((npc) => {
        const stage = flags.includes(`bond_${npc.id}_2`) ? "close"
          : flags.includes(`bond_${npc.id}_1`) ? "known" : "stranger";
        const relationship = stage === "close" ? "가까워진 사이"
          : stage === "known" ? "알아가는 중" : "낯선 사이";
        return (
          <div key={npc.id} className="affinity-person" title={`${npc.name} · 호감도 ${affinity[npc.id]}`}>
            <span className={`affinity-heart affinity-heart--${stage}`} aria-hidden="true">{stage === "stranger" ? "♡" : "♥"}</span>
            <span>{npc.name}</span>
            <span className="affinity-value">{relationship}</span>
          </div>
        );
      })}
    </div>
  );
}
