import { useEffect, useRef } from "react";
import { useRun } from "../store/useRun";
import trainCorridor from "../assets/illustrations/train-corridor.png";

export default function LogView() {
  const logs = useRun((s) => s.logs);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [logs]);

  return (
    <div className="journal-shell">
      <div className="journal-illustration" aria-hidden="true">
        <img src={trainCorridor} alt="" width="1672" height="941" />
      </div>
      <div ref={ref} className="journal-log" aria-label="여정 기록">
        <div className="journal-log__heading"><span>THE JOURNAL</span><span>✦</span><span>여정의 기록</span></div>
        {logs.map((l) => (
          <p key={l.id} className={`journal-log__entry journal-log__entry--${l.type}`}>{l.text}</p>
        ))}
      </div>
    </div>
  );
}
