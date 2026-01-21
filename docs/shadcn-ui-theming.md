# shadcn/ui Theming Documentation

## Overview

shadcn/ui provides two approaches to theming: **CSS Variables** (recommended) and **utility classes**.

### CSS Variables Approach

To enable CSS variables, set `tailwind.cssVariables` to `true` in your `components.json`:

```json
{
  "tailwind": {
    "cssVariables": true
  }
}
```

Usage example: `<div className="bg-background text-foreground" />`

### Utility Classes Approach

Set `tailwind.cssVariables` to `false` to use Tailwind utility classes directly:

```json
{
  "tailwind": {
    "cssVariables": false
  }
}
```

Usage example: `<div className="bg-zinc-950 dark:bg-white" />`

## Color Convention

The system uses a simple "background" and "foreground" naming convention. The background suffix is omitted for component background colors:

```css
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
```

Applied as: `<div className="bg-primary text-primary-foreground">`

## Complete CSS Variables List

### Root (Light Mode)
| Variable | Purpose |
|----------|---------|
| `--radius` | Border radius |
| `--background` | Page background |
| `--foreground` | Default text color |
| `--card` | Card background |
| `--card-foreground` | Card text color |
| `--popover` | Popover/dropdown background |
| `--popover-foreground` | Popover text color |
| `--primary` | Primary button/action background |
| `--primary-foreground` | Primary button text |
| `--secondary` | Secondary button background |
| `--secondary-foreground` | Secondary button text |
| `--muted` | Muted/disabled background |
| `--muted-foreground` | Muted/placeholder text |
| `--accent` | Accent/hover background |
| `--accent-foreground` | Accent text |
| `--destructive` | Destructive action (red) |
| `--destructive-foreground` | Destructive action text |
| `--border` | Default border color |
| `--input` | Input field border |
| `--ring` | Focus ring color |
| `--chart-1` ~ `--chart-5` | Data visualization colors |
| `--sidebar` | Sidebar background |
| `--sidebar-foreground` | Sidebar text |

### Dark Mode
The `.dark` class defines alternative values for all variables listed above.

## Semantic Color Mapping (Quick Reference)

When migrating from dark theme (zinc-*) to light theme (semantic):

| Dark Theme | Light Theme Semantic |
|------------|---------------------|
| `bg-zinc-900` | `bg-background` |
| `bg-zinc-800` | `bg-card` or `bg-muted` |
| `bg-zinc-700` | `bg-secondary` |
| `text-white` | `text-foreground` |
| `text-zinc-400` | `text-muted-foreground` |
| `text-zinc-500` | `text-muted-foreground` |
| `border-zinc-700` | `border-border` |
| `border-zinc-600` | `border-input` |
| `bg-blue-600` | `bg-primary` |
| `text-blue-400` | `text-blue-600` (keep color) |
| `bg-red-600` | `bg-destructive` |
| `text-red-400` | `text-destructive` |

## Adding Custom Colors

Create new color variables and expose them via the `@theme inline` directive:

```css
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}

.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

Then use: `<div className="bg-warning text-warning-foreground" />`

## Base Color Themes

The system offers pre-configured themes including: Neutral, Stone, Zinc, Gray, and Slate—each with distinct oklch() color values optimized for light and dark modes.

## Reference Links

- Official Theming Docs: https://ui.shadcn.com/docs/theming
- Color Generator: https://ui.shadcn.com/themes
- Components: https://ui.shadcn.com/docs/components
