import { useMeta } from "../store/useMeta";
import { ENDING_CATALOG } from "../data/endings";
import { NPCS } from "../data/npcs";

interface Props {
  endingId: string | null;
  onClose: () => void;
}

export default function EndingRecallModal({ endingId, onClose }: Props) {
  const record = useMeta((s) => (endingId ? s.endingLog[endingId] : undefined));
  if (!endingId) return null;

  const catalog = ENDING_CATALOG.find((e) => e.id === endingId);
  if (!catalog) return null;
  const npc = catalog.npcId ? NPCS[catalog.npcId] : null;
  return (
    <div className="story-overlay recall-overlay" role="dialog" aria-modal="true" aria-labelledby="recall-title">
      <div className="story-sheet recall-sheet">
        <div className="recall-topline">
          <span className="eyebrow">A REMEMBERED ENDING</span>
          <button
            onClick={onClose}
            className="icon-button"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div>
          <h2 id="recall-title" className="story-sheet__title">{catalog.title}</h2>
          {npc && <p className="muted-copy">{npc.name}</p>}
        </div>

        <p className="story-prose">
          {record?.text ?? catalog.summary}
        </p>

        {record && (
          <p className="recall-date">
            {new Date(record.timestamp).toLocaleString("ko-KR")}
          </p>
        )}

        <button
          onClick={onClose}
          className="story-button story-button--primary justify-center"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
