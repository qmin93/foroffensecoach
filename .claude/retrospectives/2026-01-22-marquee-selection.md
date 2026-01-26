# 반성회: 마퀴 선택 기능 구현 (2026-01-22)

## 발생한 문제

### 1. Player 타입 구조 오류
**증상**: `player.position.x` 사용으로 TypeScript 빌드 실패
```
Property 'position' does not exist on type 'WritableNonArrayDraft<Player>'
```

**원인**: Player 타입의 좌표 속성명을 잘못 가정
- 잘못된 코드: `player.position.x`
- 올바른 코드: `player.alignment.x`

**근본 원인**: DSL 타입 정의를 확인하지 않고 코드 작성

### 2. Action 타입 구조 오류
**증상**: `action.startPoint`, `action.endPoint` 사용으로 TypeScript 빌드 실패
```
Property 'endPoint' does not exist on type 'WritableNonArrayDraft<RouteAction>'
```

**원인**: Action 타입들의 실제 구조를 파악하지 않음
- RouteAction: `route.controlPoints[]`
- BlockAction: `block.pathPoints[]`
- MotionAction: `motion.pathPoints[]`
- ZoneAction: `zone.x`, `zone.y`
- SymbolAction: `symbol.x`, `symbol.y`

**근본 원인**: 타입 정의 파일(dsl.ts)을 먼저 확인하지 않고 추측으로 코드 작성

## 재발 방지 대책

### 1. 타입 정의 우선 확인 원칙
**새로운 기능 구현 전 반드시 확인할 파일:**
```
editor/src/types/dsl.ts  # 핵심 DSL 타입 정의
```

**확인 방법:**
```bash
# Player 타입 확인
grep -A 15 "interface Player" editor/src/types/dsl.ts

# Action 타입 확인
grep -A 20 "interface RouteAction\|interface BlockAction\|interface MotionAction" editor/src/types/dsl.ts
```

### 2. 기존 코드 패턴 참조
새로운 기능 구현 시 editorStore.ts에서 유사한 패턴 검색:
```bash
# Player 좌표 접근 패턴
grep "player\.alignment" editor/src/store/editorStore.ts

# Action 접근 패턴
grep "action\.route\|action\.block\|action\.motion" editor/src/store/editorStore.ts
```

### 3. CLAUDE.md 업데이트 필요
**추가할 내용:**
```markdown
## 핵심 타입 구조 (Quick Reference)

### Player 좌표
- `player.alignment.x` / `player.alignment.y` (NOT player.position)

### Action 경로 데이터
| Action Type | Path Property |
|-------------|---------------|
| RouteAction | `route.controlPoints[]` |
| BlockAction | `block.pathPoints[]` |
| MotionAction | `motion.pathPoints[]` |
| ZoneAction | `zone.x`, `zone.y` (center) |
| SymbolAction | `symbol.x`, `symbol.y` |
```

## 교훈

1. **추측하지 말고 확인하라**: 타입 구조는 반드시 정의 파일에서 확인
2. **빌드 먼저**: 코드 작성 후 즉시 빌드하여 타입 오류 조기 발견
3. **기존 패턴 활용**: 유사한 기능이 이미 구현되어 있다면 그 패턴을 참조

## 체크리스트 (향후 Store 수정 시)

- [ ] `editor/src/types/dsl.ts`에서 관련 타입 정의 확인
- [ ] editorStore.ts에서 유사 패턴 grep으로 검색
- [ ] 코드 작성 후 `npm run build` 즉시 실행
- [ ] TypeScript 오류 발생 시 타입 정의 재확인
