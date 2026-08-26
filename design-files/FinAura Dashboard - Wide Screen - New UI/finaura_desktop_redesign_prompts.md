# FinAura — Desktop Redesign Blueprint
### Turning the wide-screen web view into a billion-dollar fintech experience

Your mobile view already nails the FinAura brand. The desktop view fails for one core reason: it was built as "mobile UI stretched wide" rather than designed for the extra horizontal real estate. A premium fintech desktop app (Ramp, Mercury, Brex, Linear) uses width for **density, hierarchy, and calm whitespace** — not bigger versions of mobile cards.

This document gives you a full design system plus a screen-by-screen rebuild prompt you can hand directly to a designer, or paste into an AI design tool (v0, Claude Design, Figma AI, Galileo, etc.) one screen at a time.

---

## 1. Global Design System (apply to every screen)

**Brand foundation (carried over from your identity work):**
- Wordmark: "FinAura" + tagline "ELEVATE YOUR FINANCES"
- Icon: metallic silver shield with an upward arrow/"A" structure and a small star detail
- Reference bar: Apple / Stripe / Linear / Vercel / Ramp level of polish
- Avoid: neon, glassmorphism, heavy gradients, generic "fintech teal-on-white SaaS template" look

**Base theme — Dark mode primary, Light mode secondary**
- Background base: `#0B0C0E` (near-black, not pure black)
- Surface / card background: `#141518` with a 1px `#232428` hairline border (no drop shadows — use border + subtle inner highlight instead)
- Elevated surface (modals, popovers): `#1B1C20`
- Primary accent: brushed silver gradient `#C9CDD3 → #9498A0` for icons/highlights, used sparingly
- Data accent colors (muted, desaturated — never neon):
  - Positive / savings: `#5FBF95` (muted sage green)
  - Negative / dues: `#D9736B` (muted terracotta red)
  - Secondary data 1: `#C9A227` (muted gold, replaces bright orange)
  - Secondary data 2: `#7C8CE0` (muted indigo, replaces bright blue)
  - Tertiary: `#8B8FA3` (slate)
- Text: primary `#F2F2F3`, secondary `#9B9DA6`, tertiary/disabled `#5C5E68`

**If a light theme is kept** (per your Settings toggle): background `#FAFAFA`, surface `#FFFFFF` with `#EBEBED` borders, same muted data palette instead of the current bright teal/green/red — the *saturation*, not the theme, is what reads as "cheap."

**Typography**
- Typeface: Inter or Söhne (fallback: -apple-system) — Inter is free and nearly identical to Stripe/Linear's type
- Numbers/currency: tabular figures, slightly heavier weight (600) than surrounding text — money should feel "engineered," not decorative
- Scale: 12 / 13 / 14 (body) / 16 / 20 / 28 / 36px, with 1.4–1.5 line height on body text
- Letter-spacing: +0.04em on all-caps labels (e.g. "TOTAL SAVINGS")

