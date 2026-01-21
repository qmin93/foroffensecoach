# Changelog

## 2026-01-20 - Session Update #3

### UI/UX 개선

#### 1. Install Focus 패널 개선
**Files**: `src/components/editor/InstallFocusPanel.tsx`, `src/components/editor/Toolbar.tsx`, `src/components/editor/ConceptPanel.tsx`

- 왼쪽 Toolbar에서 Install Focus 버튼 제거
- ConceptPanel 하단에 Install Focus 버튼 추가 (오렌지색)
- 커스텀 영상 링크 추가 기능 (YouTube/Instagram)
  - URL 입력 시 플랫폼 자동 감지
  - YouTube: 빨간색 아이콘
  - Instagram: 그라데이션 아이콘
  - 영상 추가/삭제 기능

#### 2. Pass/Run 토글 버튼
**File**: `src/components/editor/SituationHeader.tsx`

- 상단 헤더에 Pass/Run 토글 버튼 추가
- 클릭 시 Pass ↔ Run 전환
- Pass: 파란색 배경 (🏈 Pass)
- Run: 초록색 배경 (🏃 Run)
- conceptStore의 typeFilter와 자동 연동

#### 3. 공(Ball) 위치 수정
**File**: `src/store/editorStore.ts`

- 모든 14개 포메이션에서 공 위치를 LOS 정중앙으로 이동
- 변경: `y: -0.01` → `y: 0`
- 센터(y: -0.03)와 겹치지 않음

#### 4. 키보드 단축키 도움말 위치 이동
**File**: `src/components/editor/PlayEditor.tsx`

- 도움말 패널을 오른쪽 하단에서 왼쪽 하단으로 이동
- Install Focus 패널과의 겹침 해결
- 변경: `bottom-4 right-4` → `bottom-4 left-4`

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `InstallFocusPanel.tsx` | 커스텀 영상 링크 추가 기능, YouTube/Instagram 아이콘 |
| `Toolbar.tsx` | Install Focus 버튼 제거, props 정리 |
| `ConceptPanel.tsx` | Install Focus 버튼 추가 (하단) |
| `PlayEditor.tsx` | Toolbar props 정리, 도움말 위치 이동 |
| `SituationHeader.tsx` | Pass/Run 토글 버튼 추가 |
| `editorStore.ts` | Ball 위치 y: 0으로 수정 |

### Git Commits
```
commit 14f9dff - docs: Update CHANGELOG with session #2 features and bug fix
commit dc0dc8f - feat: Update UI - Install Focus panel, Pass/Run toggle, ball position
commit e5940d5 - fix: Move keyboard shortcuts help panel to left side
```

---

## 2026-01-20 - Session Update #2

### New Features

#### 1. Situation Header (Down & Distance, Defense Settings)
**File**: `src/components/editor/SituationHeader.tsx` (NEW)

캔버스 상단에 게임 상황 및 수비 설정을 표시하는 헤더 추가:

**Situation (Down & Distance)**
- DOWN: 1, 2, 3, 4 버튼 선택
- Distance: 1-20 yards, Goal 선택
- Field Position: OWN 5-40, 50, OPP 40-5, Red Zone

**Defense Settings**
- Box Count: 6, 7, 8명 선택 (컨셉 추천에 반영)
- Front: Even (4-3), Odd (3-4), Bear, Over, Under
- 3-Tech Position: Strong, Weak, Both, None
- Shell: 1-High (Cover 1/3), 2-High (Cover 2/4), Quarters
- Blitz Tendency: Low, Medium, High

**상황 힌트 배지**
- Run Situation: 짧은 야드 (1-2), 골라인
- Pass Situation: 긴 야드 (8+), 3rd & long
- Balanced: 일반 상황

#### 2. Defense-Based Concept Filtering
**File**: `src/store/conceptStore.ts`

`computeRecommendations` 함수 개선:

**Pass Concepts**
| 설정 | 점수 영향 |
|------|----------|
| Box 6 (Light) | -10 기본, Zone beater +15 |
| Box 8 (Heavy) | +15 (패스 기회) |
| 1-High Shell | Man beater +20, Deep +10 |
| 2-High Shell | Zone beater +15, MOF attack +15, Deep -10 |

**Run Concepts**
| 설정 | 점수 영향 |
|------|----------|
| Box 매칭 | +25, 불매칭시 8-man box -25 |
| Front 매칭 | +20, 불매칭 -5 |
| 3T 매칭 | +15, Gap/Power 불매칭 -10 |

#### 3. Player Assignments Display
**Files**: `src/components/editor/ConceptCard.tsx`, `src/types/concept.ts`

컨셉 카드 선택 시 각 선수의 assignment 표시:

```typescript
interface RoleAssignmentDisplay {
  roleName: string;      // e.g., 'STICK', 'FLAT', 'ZONE_LT'
  appliesTo: string[];   // e.g., ['X', 'Z'], ['RG']
  action: string;        // e.g., 'Slant @ 6 yds', 'Zone block'
  notes?: string;
}
```

#### 4. Concepts & Install Focus Mutual Exclusivity
**Files**: `src/components/editor/PlayEditor.tsx`, `src/components/editor/Toolbar.tsx`

두 패널이 서로 배타적으로 동작:
- Show Concepts 클릭 → Install Focus 패널 닫힘
- Install Focus 클릭 → Concepts 패널 닫힘
- 버튼 텍스트 동적 변경: Show/Hide

