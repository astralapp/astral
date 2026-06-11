---
name: Astral
description: Organize your GitHub stars with tags, notes, smart filters, and fast search.
colors:
  signal-green: "#10b981"
  signal-green-strong: "#059669"
  signal-green-deep: "#047857"
  signal-green-wash: "#d1fae5"
  signal-green-ink: "#065f46"
  rail: "#101828"
  rail-soft: "#1e2939"
  canvas: "#f9fafb"
  surface: "#ffffff"
  void: "#000000"
  ink: "#030712"
  ink-body: "#364153"
  ink-dim: "#6a7282"
  ink-faint: "#99a1af"
  paper: "#d1d5dc"
  tag-indigo: "#615fff"
  tag-wash: "#e0e7ff"
  tag-ink: "#372aac"
  danger: "#e7000b"
  warning: "#f0b100"
  success: "#008236"
typography:
  display:
    fontFamily: "Orbitron, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.25
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.05em"
  micro:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: "0.875rem"
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-base:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  button-base-hover:
    backgroundColor: "{colors.canvas}"
  button-primary:
    backgroundColor: "{colors.signal-green-strong}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  button-primary-hover:
    backgroundColor: "{colors.signal-green-deep}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  chip-tag:
    backgroundColor: "{colors.tag-wash}"
    textColor: "{colors.tag-ink}"
    rounded: "{rounded.xs}"
    padding: "2px 8px"
  chip-language:
    backgroundColor: "{colors.signal-green-wash}"
    textColor: "{colors.signal-green-ink}"
    rounded: "{rounded.xs}"
    padding: "2px 8px"
---

# Design System: Astral

## 1. Overview

**Creative North Star: "The Star Catalog"**

Astral turns a sprawling, unsearchable pile of GitHub stars into an astronomer's
catalog: a vast sky made findable, taggable, and annotated. The interface is the
catalog room, not the sky. It is built as a three-pane workstation: a permanently
dark navigation rail on the left, a column of star entries in the middle, and a
reading surface (README plus notes) on the right. Nothing competes with the
contents. The chrome holds still so the repos, languages, tags, and notes stay in
focus.

