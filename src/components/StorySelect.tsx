import { STORY_BOOKS } from "../data/stories";
import { useRun } from "../store/useRun";
import trainCorridor from "../assets/illustrations/train-corridor.webp";

export default function StorySelect() {
  const selectStory = useRun((s) => s.selectStory);

  return (
    <main className="chapter-screen">
      <section className="chapter-page story-select-page">
        <header className="prologue-topline">
          <span>종점 없는 서고</span><span>CHOOSE A STORY</span>
        </header>
        <div className="chapter-visual">
          <img src={trainCorridor} alt="책장 사이로 이어지는 열차 복도" />
        </div>
        <div className="chapter-content">
          <p className="section-kicker">THE BOOKSHELF OF UNFINISHED STORIES</p>
          <h1>어떤 책을 펼칠까?</h1>
          <p className="story-prose">책장마다 끝나지 못한 이야기가 꽂혀 있다. 손을 뻗자, 차표의 빈칸과 닮은 잉크가 한 권의 책등 위에서 번진다.</p>
          <div className="story-book-list">
            {STORY_BOOKS.map((book) => (
              <article className="story-book-card" key={book.id}>
                <div className="story-book-card__mark" aria-hidden="true">✧</div>
                <div className="story-book-card__body">
                  <span className="story-book-card__label">{book.label}</span>
                  <h2>{book.title}</h2>
                  <p>{book.description}</p>
                  <small>{book.promise}</small>
                </div>
                <button className="story-button story-button--primary story-book-card__button" data-sfx="page" onClick={() => selectStory(book.id)}>
                  이 책을 펼친다 <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
