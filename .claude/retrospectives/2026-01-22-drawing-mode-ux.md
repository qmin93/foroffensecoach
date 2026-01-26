# 반성회 기록 - 2026-01-22 그리기 도구 UX

## 발생한 문제

### 문제: 그리기 완료 후 Select 모드로 돌아오지 않음
- **증상**: Line 섹션에서 Straight/Curved 선택 → 라인 그리기 완료 → 여전히 Draw 모드 유지
- **영향**: 사용자가 다른 요소를 선택하거나 수정하려면 수동으로 모드 전환 필요
- **사용자 피드백**: "마우스로 자유롭게 Select 할 수 있게 더블클릭으로 다 그리고 나면 다시 마우스의 원래 상태인 Select로 돌아오게 해줘"

## 5 Whys 분석

1. **왜 Select 모드로 돌아오지 않았는가?**
   → `confirmDrawing`, `confirmAngularDrawing`, `finishZoneDrag` 함수에서 `state.mode`를 'select'로 변경하지 않음

2. **왜 mode를 리셋하지 않았는가?**
   → 초기 설계가 "연속 그리기"를 위해 draw 모드를 유지하도록 되어 있음

3. **왜 연속 그리기 설계였는가?**
   → 개발자 관점에서 여러 라인을 연속으로 그릴 수 있으면 편리할 것이라 가정

4. **왜 이것이 문제가 되었는가?**
   → 실제 사용자 워크플로우는 "하나 그리기 → 확인/수정 → 다음 작업"이 더 자연스러움

5. **왜 사용자 워크플로우를 고려하지 않았는가?**
   → UX 테스트 없이 개발자 추측 기반으로 구현

## 근본 원인

**그리기 완료 후 기본 동작이 Select 모드 복귀여야 함** - 대부분의 드로잉 앱(Figma, Sketch 등)에서 도형 하나 그리면 Selection Tool로 돌아옴

## 재발 방지 대책

| 문제 | 근본 원인 | 재발 방지 대책 | 상태 |
|------|-----------|----------------|------|
| Draw 모드 유지 | 연속 그리기 가정 | 그리기 완료 함수에서 mode='select' 리셋 | 완료 |

## 수정된 코드

### editorStore.ts 수정 내역

1. **confirmDrawing** (Straight/Curved 라인)
```typescript
set((state) => {
  // ... 기존 리셋 로직
  state.mode = 'select'; // 추가됨
});
```

2. **confirmAngularDrawing** (Angular 라인, 더블클릭 완료)
```typescript
set((state) => {
  // ... 기존 리셋 로직
  state.mode = 'select'; // 추가됨
});
```

3. **finishZoneDrag** (Zone 배치)
```typescript
set((state) => {
  // ... 기존 로직
  state.mode = 'select'; // 추가됨
  state.placementPhase = 'idle'; // 추가됨
});
```

## 도출된 규칙

1. **그리기 도구 UX 원칙**: 도형/라인 하나 그리면 Select 모드로 복귀 (Figma, Sketch 등 표준 패턴)
2. **연속 작업이 필요하면**: Shift 키 등 수정자 키로 "연속 모드" 옵션 제공 (향후 개선)

## 조치 상태

- [x] confirmDrawing에 mode='select' 추가
- [x] confirmAngularDrawing에 mode='select' 추가
- [x] finishZoneDrag에 mode='select' + placementPhase='idle' 추가
- [x] 빌드 테스트 통과
- [x] 배포 완료 (커밋 775af53)