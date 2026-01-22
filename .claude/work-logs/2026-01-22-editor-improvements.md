# 작업일지 - 2026-01-22

## 작업 개요
ForOffenseCoach 에디터 개선 10가지 배치 구현

## 작업 내역

### 완료된 작업

| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| 1 | VIEW 버튼 → 작전 이름 입력 | TopBar.tsx | ✅ |
| 2 | 팝업 드래그 가능 | PropertiesPanel.tsx | ✅ |
| 3 | Zone 블락 곡선 / Gap 블락 직선 | ActionLayer.tsx | ✅ |
| 4 | 선택된 Play 자동 스크롤 | PlaysPanel.tsx | ✅ |
| 5 | 라우트 트리 오버레이 (호버+클릭) | RouteTreeOverlay.tsx (신규), ActionLayer.tsx | ✅ |
| 6 | 모션 점선 / sweep 곡선 | dsl.ts, concept-builder.ts | ✅ |
| 7 | 슬랏 리시버 0.5야드 뒤로 | editorStore.ts | ✅ |
| 8 | QB 언더센터 y: -0.08 | editorStore.ts | ✅ |
| 9 | 팀 프로필 기반 추천 | conceptStore.ts | ✅ |
| 10 | Undo/Redo 버튼 수정 | TopBar.tsx | ✅ |

### 수정 이력
- QB 위치: -0.09 → -0.05 → **-0.08** (사용자 피드백 반영)
- Zone 마커: arrow → **t_block** (사용자 피드백 반영)
- 라우트 트리: 호버 프리뷰 → **클릭으로 라우트 생성** 추가

### 신규 파일
- `editor/src/components/editor/RouteTreeOverlay.tsx` - 라우트 트리 오버레이 컴포넌트

### 변경된 파일 (10개)
```
editor/src/components/editor/ActionLayer.tsx
editor/src/components/editor/PlaysPanel.tsx
editor/src/components/editor/PropertiesPanel.tsx
editor/src/components/editor/TopBar.tsx
editor/src/lib/concept-builder.ts
editor/src/store/conceptStore.ts
editor/src/store/editorStore.ts
editor/src/types/dsl.ts
CLAUDE.md
```

## 배포 정보

- **커밋**: `27e4f12` - feat: Editor improvements batch - 10 enhancements
- **배포 방식**: Git push → Vercel 자동 배포
- **배포 시간**: 2026-01-22

## 기술적 세부사항

### 1. 라우트 트리 구현
- 8개 표준 라우트: Go, Post, Corner, Out, In, Curl, Slant, Flat
- 필드 좌/우에 따라 라우트 방향 자동 조정
- 리시버 역할만 표시 (WR, TE, RB, FB, H, X, Y, Z, SLOT, SE, FL)
- 클릭 시 `addRouteFromTree()` 호출하여 실제 라우트 생성

### 2. 팀 프로필 추천 점수
```typescript
// Run/Pass Balance
run_heavy → run +15, pass -10
pass_heavy → pass +15, run -10

// Unit Strength
wrSeparation >= 4 + manBeater → +10
qbArm >= 4 + deep → +15
qbMobility >= 4 + RPO/scramble → +10
olPassPro >= 4 + deep/intermediate → +10
olRunBlock >= 4 + gap/power → +15
rbVision >= 4 + zone → +15
rbPower >= 4 + gap/power → +10
teBlock >= 4 + needsTE → +10

// Risk Tolerance
aggressive + deep → +10
conservative + quick → +10
conservative + deep → -15
```

### 3. 언더센터 포메이션 QB 위치
- 모든 언더센터 포메이션: y: -0.08 (2야드 뒤)
- 적용: iFormation, singleBack, proSet, wingT, powerI, wishbone 등 31개

## 반성회 요약

### 문제점
1. QB 위치 세 번 수정 - 시각적 요소 값 미확인
2. Zone 마커 오류 - 불명확 요구사항 추측
3. 라우트 트리 클릭 누락 - UI 상호작용 미고려
4. 포트 충돌 안내 누락 - 서버 상태 미공유

### 도출된 규칙 (CLAUDE.md 추가)
- 시각적 요소 변경 시 구체적 값 확인
- 불명확 요구사항은 추측 말고 확인
- UI 요소의 상호작용 범위 명확히
- dev 서버 포트 변경 시 안내

## 다음 작업

- [ ] Vercel 배포 성공 확인
- [ ] 프로덕션 환경 테스트
