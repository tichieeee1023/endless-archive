import { useRun } from "../store/useRun";
import { NPCS } from "../data/npcs";

export default function AffinityBar() {
  const affinity = useRun((s) => s.affinity);
  const flags = useRun((s) => s.flags);
  return (
    <div className="affinity-row" aria-label="인물들과의 관계"><span className="affinity-label">인연의 기록</span>
      {Object.values(NPCS).map((npc) => (
        <div key={npc.id} className="affinity-person" title={`${npc.name} · 호감도 ${affinity[npc.id]}`}>
          <span className="affinity-star">✦</span>
          <span>{npc.name}</span>
          <span className="affinity-value">{flags.includes(`bond_${npc.id}_2`) ? "가까워진 사이" : flags.includes(`bond_${npc.id}_1`) ? "알아가는 중" : "낯선 사이"}</span>
        </div>
      ))}
    </div>
  );
}
