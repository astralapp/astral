# Product

## Register

product

## Users

Developers and technically-minded GitHub users who have starred a lot of
repositories (often hundreds or thousands) and have lost track of them. GitHub's
native stars are a flat, unsearchable list, so once the pile grows it's
effectively useless. Astral users come to reclaim it.

- **Context:** focused, repeated use — frequently returning mid-workflow to find
  "that one tool I starred a while ago." Keyboard-comfortable, developer mindset,
  low tolerance for friction.
- **Job to be done:** turn an unmanageable pile of GitHub stars into a
  searchable, organized, annotated personal library — and trust it enough to make
  it the daily home for managing stars.

## Product Purpose

Astral organizes your GitHub starred repositories with **tags, notes, smart
filters, and fast search**, plus an in-app README reader so you never have to
leave to remember what a repo does. It authenticates entirely through GitHub
(OAuth, no passwords) and reads/writes stars via the GitHub API. It ships both
hosted and self-hostable (Docker, MySQL or SQLite).

It exists because starring on GitHub is easy and finding a starred repo later is
nearly impossible. Success is simple: a user can surface any starred repo in
seconds, and the messy pile finally feels under control.

## Brand Personality

**Calm, focused, fast.** A quiet power-user utility that gets out of the way.

- **Voice & tone:** plain, confident, developer-to-developer. No marketing fluff,
  no hand-holding. Clear labels over clever ones.
- **Emotional goal:** control and calm — the relief of a messy pile finally
  organized and searchable.
- The astral/space identity (the Orbitron wordmark, the Galileo mascot, the
  emerald-green field, the subtle float) is a *restrained accent* that gives the
  product character without ever becoming a costume.

## Anti-references

- **Cluttered / heavy enterprise tooling.** Dozens of controls competing for
  attention, dense toolbars, nothing allowed to breathe. The content (repos,
  notes, READMEs) is the point; chrome stays quiet.
- **Trendy / over-designed surfaces.** Glassmorphism, decorative gradients,
  gradient text, bouncy or elastic motion, effects for their own sake.
- **Childish / toy-like.** The space theme must never tip into cartoonish. It
  stays subtle so the tool keeps the trust of developers who rely on it daily.

## Design Principles

1. **Get out of the way.** The user's library is the interface. Chrome, color,
   and motion stay quiet so the repos, notes, and READMEs stay in focus.
2. **Speed is a feature.** Power users live here. Favor keyboard reach, instant
   feedback, and dense-but-legible layouts over decoration.
3. **Earn the cosmos.** The astral identity is an accent, not a theme park — a
   restrained wordmark, one mascot, gentle motion. Personality must never cost
   trust or clarity.
4. **Consistency is craft.** One button system, one set of states, full
   light/dark parity. Every surface should feel like the same hand made it.
5. **Respect the reader.** Legible contrast, honest focus states, motion that can
   be turned off. Accessibility is the baseline, not a later layer.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA**.
- Body text contrast ≥ 4.5:1, large text ≥ 3:1 — verified against **both** the
  light and dark themes, since full dark-mode parity ships.
- Visible focus states everywhere (the codebase already standardizes on
  `focus-visible` rings — keep them) and full keyboard navigation for the stars
  list, sidebar, and dialogs.
- **Honor `prefers-reduced-motion`.** Every transition and animation (the logo
  float, sidebar slide-in, list transitions, panel reveals) needs a reduced or
  instant alternative.
