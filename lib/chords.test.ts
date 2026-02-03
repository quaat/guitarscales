import { describe, expect, it } from 'vitest';
import { getDiatonicChordTones } from './chords';

const C_MAJOR = [0, 2, 4, 5, 7, 9, 11];

describe('getDiatonicChordTones', () => {
  it('returns triad tones for degree I', () => {
    const tones = getDiatonicChordTones(C_MAJOR, 1, 'triad');
    expect(tones).toEqual([0, 4, 7]);
  });

  it('wraps correctly across the scale for degree VII', () => {
    const tones = getDiatonicChordTones(C_MAJOR, 7, 'triad');
    expect(tones).toEqual([11, 2, 5]);
  });

  it('returns seventh tones for degree V', () => {
    const tones = getDiatonicChordTones(C_MAJOR, 5, '7');
    expect(tones).toEqual([7, 11, 2, 5]);
  });

  it('returns only diatonic tones', () => {
    const tones = getDiatonicChordTones(C_MAJOR, 6, 'triad');
    expect(tones.every((tone) => C_MAJOR.includes(tone))).toBe(true);
  });
});
