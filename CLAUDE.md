# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ForOffenseCoach** is a football playbook builder & concept recommender SaaS for coaches. This repository contains product specifications and documentation.

Core value proposition: Formation → Concept recommendation → Auto-build → Export/Share → Install Focus (drill connection)

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
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
```

## Repository Structure

| Path | Purpose |
|------|---------|
| `editor/` | Next.js play editor application |
| `prd.md` | Product Requirements Document - MVP scope, user stories, acceptance criteria |
| `DSL Specification.md` | Data model for football plays - schemas for Play, Playbook, Concept, Formation |
| `user flow spec.md` | UX flows, UI components, state transitions, telemetry events |
| `business plan.md` | Business model, pricing, GTM strategy, competitive analysis |
| `Formation recommendation.md` | Team Profile-based formation recommendation engine spec |

## Editor Project Structure (`editor/`)

```
src/
├── app/
│   ├── page.tsx                    # Landing/redirect page
│   ├── layout.tsx                  # Root layout with providers
│   ├── globals.css                 # Global styles
│   ├── dashboard/page.tsx          # Playbook list dashboard
│   ├── editor/
│   │   ├── page.tsx                # New play editor (no ID)
│   │   └── [playId]/page.tsx       # Edit existing play
│   ├── playbook/[playbookId]/page.tsx  # Playbook detail view
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup page
│   │   └── callback/route.ts       # OAuth callback handler
│   ├── share/[token]/page.tsx      # Public shared play view
│   ├── team-profile/page.tsx       # Team profile input
│   ├── workspace/settings/page.tsx # Workspace settings
│   ├── pricing/page.tsx            # Pricing page
│   └── api/stripe/                 # Stripe webhook/checkout routes
├── components/
│   ├── editor/
│   │   ├── FieldLayer.tsx          # Field rendering (yard lines, LOS, hash)
│   │   ├── PlayerNode.tsx          # Individual player node
│   │   ├── ActionLayer.tsx         # Routes, blocks, motions
│   │   ├── Toolbar.tsx             # Editor toolbar and controls
│   │   ├── ConceptCard.tsx         # Concept recommendation card
│   │   ├── UndoToast.tsx           # Auto-build undo notification
│   │   ├── ContextMenu.tsx         # Right-click context menu
│   │   ├── SituationHeader.tsx     # Down/distance/field position
│   │   └── ZoomControls.tsx        # Canvas zoom controls
│   ├── dashboard/
│   │   ├── PlaybooksGrid.tsx       # Playbook list grid
│   │   ├── PlaybookCard.tsx        # Individual playbook card
│   │   ├── PlaysGrid.tsx           # Play list within playbook
│   │   ├── PlayCard.tsx            # Individual play card
│   │   ├── CreatePlaybookModal.tsx # New playbook modal
│   │   └── QuickStartModal.tsx     # Quick start wizard
│   ├── auth/AuthForm.tsx           # Login/signup form
│   ├── share/ShareModal.tsx        # Share link generation
│   ├── export/PDFExportModal.tsx   # PDF export options
│   ├── recommendation/             # Formation recommendation UI
│   ├── team-profile/               # Team profile input components
│   ├── subscription/               # Subscription management
│   ├── workspace/                  # Workspace/team management
│   ├── layout/GlobalNavbar.tsx     # Top navigation bar
│   └── ui/                         # shadcn/ui primitives
├── store/
│   ├── editorStore.ts              # Main editor state (Zustand + Immer)
│   ├── conceptStore.ts             # Concept recommendation state
│   ├── authStore.ts                # Authentication state
│   ├── playbookStore.ts            # Playbook CRUD state
│   ├── teamProfileStore.ts         # Team profile state
│   └── toastStore.ts               # Toast notification state
├── data/
│   ├── concepts/
│   │   ├── pass-concepts.ts        # Pass concept definitions (20+)
│   │   ├── run-concepts.ts         # Run concept definitions (20+)
│   │   └── index.ts                # Concept exports
│   └── formation-library.ts        # Formation metadata for recommendations
├── lib/
│   ├── supabase/                   # Supabase client (client/server/middleware)
│   ├── api/                        # API helpers (playbooks, plays, share)
│   ├── recommendation-engine.ts    # Concept recommendation logic
│   ├── formation-recommendation.ts # Formation package recommendations
│   ├── pdf-export.ts               # PDF generation with jsPDF
│   ├── subscription.ts             # Feature gating logic
│   ├── stripe.ts                   # Stripe integration
│   └── utils.ts                    # General utilities (cn, etc.)
├── hooks/
│   ├── useSavePlay.ts              # Auto-save play hook
│   └── useFeatureAccess.ts         # Feature gating hook
├── types/
│   ├── dsl.ts                      # Play/Playbook/Action types
│   ├── concept.ts                  # Concept types
│   ├── team-profile.ts             # Team profile types
│   └── database.ts                 # Supabase database types
├── utils/
│   └── coordinates.ts              # Coordinate conversion utilities
└── __tests__/                      # Vitest test files
```

## DSL Architecture

All entities use JSON with `schemaVersion: "1.0"`. Key types:

### Play
Single diagram containing:
- `roster.players[]` - Player positions with role, x/y coordinates, alignment
- `actions[]` - Routes, blocks, motions, landmarks, text annotations
- `meta` - Personnel, formation/concept references, strength
- `notes` - Call name, coaching points

### Playbook
Collection of plays with sections and export settings.

### Formation
Preset player arrangements (e.g., Trips, 2x2, Bunch, I, Ace). Contains:
- `requiredRoster` - Minimum players per position
- `defaults.players[]` - Default positions
- `snapRules` - OL spacing, WR split presets

### Concept
Pass/Run templates used for recommendations. Contains:
- `template.roles[]` - Route/block role assignments
- `requirements` - Min receivers, preferred structures
- `suggestionHints` - Pass/run-specific recommendation metadata
- `installFocus.failurePoints[]` - Drill recommendations per concept

### TeamProfile
Roster/capability data for formation recommendations:
- `rosterAvailability` - Position counts and quality
- `unitStrength` - 1-5 ratings (OL run/pass, RB vision, WR separation, etc.)
- `stylePreferences` - Run/pass balance, motion usage, tempo, risk tolerance

## Konva Layer Architecture

```
Konva.Stage
├── fieldLayer      - Yard lines, LOS, hash marks (static, cacheable)
├── playerLayer     - Player nodes (Konva.Group = Circle + Text)
├── actionLayer     - Routes (Arrow), Blocks (Line/Shape), Motions (dashed Line)
├── annotationLayer - Text notes, landmarks
└── uiLayer         - Selection handles, guides (excluded from export)
```

**Konva Shape Mapping**:
| DSL Entity | Konva Shape |
|------------|-------------|
| Player | `Konva.Group` (Circle/Rect/RegularPolygon/Star + Text) |
| Route | `Konva.Arrow` with tension for curves |
| Block | `Konva.Line` + custom T-block `Konva.Shape` |
| Motion | `Konva.Line` (dash: [10, 5]) with tension |
| Text | `Konva.Text` |

**Player Shapes**: `circle`, `square`, `triangle`, `diamond`, `star`, `x_mark`

**Path Types**: `straight`, `quadratic`, `bezier`, `tension` (smooth curves through points)

## Coordinate System

Normalized field coordinates (0.0-1.0 for X, -0.4 to +0.6 for Y):
- Y=0 is Line of Scrimmage (LOS), rendered at 60% down from top
- Y<0 is backfield (offense behind LOS, max -0.4 = 10 yards back)
- Y>0 is toward defense (offense direction, max 0.6 = 15 yards ahead)

**Yard to Normalized Conversion** (CRITICAL):
```typescript
// 1 yard = 0.04 normalized y
// Formula: yards * 0.04 = normalized y
// Example: 20 yards = 20 * 0.04 = 0.8 normalized

