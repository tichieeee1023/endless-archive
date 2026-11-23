# 종점 없는 서고 — P2 시나리오 보강 보고서

- 작업일: 2026-11-23
- 기준: P1 로컬 커밋 `6eaf605`
- 작업 범위: 짧은 사건 분기 보강, 실패 후속 처리, 기존 관계 특별 이벤트 보존
- 배포 상태: 로컬 작업물만 생성. GitHub/Vercel 변경 없음

## 설계 원칙

일반 사건 및 랜덤 조우는 2~4문장 안팎으로 짧게 유지한다. **연애 감정이 드러나는 특별 이벤트는 이 길이 제한의 대상이 아니다.** 사건 결과 BAD/NORMAL/HAPPY는 연애와 독립이며, 연애는 특정 관계 선택으로 얻는 추가 보너스다.

## 주요 구현 사항

### 인물별 신규 단서 사건 (각 1개)

| 인물 | 추가 이벤트 | 플래그 | 역할 |
|---|---|---|---|
| 라엘 | `rael_registry` — 찢긴 운행 규정 | `story_rael_exception` | 본인 동의 없는 갱신이 무효라는 예외 조항. 자유를 선택할 수 있는 HAPPY 선택지를 해금 |
| 세온 | `seon_signal` — 폐허의 신호 | `story_seon_signal` | 아르겐 생존자의 구조 신호를 기록. HAPPY 선택지를 해금 |
| 카이루 | `kairu_colophon` — 금서의 판권 | `story_kairu_authorship` | 스스로 이름을 적어야 소유되지 않는다는 실마리. HAPPY 선택지를 해금 |

### 결말 및 실패 판정

- 인물별 본편 사건은 일반 조우 → 후속 조우 → 핵심 선택으로 연결한다.
- 사건 핵심 판정이 실패해도 루트가 사라지는 대신 NORMAL이 기록되는 경로를 추가했다.
- 강압적인 선택은 사건 BAD로 이어질 수 있으며, 플레이어의 여정 전체가 자동 종료되지는 않는다.
- 단서를 놓쳐도 NORMAL 또는 BAD 결말로 사건을 마무리할 수 있다.
- 사건 HAPPY는 관계 호감도와 무관하게 도달 가능하다.
- 연애 보너스는 사건 HAPPY에 더해 별도의 관계 플래그와 명시적 선택이 있어야 붙는다.

### 특별 이벤트 원문 보존 (중요)

중간 작업에서 줄였던 아래 여섯 관계 이벤트는 **P1 원문 전체를 그대로 복구**했다. 등장 문장, 세 선택지, 각 선택의 결과 문장과 플래그를 모두 보존했다.

1. 라엘 — `rael_tea` / 「식어 가는 찻잔」
2. 라엘 — `rael_watch` / 「멈춘 초침」
3. 세온 — `seon_bandage` / 「기사의 손」
4. 세온 — `seon_home` / 「돌아갈 곳의 모양」
5. 카이루 — `kairu_name` / 「이름 없는 책갈피」
6. 카이루 — `kairu_promise` / 「읽히지 않을 약속」

복원 결과 `src/data/memories.ts`의 SHA-256은 P1과 동일하다:
`3e9463574c914dc2d869b5d945e4c5a99e5fec7812fef2d5cc7`

최종 관계 선택의 결과 문장도 사건의 조건과 양립하도록 유지·보강했다.

## 검증

- `npm run test:p2`: **43개 통과, 실패 0** (P1 회귀 테스트 포함)
- 인물별 비연애 HAPPY, 실패 시 NORMAL, 비연애 BAD, 관계 보너스 추가를 실제 Zustand 스토어 기반 테스트로 확인.
- 여섯 관계 특별 이벤트의 등장과 대화·결과 텍스트 보존을 회귀 테스트에 추가.
- `tsc --noEmit --target es2022 --module esnext --moduleResolution bundler --skipLibCheck --strict src/data/encounters.ts src/data/endings.ts`: 통과.
- `git diff --check`: 통과.
- **전체 `npm run build` 및 브라우저 플레이는 미검증.** 환경에 `node_modules`가 없어서 `vite/client`, `node` 타입 정의를 찾지 못함. 이는 전체 빌드 통과를 주장하는 근거가 되지 않는다.

## 수정한 파일

- `src/data/encounters.ts`: 짧은 사건 보강, 신규 단서, 세 인물의 결말 선택·후속 처리
- `src/data/endings.ts`: 새 HAPPY 조건에 맞춘 도감 힌트
- `scripts/test-p1.cjs`: 기존 회귀 테스트를 P2 사건 조건에 맞게 갱신
- `scripts/test-p2.cjs`: P2 시나리오/선택/실패/관계 보너스 검증
- `package.json`: `test:p2` 명령 추가
- **`src/data/memories.ts`는 P1 원문 그대로이며 변경 없음.**

## 보류 사항

- 독립 공통 사건 추가, 조우 출현 확률 및 전투 비중 조정은 P3에서 다룬다.
- GitHub 원격 `main` 및 Vercel에는 이번 변경을 적용하지 않았다.
- 실제 기기에서 연쇄 조우 확률과 화면 높이, 저장 호환성은 추후 배포 전 검수 필요.
