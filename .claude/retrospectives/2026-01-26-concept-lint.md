# 반성회 기록 - 2026-01-26

## 세션 요약
Formation audit 시스템 통합 및 concept-lint 스크립트 구축

## 발생한 문제들

### 문제 1: Import 경로 불일치
- **증상**: audit 파일들이 존재하지 않는 타입 경로를 import
- **근본 원인**: audit 파일 목적(참고 문서 vs 실행 코드)이 명확하지 않았음
- **해결**: `docs/audits/types.ts` 생성하여 공용 타입 정의
- **상태**: 완료

### 문제 2: Formation에 OL 라벨 누락
- **증상**: lint에서 모든 포메이션에 OL 라벨 누락 경고
- **근본 원인**: 스킬 포지션만 정의하고 OL은 생략
- **해결**: OL 라벨을 모든 포메이션에 추가
- **상태**: 완료

### 문제 3: Go route depth 경고 (false positive)
- **증상**: 3-step 컨셉에서 Go route(18yd)가 "너무 깊다" 경고
- **근본 원인**: Go route의 "clear-out" 역할을 코드에 반영하지 않음
- **해결**: Go route를 depth 검증에서 예외 처리
- **상태**: 완료

## 도출된 규칙

1. **audit 파일 = 실행 가능한 코드**: types.ts 필수
2. **Formation 완전성**: OL 라벨(LT, LG, C, RG, RT) 항상 포함
3. **도메인 예외 문서화**: 축구 전술 예외는 주석으로 설명

## 적용된 조치

- [x] `docs/audits/types.ts` 생성
- [x] formation-presets.audit.ts에 OL 라벨 추가
- [x] concept-lint.ts에 Go route 예외 처리
- [x] `npm run lint:concepts` 스크립트 추가
- [x] CLAUDE.md에 규칙 추가

## 관련 파일
- `docs/audits/types.ts`
- `docs/audits/formation-presets.audit.ts`
- `editor/scripts/concept-lint.ts`
- `editor/package.json`