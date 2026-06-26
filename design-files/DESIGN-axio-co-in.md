# Design System Inspired by axio

> Auto-extracted from `https://www.axio.co.in/` on 2026-06-26

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

The hero section leads with "Shop easy.".

**Key Characteristics:**
- Onest as the heading font
- Onest as the body font for all running text
- Heading weight 700, letter-spacing -0.64px
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#2d62ff` used for CTAs and brand highlights
- 1 shadow level(s) detected — tinted shadows
- Rounded corners (50px+) creating a friendly, approachable feel
- Tags: light, rounded, colorful, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#2d62ff`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#539600`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#f8fafc`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#000000`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#697586`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#262626`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#262626` | `--palette-1` | block | large | text-light |
| 2 | `#f8fafc` | `--palette-2` | section | large | text-dark |
| 3 | `#1a1a1a` | `--palette-3` | block | large | text-light |
| 4 | `#000000` | `--palette-4` | button | medium | text-light |
| 5 | `#d8e1ce` | `--palette-5` | button | medium | text-dark |
| 6 | `#daf180` | `--palette-6` | button | small | text-dark |
| 7 | `#2d62ff` | `--palette-7` | text-accent | small | text-light |
| 8 | `#202939` | `--palette-8` | text-accent | small | text-light |
| 9 | `#376400` | `--palette-9` | text-accent | small | text-light |
| 10 | `#697586` | `--palette-10` | text-accent | small | text-light |
| 11 | `#539600` | `--palette-11` | text-accent | small | text-light |
| 12 | `#6ec800` | `--palette-12` | text-accent | small | text-dark |

## 3. Typography Rules

- **Heading Font:** `Onest`, sans-serif
- **Body Font:** `Onest`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | Onest | 64px | 700 | 70.4px | -0.64px |
| H2 | Onest | 57.6px | 700 | 69.12px | -0.64px |
| H3 | Onest | 48px | 500 | 57.6px | -0.64px |
| H4 | Onest | 36px | 700 | 50.4px | -0.64px |
| Body | Plus Jakarta Sans | 20px | 400 | 30px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `64px` | headings |
| H1 | `57.6px` | headings |
| H2 | `56px` | headings |
| H3 | `48px` | headings |
| H4 | `36px` | headings |
| Body L | `25px` | body / supporting text |
| Body | `24px` | body / supporting text |
| Small | `20px` | body / supporting text |
| XS | `18px` | body / supporting text |
| Caption | `16px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #ffffff;
  border-radius: 0px;
  padding: 20px 20px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #539600;
  border-radius: 0px;
  padding: 20px 20px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
```

### Pill Button

```css
.btn-pill {
  background: #ffffff;
  color: #376400;
  border-radius: 128px;
  padding: 20px 28px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #ffffff;
  color: #376400;
  border-radius: 32px;
  padding: 8px 20px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
```

### Pill Button 2

```css
.btn-pill-2 {
  background: #000000;
  color: #ffffff;
  border-radius: 128px;
  padding: 20px 28px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
```

### Ghost Button 2

```css
.btn-ghost-2 {
  background: transparent;
  color: #000000;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
```

### Card

```css
.card {
  background: #262626;
  border-radius: 64px;
  padding: 40px;
}
```

## 5. Layout Principles

