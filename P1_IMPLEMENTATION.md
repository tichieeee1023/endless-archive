# 《종점 없는 서고》 P1 — 엔딩 구조 분리 구현 기록

> 개발 기준: `main` 커밋 `6adbc7a719f5146fdbda7d958c8a58f92ec52f99` (2026-11-23)  
> 상태: **로컬 P1 구현 및 핵심 자동 테스트 통과**. GitHub 푸시·Vercel 배포 및 브라우저 플레이 검증 **미완료**.

## 목표와 결과

기존의 단일 `death / solo / 남주별 연애 엔딩 / true_end` 구조를 **여정 엔딩 + 인물 사건 BAD/NORMAL/HAPPY + 선택적 관계 보너스**로 분리했습니다. 공략 대상에게 연애 감정을 표현하지 않더라도 세 인물의 사건을 끝까지 진행할 수 있습니다.

| 구분 | 변경 후 |
|---|---|
| 여정 | `death`, `solo`, `true_end` 중 1개 |
| 라엘 사건 | `rael_route_bad / normal / happy` 중 1개 (완료했다면) |
| 세온 사건 | `seon_route_bad / normal / happy` 중 1개 |
| 카이루 사건 | `kairu_route_bad / normal / happy` 중 1개 |
| 관계 보너스 | `rael_romance`, `seon_romance`, `kairu_romance` (조건 충족 시 추가) |
| 도감 | 여정 / 사건 / 관계 보너스 구역 분리, 기존 레거시 엔딩 수집 기록 보존 |
| 저장 | 슬롯 저장 상태 버전 `6 → 7`, 기존 플래그와 엔딩 회상 기록 보존 |

### 인카운터 핵심 변경

- 1·2번째 메인 조우에서 만났다는 사실과 발견한 단서를 `story_<인물>_met`, `story_<인물>_clue`에 기록합니다. 거절하거나 판정에 실패해도 **그 장면을 보았다면** 후속 조우 조건을 충족할 수 있습니다. 관계 플래그(`bond_*`)는 일상·선택적 관계 이벤트 해금에 사용합니다.
- 각 3번째 사건에서 실패하거나 포기해도 그에 합당한 사건 결말이 있습니다. **BAD는 플레이어의 사망과 별개**입니다.
- 3번째 사건에 조건부 후속 장면이 이어지며, 결과가 직접 `route_*_{bad|normal|happy}`로 확정됩니다.
- 관계 보너스는 호감도 순위로 자동 결정하지 않습니다. 주요 사건에서 별도로 마음을 표현하는 선택을 해야 하고, 해당 인물과의 기존 관계 장면 플래그가 필요합니다. 이번 P1 초안의 관계 보너스는 사건 HAPPY에서만 추가됩니다. NORMAL에서의 추가 허용 여부는 차후 별도 결정 대상입니다.
- **카이루의 책 귀환 선택**은 귀환 사건 NORMAL로 직접 확정되며, 더 이상 책 밖 해방 장면으로 연결되지 않습니다.
- `true_end`는 기존 연애 엔딩 3종 수집 조건 대신 인물 사건 HAPPY 3종 수집으로 해금됩니다. 서로 다른 회차의 기록을 합산할 수 있습니다.
- 한 회차에서 여러 인물의 사건이 끝나면 **각 인물 결과를 모두** 표시하고 도감에 수집합니다.

### 데이터 보존

기존 `endless-archive-run_slot1~3`, `endless-archive-meta`, `endless-archive-slot-meta` 저장 키는 그대로입니다. v6 → v7 이행에서 기존 `flags`, `seenEncounters`, `endingRecorded`, `endingResult`를 보존하고, 완료한 이전 인물 사건을 추측해 새 등급으로 승격하지 않습니다. `rael_end`, `seon_end`, `kairu_end` 등 과거 기록은 별도 ‘이전 버전의 수집 기록’에 표시합니다(기존 수집 기록이 있을 때만).

**유의:** 이미 진행 중인 회차의 플래그는 보존되지만, 업데이트 시 신규 사건 조건이 활성화되므로 이전과 동일한 다음 사건이 반드시 나타나지는 않습니다. 신규 엔딩 도감과 회상은 기존 기록과 별개입니다.

## 수정된 파일

- `src/lib/ending.ts` — 독립 3축 결과 계산
- `src/data/endings.ts` — 신규 도감과 레거시 목록
- `src/data/encounters.ts` — 사건 플래그 기반 체인, 최종 선택 분기
- `src/lib/encounterChoice.ts` / `src/types/encounter.ts` — 복수 조건부 선택 가능 판정
- `src/lib/storyProgress.ts` / `src/store/useRun.ts` — 무연애 진행 플래그, 저장 v7 마이그레이션
- `src/components/EndingScreen.tsx`, `ArchiveModal.tsx`, `EventModal.tsx`, `src/index.css` — 분리된 결과 UI
- `scripts/test-p1.cjs`, `package.json` — P1 회귀 테스트 추가

## 검증 결과

- **20개 자동 테스트 통과** (`npm run test:p1`과 동일 스크립트, 로컬 환경의 전역 TypeScript 경로 지정하여 실행)
- 핵심 도메인 TypeScript 파일 **엄격 타입 검사 통과** (`tsc --noEmit --strict ...`)
- `src/`의 TS/TSX **41개 파일 구문 파싱 오류 0개**
- `git diff --check` 통과
- 실제 스토어 함수 호출로 첫 조우 거절 → 단서 누적, 비연애 HAPPY, 조건부 연애 보너스, 카이루 귀환, 저장 v6→v7 이행 검사

### 아직 확인하지 못한 것

- `npm ci`, `npm run build`, `npm run lint`, `npm run sim`: P0에서 npm 레지스트리 DNS 접속 실패로 필요한 의존성을 설치하지 못했습니다. P1 변경 후에도 **전체 빌드·린트·시뮬레이션을 통과했다고 주장할 수 없습니다**.
- 실제 브라우저에서 전체 여정을 진행하고 화면을 보는 수동 테스트를 수행하지 않았습니다.
- 원격 GitHub 백업 브랜치 생성에서 기존 연결이 **403**으로 거부되었습니다. 이 작업 역시 **원격에 푸시하지 않았고, 현재 Vercel 배포에도 반영되지 않았습니다**.

## 배포 전 확인 순서

```bash
npm ci
npm run test:p1
npm run build
npm run lint
npm run sim
```

추가로 **새 회차 1개, 기존 v6 슬롯 1개, BAD/NORMAL/HAPPY/관계 보너스 각 사례**를 브라우저에서 확인해야 합니다. P2에서 각 인물의 사건 문장·단서·선택 결과를 다듬되, P1의 세 축 분리 구조는 유지합니다.
