import { UNNAMED_STATION_OPENING } from "../data/unnamedStation";
import { useRun } from "../store/useRun";
import { EXTRA_ART } from "../data/extraArt";
import ExtraArt from "./ExtraArt";
import { formatNarrative } from "../lib/formatNarrative";

export default function StoryOpeningScreen() {
  const chooseStoryOpening = useRun((s) => s.chooseStoryOpening);
  const story = UNNAMED_STATION_OPENING;

  return (
    <main className="chapter-screen">
      <section className="chapter-page">
        <header className="prologue-topline">
          <span>이름 없는 역</span><span>THE MAIN STORY · 01</span>
        </header>
        <div className="chapter-visual"><ExtraArt src={EXTRA_ART.story_train_ticket} className="chapter-illustration" /></div>
        <div className="chapter-content">
          <p className="section-kicker">THE FIRST PAGE OF THIS BOOK</p>
          <h1>{story.title}</h1>
          <div className="prologue-divider"><span>✦</span></div>
          <div className="chapter-prose">{formatNarrative(story.text)}</div>
          <p className="chapter-prompt">{story.prompt}</p>
          <div className="chapter-choices">
            {story.choices.map((choice, index) => (
              <button className="story-button" key={choice.flag} onClick={() => chooseStoryOpening(index)}>
                <span>{choice.text}</span><span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
