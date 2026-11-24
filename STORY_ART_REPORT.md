# 종점 없는 서고 — 승객·메인스토리 삽화 확장

기준: endless-archive-passenger-stories.zip. 입력: endless-archive-story-art-16(1).zip.

- 신규 WebP 16장, 각각 768×384. 원본 바이트 그대로 public/art/events에 추가.
- 장기 서브스토리 4편의 12개 장면, 독립 단편 8개 장면, 메인스토리 9개 장면에 전용 삽화 연결. 새벽역 삽화는 true_end, journey_return, journey_stay에서도 사용.
- 도감: 사건·배경 56, 인물 CG 24, 아이템·소품 12, 합계 92. 기존 발견 기록 보존 및 이전 엔딩 삽화 접근 유지. 새 삽화는 연결 사건을 발견하거나 대응 엔딩을 수집하면 해금되는 기존 규칙을 이용.
- 기존 사건/대사/전투/엔딩 판정/저장 스키마는 변경하지 않음. docs/art-integration의 매핑 JSON을 갱신.

## 검증
- node scripts/test-side-stories.cjs: 107/107 통과 (기존 회귀 포함).
- node scripts/test-art-integration.cjs: 11/11 통과 (신규 2개 포함).
- artLibrary.ts TypeScript strict noEmit 통과.
- 전체 빌드 및 린트/브라우저 미검증: npm ci --offline이 zustand 패키지 ENOTCACHED로 실패.
- GitHub/Vercel 미반영.
