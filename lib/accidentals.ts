import { AccidentalMode, PitchClass, ScaleConfig } from '../types';
import { normalizePitch } from './musicTheory';

// F, Bb, Eb, Ab, Db, Gb. Prefer Gb to F# at the six-accidental tie,
// except when that would respell the selected natural tonic B as Cb.
const FLAT_MAJOR_TONICS = new Set([5, 10, 3, 8, 1, 6]);

/**
 * Use the key signature of the parent scale, not the number of altered modal
 * degrees. A mode's parent tonic lies its original interval below the root.
 * Minor families inherit the relative major signature (three semitones up);
 * harmonic/melodic alterations do not change the underlying key signature.
 * Symmetric scales have no unique key signature: use the tonic-major convention.
 * This chooses a display preference, not context-aware note spelling.
 */
export const getDefaultAccidentalMode = (
  root: PitchClass,
  scale: ScaleConfig,
  modeIndex: number,
): AccidentalMode => {
  const modeOffset = scale.modeNames ? (scale.intervals[modeIndex] ?? 0) : 0;
  const minorFamily = ['harmonic_minor', 'melodic_minor', 'minor_pentatonic', 'blues'].includes(scale.id);
  const relativeMajor = normalizePitch(root - modeOffset + (minorFamily ? 3 : 0));
  if (relativeMajor === 6 && normalizePitch(root) === 11) return 'sharp';
  return FLAT_MAJOR_TONICS.has(relativeMajor) ? 'flat' : 'sharp';
};
