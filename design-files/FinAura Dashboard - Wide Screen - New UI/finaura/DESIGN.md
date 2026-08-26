---
name: FinAura
colors:
  surface: '#121415'
  surface-dim: '#121415'
  surface-bright: '#38393a'
  surface-container-lowest: '#0c0e0f'
  surface-container-low: '#1a1c1d'
  surface-container: '#1e2021'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333536'
  on-surface: '#e2e2e3'
  on-surface-variant: '#c6c6ca'
  inverse-surface: '#e2e2e3'
  inverse-on-surface: '#2f3132'
  outline: '#909094'
  outline-variant: '#45474a'
  surface-tint: '#c7c6c9'
  primary: '#c7c6c9'
  on-primary: '#303033'
  primary-container: '#0b0c0e'
  on-primary-container: '#7a7a7c'
  inverse-primary: '#5e5e61'
  secondary: '#c7c6ca'
  on-secondary: '#2f3033'
  secondary-container: '#46464a'
  on-secondary-container: '#b5b4b9'
  tertiary: '#c7c6cb'
  on-tertiary: '#2f3034'
  tertiary-container: '#0b0c10'
  on-tertiary-container: '#7a7a7f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e3e2e5'
  primary-fixed-dim: '#c7c6c9'
  on-primary-fixed: '#1b1c1e'
  on-primary-fixed-variant: '#464749'
  secondary-fixed: '#e3e2e6'
  secondary-fixed-dim: '#c7c6ca'
  on-secondary-fixed: '#1b1b1f'
  on-secondary-fixed-variant: '#46464a'
  tertiary-fixed: '#e3e2e7'
  tertiary-fixed-dim: '#c7c6cb'
  on-tertiary-fixed: '#1a1b1f'
  on-tertiary-fixed-variant: '#46464b'
  background: '#121415'
  on-background: '#e2e2e3'
  surface-variant: '#333536'
  border-hairline: '#232428'
  sage-green: '#5FBF95'
  terracotta-red: '#D9736B'
  muted-gold: '#C9A227'
  muted-indigo: '#7C8CE0'
  slate-gray: '#8B8FA3'
  text-secondary: '#9B9DA6'
  text-tertiary: '#5C5E68'
  silver-gradient-start: '#C9CDD3'
  silver-gradient-end: '#9498A0'
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
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
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

The design system for this product is rooted in the "Investor-Grade" aesthetic—a high-polish, functional style that prioritizes data density, visual calm, and structural precision. It targets a sophisticated user base that values clarity over decoration, moving away from generic consumer fintech tropes (vibrant neons and soft glassmorphism) toward a more institutional, engineering-led feel.

The visual direction is **Corporate / Modern** with a lean toward **Minimalism**. It utilizes a "brushed-metal" philosophy, where depth is achieved through hairline borders and subtle tonal shifts rather than heavy drop shadows. The interface should feel like a high-end physical tool—matte, precise, and durable.

**Emotional Response:**
- **Reliability:** Built on a systematic 8px grid.
- **Precision:** Heavy use of tabular figures and clear hierarchy.
- **Sophistication:** A muted, desaturated palette that communicates maturity.
- **Calm:** Generous use of internal card padding and controlled content widths.

## Colors

The color strategy centers on a deep, near-black foundation (`#0B0C0E`) to reduce eye strain and provide a canvas where data points can stand out without appearing fluorescent. 

- **Surfaces:** We use a three-tier elevation system. The background is the base, cards sit on top at `#141518`, and temporary overlays (modals/tooltips) use `#1B1C20`.
- **Accents:** Instead of "fintech teal," we utilize a palette of muted, earthy tones. **Sage Green** represents growth and positive trends, while **Terracotta Red** signifies dues or negative movement. **Muted Gold** and **Indigo** are used for secondary data categorization to ensure variety without breaking the professional tone.
- **Brushed Silver:** This is the primary brand accent, often applied as a subtle linear gradient to represent premium "metal" finishes on icons or primary action states.
- **Borders:** A consistent hairline border (`#232428`) is mandatory for all containers to define shape in the absence of shadows.

## Typography

Typography is the backbone of this design system's "engineered" feel. We use **Inter** exclusively for its neutral, systematic clarity and excellent legibility at small sizes.

