# DESIGN.md

Direction for PitchSide. antislop reads this as the design brief; without it the
output is "draft without direction".

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

## What this is

A football matchday dashboard. The user opens it during a live match on a
second screen, glances at it for two seconds, and needs the score. It is a
dense information surface, not a marketing page.

## Audience and context

Someone already watching football, often in a dim room, often on a phone at
half time. They compare fixtures across leagues. They do not want to be sold
anything.

## Identity

Broadcast graphics, not a SaaS landing page. The reference is the lower-third
on a match broadcast: flat, high contrast, condensed, numbers carry the weight.
Deliberately not glowing, not glassy, not gradient-heavy.

## Palette (R-29: 2 core + 1 accent)

- Core: near-black surfaces, one step apart (`#050505` page, `#0b0b0c` card)
- Core: off-white text (`#f4f4f5`)
- Accent: one yellow (`#ffd60a`), used only for the live indicator, the
  primary action, and the single most important number on a screen
- Semantic states: red for live/danger, a muted green for a win, both treated as
  status colors rather than part of the brand palette

Reason for yellow: it is the color of a referee's card and of floodlit pitch
graphics, so it reads as football rather than as a generic accent.

## Why dark, not a toggle (R-21)

Football is watched in the evening. A matchday dashboard that flashes white at
kick-off is the wrong tool. The dark theme is a deliberate product decision, not
"dark looks techy", so no light mode ships. If this ever becomes a daytime
editorial site, that reasoning changes and a toggle comes with it.

## Typography

System sans stack, no webfont download. App UI is read in short bursts and must
paint instantly on a phone on stadium wifi. Tabular numerals everywhere a score
or a table column appears, so digits do not jitter as values update live.

Uppercase micro-labels are reserved for table headers and stat labels, which is
a genuine scanning convention in sports data, at moderate tracking (0.08em), not
the wide-tracked `HOW IT WORKS` decorative style R-06 warns about.

## Composition

Cards are the unit because every item is a peer: one fixture, one player, one
table row. Card weight is not uniform: a live fixture carries a red left edge
and a pulsing dot, finished fixtures recede. The formation pitch is the one
asymmetric, illustration-like surface, and it earns that space because it
communicates shape and positioning that a list cannot.

## Motion

Hover and focus transitions only, plus one pulsing dot for the live indicator.
The pulse earns its place: it distinguishes a live fixture from a finished one at
a glance, and it stops under `prefers-reduced-motion`.

## Hard constraints carried into the build

- Every text color clears WCAG AA 4.5:1 on the surface it sits on
- No em dashes in UI copy (R-02)
- No fabricated statistics; demo data is labeled "demo" in the UI
- Interactive targets at least 44px on touch, visible focus ring on every control
- Data views ship empty, loading, and error states (R-27)
