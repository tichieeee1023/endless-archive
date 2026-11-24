import { useRun } from "../store/useRun";
import { EXTRA_ART } from "../data/extraArt";
import { actArt, enemyArt } from "../data/extraArtMapping";
import ExtraArt from "./ExtraArt";
import { formatNarrative } from "../lib/formatNarrative";
import { EXPANDED_STORY } from "../data/mainStory";
import { unnamedStationChapterText } from "../data/unnamedStation";

const CHAPTER_TEXT = [
  "닫힌 문 너머로 열차의 바퀴 소리가 들린다. 어떤 페이지를 펼칠지, 이번에는 당신이 고를 차례다.",
  "한 번 지나친 객차에도 새로운 문이 생겨 있다. 당신의 선택이 다음 만남을 이끈다.",
  "열차는 마지막 장을 향해 달린다. 아직 전하지 못한 말과 만나야 할 이야기가 남아 있다.",
];

export default function SceneView() {
  const { act, floor, current, status, battle, nodeResult, shopkeeper, storyId, flags } = useRun();
  const choosing = status === "choosing";
  const expanded = flags.includes(EXPANDED_STORY);
  const storySummary = expanded && floor > 1 ? (act === 1 ? (floor >= 10 ? "창밖의 불빛이 가리키는 곳으로 향한다." : floor >= 6 ? "두 승객의 기록을 따라 잃어버린 길을 찾는다." : "지워진 역명의 흔적을 좇는다.") : act === 2 ? (floor >= 10 ? "떠났던 밤의 마지막 기록을 찾아야 한다." : floor >= 6 ? "편지에 남은 약속과 끊어진 선로를 조사한다." : "기억 속의 승객에게 닿을 길을 찾는다.") : (floor >= 10 ? "마지막 장 앞에서 두 사람의 차표를 확인한다." : floor >= 6 ? "꺼지지 않는 신호를 따라 개찰구로 향한다." : "새벽역의 이름을 되찾을 차례다.")) : unnamedStationChapterText(act, flags);
  const text = choosing
    ? storyId === "unnamed_station" ? storySummary : CHAPTER_TEXT[Math.min(Math.max(act - 1, 0), 2)]
    : current?.preview;
  const chapterTitle = storyId === "unnamed_station"
    ? ["차표에 적힌 약속", "기록에서 사라진 승객", "새벽역을 향해"][Math.min(Math.max(act - 1, 0), 2)]
    : "어느 객차로 향할까";
  const shopArt = shopkeeper === "spirit" ? EXTRA_ART.scene_spirit_merchant
    : act <= 1 ? EXTRA_ART.scene_traveling_merchant : EXTRA_ART.scene_wagon_shop;
  const art = status === "battle" && battle ? enemyArt(battle.enemy.name)
    : (nodeResult?.endsRun === "death" || nodeResult?.endsRun === "defeat") ? EXTRA_ART.scene_defeat
    : status === "shop" ? shopArt
    : status === "resolving" && current?.type === "rest" ? EXTRA_ART.scene_rest
    : choosing && floor === 1
      ? storyId === "unnamed_station" && act === 3 ? EXTRA_ART.story_dawn_moon_station : actArt(act)
      : undefined;
  return (
    <section className="current-page" aria-label="현재 페이지">
      <span className="current-page__number">{String(act).padStart(2, "0")} / {String(floor).padStart(2, "0")}</span>
      <span className="current-page__ornament" aria-hidden="true">✳</span>
      {art && <ExtraArt src={art} fallback={status === "battle" ? EXTRA_ART.battle_common : undefined} className="extra-art--scene" />}
      <h1>{choosing ? chapterTitle : current?.title ?? "여정의 한 페이지"}</h1>
      {text && <p>{formatNarrative(text)}</p>}
      <span className="current-page__line" aria-hidden="true" />
    </section>
  );
}
