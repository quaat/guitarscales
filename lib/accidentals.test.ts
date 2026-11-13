import { describe, expect, it } from 'vitest';
import scales from '../config/scales';
import { getDefaultAccidentalMode } from './accidentals';

const scale = (id: string) => scales.find((entry) => entry.id === id)!;

describe('circle-of-fifths accidental defaults', () => {
  // Independent reference table; retain B Lydian rather than respelling it Cb.
  const flatTonics = [
    [5, 10, 3, 8, 1, 6], // Ionian: F Bb Eb Ab Db Gb
    [7, 0, 5, 10, 3, 8], // Dorian: G C F Bb Eb Ab
    [9, 2, 7, 0, 5, 10], // Phrygian: A D G C F Bb
    [10, 3, 8, 1, 6], // Lydian: Bb Eb Ab Db Gb (B uses F# major)
    [0, 5, 10, 3, 8, 1], // Mixolydian: C F Bb Eb Ab Db
    [2, 7, 0, 5, 10, 3], // Aeolian: D G C F Bb Eb
    [4, 9, 2, 7, 0, 5], // Locrian: E A D G C F
  ];

  for (const [mode, tonics] of flatTonics.entries()) {
    it(`chooses the signature side for all 12 ${scale('major').modeNames![mode]} roots`, () => {
      for (let root = 0; root < 12; root += 1) {
        expect(getDefaultAccidentalMode(root, scale('major'), mode), `root ${root}`)
          .toBe(tonics.includes(root) ? 'flat' : 'sharp');
      }
    });
  }

  it.each([
    ['harmonic_minor', [0, 2, 3, 5, 7, 8, 11], [9, 11, 0, 2, 4, 5, 8]],
    ['melodic_minor', [0, 2, 3, 5, 7, 9, 11], [9, 11, 0, 2, 4, 6, 8]],
    ['minor_pentatonic', [0, 3, 5, 7, 10], [9, 0, 2, 4, 7]],
  ] as const)('retains the parent minor signature for every %s mode', (id, flatRoots, sharpRoots) => {
    flatRoots.forEach((root, mode) => expect(getDefaultAccidentalMode(root, scale(id), mode)).toBe('flat'));
    sharpRoots.forEach((root, mode) => expect(getDefaultAccidentalMode(root, scale(id), mode)).toBe('sharp'));
  });

  it('uses major pentatonic and minor blues parent signatures', () => {
    expect(getDefaultAccidentalMode(5, scale('major_pentatonic'), 0)).toBe('flat');
    expect(getDefaultAccidentalMode(7, scale('major_pentatonic'), 0)).toBe('sharp');
    expect(getDefaultAccidentalMode(2, scale('blues'), 0)).toBe('flat');
    expect(getDefaultAccidentalMode(9, scale('blues'), 0)).toBe('sharp');
  });

  it('keeps B natural instead of Cb at the six-accidental tie in harmonic minor modes', () => {
    expect(getDefaultAccidentalMode(11, scale('harmonic_minor'), 5)).toBe('sharp');
  });

  it.each(['whole_tone', 'diminished_wh'])('uses a documented tonic-major fallback for %s', (id) => {
    expect(getDefaultAccidentalMode(5, scale(id), 0)).toBe('flat');
    expect(getDefaultAccidentalMode(0, scale(id), 0)).toBe('sharp');
  });

  it('normalizes transposed roots and tolerates a mode being reset', () => {
    expect(getDefaultAccidentalMode(17, scale('major'), 0)).toBe('flat');
    expect(getDefaultAccidentalMode(-7, scale('major'), 0)).toBe('flat');
    expect(getDefaultAccidentalMode(5, scale('major'), 99)).toBe('flat');
    expect(getDefaultAccidentalMode(5, scale('major_pentatonic'), 6)).toBe('flat');
  });
});