**Layout grid (this is the #1 fix for the desktop view)**
- Max content width: 1280–1360px, centered, with generous side margins on ultra-wide monitors — never let cards stretch edge-to-edge on a 1920px screen
- Sidebar: fixed 240px, not the current ~320px — it's currently oversized relative to content
- Base spacing unit: 8px. Card padding: 24px. Gap between cards: 16–20px, never less than 12px
- Replace the current "one huge hero banner + one huge white card" structure with a **responsive grid of smaller, purposeful cards** (see per-screen breakdowns) — the emptiness on Cashback and the awkward single-column stack on Dashboard both come from not using a grid

**Components**
- Buttons: 8px radius, no gradients, solid fill with a subtle 1px lighter top border for depth (mimics brushed metal edge)
- Icons: 1.5px stroke weight (Lucide/Phosphor style), never filled/blocky
- Progress/allocation bars: 4px height, rounded, muted fill colors from palette above, track color `#232428`
- Sidebar active state: instead of a solid teal block, use a thin 2px left border in silver/accent + subtle background tint `#1B1C20` — solid fills read as "admin dashboard template," a border accent reads as premium
- Remove the floating pink/purple gradient FAB (settings icon) — replace both bottom-right buttons with a single dark, bordered icon button; the pink-purple orb clashes with the entire brand palette

**Motion**
- 150–200ms ease-out on all hover/active states
- Numbers animate with a quick count-up (300ms) on load, not an instant snap
- No bouncy/springy easing anywhere — premium fintech motion is fast and flat

---

## 2. Screen: Dashboard

**What's wrong now:** a very tall, oversized gradient hero banner dominates the top; the net-worth card floats awkwardly centered with lots of dead space on either side; month navigator cards at the bottom feel like a disconnected second app.

**Rebuild structure (top to bottom):**
1. **Header row** (not a full-width colored banner): page title "Dashboard" left-aligned in white/near-black text on the base background, small utility icons (export, item count) right-aligned. No blue gradient band.
2. **KPI row** — 3–4 equal-width compact stat cards side by side (not 2 huge ones): Total Savings, Outstanding Dues, Net Worth Change (%, new), Active Cards. Each card: label in small caps muted gray, large tabular number below, tiny trend arrow + % change in the corner (new — currently there's no sense of trend/direction).
3. **Two-column main grid** (this is the biggest structural change — stop stacking everything in one center column):
   - **Left (60%):** Net worth donut chart card, same data as now (Bank/FD/RD/Dues/Cards) but redrawn with the muted palette, thinner donut ring (12–14px stroke), legend as a clean table with right-aligned amounts, allocation bars below using the muted colors and thinner track.
   - **Right (40%):** A vertical "This Month" card — closing bank balance, dues this month, paid amount — replacing the awkward bottom month-navigator strip. Include a compact 6-month sparkline of net worth trend (new element, gives investor-grade feel).
4. Remove the bottom full-width "August 2026 <> " navigator bar entirely — fold its two stat cards into the right column card described above, with a small inline month-switcher (‹ August 2026 ›) as a header inside that single card, not a separate page-width component.

**Design prompt to paste into your tool:**
> Design a dark-mode fintech dashboard, background near-black (#0B0C0E), no colored hero banners. Top row: page title + 4 compact equal stat cards (Total Savings, Outstanding Dues, Net Worth Change %, Active Cards) with muted sage-green and terracotta-red accents only, no bright teal or pink. Below: two-column grid — left, a thin-stroke donut chart (12px ring) breaking net worth into Bank/FD/RD/Dues/Cards with a clean right-aligned legend table and slim allocation bars; right, a single card showing this month's closing balance, dues, and a 6-month net-worth sparkline, with a small inline month switcher in its header. Typography: Inter, tabular numbers, 600 weight for figures. Cards use 1px hairline borders (#232428) instead of shadows. Style reference: Ramp, Mercury, Linear.

---

## 3. Screen: Cards

**What's wrong now:** three flat top numbers with no visual separation from the tabs below; each card row is a plain list item with badge pills that feel like Bootstrap defaults; "Pay Later Services" section has huge empty space around one item.

**Rebuild structure:**
1. **Header:** "Cards" title + 3 utility icons kept, but move the 3 top stats (Total Limit, Outstanding, Card Count) into a single slim summary bar directly under the header — smaller, secondary in visual weight to the tabs, since the cards themselves are the content.
2. **Tabs** ("Card Balance / Card Expenses / Get a Card") restyled as a proper segmented control with a moving pill background, not just an underline — feels more "product," less "browser default."
3. **Card list → Card grid.** This is the key fix: stop listing credit cards as plain rows. Render each card as a **compact visual card tile** (2–3 per row) that echoes your actual physical card designs — dark matte tile, brushed-silver network logo mark in a corner, masked number, and a slim data footer (Limit / Due / Cashback) inside the tile rather than as separate badge pills below the text. This turns a boring list into something that visually sells the product.
4. **Pay Later Services**: keep as its own section header, but if there's only one item, don't leave a full-width mostly-empty row — cap the section's card width to content size (e.g., a 320px card) rather than stretching to the full container.

**Design prompt to paste into your tool:**
> Design a dark-mode "My Cards" screen for a premium fintech app. Replace plain list rows with a grid of 2–3 visual card tiles per row, each styled like a real matte-black metal credit card (rounded 12px corners, subtle brushed texture, small silver network mark top-right, masked card number in monospace, and a 2-row data footer showing Limit / Due / Cashback in muted colors — sage green for cashback, terracotta for due). Above the grid, a slim single-line summary bar (Total Limit, Outstanding, Card Count) in small caps muted text, then a segmented pill-style tab control (Card Balance / Card Expenses / Get a Card) with a sliding active-state background. No bright orange/purple badges — keep all accent colors muted and consistent with a near-black (#0B0C0E) canvas. Style reference: Apple Card app, Ramp corporate cards page.

---

## 4. Screen: Banks & Investments

**What's wrong now:** four big square stat tiles with huge internal empty space (icon, number, and two lines of text rattling around in an oversized box); "Returns & Gains" and "Asset Breakdown" feel like afterthoughts stacked below with inconsistent card widths.

**Rebuild structure:**
1. **Hero number:** keep "Total Net Worth" centered but shrink its vertical padding — it currently has disproportionate breathing room versus the rest of the page.
2. **Stat tiles → dense 4-across row**, each tile roughly half its current height: icon + label top row, number bottom row, sub-label (e.g. "3 accounts") as a small trailing badge instead of a separate centered line. This alone removes most of the "empty box" feeling.
3. **Tabs** (Overview / Accounts / Invest / Txns): same segmented-pill treatment as the Cards screen for visual consistency across the app.
4. **Returns & Gains** and **Asset Breakdown**: place these two **side by side** in a two-column row instead of full-width stacked blocks — "Returns & Gains" is short content and doesn't need the full container width; pairing it with the allocation bars balances the page and removes dead space.
5. Add a small **institution-level breakdown list** below (which bank holds what) — currently missing, and it's the kind of granular trust-building detail that separates a "budgeting app" from a "financial operating system."

**Design prompt to paste into your tool:**
> Design a dark-mode "Banks & Investments" overview for a premium fintech app. Centered Total Net Worth figure with tight vertical padding. Below, a dense 4-column row of compact stat tiles (Bank Balance, Fixed Deposits, Recurring Deposits, Mutual Funds) — icon and label on one line, large number below, small trailing count badge, minimal internal padding so tiles read as data-dense rather than empty. Segmented pill tabs (Overview/Accounts/Invest/Txns) matching the Cards screen. Below the tabs, a two-column row: left a "Returns & Gains" card with a single highlighted metric in sage green, right an "Asset Breakdown" card with thin allocation bars in muted blue/gold/green. Underneath, a compact list of individual bank/institution rows with logos, account type, and balance. Near-black background, hairline borders, Inter typography, tabular numbers.

---

## 5. Screen: Cashback Tracker

**What's wrong now:** this is the emptiest screen — one giant purple gradient banner, one thin list row, one big teal button, and then a huge void of unused white space below. It looks unfinished next to the other tabs.

**Rebuild structure:**
1. **Replace the full-bleed purple gradient banner** with a compact stat card consistent with the Dashboard KPI style — "Total Cashback Earned" as a label + large number, sitting alongside 2–3 *new* supporting stats to fill the row meaningfully: "This Month," "Best Card for Cashback," "Pending Cashback." (You need more than one number here to justify a dedicated screen.)
2. **"+ Add Cashback"** button: shrink from full-width to a right-aligned standard button in the section header ("History" + button on the same row) — a full-width button for a single action reads as a placeholder, not a finished screen.
3. **History list → History table/cards with more structure**: each entry should show source card, category icon, date, and amount, styled like the card tiles on the Cards screen for visual consistency, arranged as a 2-column grid if there are multiple entries, single column only when sparse.
4. **Fill the empty lower half** with a small "Cashback by Card" bar chart or ranked list (which card earns you the most) — this is a natural, valuable addition to a finance app and solves the empty-screen problem with real content rather than padding.

**Design prompt to paste into your tool:**
> Design a dark-mode "Cashback Tracker" screen for a premium fintech app — no purple gradient banners. Top row: 3–4 compact stat cards (Total Cashback Earned, This Month, Best Card, Pending) styled identically to the app's Dashboard KPI cards. Below, a "History" section header with a small right-aligned "+ Add Cashback" button (not full width), followed by a 2-column grid of transaction entry cards (card name, category icon, date, muted-gold amount). Below that, add a horizontal ranked bar list titled "Cashback by Card" showing which card earns the most, using thin muted-gold bars. Near-black background, hairline borders, no bright purple/teal gradients, Inter typography.

---

## 6. Screen: Settings

**What's wrong now:** functionally fine, but visually generic — plain gray pill toggle buttons (Light/Dark, AI Provider) look like unstyled HTML buttons; profile row has a lot of empty horizontal space; sections aren't visually differentiated beyond a bold caption.

**Rebuild structure:**
1. **Profile card:** keep avatar + name + edit icon, but add a subtitle line (email or plan tier, e.g. "Free Plan" / "FinAura Premium") to use the empty horizontal space meaningfully and reinforce the monetization tiers from your product plan.
2. **Toggle groups (Theme, AI Provider, Currency):** restyle from flat gray rectangular buttons to the same segmented-pill control used elsewhere for Light/Dark, and a proper dropdown-with-icon for AI Provider and Currency (4 flat buttons in a row currently looks like a debug/test UI) — consider AI Provider as a dropdown or radio-card list with provider logos instead of 4 identical gray boxes.
3. **Section cards:** add a subtle icon next to each section title (Appearance, AI Assistant, Display Currency, Backup & Restore) consistently sized/colored in silver, and tighten vertical padding so sections feel like a cohesive settings panel rather than separately-spaced blocks.
4. Top-right utility icons + "Landing Page" button + the black circular avatar/menu: align these to the same 8px grid and give the "Landing Page" button the same button styling system as the rest of the app (currently a bright blue-purple gradient pill that doesn't match anything else on screen).

**Design prompt to paste into your tool:**
> Design a dark-mode Settings screen for a premium fintech app. Profile card with avatar, name, and a plan-tier subtitle (e.g. "FinAura Premium"), edit icon right-aligned. Below, consistent section cards (Appearance, AI Assistant Settings, Display Currency, Backup & Restore) each with a small silver icon next to the title. Replace flat gray toggle buttons with a segmented pill control for Light/Dark, and a radio-card list (with subtle provider logos) for AI Provider instead of four identical gray buttons. Currency picker as a clean dropdown with a leading currency symbol icon. Top-right utility buttons restyled to match the app's single button system — remove the mismatched blue-purple gradient button. Near-black background (#0B0C0E), hairline card borders, Inter typography, muted silver accents only.

---

## 7. Quick priority order if you can only fix a few things first

1. **Kill the bright gradients** (blue Dashboard banner, purple Cashback banner, pink/purple FAB) — these single-handedly clash with your black/silver brand and are the fastest visual win.
2. **Switch every list row to a grid of tiles** on Cards and Cashback — turns "empty/list-y" into "dense/premium" instantly.
3. **Unify one button system and one segmented-tab system** app-wide — right now each screen seems to invent its own button and toggle style.
4. **Cap max content width** so cards don't stretch edge-to-edge on wide monitors — add real side margins.
5. **Swap all bright/saturated data colors for the muted palette** in section 1 — this alone will make every chart and badge look "designed" instead of "default."
