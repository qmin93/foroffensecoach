# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Table of Contents
- [Project Overview](#project-overview)
- [Commands](#commands)
- [UI Theming](#ui-theming-shadcnui)
- [Repository Structure](#repository-structure)
- [State Management](#state-management-zustand-stores)
- [DSL Architecture](#dsl-architecture)
- [Concept System](#concept-system-architecture)
- [Konva Layer Architecture](#konva-layer-architecture)
- [Coordinate System](#coordinate-system)
- [Visual Specifications](#visual-specifications-canvas--nodes)
- [Critical Exceptions](#critical-exceptions-반성회에서-도출)
- [Design Principles](#design-principles)
- [배포 권한 규칙](#배포-권한-규칙-중요)
- [Vercel 빌드 주의사항](#vercel-빌드-주의사항)

## Project Overview

**ForOffenseCoach** is a football playbook builder & concept recommender SaaS for coaches.

Core value proposition: Formation → Concept recommendation → Auto-build → Export/Share → Install Focus (drill connection)

## Git Repository

- **URL**: https://github.com/qmin93/foroffensecoach.git
- **Branch**: master
- **Note**: If git commands fail, ensure `.git` folder exists in `c:\FOC`. If missing, run:
  ```bash
  git init && git remote add origin https://github.com/qmin93/foroffensecoach.git && git fetch origin && git reset --hard origin/master
  ```

## Deployment

- **Vercel Dashboard**: https://vercel.com/qs-projects-e4f478bc/foroffensecoach
- **Root Directory**: `editor/` (Vercel project settings에서 설정)
- **Framework**: Next.js (자동 감지)

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **UI Components**: shadcn/ui (Tailwind CSS + Radix UI)
- **Editor**: Konva.js (Canvas 2D library) with react-konva
- **State**: Zustand + Immer
- **Export**: Konva.toDataURL() for PNG, jsPDF for PDF
- **Data Model**: JSON-based DSL (Domain Specific Language)
- **Deployment**: Vercel + Supabase

## Commands

```bash
# Development
cd editor && npm run dev     # Start dev server (http://localhost:3000)

# Build
cd editor && npm run build   # Production build
cd editor && npm run start   # Start production server

# Linting
cd editor && npm run lint    # Run ESLint

# Testing (Vitest)
cd editor && npm run test           # Run tests in watch mode
cd editor && npm run test:run       # Run tests once
cd editor && npm run test:coverage  # Run tests with coverage
cd editor && npm run test -- --run src/__tests__/specific.test.ts  # Single test
```

### Test Files Location
- `editor/src/__tests__/*.test.ts` - Unit tests (Vitest + jsdom)
- Setup: `editor/src/__tests__/setup.ts`
- Config: `editor/vitest.config.ts`

## UI Theming (shadcn/ui)

**IMPORTANT**: UI 스타일링 작업 시 반드시 `docs/shadcn-ui-theming.md` 문서를 참조할 것.

### 핵심 규칙
1. **Semantic Color 사용**: `zinc-*`, `gray-*` 등 하드코딩 색상 대신 semantic color 변수 사용
2. **Light Theme 기본**: 흰색 배경 기반의 기본 shadcn/ui 테마 사용

### Quick Reference (Dark → Light 변환)
| Dark Theme | Light Theme |
|------------|-------------|
| `bg-zinc-900` | `bg-background` |
| `bg-zinc-800` | `bg-card` / `bg-muted` |
| `text-white` | `text-foreground` |
| `text-zinc-400` | `text-muted-foreground` |
| `border-zinc-700` | `border-border` |
| `bg-blue-600` | `bg-primary` |
| `bg-red-600` | `bg-destructive` |

### 허용 예외 (의미적 색상)
- `green-600/500` - 성공 액션 (Complete, Save, Copy)
- `orange-500` - Team/Owner 뱃지
- `red-500` - 에러 상태 (destructive 대신 사용하는 경우)

### 하드코딩 색상 감지
```bash
grep -rn "zinc-\|gray-\|slate-" editor/src/app --include="*.tsx"
```

## Repository Structure

| Path | Purpose |
|------|---------|
| `editor/` | Next.js play editor application |
| `editor/src/app/` | Next.js App Router pages |
| `editor/src/components/` | React components (editor/, dashboard/, ui/) |
| `editor/src/store/` | Zustand stores (editorStore, authStore, playbookStore) |
| `editor/src/lib/` | Utilities (API, Supabase, recommendation engine) |
| `editor/src/data/concepts/` | Pass/Run concept definitions |
| `editor/src/types/dsl.ts` | Core DSL type definitions |
| `prd.md` | Product Requirements Document |
| `DSL Specification.md` | Data model schemas |
| `docs/formations-and-concepts.md` | 51개 포메이션 + 65개 컨셉 레퍼런스 |
| `.claude/retrospectives/` | 반성회 기록 (문제 해결 후 작성) |

## State Management (Zustand Stores)

| Store | Purpose | Key State |
|-------|---------|-----------|
| `editorStore` | Canvas editor state | `play`, `mode`, `selectedPlayerIds`, `drawingConfig`, `history` |
| `playbookStore` | Playbook collection | `playbook`, `plays[]`, CRUD operations |
| `conceptStore` | Concept recommendations | `filteredConcepts`, `searchTerm`, filters |
| `authStore` | Authentication | `user`, `session`, Supabase auth |
| `teamProfileStore` | Team settings | `teamProfile`, preferences |
| `toastStore` | UI notifications | `toasts[]`, `addToast()` |

### Data Flow

```
Formation Selection → Concept Recommendation → Auto-build → Play DSL
     │                      │                      │
     ▼                      ▼                      ▼
 editorStore          conceptStore           concept-builder.ts
 (setFormation)       (filter by tags)       (buildConceptActions)
```

## DSL Architecture

All entities use JSON with `schemaVersion: "1.0"`. Key types:

- **Play**: `roster.players[]` + `actions[]` + `meta` + `notes`
- **Playbook**: Collection of plays with sections
- **Formation**: Preset player arrangements (Trips, 2x2, Bunch, etc.)
- **Concept**: Pass/Run templates with `template.roles[]` for auto-build

## Core Type Structures (Quick Reference)

### Player 좌표 접근 (중요)
```typescript
// CORRECT
player.alignment.x
player.alignment.y

// WRONG - position 속성 없음
player.position.x  // ❌ TypeScript 오류
```

### Action 경로 데이터 (중요)
| Action Type | Path Property | 설명 |
|-------------|---------------|------|
| RouteAction | `route.controlPoints[]` | 경로 포인트 배열 |
| BlockAction | `block.pathPoints[]` | 블로킹 경로 배열 |
| MotionAction | `motion.pathPoints[]` | 모션 경로 배열 |
| ZoneAction | `zone.x`, `zone.y` | 중심점 좌표 |
| SymbolAction | `symbol.x`, `symbol.y` | 심볼 위치 |

**주의**: `startPoint`, `endPoint` 속성은 존재하지 않음

## Concept System Architecture

Concepts are pre-defined play templates (Pass/Run) stored in `editor/src/data/concepts/`.

```
Concept Definition (pass-concepts.ts / run-concepts.ts)
├── id, name, category (quick_game, dropback, rpo, etc.)
├── tags: ['2x2', 'trips', 'bunch'] - for formation matching
└── template.roles[]: role assignments
    ├── role: 'X' | 'Y' | 'Z' | 'H' | 'RB' etc.
    └── action: { type: 'route', pattern: 'slant', depth: 5 }
```

**Position Alias Mapping** (concept-builder.ts):
- `Y` = TE, U
- `Z` = WR, SE (split end)
- `X` = WR, FL (flanker)
- `H` = WR, SLOT

**Auto-build Process**:
1. User selects concept from recommendation panel
2. `buildConceptActions()` matches concept roles to players
3. Actions (routes, blocks) generated and added to `play.actions[]`
4. Undo toast shown for reverting

## Konva Layer Architecture

```
Konva.Stage
├── fieldLayer      - Yard lines, LOS, hash marks (static)
├── actionLayer     - Routes, Blocks, Motions (BELOW players)
├── playerLayer     - Player nodes (Circle/Rect + Text)
└── uiLayer         - Selection handles (excluded from export)
```

**Layer Order (Critical)**: `FieldLayer → ActionLayer → PlayerLayer`
- ActionLayer MUST render BELOW PlayerLayer
- Changing this order breaks selection and visual hierarchy

## Coordinate System

Normalized field coordinates (0.0-1.0 for X, -0.4 to +0.6 for Y):
- Y=0 is Line of Scrimmage (LOS), rendered at 60% down from top
- Y<0 is backfield (max -0.4 = 10 yards back)
- Y>0 is toward defense (max 0.6 = 15 yards ahead)

**Yard to Normalized Conversion** (CRITICAL):
```typescript
// 1 yard = 0.04 normalized y
const routeDepth = depthInYards * 0.04; // CORRECT
// const routeDepth = depthInYards / 100; // WRONG - causes 1/4 length routes

// Route depth capped at 14 yards (0.56 normalized)
const cappedDepth = Math.min(routeDepth, 0.56);
```

## Visual Specifications (Canvas & Nodes)

### Canvas Aspect Ratio
- Default: **3:2** (balanced)
- Location: `PlayEditor.tsx` line ~136
```typescript
const aspectRatio = 3 / 2;
```

### Node Sizing Formula
```typescript
// PlayerNode.tsx - 1.8% of canvas width
const baseRadius = Math.max(8, Math.min(18, stageWidth * 0.018));
const responsiveLabelFontSize = Math.max(7, Math.min(10, stageWidth * 0.01));
```

### O-Line Formation Spacing (중요)
**각 라인맨 간격: 0.04 = 1야드**
| Position | X 좌표 |
|----------|--------|
| TE (Left) | 0.38 |
| LT | 0.42 |
| LG | 0.46 |
| C | 0.50 |
| RG | 0.54 |
| RT | 0.58 |
| TE (Right) | 0.62 |
- 전체 O-Line 너비: 0.16 (4야드)
- Y 좌표: -0.03 (LOS 뒤 약 0.75야드)
- **TE 위치 규칙**: 방향에 따라 LT 또는 RT 옆에 배치, 간격 0.04 (1야드) 동일

### 노드 겹침 방지 규칙 (중요)
**모든 플레이어 간 최소 간격: 0.06**
- 노드 반지름: ~0.018 (캔버스 너비의 1.8%)
- 두 노드가 겹치지 않으려면 최소 0.036 필요
- 안전 마진 포함하여 **0.06 이상** 간격 유지
- 같은 X좌표 스택 (Tight Bunch, Stack): Y 간격 0.06 이상
- 같은 Y좌표 라인 (Double Tight, TE 클러스터): X 간격 0.06 이상

### Size Change Protocol
Before modifying visual sizes:
1. Compare with reference design (FirstDown PlayBook style)
2. Test at 100% browser zoom - OL should have clear gaps
3. Verify routes visible behind nodes
4. Update this section with new values

## Critical Exceptions (반성회에서 도출)

### BALL and QB Special Handling
- **BALL Role** (`player.role === 'BALL'`):
  - Color: Brown (#8B4513) fill, white border
  - Size: Fixed (NOT responsive sizing)
- **QB Role** (`player.role === 'QB'`):
  - No auto-assigned routes or actions in concept builder
- **Check in ALL action assignment loops**:
  ```typescript
  if (player.role === 'BALL' || player.role === 'QB') continue;
  ```

### Responsive Sizing Exception
```typescript
// PlayerNode.tsx
const isBall = player.role === 'BALL';
const radius = isBall ? (appearance.radius || 10) : Math.min(baseRadius, maxRadius);
```

### Editor Colors
- Canvas uses only black (#000000) and white (#ffffff)
- Exception: BALL uses brown (#8B4513)

### Drawing Tool UX (그리기 도구 규칙)
**그리기 완료 후 반드시 Select 모드로 복귀**
- Straight/Curved 라인 → `confirmDrawing()` → `mode = 'select'`
- Angular 라인 (더블클릭) → `confirmAngularDrawing()` → `mode = 'select'`
- Zone 배치 → `finishZoneDrag()` → `mode = 'select'` + `placementPhase = 'idle'`
- 표준 드로잉 앱 패턴 (Figma, Sketch 등) 따름
- 연속 그리기가 필요하면 Shift 키 등 수정자 키로 별도 구현 (향후)

### 시각적 요소 변경 시 확인 규칙 (2026-01-22 추가)
**위치/크기/색상 변경 시 구체적 값 사용자 확인 필수**
- **위치 (y좌표)**: "겹치지 않게" → 구체적 y값 (예: -0.08) 확인
- **마커/스타일**: 불명확 시 기존 동작 유지 또는 명시적 확인
- **UI 상호작용**: 새 UI 요소 추가 시 "보기만" vs "클릭 가능" 확인
- **dev 서버**: 시작 후 실제 포트 번호 사용자에게 명시

### Audit 파일 규칙 (2026-01-26 추가)
**docs/audits/ 파일은 실행 가능한 코드로 취급**
- **타입 정의 필수**: `docs/audits/types.ts`에서 공용 타입 import
- **Formation 완전성**: OL 라벨 필수 포함 (LT, LG, C, RG, RT)
- **Lint 스크립트**: `npm run lint:concepts`로 검증
- **Go route 예외**: Clear-out 역할이므로 depth 검증에서 제외

### 대량 데이터 처리 규칙 (2026-01-26 추가)
**10줄 이상의 코드/데이터는 즉시 파일로 저장**
- 컨텍스트 소진 방지를 위해 대량 데이터는 파일로 먼저 저장
- 저장 후 Read 도구로 참조하여 작업
- JSON 스키마와 TypeScript 구현을 분리하여 관리

## Design Principles

1. **Recommendations are filtering, not judgment** - Show options, not "AI picks"
2. **Auto-build always has Undo** - Every auto-generation shows undo toast
3. **Results limited to 8-12 concepts** - Reduce decision fatigue
4. **DSL is source of truth** - Konva renders from DSL; UI state is separate
5. **No AI predictions in MVP** - No success rates, expected yards, or scores

## MVP Non-Goals

Do not implement:
- Play success rate predictions
- Defense auto-generation
- Animation playback
- Real-time collaborative editing
- Drill editor/scheduler
- Film/video integration

## 배포 권한 규칙 (중요)

**git push는 사용자가 명시적으로 요청할 때만 수행한다.**

### 허용되는 요청 예시
- "배포해", "push해", "deploy", "푸시"
- "Vercel에 올려줘", "원격에 푸시해"

### 금지 사항
- 작업 완료 후 자동 배포 (작업 완료 ≠ 배포 요청)
- 사용자 승인 없이 `git push` 실행

### 위험 명령어 (명시적 요청 필수)
- `git push` - 원격 배포
- `git push --force` - 강제 배포
- `git reset --hard` - 작업 손실 가능

## Vercel 빌드 주의사항

- **Monorepo 구조**: Root에 `package-lock.json`과 `editor/package-lock.json` 두 개 존재
- **Turbopack root 필수**: `next.config.ts`에 `turbopack.root: __dirname` 설정 필수
  - 미설정 시 Vercel에서 `@/` 경로 모듈 못 찾음
  - 로컬 빌드 성공 ≠ Vercel 빌드 성공

### 배포 전 체크리스트
1. **`git status` 먼저 확인** - 커밋되지 않은 변경사항이 있으면 로컬 빌드 의미 없음
2. `cd editor && npm run build` 로컬 빌드 성공 확인
3. TypeScript 오류 없는지 확인
4. 새 파일 추가 시 git add 확인
5. Vercel Root Directory가 `editor`로 설정되어 있는지 확인

### 배포 실패 시 대응 (2026-01-22 추가)
1. **에러 로그 먼저 확인** - 사용자에게 Vercel 빌드 로그 요청
2. **Vercel CLI 직접 배포 금지** - `vercel --prod` 사용 시 잘못된 프로젝트로 배포될 수 있음
3. **반드시 Git push만 사용** - `foroffensecoach` 프로젝트는 Git 트리거로만 배포
4. **로컬 파일 vs 커밋 파일 확인** - `git diff <파일>` 또는 `git show HEAD:<파일>`로 확인

### 흔한 배포 실패 원인
| 에러 | 원인 | 해결 |
|------|------|------|
| `Property 'X' is missing in type` | Props 인터페이스 불일치 | 해당 컴포넌트의 Props 타입 확인 후 선택적(?)으로 변경 또는 호출부에서 전달 |
| `Module not found: '@/components/ui/X'` | UI 컴포넌트 미설치 | shadcn/ui 컴포넌트 추가 후 Radix 의존성도 확인 |
| `outputFileTracingRoot and turbopack.root` 경고 | next.config.ts 설정 | 무시해도 되는 경고, 빌드에 영향 없음 |
