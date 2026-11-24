import type { NpcId } from "../types/npc";

export type EndingKind = "journey" | "route" | "bonus" | "legacy";
export interface EndingEntry {
  id: string;
  title: string;
  npcId: NpcId | null;
  kind: EndingKind;
  hint: string;
  summary: string;
}

export const ENDING_CATALOG: EndingEntry[] = [
  { id: "death", kind: "journey", title: "찢어진 페이지", npcId: null, hint: "…어딘가에서, 이야기가 끝났다.", summary: "당신의 여정은 여기서 끝났다. 열차는 다시 기다린다." },
  { id: "solo", kind: "journey", title: "서고의 주인", npcId: null, hint: "마지막 장에서 열차의 서고로 돌아가기로 한다.", summary: "끝나지 않은 책들을 돌보며 다음 이야기를 준비한다." },
  { id: "true_end", kind: "journey", title: "쓰이지 않은 첫 문장", npcId: null, hint: "이름 없는 역에서 승객과의 약속, 역의 이름, 떠났던 이유를 연결해 돌아간다.", summary: "사라진 역과 두 사람의 약속이 온전한 결말을 맞는다." },
  { id: "journey_return", kind: "journey", title: "다시 돌아갈 역", npcId: null, hint: "마지막 장에서 돌아갈 길을 고른다.", summary: "미뤄 둔 말을 건네기 위해 열차에서 내린다." },
  { id: "journey_stay", kind: "journey", title: "이야기를 잇는 사람", npcId: null, hint: "마지막 장에서 새벽역에 남아 불을 켜 둔다.", summary: "다음 승객이 길을 고를 때까지 곁을 지킨다." },
  { id: "journey_depart", kind: "journey", title: "아직 없는 목적지", npcId: null, hint: "마지막 장에서 차표의 빈칸에 새 목적지를 쓴다.", summary: "지도에 없는 길을 향해 스스로 첫발을 내딛는다." },
  { id: "rael_defeat", kind: "journey", title: "비상 정차", npcId: "rael", hint: "라엘과 가까워진 채 마지막 장에서 쓰러진다.", summary: "차장이 열차를 세워 당신을 구한다." },
  { id: "seon_defeat", kind: "journey", title: "부러진 검 곁에서", npcId: "seon", hint: "세온과 가까워진 채 마지막 장에서 쓰러진다.", summary: "기사가 마지막 순간에 길을 막아선다." },
  { id: "kairu_defeat", kind: "journey", title: "여백에 적힌 이름", npcId: "kairu", hint: "카이루와 가까워진 채 마지막 장에서 쓰러진다.", summary: "그가 당신의 이름을 여백에 적는다." },
  { id: "rael_route_bad", kind: "route", npcId: "rael", title: "반복되는 시간", hint: "기관실 문을 등진 대가.", summary: "라엘은 다시 운행에 묶인다." },
  { id: "rael_route_normal", kind: "route", npcId: "rael", title: "잠깐의 정차", hint: "명령을 따르는 것 말고도 길이 있다.", summary: "완전한 해방은 아니지만 라엘은 선택을 배웠다." },
  { id: "rael_route_happy", kind: "route", npcId: "rael", title: "멈출 수 있는 사람", hint: "운행 규정의 예외 조항과 장부의 진실을 함께 확인한다.", summary: "라엘은 스스로 목적지를 정한다." },
  { id: "rael_romance", kind: "bonus", npcId: "rael", title: "옆자리의 약속", hint: "자유를 되찾은 차장이 특별한 약속을 한다.", summary: "함께 가고 싶다는 마음을 나눈다." },
  { id: "seon_route_bad", kind: "route", npcId: "seon", title: "돌아오지 못한 기사", hint: "과거의 문이 닫힌다.", summary: "세온은 아르겐의 기억에 붙잡힌다." },
  { id: "seon_route_normal", kind: "route", npcId: "seon", title: "마지막 인사", hint: "검을 내려놓는 선택.", summary: "세온은 잃어버린 세계에 작별을 고한다." },
  { id: "seon_route_happy", kind: "route", npcId: "seon", title: "다시 걷는 길", hint: "폐허의 구조 신호를 따라 아르겐에 돌아간다.", summary: "세온은 앞으로 나아갈 길을 찾았다." },
  { id: "seon_romance", kind: "bonus", npcId: "seon", title: "귀향의 동행", hint: "아르겐의 진실과 서로의 마음을 마주한다.", summary: "그가 당신과 다음 이야기를 약속한다." },
  { id: "kairu_route_bad", kind: "route", npcId: "kairu", title: "닫힌 여백", hint: "이름을 지워 버리는 선택.", summary: "그의 목소리가 사라졌다." },
  { id: "kairu_route_normal", kind: "route", npcId: "kairu", title: "책갈피 하나", hint: "그는 책으로 돌아가지만 이야기는 남는다.", summary: "책에는 카이루의 이름이 남아 있다." },
  { id: "kairu_route_happy", kind: "route", npcId: "kairu", title: "스스로 쓰는 결말", hint: "금서의 빈칸을 찾아 스스로 이름을 쓰게 한다.", summary: "카이루는 제 다음 문장을 선택한다." },
  { id: "kairu_romance", kind: "bonus", npcId: "kairu", title: "둘이 쓰는 여백", hint: "그의 자유와 당신의 대답을 함께 존중한다.", summary: "둘만의 페이지가 열렸다." },
  // These IDs remain readable in the Archive for people who earned them before P1.
  { id: "rael_end", kind: "legacy", npcId: "rael", title: "정거장 없는 두 사람", hint: "이전 버전의 기록", summary: "끝나지 않는 여행은 이제 두 사람의 것이다." },
  { id: "seon_end", kind: "legacy", npcId: "seon", title: "귀향", hint: "이전 버전의 기록", summary: "세온은 돌아갈 곳을 찾았다." },
  { id: "kairu_end", kind: "legacy", npcId: "kairu", title: "쓰이지 않은 결말", hint: "이전 버전의 기록", summary: "결말은 아직 쓰이지 않았다." },
];
