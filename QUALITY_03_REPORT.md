# Quality 03 — 진행 중인 이야기 수첩

기준: `endless-archive-quality-02.zip`. 기존 여정·엔딩·전투 및 사건 데이터 변경 없음.

## 기능
- 일반 진행 화면 체력/집중력 옆 수첩 버튼, 막 전환 및 마지막 목적지 선택 화면에도 접근점 추가.
- 메인 단서: 실제 획득한 주요 플래그의 짧은 기록과 이미 읽은 장면의 선택/결과. 책 시작 및 막 전환 선택도 표시.
- 인물 사건: 만난 인물의 관계/호감도와 읽은 장면, 핵심 사건 완료 여부. 연애는 명시적인 약속만 표시.
- 승객 이야기: 장기 서브스토리 4편, 공통 연속 이야기 6편, 독립 사건을 방문 기록에 따라 묶음. 현재 지도에 재회 선택지가 있는지, 이어질 수 있는지, 마쳤는지 구별. 마지막 목적지 선택 시 미완결로 표시.
- 방문 전의 사건 제목/대사, 미획득 단서, 엔딩 조건식은 표시하지 않음. 과거 저장의 상세 로그가 없으면 없는 상태 그대로 표시.
- 실제 선택 결과는 기존 `【사건명】` 로그에서 가져옴. 선택 전인 현재 사건은 읽는 중으로 표시. 별도 상태 저장 없이 현재 슬롯을 읽기만 하며 새 여정/슬롯에 자동 반영.
- 네이티브 dialog로 포커스와 Escape 처리, 배경 클릭 닫기, 모바일 스크롤 및 접기/펼치기. 자동 전투 중에는 수첩 버튼 비활성화(전투의 의도치 않은 계속 진행 방지).

## 검증
- `NODE_PATH=$(npm root -g) node scripts/test-notebook.cjs`: 134 통과(기존 124 + 신규 10).
- `NODE_PATH=$(npm root -g) node scripts/test-art-integration.cjs`: 11 통과. 총 145 테스트 통과.
- `tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler src/lib/notebook.ts`: 통과.
- 전체 TS/TSX 75개 transpile 문법 검사 통과.
- `npm ci --offline --ignore-scripts --no-audit --no-fund`: ENOTCACHED(zustand 4.5.7). 전체 빌드/린트/React 브라우저 및 모바일 실기 검증은 미수행.
- 저장 형식 및 메타 기록을 수정하지 않음. 기존 public 에셋 변경 없음.

## 변경 파일
`src/lib/notebook.ts`, `src/components/JourneyNotebook.tsx`, `src/components/StatusBar.tsx`, `src/components/InterludeScreen.tsx`, `src/components/FinalChoiceScreen.tsx`, `src/index.css`, `scripts/test-notebook.cjs`, `package.json`, 본 보고서.
