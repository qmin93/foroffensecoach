# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
| `.claude/retrospectives/` | 반성회 기록 (문제 해결 후 작성) |

## DSL Architecture

All entities use JSON with `schemaVersion: "1.0"`. Key types:

- **Play**: `roster.players[]` + `actions[]` + `meta` + `notes`
- **Playbook**: Collection of plays with sections
- **Formation**: Preset player arrangements (Trips, 2x2, Bunch, etc.)
- **Concept**: Pass/Run templates with `template.roles[]` for auto-build

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

## Vercel 빌드 주의사항

- **Monorepo 구조**: Root에 `package-lock.json`과 `editor/package-lock.json` 두 개 존재
- **Turbopack root 필수**: `next.config.ts`에 `turbopack.root: __dirname` 설정 필수
  - 미설정 시 Vercel에서 `@/` 경로 모듈 못 찾음
  - 로컬 빌드 성공 ≠ Vercel 빌드 성공

### 배포 전 체크리스트
1. `cd editor && npm run build` 로컬 빌드 성공 확인
2. TypeScript 오류 없는지 확인
3. 새 파일 추가 시 git add 확인
4. Vercel Root Directory가 `editor`로 설정되어 있는지 확인
