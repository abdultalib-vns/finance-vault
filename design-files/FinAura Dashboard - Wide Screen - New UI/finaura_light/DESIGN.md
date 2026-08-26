---
name: FinAura Light
colors:
  surface: '#fcf8f8'
  surface-dim: '#ddd9d9'
  surface-bright: '#fcf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f1eded'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#44474a'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#75777a'
  outline-variant: '#c5c6ca'
  surface-tint: '#5d5e61'
  primary: '#000101'
  on-primary: '#ffffff'
  primary-container: '#1a1c1e'
  on-primary-container: '#838486'
  inverse-primary: '#c6c6c9'
  secondary: '#5a5e66'
  on-secondary: '#ffffff'
  secondary-container: '#dfe2ec'
  on-secondary-container: '#60646c'
  tertiary: '#000001'
  on-tertiary: '#ffffff'
  tertiary-container: '#181c22'
  on-tertiary-container: '#81848c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e5'
  primary-fixed-dim: '#c6c6c9'
  on-primary-fixed: '#1a1c1e'
  on-primary-fixed-variant: '#454749'
  secondary-fixed: '#dfe2ec'
  secondary-fixed-dim: '#c3c6d0'
  on-secondary-fixed: '#181c22'
  on-secondary-fixed-variant: '#43474e'
  tertiary-fixed: '#e0e2eb'
  tertiary-fixed-dim: '#c4c6cf'
  on-tertiary-fixed: '#181c22'
  on-tertiary-fixed-variant: '#43474e'
  background: '#fcf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  border-hairline: '#EBEBED'
  surface-elevated: '#F5F5F7'
  sage-green: '#5FBF95'
  terracotta: '#D9736B'
  muted-gold: '#C9A227'
  muted-indigo: '#7C8CE0'
  silver-accent: '#9498A0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  data-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  data-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  sidebar-width: 240px
  max-content-width: 1360px
---

## Brand & Style

The design system is an "Investor-Grade" light mode implementation that prioritizes clarity, mathematical precision, and an institutional aesthetic. It shifts from the "dark-mode depth" of the original system to a **Minimalist / Corporate Modern** look that feels like high-end financial stationery—crisp, structured, and profoundly legible.

By moving away from the saturated "fintech teal" and neon gradients common in consumer apps, this system communicates maturity and reliability. It uses a "Paper-on-Metal" philosophy where depth is not created by shadows, but by 1px hairlines and subtle tonal shifts between the base background and the surface containers.

**Emotional Response:**
- **Institutional Trust:** A clean, airy environment that mimics premium banking portals.
- **Data Clarity:** High-contrast typography on off-white surfaces ensures maximum readability.
- **Engineering Precision:** Tight grids and hairline dividers suggest a tool built for accuracy.
- **Sophistication:** A desaturated, earthy data palette that feels professional rather than playful.

## Colors