#### 5. Ball in All Formations
**File**: `src/store/editorStore.ts`

모든 14개 포메이션에 공(Ball) 추가 (football 모양)

#### 6. New Formation Presets (8개 추가, 총 14개)
**File**: `src/store/editorStore.ts`

신규 8개:
- Trips Right, Bunch Right, Pistol, Twins Right
- Wing-T, Ace, Goal Line, Slot Right

### Bug Fix

**TypeScript Build Error 수정**
- `FORMATION_PRESETS` 타입에서 `shape?: string`을 `shape?: PlayerShape`로 변경
- `PlayerShape` 타입 import 추가

### Git Commits
```
commit 50a210d - feat: Add situation header, defense filtering, and UI improvements
commit 1c719d5 - fix: Fix TypeScript type error for PlayerShape in FORMATION_PRESETS
```

---

## 2026-01-20 - 에디터 UX 개선 업데이트

### 새로운 기능

#### 1. 멀티 선택 (Multi-selection)
- **Shift+클릭**으로 여러 플레이어/라인을 동시 선택 가능
- 선택된 항목들을 한번에 이동, 삭제, 복제 가능

#### 2. 키보드 단축키
| 단축키 | 기능 |
|--------|------|
| `Ctrl+A` | 전체 선택 |
| `Ctrl+D` | 선택 항목 복제 |
| `Ctrl+Z` | 실행 취소 (Undo) |
| `Ctrl+Y` | 다시 실행 (Redo) |
| `Delete` / `Backspace` | 선택 항목 삭제 |
| `Arrow Keys` | 선택 항목 이동 (1% 단위) |
| `Shift + Arrow Keys` | 선택 항목 큰 폭 이동 (5% 단위) |
| `Escape` | 그리기 취소 / 선택 해제 |

#### 3. 호버 효과 (Hover States)
- 플레이어 노드에 마우스 올리면 파란색 글로우 효과
- 라인에 마우스 올리면 하이라이트 및 그림자 효과
- 클릭 가능한 요소 시각적 피드백 개선

#### 4. 선택된 라인 스타일 편집
- 라인 선택 시 툴바에 편집 패널 표시
- 편집 가능 속성:
  - 라인 타입 (직선 ↔ 곡선 변환)
  - 끝 마커 (화살표, T블록, 원, 없음)
  - 라인 스타일 (실선, 점선, 파선)
  - 라인 색상
  - 라인 두께

#### 5. 컨텍스트 메뉴 (우클릭 메뉴)
- 캔버스에서 우클릭 시 컨텍스트 메뉴 표시
- 메뉴 항목:
  - 삭제 (Delete)
  - 복제 (Duplicate)
  - 직선/곡선 변환 (라인 선택 시)
  - 전체 선택 (Select All)

#### 6. 포메이션 프리셋
- 툴바에서 포메이션 드롭다운으로 빠른 배치
- 지원 포메이션:
  - I Formation
  - Shotgun
  - Spread
  - Single Back
  - Pro Set
  - Empty Set

### UI/UX 개선

#### Export PNG 버튼 위치 수정
- 툴바 하단에 고정 배치
- 스크롤해도 항상 보이도록 레이아웃 변경

#### 안내 패널 업데이트
- 우클릭 컨텍스트 메뉴 안내 추가
- 키보드 단축키 목록 표시

### 수정된 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/store/editorStore.ts` | 새로운 상태 및 액션 추가 (hover, selectAll, duplicateSelected, moveSelectedByOffset, updateActionStyle, convertLineType, loadFormation) |
| `src/components/editor/PlayEditor.tsx` | 키보드 단축키, 컨텍스트 메뉴, 레이아웃 수정 |
| `src/components/editor/PlayerLayer.tsx` | Shift+클릭, 호버 핸들러 추가 |
| `src/components/editor/PlayerNode.tsx` | 호버 시각 효과 추가 |
| `src/components/editor/ActionLayer.tsx` | 라인 호버 효과, Shift+클릭 지원 |
| `src/components/editor/Toolbar.tsx` | 라인 스타일 편집 UI, 포메이션 프리셋 추가 |
| `src/components/editor/ContextMenu.tsx` | 새로 생성 - 우클릭 컨텍스트 메뉴 컴포넌트 |

### 기술적 세부사항

#### 새로운 Store 상태
```typescript
// 호버 상태
hoveredPlayerId: string | null;
hoveredActionId: string | null;

// 새로운 액션
selectAll: () => void;
setHoveredPlayer: (playerId: string | null) => void;
setHoveredAction: (actionId: string | null) => void;
updateActionStyle: (actionId: string, style: Partial<...>) => void;
convertLineType: (actionId: string, toType: 'straight' | 'curved') => void;
duplicateSelected: () => void;
moveSelectedByOffset: (dx: number, dy: number) => void;
loadFormation: (formationKey: string) => void;
```

#### 포메이션 프리셋 데이터 구조
```typescript
FORMATION_PRESETS: Record<string, {
  name: string;
  players: Array<{
    role: string;
    label: string;
    x: number;  // 0.0 ~ 1.0 (normalized)
    y: number;  // -1.0 ~ 1.0 (LOS = 0)
  }>;
}>;
```

---

## 이전 업데이트 (세션 이전)

- 통합 그리기 시스템 구현
- 러버밴드 프리뷰
- 라인 편집 (드래그 가능한 핸들)
- 플레이어에 라인 시작점 연결
