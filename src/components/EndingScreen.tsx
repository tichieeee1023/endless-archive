import { useEffect, useRef, useState } from "react";
import { useRun } from "../store/useRun";
import { useMeta } from "../store/useMeta";
import { resolveEnding } from "../lib/ending";
import { audio } from "../lib/audio";
import ArchiveModal from "./ArchiveModal";

export default function EndingScreen() {
  const { affinity, flags, nodeResult, startRun } = useRun();
  const { endings, addRun, addEnding } = useMeta();

  const victory = nodeResult?.endsRun === "victory";
  const [ending] = useState(() => useRun.getState().endingResult ?? resolveEnding(affinity, flags, victory, endings));
  const [archiveOpen, setArchiveOpen] = useState(false);
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current || useRun.getState().endingRecorded) return;
    recorded.current = true;
    audio.sfx("ending");
    addEnding(ending.id, ending.title, ending.text);
    addRun(victory ? "victory" : "death");
    useRun.getState().markEndingRecorded(ending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ending-screen">
      <div className="ending-ornament">✧</div>
      <div className="eyebrow">THE END OF A JOURNEY</div>
      <h1>{ending.title}</h1>
      <div className="ending-rule">✦</div>
      <p>{ending.text}</p>
      <button
        onClick={() => startRun()}
        className="story-button story-button--primary justify-center"
      >
        다시 열차에 오른다
      </button>
      <button className="ending-archive" onClick={() => setArchiveOpen(true)}>서고의 기록 살펴보기 →</button>
      <ArchiveModal open={archiveOpen} onClose={() => setArchiveOpen(false)} />
    </div>
  );
}