**Key Rules:**
- **Tabular Figures:** All currency and numerical data must use `tnum` (tabular figures) settings. This ensures that columns of numbers align perfectly, allowing for instant scanning of financial data.
- **Hierarchy:** We use `label-caps` for section headers and KPI titles to create a distinct visual break from data.
- **Weight:** Figures and headlines are set to `600` (Semi-Bold) to emphasize the "weight" of the assets being managed, while body text remains at `400` for breathability.
- **Mobile Scaling:** For screens smaller than 768px, `display-lg` should scale down to `28px` to prevent layout breaking.

## Layout & Spacing

This design system employs a strict **8px grid** to maintain mathematical harmony across all components.

**Layout Model:**
- **Max Content Width:** On desktop, content is capped at **1360px** and centered. This prevents "ribboning" (text lines becoming too long) on ultra-wide monitors.
- **The Sidebar:** A fixed **240px** sidebar provides persistent navigation. Its background is integrated into the base background, using a 2px silver border for the active state rather than a blocky fill.
- **Grid System:** A 12-column fluid grid is used within the max-width container. 
  - **KPIs:** Usually span 3 columns each (4-across).
  - **Main Content:** Often split into a 60/40 or 70/30 two-column layout to show primary data (charts/lists) alongside secondary insights (trends/summaries).
- **Adaptivity:** 
  - **Desktop:** 24px card padding, 20px gaps between cards.
  - **Tablet:** 16px card padding, 12px gaps.
  - **Mobile:** 12px margins, single-column stack.

## Elevation & Depth

In line with the high-polish fintech aesthetic, this system avoids traditional drop shadows which can look "muddy" on near-black backgrounds. Instead, we use **Tonal Layering** and **Hairline Outlines**.

- **Surface Definition:** Depth is communicated through color. The base is the darkest, and as elements "rise" toward the user, they become slightly lighter (from `#0B0C0E` to `#141518`).
- **Inner Highlights:** To mimic a beveled metal edge, buttons and primary cards may feature a 1px inner top border that is slightly lighter than the surface color.
- **Contrast Borders:** Every card and interactive element uses a 1px border (`#232428`). This provides sharp definition and a "blueprint" feel.
- **Interactions:** Hover states should not use shadows; instead, increase the border brightness or apply a subtle background tint (`#1B1C20`) to indicate interactivity.

## Shapes

The shape language is "Soft-Mechanical." We use a conservative corner radius to maintain a professional, organized look while avoiding the harshness of 90-degree angles.

- **Standard Elements:** Buttons, input fields, and small tags use a **0.25rem (4px - 8px)** radius.
- **Containers:** Large cards and visual tiles use a **0.5rem (8px)** radius to provide a clear frame for content.
- **Specialty Shapes:** 
  - **Pills:** Segmented controls and status badges use a fully rounded (pill) shape to distinguish them from structural layout cards.
  - **Progress Bars:** These use a **4px** height with rounded ends for a sleek, modern appearance.

## Components

### Buttons & Controls
- **Primary Button:** Brushed silver gradient background with dark text. 8px radius.
- **Secondary Button:** Surface color (`#141518`) with a hairline border and white text.
- **Segmented Controls:** Used for tabs. A pill-shaped dark container where the active state is a lighter gray sliding pill.

### Card Tiles
- **Matte Tiles:** For "My Cards" or bank accounts, use a matte-black tile (`#141518`) with a subtle brushed texture. Include a small silver logo in the top-right and a data footer at the bottom.
- **Stat Cards:** Compact, data-dense blocks. Label in `label-caps`, value in `data-lg`. Trend indicators (arrows) are tucked into the corner in sage green or terracotta red.

### Input Fields
- **Fields:** Dark background, hairline border. On focus, the border shifts to silver. Text is `body-md`.
- **Dropdowns:** Use a clean chevron icon. List items follow the same elevation rules as modals.

### Data Visualization
- **Donut Charts:** Use a thin 12px–14px ring. Colors must follow the muted data palette.
- **Sparklines:** Used inside stat cards to show 6-month trends. 1.5px stroke weight, no fill, muted indigo or silver.
- **Progress Bars:** 4px height, with a background track of `#232428`.

### Lists & Tables
- **Standard List:** Rows are separated by 1px hairline dividers. No alternating row colors; use hover tints for interactivity.
- **Tables:** Use `label-caps` for headers. All numerical columns are right-aligned to ensure the tabular figures are easy to compare.