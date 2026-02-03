import { RomanDegree, RomanParseError, RomanStep, RomanStepParseResult } from '../types';

const ROMAN_DEGREE_MAP: Record<string, RomanDegree> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
};

const TOKEN_REGEX = /[^\s,–-]+/g;
const ROMAN_REGEX = /^([ivIV]+)(7)?$/;

export const parseRomanProgression = (input: string): RomanStepParseResult => {
  const steps: RomanStep[] = [];
  const errors: RomanParseError[] = [];

  if (!input.trim()) {
    errors.push({
      message: 'Enter a progression to begin playback.',
      token: '',
      start: 0,
      end: 0,
    });
    return { steps, errors };
  }

  for (const match of input.matchAll(TOKEN_REGEX)) {
    const token = match[0];
    const start = match.index ?? 0;
    const end = start + token.length;

    if (/[b#♭♯]/.test(token)) {
      errors.push({
        message: 'Accidentals like bVII or #iv are not supported yet.',
        token,
        start,
        end,
      });
      continue;
    }

    const romanMatch = token.match(ROMAN_REGEX);
    if (!romanMatch) {
      errors.push({
        message: 'Invalid token. Use roman numerals like I, vi, or V7.',
        token,
        start,
        end,
      });
      continue;
    }

    const romanPart = romanMatch[1];
    const extension = romanMatch[2] ? '7' : 'triad';
    const normalized = romanPart.toUpperCase();
    const degree = ROMAN_DEGREE_MAP[normalized];

    if (!degree) {
      errors.push({
        message: 'Roman numeral must be between I and VII.',
        token,
        start,
        end,
      });
      continue;
    }

    steps.push({
      raw: token,
      degree,
      extension,
    });
  }

  if (!steps.length) {
    errors.push({
      message: 'No valid roman numerals found.',
      token: input.trim(),
      start: 0,
      end: input.trim().length,
    });
  }

  return { steps, errors };
};
