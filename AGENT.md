# GuitarScales Agent Guide

## Project summary
- Interactive guitar scale visualizer built with React 19, TypeScript, and Vite.
- UI uses Tailwind via CDN configuration in `index.html` (no build-time Tailwind setup).
- Music theory logic lives in `lib/` and scale data in `config/`.

## Repo layout
- `App.tsx`: page layout, top-level state, URL sync, and wiring between components.
- `components/`: UI components (`Controls`, `Fretboard`, `ScaleInfo`).
- `lib/`: music theory helpers and constants (`musicTheory.ts`, `constants.ts`).
- `config/scales.ts`: scale and mode definitions.
- `types.ts`: shared type definitions.
- `index.html`: Tailwind config, font imports, and base styles.

## Commands
- `npm install`
- `npm run dev` (Vite dev server on port 3000)
- `npm run build`
- `npm run preview`

## Coding conventions
- Prefer functional React components with typed props.
- Keep state in `App.tsx` unless a component needs local-only state.
- Use `types.ts` for shared types; update it when adding new data structures.
- Keep logic in `lib/` and keep components focused on rendering.

## Styling conventions
- Use Tailwind utility classes directly in JSX; rely on the theme set in `index.html`.
- Use the existing palette: `background`, `surface`, `primary`, `accent`.
- Avoid adding new global CSS unless needed; if you add it, create `index.css` and ensure it is referenced from `index.html`.
- Default to ASCII in new text; only use non-ASCII (e.g., ♯/♭) when matching existing UI conventions.

## Music theory logic
- Pitch classes are `0-11` (`C` through `B`).
- `STANDARD_TUNING` is low E to high E; UI reverses it for display.
- `calculateScaleData` is the source of truth for notes/intervals/formulas; keep it in sync with any new scale logic.

## URL/state behavior
- App reads `root`, `scale`, `mode`, `accidental` from query params on mount.
- Share button encodes those params into the URL; keep this behavior consistent if routing changes.

## Prompt context
- The app is meant to be a premium, dark, modern guitar scale visualizer with strong UX and correct music theory.
- Required UI: header with title/tagline + share, left control panel (root, scale, mode, label toggle, reset), main fretboard, legend, and optional formula panel.
- Required behavior: compute scale notes via pitch-class math (0-11), standard tuning, frets 0-12, mode rotation + normalization, tooltips with note + degree + interval, root note clearly highlighted.
- Data-driven scales: load from `config/scales.json` with `id`, `name`, `intervals`, optional `modeNames`/`tags`; mode names can be derived if not provided.
- Accessibility: keyboard-friendly controls, focus states, adequate contrast, respect reduced motion, responsive layout (controls stacked/drawer on mobile).
- Sharing: state should be shareable via URL params (prompt expects human-readable values like `root=F%23`, `mode=Dorian`, `labels=degrees`).
- Tests requested in prompt: note mapping, mode rotation normalization, scale membership checks.
- Current repo gaps to be aware of: scales are in `config/scales.ts` (not JSON), share state uses numeric indices, and no tests are present.