- **Base spacing unit:** `8px` — use multiples (16px, 24px, 32px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `8px` | element |
| spacing-2 | `25px` | card |
| spacing-3 | `20px` | element |
| spacing-4 | `16px` | element |
| spacing-5 | `64px` | section |
| spacing-6 | `128px` | section |
| spacing-7 | `24px` | card |
| spacing-8 | `32px` | card |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-card | `50px` | card |
| radius-card | `20px` | card |
| radius-card | `32px` | card |
| radius-card | `16px` | card |
| radius-pill | `128px` | pill |
| radius-card | `36px` | card |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(61, 65, 73, 0.5) 0px 0px 1px 0px inset, rgba(37, 39, 43, 0.8) 0px 0px 3px 0...` | Cards, subtle elevation |

> **Note:** This site uses chromatic (color-tinted) shadows rather than pure black — this is a deliberate brand choice that adds warmth to elevation.

## 7. Do's and Don'ts

### Do
- Use `#ffffff` as the primary background color
- Use `Onest` for all headings and `Onest` for body text
- Use `#2d62ff` as the single dominant accent/CTA color
- Maintain `8px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`50px`+) consistently for all interactive elements
- Embrace bold color combinations — playful energy is the point
- Apply the shadow system for elevation — use the extracted shadow values
- Use weight 700 for headings to match the brand's typographic voice

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Onest/Onest with generic alternatives
- Don't use irregular spacing — stick to 8px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use pure black (#000000) for text — use `#000000` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 8px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #000000
Accent:      #2d62ff
Secondary:   #539600
Border:      #262626
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `Onest` heading in `#000000`, and a `#2d62ff` CTA button with 128px radius."
2. "Create a pricing card using background `#f8fafc`, border `#262626`, `Onest` for text, and 24px padding."
3. "Design a navigation bar — `#ffffff` background, `#000000` links, `#2d62ff` for active state."
4. "Build a feature grid with 3 columns, 24px gap, each card using the card component style."
5. "Create a footer with `#000000` background, `#ffffff` text, and 16px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 41 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--base-color-neutral--white` | `#fff` |
| `--base-color-neutral--black` | `#000` |
| `--base-color-brand--blue-dark` | `#080331` |
| `--base-color-brand--blue` | `#2d62ff` |
| `--base-color-brand--blue-light` | `#d9e5ff` |
| `--base-color-brand--pink-light` | `#ffaefe` |
| `--base-color-brand--pink` | `#dd23bb` |
| `--base-color-brand--pink-dark` | `#3c043b` |
| `--base-color-neutral--neutral-lightest` | `#eee` |
| `--base-color-neutral--neutral-lighter` | `#ccc` |
| `--base-color-neutral--neutral-light` | `#aaa` |
| `--base-color-neutral--neutral` | `#666` |
| `--base-color-neutral--neutral-dark` | `#444` |
| `--base-color-neutral--neutral-darker` | `#222` |
| `--base-color-neutral--neutral-darkest` | `#111` |
| `--base-color-system--success-green` | `#cef5ca` |
| `--base-color-system--success-green-dark` | `#114e0b` |
| `--base-color-system--warning-yellow` | `#fcf8d8` |
| `--base-color-system--warning-yellow-dark` | `#5e5515` |
| `--base-color-system--error-red` | `#f8e4e4` |
| `--base-color-system--error-red-dark` | `#3b0b0b` |
| `--base-color-system--focus-state` | `#2d62ff` |

### Typography Variables

| Variable | Value |
|---|---|
| `--text-color--text-alternate` | `var(--base-color-neutral--white)` |
| `--text-color--text-secondary` | `var(--base-color-neutral--neutral-darker)` |
| `--text-color--text-success` | `var(--base-color-system--success-green-dark)` |
| `--text-color--text-error` | `var(--base-color-system--error-red-dark)` |
| `--text-color--text-warning` | `var(--base-color-system--warning-yellow-dark)` |
| `--text-color--text-primary` | `var(--base-color-neutral--black)` |

### Other Variables

| Variable | Value |
|---|---|
| `--link-color--link-primary` | `var(--base-color-brand--blue)` |
| `--background-color--background-primary` | `var(--base-color-neutral--black)` |
| `--background-color--background-success` | `var(--base-color-system--success-green)` |
| `--border-color--border-primary` | `var(--base-color-neutral--neutral-lightest)` |
| `--background-color--background-alternate` | `var(--base-color-neutral--white)` |
| `--background-color--background-secondary` | `var(--base-color-brand--blue)` |
| `--background-color--background-tertiary` | `var(--base-color-brand--pink)` |
| `--background-color--background-error` | `var(--base-color-system--error-red)` |
| `--border-color--border-alternate` | `var(--base-color-neutral--neutral-darker)` |
| `--background-color--background-warning` | `var(--base-color-system--warning-yellow)` |
| `--border-color--border-secondary` | `var(--base-color-brand--blue)` |
| `--link-color--link-secondary` | `var(--base-color-neutral--black)` |
| `--link-color--link-alternate` | `var(--base-color-neutral--white)` |
