export interface StoryBook {
  id: string;
  label: string;
  title: string;
  description: string;
  promise: string;
}

/** 새 이야기는 이 목록에 추가해 책 선택 화면에서 고를 수 있습니다. */
export const STORY_BOOKS: StoryBook[] = [
  {
    id: "unnamed_station",
    label: "첫 번째 이야기 · 종점 없는 서고",
    title: "이름 없는 역",
    description: "목적지가 지워진 차표와 창밖에만 나타나는 역. 책 속에 남겨진 사람들의 선택을 따라가다 보면, 당신이 열차에 오른 이유도 조금씩 선명해진다.",
    promise: "총 3챕터 · 36페이지로 진행되는 이야기 · 선택에 따라 달라지는 결말",
  },
];
