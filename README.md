# GuitarScales

An interactive guitar fretboard visualizer for exploring scales, modes, diatonic chords, and playable chord voicings by neck position.

---

## Features

* **Scale + mode explorer**

  * Select a **root note**, **scale**, and **mode** (e.g., Ionian, Dorian, etc.).
  * Toggle **note labels** vs **scale degrees**.
  * Choose **accidentals** preference (sharps/flats) for note spelling.

* **Fretboard visualization**

  * Full-width responsive layout with a left-side `CONFIGURATION` panel.
  * **Realistic fret spacing** (geometric layout) so frets narrow toward the bridge like a real instrument.
  * Clean string labeling (single set of string names).

* **Diatonic chord lists (per selected mode)**

  * Automatically generates and displays:

    * **Triads** (3-tone chords) for all 7 scale degrees
    * **7th chords** for all 7 scale degrees
  * Shows chord **degree**, **name/quality**, and **tones**.

* **Chord voicing diagrams by position**

  * Pick a **starting fret (position)** and view **playable chord diagrams** for each diatonic chord around that area of the neck.
  * Intuitive chord charts (strings, frets, muted/open markers), designed to be easy to scan and compare.
  * Hover/click interactions can highlight tones on the main fretboard (if enabled in the build).

---

## Tech Stack

* **Vite** (frontend tooling / dev server)
* **JavaScript/TypeScript** (depending on the project setup)
* **Canvas/SVG rendering** for fretboard + chord diagrams (implementation-dependent)

---

## Getting Started

### Prerequisites

* **Node.js**: recommended **LTS** version
* **npm** (or `pnpm` / `yarn` if your project is configured for it)

### Install

```bash
npm install
```

### Run locally (dev)

```bash
npm run dev
```

Then open the URL printed in the terminal (commonly `http://localhost:5173`).

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## How to Use

1. Use the `CONFIGURATION` panel to choose:

   * **Root note**
   * **Scale** (e.g., Major)
   * **Mode** (e.g., Ionian)
   * **Fretboard labels** (Notes / Degrees)
   * **Accidentals** (Sharps / Flats)

2. View the updated **fretboard visualization**:

   * Root tones and scale tones are highlighted according to the legend.

3. Scroll below the fretboard to see:

   * **Triads** (I–VII)
   * **7th chords** (I–VII)

4. In the **Chord Voicings** section:

   * Set the **Position / Start fret**
   * Browse chord diagram cards for playable shapes near that fret range

---

## Musical Logic Notes (High-Level)

* **Diatonic triads** are built by stacking scale degrees in thirds:

  * `[degree, degree+2, degree+4]` (wrapping within the 7-note scale)
* **Diatonic 7th chords** extend the same idea:

  * `[degree, degree+2, degree+4, degree+6]`
* **Chord quality** is determined by interval patterns from the chord root (e.g., major, minor, diminished, dominant 7, half-diminished, etc.).
* **Fret spacing** uses a geometric model (equal temperament), so distances shrink as fret numbers increase.

---

## Project Scripts

These scripts are typically found in `package.json`:

* `npm run dev` — start the dev server
* `npm run build` — build the production bundle
* `npm run preview` — preview the production build

If your repo includes additional scripts (e.g., `lint`, `test`, `format`), run:

```bash
npm run
```

to see the full list available in your setup.

---

## Troubleshooting

* **Nothing renders / blank page**

  * Confirm you’re using a supported Node version (LTS recommended).
  * Reinstall dependencies:

    ```bash
    rm -rf node_modules
    npm install
    ```

* **Layout looks constrained**

  * Check for `max-width` or `margin: 0 auto` constraints on the root container and ensure the main layout uses full width.

* **Chord voicings show “No easy voicing”**

  * Try changing the **Position / Start fret**.
  * If the UI includes a “widen range” option, use it for difficult regions.

---

## Contributing

* Keep UI changes consistent with the existing theme and spacing.
* Prefer pure, well-tested utilities for:

  * note ↔ pitch class mapping
  * scale generation
  * chord construction and quality detection
  * voicing selection/scoring

If you add a new feature, include:

* Clear UI behavior notes
* Edge cases handled
* Minimal performance impact (cache computed fret positions/voicings where appropriate)

