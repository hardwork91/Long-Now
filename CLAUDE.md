# Project — Long Now (game prototype)

## Standing rules (always apply)
- **ALL in-game UI text MUST be in English.** Every user-facing string in the React
  prototype (labels, buttons, room names, crew roles, traits, event text, station log,
  resource names, tooltips, etc.) is written in English. The design document
  (`Long_Now_Game_Design_Document.md`) may use the original Spanish working names, but
  anything that renders on screen in the app is English.
- Conversations with the user happen in Spanish; the **deliverable UI stays English**.

## Project layout
- `Long_Now_Game_Design_Document.md` — the living GDD (design language: mixed ES room names).
- `long-now/` — Vite + React + TypeScript prototype.
  - Image assets live in `long-now/public/assets/{crew,rooms,events,ui}` and are referenced as `/assets/...`.
  - `public/assets/ui/frame9.png` is a generated 9-slice (from `corner.png` + `frame.png`) used for all container borders.

## Canonical room types (English display names)
Power · Reactor · O₂ Generation · Food Production · Water Generation · Habitat · Workshop · Infirmary-Lab · Exploration Bay
- The **Exploration Bay** is its own room (the airlock/expedition function — no longer part of the Workshop). It is reached via the sonar, not the rooms sidebar.
