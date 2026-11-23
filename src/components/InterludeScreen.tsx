import { interludeFor } from "../data/interludes";
import { unnamedStationInterludeFor } from "../data/unnamedStation";
import { useRun } from "../store/useRun";
import { EXTRA_ART } from "../data/extraArt";
import ExtraArt from "./ExtraArt";
import { formatNarrative } from "../lib/formatNarrative";

export default function InterludeScreen() {
  const { act, interludeAct, flags, storyId, chooseInterlude } = useRun();
  const interlude = storyId === "unnamed_station"
    ? unnamedStationInterludeFor(interludeAct ?? act, flags)
    : interludeFor(interludeAct ?? act, flags);
  const art = interlude.act === 2 ? EXTRA_ART.act_transition_2 : EXTRA_ART.act_transition_3;

  return (
    <main className="chapter-screen">
      <section className="chapter-page">
        <header className="prologue-topline">
          <span>이름 없는 역</span><span>MAIN STORY · 0{interlude.act}</span>
        </header>
        <div className="chapter-visual"><ExtraArt src={art} className="chapter-illustration" /></div>
        <div className="chapter-content">
          <p className="section-kicker">THE UNNAMED STATION</p>
          <h1>{interlude.title}</h1>
          <div className="prologue-divider"><span>✦</span></div>
          <div className="chapter-prose">{formatNarrative(interlude.text)}</div>
          <p className="chapter-prompt">{interlude.prompt ?? "이 장면에서 당신은 어떻게 할까?"}</p>
          <div className="chapter-choices">
            {interlude.choices.map((choice, index) => (
              <button className="story-button" key={choice.flag} onClick={() => chooseInterlude(index)}>
                <span>{choice.text}</span><span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
