# Retrospective: Dark Theme Hardcoding Issue

**Date**: 2026-01-22
**Issue**: Pages using hardcoded dark theme colors instead of semantic colors

## What Happened

5 pages were discovered using hardcoded dark theme colors (zinc-*, bg-zinc-950) instead of shadcn/ui semantic colors:
- `/` (Landing page)
- `/pricing`
- `/team-profile`
- `/workspace/settings`
- `/share/[token]`

This caused inconsistent theming and would break if light/dark mode switching was implemented.

## Root Cause

1. **Copy-paste from examples**: Dark theme examples were copied without converting to semantic colors
2. **Lack of enforcement**: No lint rules or code review checklist for color usage
3. **Missing documentation awareness**: CLAUDE.md theming guidelines existed but weren't consistently followed

## Color Mapping Applied

| Hardcoded (Dark) | Semantic Color |
|------------------|----------------|
| `bg-zinc-950` | `bg-background` |
| `bg-zinc-900` | `bg-card` |
| `bg-zinc-800` | `bg-muted` |
| `text-white` | `text-foreground` |
| `text-zinc-400` | `text-muted-foreground` |
| `border-zinc-700/800` | `border-border` |
| `bg-blue-600` | `bg-primary` |
| `bg-red-600` | `bg-destructive` |

## Prevention Measures

### 1. CLAUDE.md Guidelines (Already Added)
```markdown
## UI Theming (shadcn/ui)

### 핵심 규칙
1. **Semantic Color 사용**: zinc-*, gray-* 등 하드코딩 색상 대신 semantic color 변수 사용
2. **Light Theme 기본**: 흰색 배경 기반의 기본 shadcn/ui 테마 사용
3. **문서 참조**: 색상 변환이 필요할 때 docs/shadcn-ui-theming.md 매핑 테이블 확인
```

### 2. Code Review Checklist
When reviewing UI code, check for:
- [ ] No hardcoded color classes (zinc-*, gray-*, slate-*)
- [ ] Uses semantic colors (background, foreground, card, muted, border, primary, destructive)
- [ ] Exceptions documented with comments (e.g., green-600 for success actions)

### 3. Allowed Exceptions
Some colors are intentionally hardcoded for semantic meaning:
- `green-600/500` - Success actions (Complete, Save)
- `orange-500` - Team/Owner badges
- `red-500` - Error states (when destructive isn't appropriate)

### 4. Quick Audit Command
To find potentially hardcoded colors:
```bash
grep -rn "zinc-\|gray-\|slate-" editor/src/app --include="*.tsx" | grep -v node_modules
```

## Verification

After conversion:
1. `npm run build` - Passed
2. Visual check - All pages render correctly with semantic colors
3. Theme consistency - All pages now use same color system

## Commits

1. `17215a0` - feat: Add skeleton loading states for better UX
2. `11de446` - refactor: Convert pages from dark theme to semantic colors
3. `e72ee1c` - docs: Update CLAUDE.md and add skeleton UI retrospective