The palette is engineered to provide a high-contrast experience without the harshness of pure white (#FFFFFF) on pure black. 

- **Foundation:** The base background is `#FAFAFA`, providing a soft, matte canvas. 
- **Surface Strategy:** Content lives on `#FFFFFF` cards. To provide structure without heavy shadows, cards use a 1px hairline border of `#EBEBED`.
- **Elevated States:** Functional areas like sidebars, inactive segments, or nested containers use `#F5F5F7` to provide a clear visual "step down" or "recess" from the primary surface.
- **Typography Tiers:** Primary text (`#1A1C1E`) provides maximum legibility, while secondary (`#60646C`) and tertiary (`#8E9199`) tones manage the hierarchy of supporting information.
- **Data Accents:** The palette uses a specific desaturated range to ensure data points are distinguishable but not distracting. **Sage Green** is reserved for positive movement, **Terracotta** for liabilities/dues, while **Gold** and **Indigo** handle categorization.

## Typography

**Inter** is utilized for its utilitarian clarity. The "engineered" feel of this design system is largely achieved through strict typographic rules.

- **Tabular Numbers:** All financial data, balances, and counts MUST use tabular figures (`tnum`). This ensures decimal points and digits align vertically in lists and tables, facilitating rapid scanning.
- **Visual Weight:** Values and amounts use a `600` weight to emphasize their importance, while labels and descriptions use a `400` weight to recede.
- **All-Caps Labels:** Section headers and meta-data labels use `label-caps` with increased letter spacing (+0.04em) to create a distinct visual "header" style that contrasts with the standard body text.
- **Scaling:** On mobile devices, `display-lg` should be reduced to `28px` to maintain layout integrity.

## Layout & Spacing

The design system operates on a strict **8px base unit** to ensure mathematical consistency across all viewports.

**Grid Philosophy:**
- **The Container:** Content is never allowed to stretch edge-to-edge on desktop. It is centered within a **1360px max-width** container to maintain comfortable line lengths and information density.
- **Sidebar:** A persistent **240px** sidebar provides navigation. In light mode, it uses the `#FAFAFA` base background but is separated from the main content by a 1px vertical hairline divider (`#EBEBED`).
- **Standard Spacing:**
  - **Card Padding:** Standardized at 24px (`lg`).
  - **Gutters:** 20px gaps between primary layout cards.
- **Responsive Behavior:** 
  - **Desktop:** 12-column fluid grid within the max-width.
  - **Tablet:** 16px margins, cards stack or condense into 2 columns.
  - **Mobile:** 12px margins, single-column stack only.

## Elevation & Depth

This design system rejects traditional shadows in favor of **Tonal Layering** and **Hairline Precision**. This creates a "flat but layered" look common in high-end financial software.

- **Surface Levels:** 
  - **L0 (Base):** `#FAFAFA` — The canvas for the application.
  - **L1 (Surface):** `#FFFFFF` — All primary cards and content areas.
  - **L2 (Elevated):** `#F5F5F7` — Used for active states, nested containers, or secondary functional blocks.
- **The Hairline:** Every card, button, and input field is defined by a 1px border. In light mode, this is `#EBEBED`. This border replaces shadows as the primary method of defining shape.
- **Subtle Highlights:** For primary interactive elements (like buttons), a 1px white inner border on the top edge may be used to suggest a very slight bevel or "brushed" edge.

## Shapes

The shape language is "Soft-Mechanical." It uses moderate rounding to feel modern and accessible while maintaining enough structure to appear professional.

- **Standard Radius (0.5rem / 8px):** Applied to all cards, primary action buttons, and input fields.
- **Small Elements (0.25rem / 4px):** Used for tags, progress bars, and small checkboxes.
- **Interactive Pills:** Segmented controls and status badges use a fully rounded "pill" shape to distinguish them from structural, rectangular layout cards.

## Components

### Buttons
- **Primary:** Dark fill (`#1A1C1E`) with white text. 8px radius.
- **Secondary:** White fill (`#FFFFFF`) with a 1px `#EBEBED` border and `#1A1C1E` text.
- **Ghost:** No fill, secondary text color (`#60646C`), highlighting to `#F5F5F7` on hover.

### Segmented Controls
- Used for switching views (e.g., "Monthly / Yearly").
- A container with `#F5F5F7` background and 8px radius. The active segment is a `#FFFFFF` white pill with a hairline border that appears to slide behind the text.

### Stat Cards
- Layout-critical components. 24px padding.
- Label in `label-caps` (secondary text).
- Large value in `data-lg` (primary text).
- Trend indicators (sage green for up, terracotta for down) are placed in the bottom right or immediately following the value.

### Input Fields
- White background with a 1px `#EBEBED` border. 
- On focus, the border shifts to a darker `#9498A0` (silver accent). 
- Placeholder text uses the tertiary color (`#8E9199`).

### Data Visualization
- **Donut Charts:** Thin 12px–14px stroke weight. Use the muted palette only.
- **Sparklines:** 1.5px stroke width. No fills. Use Muted Indigo or Silver.
- **Progress Bars:** 4px height. Track is `#F5F5F7`, fill is a muted brand color.

### Tables & Lists
- **Headers:** `label-caps` in secondary text, vertically aligned with a 1px border at the bottom.
- **Rows:** 1px hairline dividers. No "Zebra" striping; use a subtle `#F5F5F7` background tint on hover.
- **Alignment:** Numerical data is always right-aligned to maintain tabular figure integrity.