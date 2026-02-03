import { describe, expect, it } from 'vitest';
import { parseRomanProgression } from './romanNumerals';

describe('parseRomanProgression', () => {
  it('parses separators and degrees', () => {
    const result = parseRomanProgression('I–V-vi, IV');
    expect(result.errors).toHaveLength(0);
    expect(result.steps.map((step) => step.raw)).toEqual(['I', 'V', 'vi', 'IV']);
    expect(result.steps.map((step) => step.degree)).toEqual([1, 5, 6, 4]);
  });

  it('detects seventh extensions', () => {
    const result = parseRomanProgression('V7 ii7');
    expect(result.errors).toHaveLength(0);
    expect(result.steps.map((step) => step.extension)).toEqual(['7', '7']);
    expect(result.steps.map((step) => step.degree)).toEqual([5, 2]);
  });

  it('rejects unsupported accidentals', () => {
    const result = parseRomanProgression('I bVII');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects empty input', () => {
    const result = parseRomanProgression('   ');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.steps).toHaveLength(0);
  });
});