const routeDepth = depthInYards * 0.04; // CORRECT
// const routeDepth = depthInYards / 100; // WRONG - causes 1/4 length routes

// Route depth is capped at 14 yards (0.56 normalized) to stay within canvas
const cappedDepth = Math.min(routeDepth, 0.56);
```

**Coordinate Conversion** (actual implementation in coordinates.ts):
```typescript
// Normalized → Pixel (LOS at 60% down from top)
toPixel(norm, stage) => ({
  x: norm.x * stage.width,
  y: (0.6 - norm.y) * stage.height  // LOS (y=0) at 60% down
})

// Pixel → Normalized
toNormalized(px, stage) => ({
  x: px.x / stage.width,
  y: 0.6 - px.y / stage.height  // Inverse of above
})
```

## Action Types

- `route` - Pass routes with pattern, depth, breakAngle, controlPoints
- `block` - Blocking schemes (zone, pull, trap, etc.) with target/landmark
- `motion` - Pre-snap motion paths (jet, orbit, shift)
- `landmark` - Aim points, read keys, cones
- `text` - Annotations and coaching notes

## Design Principles

1. **Recommendations are filtering, not judgment** - Show possible options, not "AI picks"
2. **Auto-build always has Undo** - Every auto-generation shows undo toast
3. **Results limited to 8-12 concepts** - Reduce decision fatigue
4. **3-line rationale for run recommendations** - Numbers/Angle/Surface
5. **Install Focus is read-only** - Drill data from concepts, max 3 failure points
6. **No AI predictions in MVP** - No success rates, expected yards, or scores
7. **DSL is source of truth** - Konva renders from DSL; UI state is separate
8. **Editor colors: Black and White only** - The editor canvas uses only black (`#000000`) and white (`#ffffff`):
   - Routes/Blocks: Black stroke lines
   - Player nodes: White fill with black text and black border
   - No colored elements in the editor canvas
   - **EXCEPTION: BALL** - The BALL player uses brown (#8B4513) fill, white border, and fixed size (not responsive)

## Editor Modes (Konva Implementation)

- **Select**: `draggable: true`, `Konva.Transformer` for handles
- **Draw**: Click player → set end point → confirm (Straight/Curved/Angular modes)
- **Text**: Click canvas → `Konva.Text` with textarea overlay

### Route Editing (Select Mode)
When a route is selected:
- **Double-click on route line**: Adds a new bend point at that location
- **Double-click on middle point**: Deletes that bend point (min 2 points required)
- **Drag any point**: Move the control point to adjust route shape
- All control points are rendered as draggable handles (green=end, orange=middle)

## MVP Non-Goals

Do not implement:
- Play success rate predictions
- Defense auto-generation/response
- Animation playback
- Real-time collaborative editing
- Drill editor/scheduler
- Film/video integration

## Important Exceptions (반성회에서 도출)

### BALL and QB Special Handling
- **BALL Role**: `player.role === 'BALL'`
  - Color: Brown (#8B4513) fill, white (#ffffff) border and laces
  - Size: Fixed size from `appearance.radius` (default 10), NOT responsive sizing
  - Why: BALL must always be visually distinct and maintain consistent size
- **QB Role**: `player.role === 'QB'`
  - No auto-assigned routes or actions in concept builder
  - QB handles the ball, doesn't run receiver routes
- **Actions**: NEVER assign routes, blocks, or any actions to BALL or QB
- **Check in ALL loops**: Every action assignment loop must include:
  ```typescript
  if (player.role === 'BALL' || player.role === 'QB') continue;
  ```

### Layer Order (Critical)
```
FieldLayer → ActionLayer → PlayerLayer
```
- ActionLayer (routes/blocks) MUST render BELOW PlayerLayer
- Changing this order breaks selection and visual hierarchy
- If unsure, verify with user before changing layer order

### Responsive Sizing
Player nodes scale based on canvas width:
```typescript
// Current formula (PlayerNode.tsx)
const baseRadius = Math.max(48, Math.min(120, stageWidth * 0.10));
const responsiveLabelFontSize = Math.max(24, Math.min(40, stageWidth * 0.035));

// EXCEPTION: BALL uses fixed size, not responsive
const isBall = player.role === 'BALL';
const radius = isBall ? (appearance.radius || 10) : Math.min(baseRadius, maxRadius);
```
- Always check for special roles (BALL) before applying responsive sizing
- Use explicit exception handling with comments

### Color Changes Checklist
Before modifying player colors/styles:
1. Check if the element has special requirements (BALL, highlights, etc.)
2. Preserve exception handling for special elements
3. Add comments for non-obvious exceptions
