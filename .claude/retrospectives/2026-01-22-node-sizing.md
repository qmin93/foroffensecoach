# Node Sizing & Canvas Ratio Retrospective

**Date**: 2026-01-22
**Issue**: Node size and canvas aspect ratio require careful calibration for visual clarity

## What Happened

1. Initial node size (4% of canvas width) was too large at 100% zoom, causing player overlap
2. Canvas 4:3 ratio felt cramped compared to reference (FirstDown PlayBook)
3. OL spacing (0.05) was too wide, not matching professional look

## Root Cause

- No reference design specs documented
- Node sizing formula used arbitrary multipliers without visual benchmarks
- Missing canvas ratio options analysis

## Solution Applied

| Setting | Before | After |
|---------|--------|-------|
| Canvas ratio | 4:3 | **16:9** |
| Node size | 2.7% | **1.8%** |
| Node min/max | 11-27px | **8-18px** |
| Label font | 7-12px | **6-9px** |
| OL spacing | 0.05 | **0.03** |

## Prevention Measures

### 1. Document Visual Specifications in CLAUDE.md

Add to CLAUDE.md under "Editor Modes":

```markdown
## Visual Specifications (Canvas & Nodes)

### Canvas Aspect Ratio
- Default: 16:9 (widescreen)
- PlayEditor.tsx line ~136: `const aspectRatio = 16 / 9;`

### Node Sizing Formula
```typescript
// PlayerNode.tsx - 1.8% of canvas width
const baseRadius = Math.max(8, Math.min(18, stageWidth * 0.018));
const responsiveLabelFontSize = Math.max(6, Math.min(9, stageWidth * 0.009));
```

### Formation Spacing (Normalized)
- OL spacing: 0.03 between linemen
- LT: 0.44, LG: 0.47, C: 0.50, RG: 0.53, RT: 0.56
```

### 2. Reference Design Comparison Checklist

Before changing visual sizes:
1. Compare with reference design (FirstDown PlayBook or similar)
2. Test at 100% browser zoom
3. Check OL overlap - should have clear gaps between players
4. Verify route visibility - lines should not be hidden by nodes

### 3. Size Change Protocol

When modifying node/canvas sizes:
1. Document current values first
2. Propose change with rationale
3. Test at multiple zoom levels (67%, 100%, 150%)
4. Update CLAUDE.md with new specifications

## Files Modified

- [PlayerNode.tsx](editor/src/components/editor/PlayerNode.tsx) - Node sizing formula
- [PlayEditor.tsx](editor/src/components/editor/PlayEditor.tsx) - Canvas aspect ratio
- [editorStore.ts](editor/src/store/editorStore.ts) - OL spacing in FORMATION_PRESETS
