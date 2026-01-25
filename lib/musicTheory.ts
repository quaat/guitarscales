import { NOTE_NAMES, NOTE_NAMES_FLAT } from './constants';
import { PitchClass, ScaleConfig, ScaleCalculatedData, AccidentalMode } from '../types';

/**
 * Normalizes a note index to 0-11
 */
export const normalizePitch = (note: number): PitchClass => {
  return ((note % 12) + 12) % 12;
};

/**
 * Returns the name of the note (Sharp or Flat convention)
 */
export const getNoteName = (pitch: PitchClass, mode: AccidentalMode = 'sharp'): string => {
  const norm = normalizePitch(pitch);
  return mode === 'flat' ? NOTE_NAMES_FLAT[norm] : NOTE_NAMES[norm];
};

/**
 * Rotates an interval array for a specific mode and normalizes it so the first interval is 0.
 */
export const getModeIntervals = (scaleIntervals: number[], modeIndex: number): number[] => {
  if (modeIndex === 0) return [...scaleIntervals];
  
  const len = scaleIntervals.length;
  // Rotate the array
  // Example: [0, 2, 4] mode 1 (2nd note) -> [2, 4, 12] (wrap octave)
  
  // 1. Create a version extending into the next octave for easy slicing
  const extended = [...scaleIntervals, ...scaleIntervals.map(i => i + 12)];
  
  // 2. Slice from modeIndex
  const sliced = extended.slice(modeIndex, modeIndex + len);
  
  // 3. Normalize so the first element is 0
  const rootValue = sliced[0];
  return sliced.map(interval => interval - rootValue);
};

/**
 * Converts a semitone interval to a degree name (e.g., 3 -> b3, 4 -> 3)
 * This is a simplified lookup for common scales.
 */
export const getDegreeName = (interval: number, index: number, totalNotes: number): string => {
  // Common Interval Map
  // 0: 1
  // 1: b2
  // 2: 2
  // 3: b3
  // 4: 3
  // 5: 4
  // 6: b5/#4
  // 7: 5
  // 8: b6
  // 9: 6
  // 10: b7
  // 11: 7
  
  // Simple heuristic based on semitones
  switch(interval) {
    case 0: return "1";
    case 1: return "b2";
    case 2: return "2";
    case 3: return "b3";
    case 4: return "3";
    case 5: return "4";
    case 6: return "b5"; // Context dependent, but b5 is safe default for blues/locrian
    case 7: return "5";
    case 8: return "b6";
    case 9: return "6";
    case 10: return "b7";
    case 11: return "7";
    default: return "?";
  }
};

/**
 * Calculates all necessary data for rendering a scale/mode on the fretboard.
 */
export const calculateScaleData = (
  rootNote: PitchClass,
  scaleConfig: ScaleConfig,
  modeIndex: number
): ScaleCalculatedData => {
  const intervals = getModeIntervals(scaleConfig.intervals, modeIndex);
  
  // Calculate actual pitch classes included in this mode
  const notes = intervals.map(interval => normalizePitch(rootNote + interval));
  
  // Calculate formula strings
  const formula = intervals.map((interval, idx) => getDegreeName(interval, idx, intervals.length));
  
  return {
    rootNote,
    intervals,
    notes,
    formula
  };
};

/**
 * Checks if a specific pitch class is present in the scale
 */
export const isNoteInScale = (pitch: PitchClass, scaleNotes: PitchClass[]): boolean => {
  return scaleNotes.includes(pitch);
};

/**
 * Get interval from root for a given note in the scale
 * Returns -1 if not in scale
 */
export const getIntervalFromRoot = (note: PitchClass, root: PitchClass): number => {
  const dist = normalizePitch(note - root);
  return dist;
}