The system is **calm, focused, and fast**. Density is high but never noisy: a
single workhorse typeface (Inter) carries every label, button, and body string;
corners are tight (2-4px); color is rationed. The one saturated hue, Signal
Green, appears only where it means something, on the active filter, the primary
action, the current selection. Everything else is a disciplined gray ramp. The
"astral" identity (the Orbitron wordmark, the Galileo mascot, the "Gaze through
your telescope" search prompt) is a restrained accent carried by copy and one
logo, never a costume applied to the UI.

This system explicitly rejects three things. It is **not cluttered or heavy**:
no dense competing toolbars, no control crowding. It is **not trendy or
over-designed**: no decorative gradients, no gradient text, no glass panels for
their own sake, no bouncy motion. And it is **not childish or toy-like**: the
space theme stays subtle so the tool keeps the trust of developers who live in
it daily.

**Key Characteristics:**

- A permanently dark left rail against light content; depth comes from tonal
  layering first, shadow second.
- One typeface (Inter) for the entire UI; Orbitron is reserved for the wordmark.
- Signal Green is the only saturated color, used for state and primary action.
- Tight radii (2-6px) and hairline borders; quiet, precise controls.
- Keyboard-first: `/` focuses search, `n` toggles notes; the surface rewards speed.
- Full light and dark parity, driven by the OS (`prefers-color-scheme`), with no
  in-app toggle.

## 2. Colors

A disciplined neutral gray system carrying one saturated accent (Signal Green),
with a small reserved vocabulary for tags and machine states.

### Primary

- **Signal Green** (#10b981, `brand-500`): The core brand hue. The accent text on
  dark surfaces (`brand-500` in dark mode), the lit toggle track, the selected
  list-row indicator. Functional, never decorative: it marks what is active.
- **Signal Green Strong** (#059669, `brand-600`): The top navigation bar, primary
  button fills, and brand-colored text in light mode (repo names, active sidebar
  items). The most visible expression of the brand.
- **Signal Green Deep** (#047857, `brand-700`): Primary button hover only.
- **Signal Green Wash / Ink** (#d1fae5 / #065f46, `brand-100` / `brand-800`): The
  language chip in light mode, a pale green field with deep green text.

### Secondary

- **Tag Indigo** (#615fff, `indigo-500`): The single non-green accent, reserved
  exclusively for user tag chips so tags read as distinct from languages and
  brand actions. Light chips use an indigo wash (#e0e7ff) with indigo ink
  (#372aac); dark chips use a 10% indigo fill with `indigo-400` text.

### Tertiary

- **Danger** (#e7000b, `red-600`): Destructive actions (unstar, delete) and error
  toasts. Hover deepens to `red-700`.
- **Warning** (#f0b100, `yellow-500`): The warning button kind. Used sparingly.
- **Success** (#008236, `green-700`): Success toast text on a `green-200` pill.

### Neutral

The neutral ramp is Tailwind v4's default `gray` (OKLCH-native, cool). Roles:

- **Rail** (#101828, `gray-900`): The left navigation rail, which stays dark even
  in light mode. In dark mode the rail softens to **Rail Soft** (#1e2939,
  `gray-800`).
- **Void** (#000000): The dark-mode backdrop of the star-list column.
- **Canvas** (#f9fafb, `gray-50`): The app background and secondary toolbar fill
  in light mode.
- **Surface** (#ffffff): Star rows, inputs, cards, dialogs in light mode.
- **Ink** (#030712, `gray-950`): Strongest text and dark-mode borders.
- **Ink Body** (#364153, `gray-700`): Body copy on light surfaces.
- **Ink Dim / Faint** (#6a7282 / #99a1af, `gray-500` / `gray-400`): Secondary
  text, metadata (star/fork counts), placeholders, disabled, and muted text on
  dark surfaces.
- **Paper** (#d1d5dc, `gray-300`): Hairline borders and dividers in light mode;
  body copy on dark surfaces.

### Named Rules

**The One Green Rule.** Signal Green is the only saturated color in the product
chrome. It is permitted on the active filter, the primary action, the current
selection, and state indicators, nowhere else. Its rarity is what makes "active"
legible at a glance.

**The Dark Rail Rule.** The navigation rail is dark in both themes. It is the
fixed instrument frame of the catalog; it never inverts to match the content.

## 3. Typography

**Display Font:** Orbitron (with `ui-sans-serif, system-ui, sans-serif` fallback)
**Body Font:** Inter (with `ui-sans-serif, system-ui, sans-serif` fallback)

**Character:** Inter is the entire working interface, a neutral humanist sans
that stays legible from 10px badges to body copy and disappears into the task.
Orbitron, a geometric techno-display face, is reserved for the Astral wordmark
(it ships in the logo SVG and is loaded for the brand mark), supplying the
"astral" character without ever being applied to UI labels or data. The pairing
contrasts on a real axis (geometric display vs. humanist text) and is held apart
by role, not mixed within a screen.

### Hierarchy

- **Display** (Orbitron 700, +0.02em tracking): The Astral wordmark only. Not used
  for in-UI headings.
- **Title** (Inter 600, 1rem / 1.25): Repo names, dialog titles, the most prominent
  in-UI text. Repo names additionally take Signal Green Strong.
- **Body** (Inter 400-500, 0.875rem / 1.25): The default UI size for descriptions,
  list items, buttons, inputs. Prose (README, notes) runs at comfortable reading
  size and is capped at 65-75ch.
- **Label** (Inter 700, 0.75rem, +0.05em, uppercase): Sidebar section headers
  (STARS, TAGS, SMART FILTERS, LANGUAGES). Short, structural, never sentences.
- **Micro** (Inter 600, 0.625rem / 0.875rem, the custom `text-xxs` step): Tiny
  counts and badges where space is tight.

### Named Rules

**The One Family Rule.** Inter carries the entire UI: headings, buttons, labels,
data, body. Orbitron is the wordmark and nothing else. A display font in a button
or a data cell is prohibited.

**The Fixed Scale Rule.** Type sizes are fixed rem steps (0.625 / 0.75 / 0.875 /
1rem), not fluid `clamp()`. A control's text is the same size in a 320px sidebar
and a wide content pane.

## 4. Elevation

Permanent depth comes from **tonal layering**; shadow is reserved for **transient
elevation**. The dark rail, the lighter content column, and the toolbars (canvas
in light, `gray-800` in dark) already establish the spatial hierarchy without a
single shadow. Resting surfaces wear at most a `shadow-xs` hairline. Real shadow
appears only on things that have lifted off the plane: dialogs, dropdown menus,
the floating drag chip, and the selected-row inner shadow.

### Shadow Vocabulary

- **Resting** (`box-shadow: var(--tw-shadow-xs)` ≈ `0 1px 2px rgb(0 0 0 / 0.05)`):
  Buttons, rows, search field at rest. A whisper of separation, not a lift.
- **Lifted** (`shadow-md` / `shadow-lg` ≈ `0 4px 6px -1px rgb(0 0 0 / 0.1)` and
  up): Dropdown menus, popovers, the drag chip.
- **Floating** (`shadow-xl` ≈ `0 20px 25px -5px rgb(0 0 0 / 0.1)`): Modal dialogs,
  the single most-elevated layer.
- **Inset** (`shadow-inner`): The selected star row, pressed into the surface to
  read as "current."

### Named Rules

**The Tonal-First Rule.** Reach for a background-tone change before a shadow.
Shadows are a response to lift (hover, drag, overlay), not a default decoration on
resting cards.

## 5. Components

### Buttons

- **Shape:** Tightly rounded (`rounded-sm`, 4px). Sizes scale padding only: sm
  (`6px 10px`, 0.75rem text), base (`8px 12px`, 0.875rem), lg, xl (`12px 16px`,
  1rem).
- **Base:** White surface, `ink-body` text, hairline `gray-300` border,
  `shadow-xs`; hover to `canvas`. In dark mode: `gray-950` fill, near-black border.
  The default, quiet workhorse.
- **Primary:** Signal Green Strong fill (#059669), white text, semibold; hover to
  Signal Green Deep (#047857).
- **Danger / Warning:** Solid `red-600` / `yellow-500` fills with white / dark
  text, for destructive and cautionary actions.
- **Borderless variants:** Each kind has a borderless twin (text-only, no fill or
  border) for low-emphasis placements.
- **Focus:** `focus-visible` ring, 2px, in the kind's own tint (`brand-200`,
  `red-200`, `gray-200`). Never a raw outline.

### Chips (tags & languages)

- **Style:** Extra-tight corners (`rounded-xs`, 2px), 0.75rem semibold,
  slightly tracked. Pale wash background with deep same-hue text.
- **Tag chips:** Indigo (wash #e0e7ff / ink #372aac light; 10% fill + `indigo-400`
  dark). **Language chips:** Signal Green (wash #d1fae5 / ink #065f46 light; 10%
  fill + `brand-400` dark). The hue split is the legend: indigo = your tag, green
  = the repo's language.
- **State:** An "Edit Tags" affordance chip stays hidden until row hover (gray,
  `opacity-0 group-hover:opacity-100`), or is shown when a row has no tags yet.

### Cards / List rows

- **Corner Style:** Star rows are full-bleed, separated by hairline `gray-300`
  bottom borders, not floating cards. No rounding on rows.
- **Background:** White at rest (`gray-800/80` dark); `gray-100` with an inner
  shadow when selected (`gray-900` dark).
- **Selected indicator:** A Signal Green 4px bar slides in from the left edge on
  selection (`-translate-x-full` → `translate-x-0`). This is a list-row *state
  indicator*, the one sanctioned use of an edge accent, not a decorative card
  stripe.
- **Internal Padding:** 16px (`md`).

### Inputs / Fields

- **Style:** White fill, `rounded-md` (6px), translucent `gray-900/20` border,
  soft `shadow-md` with a faint gray tint. Dark mode: translucent `gray-700/15`
  fill, `gray-700` border.
- **Focus:** Border shifts to `gray-400` and a 2-4px `gray-500/10` ring appears;
  the default browser outline is suppressed. Calm, not glowing.
- **Search field (signature):** Placeholder reads "Gaze through your telescope...",
  a leading search icon, and a trailing `/` keyboard-shortcut badge that fades on
  focus.

### Navigation (the rail)

- **Style:** Dark rail (`gray-900` / `gray-800`), 320px on desktop, off-canvas
  drawer with a backdrop blur on mobile. Sections are collapsible disclosures.
- **Section headers:** `label` type, uppercase + tracked, `gray-500`.
- **Items:** 0.875rem semibold; default `gray-400`, hover lightens, **active** is
  Signal Green. Counts sit in a right-aligned pill (`gray-700` default; Signal
  Green when active).
- **Tags & smart filters** are drag-sortable; tags are also drop targets for
  dragging stars onto them.

### Toggle

- Headless UI `Switch`: a `rounded-full` track, `gray-200` off / Signal Green
  Strong on, with a white knob that carries a tiny check (green) or x (gray) icon
  and a `brand-500` focus ring. 200ms color transition.

### Toast (signature)

- A `rounded-full` pill docked bottom-right, sliding in from the right edge.
  Success is `green-200` field / `green-700` text with a check; error is
  `red-200` / `red-700` with an x. Semantic color is the whole message.

### Dialogs

- Headless UI modal: `rounded-lg` white (`gray-900` dark) panel, `shadow-xl`, on a
  `gray-500/75` backdrop with a small backdrop blur. Enter `ease-out 300ms`
  (fade + 4px rise + 95% scale); leave `ease-in 200ms`.

## 6. Do's and Don'ts

### Do:

- **Do** keep Signal Green rare. Use it for active state, primary action, current
  selection, and state indicators, never as decoration. (The One Green Rule.)
- **Do** carry the entire UI in Inter; reserve Orbitron for the wordmark. (The One
  Family Rule.)
- **Do** establish depth with tonal layers first; add shadow only when something
  lifts (hover, drag, overlay). (The Tonal-First Rule.)
- **Do** keep the navigation rail dark in both light and dark themes. (The Dark
  Rail Rule.)
- **Do** ship every interactive control with its full state set: default, hover,
  `focus-visible`, active, disabled, selected. Standardize across screens.
- **Do** use fixed rem type steps (0.625 / 0.75 / 0.875 / 1rem), not fluid clamps.
- **Do** keep corners tight: 2px chips, 4px buttons, 6px inputs, 8px dialogs.
- **Do** verify contrast on **both** themes; muted text must still clear 4.5:1.
- **Do** give every transition a `prefers-reduced-motion` fallback (the logo
  float, sidebar slide, panel reveals, dialog enter/leave).

### Don't:

- **Don't** make Astral feel **cluttered or heavy**: no dense competing toolbars,
  no control crowding. The contents are the point; chrome stays quiet.
- **Don't** make it feel **trendy or over-designed**: no decorative gradients, no
  gradient text (`background-clip: text`), no glass panels by default, no bouncy
  or elastic motion.
- **Don't** let the space theme tip into **childish or toy-like**. Orbitron, the
  Galileo mascot, and telescope copy stay subtle; never cartoonish.
- **Don't** add a second saturated accent to the chrome. Indigo is fenced to tag
  chips; everything else is gray + Signal Green.
- **Don't** use a colored side-stripe as decoration on cards, callouts, or alerts.
  The only sanctioned edge accent is the selected-row state bar.
- **Don't** put a display font (Orbitron) in buttons, labels, or data.
- **Don't** drop shadows on resting cards to fake depth; that reads as a 2014 app.
- **Don't** introduce a manual theme toggle expectation; theme follows the OS.
- **Don't** use light-gray body text on tinted near-white "for elegance"; bump
  toward `ink-body` until it clears 4.5:1.
