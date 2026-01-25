export type PitchClass = number; // 0 - 11

export interface ScaleConfig {
  id: string;
  name: string;
  intervals: number[]; // Relative to root, e.g., [0, 2, 4, 5, 7, 9, 11]
  modeNames?: string[];
  tags?: string[];
}

export interface Note {
  pitchClass: PitchClass;
  octave: number;
}

export interface FretboardPosition {
  stringIndex: number; // 0 (High E) to 5 (Low E) or reverse depending on convention. We will use 0 = Low E (thickest) to 5 = High E (thinnest)
  fret: number;
  note: Note;
}

export type LabelMode = 'note' | 'degree';
export type AccidentalMode = 'sharp' | 'flat';

export type ChordType = 'triad' | 'seventh';

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'maj7'
  | 'dominant7'
  | 'min7'
  | 'halfDim7'
  | 'dim7'
  | 'minMaj7'
  | 'aug7'
  | 'unknown';

export interface DiatonicChord {
  id: string;
  type: ChordType;
  degreeIndex: number;
  root: PitchClass;
  tones: PitchClass[];
  intervals: number[];
  quality: ChordQuality;
  name: string;
  degreeLabel: string;
  toneNames: string[];
  requiredIntervals: number[];
}

export interface ChordVoicing {
  strings: Array<number | 'x'>;
  fretSpan: { min: number; max: number } | null;
  tones: Array<string | null>;
  stringPitches: Array<PitchClass | null>;
  windowStart: number;
  windowEnd: number;
}

export interface ScaleState {
  rootNote: PitchClass;
  scaleId: string;
  modeIndex: number;
}

export interface ScaleCalculatedData {
  rootNote: PitchClass;
  intervals: number[]; // The intervals of the specific mode selected
  notes: PitchClass[]; // The pitch classes included in this mode
  formula: string[]; // e.g., ["1", "2", "b3", ...]
}
