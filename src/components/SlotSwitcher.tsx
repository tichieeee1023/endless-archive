import { useState } from "react";
import { useSaveSlots, type Slot } from "../store/useSaveSlots";
import { useRun } from "../store/useRun";

export default function SlotSwitcher() {
  const { active, labels, setActive, setLabel } = useSaveSlots();
  const [editing, setEditing] = useState<Slot | null>(null);
  const [draft, setDraft] = useState("");

  const switchTo = (s: Slot) => {
    if (s === active) return;
    const hasSave = localStorage.getItem(`endless-archive-run_slot${s}`) !== null;
    setActive(s);
    if (hasSave) void useRun.persist.rehydrate();
    else useRun.getState().startRun();
  };

  const startEdit = (s: Slot) => {
    setEditing(s);
    setDraft(labels[s]);
  };

  const commit = () => {
    if (editing === null) return;
    const trimmed = draft.trim().slice(0, 12);
    if (trimmed) setLabel(editing, trimmed);
    setEditing(null);
  };

  const handleTap = (s: Slot) => {
    if (s === active) startEdit(s);
    else switchTo(s);
  };

  return (
    <section className="slot-switcher" aria-label="저장 슬롯">
      <div className="slot-row">
        <span className="slot-label">여정</span>
        {([1, 2, 3] as Slot[]).map((s) => (
          <div key={s} className="slot-item">
            {editing === s ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => e.key === "Enter" && commit()}
                maxLength={12}
                aria-label={`슬롯 ${s} 이름`}
                className="slot-input"
              />
            ) : (
              <button
                onClick={() => handleTap(s)}
                aria-current={active === s ? "true" : undefined}
                className={`slot-button ${active === s ? "is-active" : ""}`}
              >
                {labels[s]}
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="slot-hint">
        현재 슬롯을 다시 누르면 이름을 바꿀 수 있어요.
      </p>
    </section>
  );
}
