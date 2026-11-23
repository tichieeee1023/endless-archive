import { PROLOGUE_CHOICES, PROLOGUE_PAGES } from "../data/prologue";
import { STAT_LABEL } from "../types/game";
import { useRun } from "../store/useRun";
import trainCorridor from "../assets/illustrations/train-corridor.png";

export default function Prologue() {
  const step = useRun((s) => s.prologueStep);
  const advance = useRun((s) => s.advancePrologue);
  const skip = useRun((s) => s.skipPrologue);
  const choose = useRun((s) => s.choosePrologue);
  const choosing = step >= PROLOGUE_PAGES.length;
  const page = PROLOGUE_PAGES[Math.min(step, PROLOGUE_PAGES.length - 1)];

  return (
    <main className="prologue-screen">
      <div className="prologue-page">
        <header className="prologue-topline">
          <span>종점 없는 서고</span><span>PROLOGUE · {String(Math.min(step + 1, PROLOGUE_PAGES.length)).padStart(2, "0")}</span>
        </header>
        <div className="prologue-visual"><img src={trainCorridor} alt="끝이 보이지 않는 열차 복도" /></div>
        <div className="prologue-content" key={step}>
          <p className="section-kicker">THE BEGINNING OF A STORY</p>
          <h1>{choosing ? "당신은 무엇을 적을까" : page.title}</h1>
          <div className="prologue-divider"><span>✦</span></div>
          {choosing ? (
            <>
              <p className="prologue-text">수첩의 첫 줄이 당신의 대답을 기다린다.</p>
              <div className="prologue-choices">
                {PROLOGUE_CHOICES.map((choice, index) => (
                  <button key={choice.flag} className="story-button prologue-choice" onClick={() => choose(index)}>
                    <span>{choice.text}<small>{STAT_LABEL[choice.stat]} +1</small></span><span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </>
          ) : <p className="prologue-text">{page.text}</p>}
        </div>
        {!choosing && (
          <footer className="prologue-footer">
            <div className="prologue-progress" aria-label={`프롤로그 ${step + 1}/${PROLOGUE_PAGES.length}`}>
              {PROLOGUE_PAGES.map((_, index) => <span key={index} className={index === step ? "is-active" : ""} />)}
            </div>
            <button className="text-link" onClick={skip}>건너뛰기</button>
            <button className="story-button story-button--primary prologue-next" onClick={advance}>
              {step === PROLOGUE_PAGES.length - 1 ? "첫 문장 쓰기" : "다음 페이지"} <span aria-hidden="true">→</span>
            </button>
          </footer>
        )}
      </div>
    </main>
  );
}
