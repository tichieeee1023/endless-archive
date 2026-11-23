import { useRun } from "../store/useRun";
import type { FinalDestination } from "../lib/ending";
import { EXTRA_ART } from "../data/extraArt";
import ExtraArt from "./ExtraArt";

function memoryEcho(flags: string[]) {
  if (flags.includes("prologue_insight") || flags.includes("prologue_listen")) return "작은 단서를 놓치지 않겠다고 적었던 첫 문장이 떠오른다.";
  if (flags.includes("prologue_strength")) return "힘으로 길을 열겠다고 적었던 첫 문장이 떠오른다.";
  if (flags.includes("prologue_gold")) return "기억보다 먼저 골드를 챙겼던 순간이 떠오른다. 그 동전은 여정 내내 주머니에 남아 있다.";
  if (flags.includes("prologue_reach")) return "누군가에게 먼저 손을 내밀겠다고 적었던 첫 문장이 떠오른다.";
  return "끝내 나만의 답을 찾겠다고 적었던 첫 문장이 떠오른다.";
}

const DESTINATIONS: { id: FinalDestination; title: string; text: string }[] = [
  { id: "return", title: "새벽역의 이름을 되찾고 약속을 지킨다", text: "빈 차표에 새벽역을 적고, 기다리는 사람에게 답한다." },
  { id: "stay", title: "새벽역에 남아 불을 켜 둔다", text: "다음에 길을 잃은 승객도 이곳을 찾을 수 있도록." },
  { id: "depart", title: "새 목적지를 적고 떠난다", text: "약속을 품은 채, 아직 이름 없는 길로 향한다." },
];

export default function FinalChoiceScreen() {
  const { flags, chooseFinalDestination } = useRun();

  return (
    <main className="chapter-screen">
      <section className="chapter-page final-choice-page">
        <header className="prologue-topline">
          <span>이름 없는 역</span><span>THE LAST PAGE · 03</span>
        </header>
        <div className="chapter-visual"><ExtraArt src={EXTRA_ART.scene_journey_end} className="chapter-illustration" /></div>
        <div className="chapter-content">
          <p className="section-kicker">THE UNNAMED STATION · ENDING</p>
          <h1>새벽역의 마지막 승객</h1>
          <div className="prologue-divider"><span>✦</span></div>
          <p className="chapter-prose">열차가 멈춘다. 간판에는 지워졌던 이름, 새벽역이 돌아와 있다. 플랫폼 끝에는 당신과 한 쌍인 차표를 든 사람이 서 있다. 그날 왜 혼자 떠났는지, 얼굴을 마주하면 기억날지도 모른다.\n\n{memoryEcho(flags)}</p>
          <p className="chapter-prompt">그 사람에게 어떤 답을 건넬까?</p>
          <div className="chapter-choices">
            {DESTINATIONS.map((destination) => (
              <button className="story-button" key={destination.id} onClick={() => chooseFinalDestination(destination.id)}>
                <span className="final-destination-copy"><strong>{destination.title}</strong><small>{destination.text}</small></span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
