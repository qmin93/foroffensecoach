# Changelog

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
