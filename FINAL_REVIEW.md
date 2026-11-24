# 종점 없는 서고 — 9차 최종 검토 (배포 후보)

기준: `endless-archive-quality-08-brand.zip`. 게임 콘텐츠 및 전투 밸런스, 정식 제목, 아이콘은 유지.

## 수정 사항
- 단일 저장 파일 이관을 run store의 저장소 읽기 단계로 옮겨 첫 hydration 전에 실행한다. 슬롯 1의 기존 데이터를 덮어쓰지 않으며 쓰기 실패 시 기존 파일을 삭제하지 않는다.
- 무기 장착 선택창 상태를 기존 v14 저장에 포함한다. 해당 슬롯에 해당 무기가 없거나 이전 저장에 선택창 정보가 없으면 초기화한다. 저장 버전 및 키 변경 없음.
- 공유 시드 URL 및 수동 시드 입력으로 진행 중인 슬롯을 덮어쓸 때 확인을 거친다. 전체 기록 초기화에서는 기존 단일 저장 키도 제거한다.
- `npm test`로 중복 없이 전체 회귀 테스트를 실행할 수 있다.
- 시뮬레이터에 `CHOICE_POLICY=random`, `TARGET_NPC=kairu` 및 전체 엔딩 집계를 추가한다. 게임 로직 변경 없음.

## 실제 검증
- 전체 자동 테스트 185/185 (기존 180 + 신규 5). Node의 저장/React 테스트 대역을 사용하므로 실제 Zustand hydration 및 React 브라우저 검증을 대신하지 않는다.
- TS/TSX 소스 79개 transpile 문법 검사: 오류 0. 새 저장 호환 모듈의 strict 타입 검사 통과. 전체 타입 검사 아님.
- Chromium 대표 HTML 및 실제 CSS: 6가지 화면 크기 × 5개 화면 30/30, 연출 및 reduced-motion 4/4. 실제 React 앱 실행 아님.
- 최신 기준 public 및 src/assets 파일 154개 원본 바이트 일치. 새 PWA 아이콘 192, 512, maskable 512, touch 180 규격 확인.
- 오프라인 실제 상태/전투 함수 시뮬레이션: 600회 기본 균형 전략에서 556 클리어, 29 구원 결말, 15 사망. 완주 시 평균 사건 39.6개. 네 목적지별 동일 시드 반복으로 각각 종료 확인.
- 무작위 사건 선택 1,500회: 1,213 클리어(80.9%), 진엔딩 198, 일반 귀환 1,015, 구원 125, 사망 162. 카이루 집중 600회: 578 클리어, 카이루 연애 63회. 균형 연애 선호 600회: 라엘 연애 13, 세온 연애 4. 여러 전략을 합친 시뮬레이션에서 수집 대상 21종 모두 등장(여정 9, 인물 사건 9, 연애 3). 동일 시드 반복은 독립 표본으로 해석하지 않는다. 실제 사용자 통계 및 시간 측정이 아니다.

## 출시 전 남은 필수 확인
- `npm ci --offline`: ENOTCACHED(zustand 4.5.7). 온라인 설치도 제한 시간 내 완료되지 않았다.
- `npm run build`: vite/client 및 node 타입 정의를 찾지 못해 중단. 실제 전체 타입/번들 검사 미완료.
- `npm run lint`: oxlint 실행 파일 미설치로 중단. 린트 미완료.
- 실제 설치 환경에서 Node 22로 `npm ci`, `npm run build`, `npm run lint`, `npm test` 수행. 성공 후 `npm run preview`에서 확인하고 GitHub/Vercel로 배포한다.
- 실제 브라우저에서 기존 슬롯 1~3 로드 및 전환, 전투 도중 새로고침, 장착 팝업 복원, 엔딩 기록 및 회상, PWA 설치/오프라인/업데이트, Android Chrome 실기 플레이 시간(10~15분 목표) 확인.
- 로컬스토리지 기반 기록은 브라우저 사이트 데이터 삭제 시 소실될 수 있으므로 외부 백업 기능은 향후 개선 후보. 기존 기록을 가진 브라우저에서 사이트 데이터 삭제 금지.
- GitHub push 및 Vercel 배포는 수행하지 않음. 이 버전은 출시 후보이며 프로덕션 검증 완료를 의미하지 않는다.

## 시뮬레이션 재현 (PowerShell이 아닌 bash 기준)
```sh
SIM_OFFLINE=1 EXPLORE_ROTATE=1 ROMANCE=1 DESTINATION=return node scripts/simulate.mjs 600 hybrid
SIM_OFFLINE=1 EXPLORE_ROTATE=1 CHOICE_POLICY=random DESTINATION=return node scripts/simulate.mjs 1500 hybrid
SIM_OFFLINE=1 EXPLORE_ROTATE=1 TARGET_NPC=kairu ROMANCE=1 DESTINATION=return node scripts/simulate.mjs 600 hybrid
```
