# 반성회 기록 - 2026-01-26 (Assignment Engine 세션)

## 세션 요약
FOOTBALL BANK v2 완성 및 Assignment Auto-Generation Engine v1 구축

## 발생한 문제들

### 문제 1: 컨텍스트 소진으로 인한 세션 단절
- **증상**: 대화 중 컨텍스트 한계 도달로 `/compact` 필요
- **영향**: 작업 흐름 중단, 이전 맥락 일부 손실
- **근본 원인 분석 (5 Whys)**:
  1. 왜 컨텍스트가 소진되었는가? → 대량의 JSON/TypeScript 코드를 주고받음
  2. 왜 대량의 코드를 주고받았는가? → 사용자가 전체 스펙을 한 번에 제공
  3. 왜 전체 스펙을 한 번에 제공했는가? → FOOTBALL BANK의 완전성 보장 필요
  4. 왜 완전성이 필요했는가? → Rulebook과 Engine이 상호 참조
  5. **근본 원인**: 대규모 데이터 구조는 파일로 먼저 저장 후 참조하는 것이 효율적
- **재발 방지책**: 대량 데이터는 즉시 파일로 저장 후 Read 도구로 참조
- **상태**: [x] 완료 (이미 파일로 저장됨)

### 문제 2: Lemon Squeezy 플랜 파일이 아직 미완료 상태로 남아있음
- **증상**: `.claude/plans/cozy-humming-cookie.md`에 Lemon Squeezy 결제 플랜 존재
- **영향**: 플랜과 실제 구현 상태 불일치 혼란 가능
- **근본 원인 분석**:
  1. 왜 플랜 파일이 남아있는가? → 이전 세션에서 생성 후 정리 안됨
  2. 왜 정리되지 않았는가? → 구현 완료 후 플랜 파일 삭제 프로세스 없음
  3. **근본 원인**: 플랜 완료/취소 시 파일 정리 절차 미정립
- **재발 방지책**: 플랜 완료/취소 시 해당 플랜 파일 삭제 또는 완료 표시
- **상태**: [ ] 대기 (사용자 확인 필요 - Lemon Squeezy 구현 상태)

### 문제 3: 커밋되지 않은 반성회 파일들
- **증상**: `.claude/retrospectives/` 내 4개 파일이 untracked 상태
- **영향**: 반성회 기록이 저장소에 반영되지 않음
- **근본 원인**: 반성회 작성 후 커밋을 자동으로 하지 않음
- **재발 방지책**: 반성회 완료 시 관련 파일 커밋 여부 사용자에게 확인
- **상태**: [ ] 대기 (이번 반성회 완료 후 일괄 커밋 제안)

## 이번 세션에서 잘된 점

1. **체계적인 데이터 구조 설계**: Formation, Concept, Rulebook, Engine이 일관된 스키마로 설계됨
2. **TypeScript 타입 완전성**: 모든 인터페이스가 명확하게 정의됨
3. **Validation 로직 포함**: Engine에 충돌 검사 로직 내장
4. **문서화 병행**: JSON과 TypeScript 양 형태로 제공

## 도출된 규칙

1. **대량 데이터 즉시 파일화**: 10줄 이상의 코드/데이터는 즉시 파일로 저장
2. **플랜 파일 수명 관리**: 완료/취소된 플랜은 명시적으로 처리
3. **반성회 후 커밋 확인**: 반성회 파일 생성 후 커밋 여부 확인

## 적용된 조치

- [x] `docs/audits/assignment-engine.ts` 생성 및 커밋
- [x] `docs/audits/assignment-engine.json` 생성 및 커밋
- [x] `docs/audits/assignment-rulebook.json` 생성 및 커밋
- [x] `docs/audits/all-concepts.json` 생성 및 커밋
- [x] `docs/audits/formations.json` 생성 및 커밋
- [ ] 미커밋 반성회 파일 정리 (사용자 확인 후)

## 관련 파일
- `docs/audits/assignment-engine.ts`
- `docs/audits/assignment-engine.json`
- `docs/audits/assignment-rulebook.json`
- `docs/audits/all-concepts.json`
- `docs/audits/formations.json`

## 다음 액션 아이템

- [ ] Lemon Squeezy 구현 상태 확인 (플랜 파일 처리)
- [ ] 미커밋 반성회 파일들 일괄 커밋
- [ ] Assignment Engine을 실제 에디터에 통합 (향후)