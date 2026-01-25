import { PitchClass } from "../types";

export const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const NOTE_NAMES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

// Standard Tuning: E2, A2, D3, G3, B3, E4
// Stored as PitchClasses
// Index 0 = Low E (thickest string)
// Index 5 = High E (thinnest string)
export const STANDARD_TUNING: PitchClass[] = [
  4, // E
  9, // A
  2, // D
  7, // G
  11,// B
  4  // E
];

// Open string display names for UI
export const STRING_NAMES = ["E", "A", "D", "G", "B", "E"];

export const TOTAL_FRETS = 13; // 0 to 12 inclusive

export const MARKERS = [5, 7, 12];