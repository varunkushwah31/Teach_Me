---
name: Fox.ai Design System
description: Precision dark-mode aesthetic for high-velocity AI prompt engineering and vector knowledge retrieval
colors:
  bg-base: "#08090d"
  bg-surface-1: "#0e1017"
  bg-surface-2: "#141622"
  bg-surface-elevated: "#191c2b"
  border-subtle: "#1c1f2e"
  border-medium: "#282c40"
  border-accent: "rgba(99, 102, 241, 0.4)"
  text-primary: "#f4f5f9"
  text-secondary: "#9da3b8"
  text-tertiary: "#61677d"
  accent-indigo: "#6366f1"
  accent-indigo-hover: "#4f46e5"
  accent-emerald: "#10b981"
  accent-amber: "#f59e0b"
  accent-rose: "#f43f5e"
typography:
  display:
    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.03em"
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "'JetBrains Mono', 'Geist Mono', monospace"
    fontWeight: 500
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent-indigo}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-surface:
    backgroundColor: "{colors.bg-surface-2}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card-panel:
    backgroundColor: "{colors.bg-surface-1}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

## Overview

Fox.ai provides a specialized workstation for prompt engineers and researchers. The visual language is inspired by high-end analog audio synthesizers and aerospace telemetry: dense, precise, tactile, and unapologetically engineered.

Every pixel serves clarity and cognitive flow. We explicitly reject generative "AI slop" clichés: no muddy purple-to-fuchsia rainbow gradients, no thick side-tab borders, no decorative two-axis fake grid overlays, and no kickers/eyebrows floating above headings.

## Colors

The palette is anchored in deep obsidian and titanium gray, punctuated by a singular, authoritative Electric Indigo (`#6366f1`) and functional telemetry signals (Emerald for operational readiness, Amber for parameter drift, Rose for errors).

- **Ground & Baselines**:
  - `bg-base` (`#08090d`): Main viewport backdrop.
  - `bg-surface-1` (`#0e1017`): Primary card and sidebar surface.
  - `bg-surface-2` (`#141622`): Interactive control housings, input areas, and toolbars.
  - `bg-surface-elevated` (`#191c2b`): Modals, floating action menus, and dropdowns.

- **Hairline Borders**:
  - `border-subtle` (`#1c1f2e`): Layout segmentations.
  - `border-medium` (`#282c40`): Interactive card perimeters.
  - `border-accent` (`rgba(99, 102, 241, 0.4)`): Active states and focus rings.

- **Ink & Contrast**:
  - `text-primary` (`#f4f5f9`): Headings and primary code/content.
  - `text-secondary` (`#9da3b8`): Form labels, descriptors, and readable metadata.
  - `text-tertiary` (`#61677d`): Timestamps, inactive states, and keyboard shortcut legends.

## Typography

- **Display**: High-impact headlines set in Geist with tight tracking (`-0.03em`), never decorated with gradient text or floating kickers.
- **Body**: Clean, high-legibility sans-serif with natural 1.6 line height and comfortable 65-75 character measures.
- **Code & Telemetry**: JetBrains Mono for all code blocks, prompt variables, SQL queries, token counts, and latency readouts. Monospace is never used as a generic aesthetic costume.

## Layout

- **Hierarchy**: Asymmetrical bento grid compositions and clear focal anchors.
- **Rhythm**: Generous vertical breathing room between major sections (80px–100px), with tight contextual groupings inside cards (8px–16px).
- **No Kicker Labels**: Headings stand on their own strength without extraneous uppercase taglines above them.

## Elevation & Depth

- **Single Elevation Principle**: We declare elevation once using either a crisp hairline border (`1px solid #1c1f2e`) or a deliberate soft shadow with physical downward offset (`box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.7)`).
- **No Zero-Offset Glowing Halos**: We avoid flat blurry outer glows that scream generic templates.

## Shapes

- **Corner Radii**:
  - Micro badges & keycaps: `6px`
  - Interactive buttons & inputs: `10px`
  - Panels & modal containers: `16px` to `20px`
- **Affordance**: Buttons provide subtle inset highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.08)`) to convey physical tactile substance.

## Components

- **Synthesizer Sliders**: Real-time continuous track with dynamic color fill, responsive thumb physics, and numerical readout.
- **Prompt Blueprints**: Dense metadata cards with clear category chips, author verification, and one-click execution.
- **Streaming Terminal**: Monospace editor housing with line numbers, syntax highlighting, and fluid token accumulation without jitter.
- **Navigation**: Dual-mode master layout supporting full marketing persuasiveness and zero-overhead studio workstation tasks.

## Do's and Don'ts

### Do
- Maintain strict zero-emoji compliance across all UI components, buttons, and status signals.
- Use Phosphor SVG icons in consistent regular and duotone weights.
- Ensure all numbers in tabular data and telemetry readouts use tabular figures (`tabular-nums font-mono`).
- Provide immediate tactile feedback on interactive buttons and slider handles.

### Don't
- Never place a kicker or eyebrow label above a headline.
- Never use multi-stop violet-to-fuchsia or neon cyan-on-dark candy gradients.
- Never use `border-l-4` or `border-l-2` colored stripes on the sides of cards or alerts.
- Never overlay artificial two-axis grid line patterns on page backgrounds.
- Never expose raw database entities directly over REST APIs.
