# 종점 없는 서고 — P4 + 전체 일러스트 통합

작업 기준: 사용자가 제공한 `endless-archive-P4(1).zip` (2026-11-23)

## 실제 적용

- P4 게임 전체 소스에 **WebP 에셋 64개** 복사 (`public/art/`): 사건·배경 40, 인물 이벤트/엔딩 CG 12, 아이템·소품 12.
- 모바일 사건 모달: 제목 아래 16:8 삽화. 최종 사건 선택을 완료하면 HAPPY 및 연애 추가 후일담 CG로 전환.
- 여정 종료 화면: 여정 결과, 인물 BAD/NORMAL/HAPPY, 연애 추가 후일담에 대응하는 서로 다른 그림.
- 엔딩 도감의 회상 창: 해당 엔딩의 그림 표시.
- 서고 기록 화면: **삽화 보관함** 추가, 사건·인물·아이템 탭으로 64점 열람. 아직 얻지 못한 HAPPY/연애 보너스 CG는 잠김.
- 떠돌이 서적상: 기존 4개 상품 아이콘 표시. 나머지 소품 그림 8개는 삽화 보관함에 보관.
- 사건 중간에 관계 보너스 엔딩 CG가 미리 노출되지 않도록 라엘의 찻잔/카이루의 약속 장면은 일반 사건 삽화를 사용.
- 기존 P4 초상화 3장과 프로젝트의 기존 이미지·음원 파일 전부 보존.

## 구현 파일

- 신규: `src/data/artLibrary.ts` (이미지 ID와 사건/엔딩/상품 연결)
- 신규: `src/components/ArtFrame.tsx`, `src/components/ArtGallery.tsx`
- 수정: `src/components/{EventModal,EndingScreen,EndingRecallModal,ArchiveModal,ShopPanel}.tsx`, `src/index.css`, `package.json`
- 신규: `scripts/test-art-integration.cjs`, `docs/art-integration/{event-mapping,ending-mapping}.json`
- 신규: `public/art/{events,characters,items}` WebP 이미지 64개

## P4 보존 검증

원본 P4 ZIP과 비교해 다음 파일이 **바이트 단위 동일**합니다.

- `src/data/encounters.ts`
- `src/data/memories.ts`
- `src/data/independentEncounters.ts`
- `src/data/endings.ts`
- `src/store/useRun.ts`
- `src/store/useMeta.ts`
- `src/lib/ending.ts`

스토리/판정/연애 플래그/엔딩 판정/저장 스키마를 변경하지 않았습니다. `memories.ts` 원문 SHA-256:
`3e9463574c914dc2d869b5d945e4c5a99e5fec7812fef2d5cc7b208c51d923f0`

## 검사 결과

- P1~P4 회귀 테스트: **62개 통과** (`npm run test:p4`).
- 아트 연결 테스트: **6개 통과** (`npm run test:art`).
- WebP 64개 모두 파일 판독 및 규격 검사 통과 (사건/CG 768×384, 아이템 256×256).
- 사건 33개, 현행/레거시 엔딩 18개, 상점 4종의 ID 연결 검증 통과.
- `artLibrary.ts` 독립 TypeScript strict 타입 검사 통과.
- 변경한 TSX 컴포넌트의 TypeScript 변환/구문 검사 통과.
- **Vite 전체 빌드와 실제 모바일 브라우저 동작은 아직 미검증:** 의존성 다운로드 제한으로 `npm ci --offline`이 `ENOTCACHED` 오류로 실패했습니다. 기능 확인을 위해 개발 PC 또는 배포 환경에서 `npm ci && npm run build && npm run lint`를 별도 실행해야 합니다.

## 적용/실행

이 ZIP은 **P4와 일러스트가 이미 합쳐진 완성 소스**입니다. 추가 패치 적용이 필요하지 않습니다.

```bash
npm ci
npm run test:p4
npm run test:art
npm run build
npm run dev
```

GitHub와 Vercel에는 자동 푸시·배포하지 않았습니다.
