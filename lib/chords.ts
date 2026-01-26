import { STANDARD_TUNING, TOTAL_FRETS } from './constants';
import { normalizePitch, getNoteName } from './musicTheory';
import { AccidentalMode, ChordQuality, ChordType, DiatonicChord, ChordVoicing, PitchClass, ScaleCalculatedData } from '../types';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const voicingCache = new Map<string, ChordVoicing[]>();
const WINDOW_FRET_SPAN = 3;
const MAX_VOICINGS_PER_POSITION = 3;

const getTriadQuality = (intervals: number[]): ChordQuality => {
  const key = intervals.join(',');
  switch (key) {
    case '0,4,7':
      return 'major';
    case '0,3,7':
      return 'minor';
    case '0,3,6':
      return 'diminished';
    case '0,4,8':
      return 'augmented';
    default:
      return 'unknown';
  }
};

const getSeventhQuality = (intervals: number[]): ChordQuality => {
  const key = intervals.join(',');
  switch (key) {
    case '0,4,7,11':
      return 'maj7';
    case '0,4,7,10':
      return 'dominant7';
    case '0,3,7,10':
      return 'min7';
    case '0,3,6,10':
      return 'halfDim7';
    case '0,3,6,9':
      return 'dim7';
    case '0,3,7,11':
      return 'minMaj7';
    case '0,4,8,10':
      return 'aug7';
    default:
      return 'unknown';
  }
};

const getChordSuffix = (quality: ChordQuality, type: ChordType): string => {
  if (type === 'triad') {
    switch (quality) {
      case 'major':
        return '';
      case 'minor':
        return 'm';
      case 'diminished':
        return 'dim';
      case 'augmented':
        return 'aug';
      default:
        return '';
    }
  }

  switch (quality) {
    case 'maj7':
      return 'maj7';
    case 'dominant7':
      return '7';
    case 'min7':
      return 'm7';
    case 'halfDim7':
      return 'm7b5';
    case 'dim7':
      return 'dim7';
    case 'minMaj7':
      return 'mMaj7';
    case 'aug7':
      return 'aug7';
    default:
      return '7';
  }
};

const isMinorQuality = (quality: ChordQuality): boolean => {
  return ['minor', 'min7', 'minMaj7', 'halfDim7', 'dim7'].includes(quality);
};

const isDiminishedQuality = (quality: ChordQuality): boolean => {
  return ['diminished', 'halfDim7', 'dim7'].includes(quality);
};

const isAugmentedQuality = (quality: ChordQuality): boolean => {
  return ['augmented', 'aug7'].includes(quality);
};

const formatDegreeLabel = (
  degreeIndex: number,
  scaleLength: number,
  formula: string[],
  quality: ChordQuality,
  type: ChordType
): string => {
  let base = scaleLength === 7 && ROMAN_NUMERALS[degreeIndex]
    ? ROMAN_NUMERALS[degreeIndex]
    : (formula[degreeIndex] || `${degreeIndex + 1}`);

  if (scaleLength === 7 && (isMinorQuality(quality) || isDiminishedQuality(quality))) {
    base = base.toLowerCase();
  }

  let label = base;
  if (isDiminishedQuality(quality)) {
    label += ' dim';
  } else if (isAugmentedQuality(quality)) {
    label += ' aug';
  }

  if (type === 'seventh') {
    label += '7';
  }

  return label;
};

const getRequiredIntervals = (intervals: number[], type: ChordType): number[] => {
  const third = intervals.find((interval) => interval === 3 || interval === 4);
  const seventh = intervals.find((interval) => interval === 9 || interval === 10 || interval === 11);
  const required: number[] = [0];
  if (typeof third === 'number') {
    required.push(third);
  }
  if (type === 'seventh' && typeof seventh === 'number') {
    required.push(seventh);
  }
  return required;
};

export const buildDiatonicChords = (
  scaleData: ScaleCalculatedData,
  accidentalMode: AccidentalMode
): { triads: DiatonicChord[]; sevenths: DiatonicChord[] } => {
  const { notes, formula } = scaleData;
  const scaleLength = notes.length;

  const triads: DiatonicChord[] = [];
  const sevenths: DiatonicChord[] = [];

  for (let degreeIndex = 0; degreeIndex < scaleLength; degreeIndex += 1) {
    const triadTones = [
      notes[degreeIndex % scaleLength],
      notes[(degreeIndex + 2) % scaleLength],
      notes[(degreeIndex + 4) % scaleLength],
    ];
    const triadRoot = triadTones[0];
    const triadIntervals = triadTones
      .map((tone) => normalizePitch(tone - triadRoot))
      .sort((a, b) => a - b);
    const triadQuality = getTriadQuality(triadIntervals);
    const triadSuffix = getChordSuffix(triadQuality, 'triad');
    const triadName = `${getNoteName(triadRoot, accidentalMode)}${triadSuffix}`;

    triads.push({
      id: `triad-${degreeIndex}`,
      type: 'triad',
      degreeIndex,
      root: triadRoot,
      tones: triadTones,
      intervals: triadIntervals,
      quality: triadQuality,
      name: triadName,
      degreeLabel: formatDegreeLabel(degreeIndex, scaleLength, formula, triadQuality, 'triad'),
      toneNames: triadTones.map((tone) => getNoteName(tone, accidentalMode)),
      requiredIntervals: getRequiredIntervals(triadIntervals, 'triad'),
    });

    const seventhTones = [
      notes[degreeIndex % scaleLength],
      notes[(degreeIndex + 2) % scaleLength],
      notes[(degreeIndex + 4) % scaleLength],
      notes[(degreeIndex + 6) % scaleLength],
    ];
    const seventhRoot = seventhTones[0];
    const seventhIntervals = seventhTones
      .map((tone) => normalizePitch(tone - seventhRoot))
      .sort((a, b) => a - b);
    const seventhQuality = getSeventhQuality(seventhIntervals);
    const seventhSuffix = getChordSuffix(seventhQuality, 'seventh');
    const seventhName = `${getNoteName(seventhRoot, accidentalMode)}${seventhSuffix}`;

    sevenths.push({
      id: `seventh-${degreeIndex}`,
      type: 'seventh',
      degreeIndex,
      root: seventhRoot,
      tones: seventhTones,
      intervals: seventhIntervals,
      quality: seventhQuality,
      name: seventhName,
      degreeLabel: formatDegreeLabel(degreeIndex, scaleLength, formula, seventhQuality, 'seventh'),
      toneNames: seventhTones.map((tone) => getNoteName(tone, accidentalMode)),
      requiredIntervals: getRequiredIntervals(seventhIntervals, 'seventh'),
    });
  }

  return { triads, sevenths };
};

interface CandidateFret {
  fret: number;
  pitchClass: PitchClass;
}

const getVoicingCacheKey = (
  chord: DiatonicChord,
  startFret: number,
  span: number,
  accidentalMode: AccidentalMode
): string => {
  return `${chord.id}-${chord.root}-${chord.tones.join(',')}-${startFret}-${span}-${accidentalMode}`;
};

const getFifthIntervals = (chord: DiatonicChord): number[] => {
  return chord.intervals.filter((interval) => interval === 6 || interval === 7 || interval === 8);
};

const hasFifth = (voicing: ChordVoicing, chord: DiatonicChord): boolean => {
  const fifthIntervals = new Set(getFifthIntervals(chord));
  return voicing.stringPitches.some((pitch) => {
    if (pitch === null) {
      return false;
    }
    const interval = normalizePitch(pitch - chord.root);
    return fifthIntervals.has(interval);
  });
};

const getMuteRequiredIntervals = (chord: DiatonicChord): Set<number> => {
  const third = chord.intervals.find((interval) => interval === 3 || interval === 4);
  const fifths = getFifthIntervals(chord);
  if (chord.type === 'triad') {
    return new Set([0, ...(typeof third === 'number' ? [third] : []), ...fifths]);
  }
  const seventh = chord.intervals.find((interval) => interval === 9 || interval === 10 || interval === 11);
  return new Set([0, ...(typeof third === 'number' ? [third] : []), ...(typeof seventh === 'number' ? [seventh] : [])]);
};

const getVoicingScore = (voicing: ChordVoicing, chord: DiatonicChord, targetStrings: number): number => {
  const frets = voicing.strings.filter((fret) => fret !== 'x') as number[];
  if (!frets.length) {
    return Number.POSITIVE_INFINITY;
  }

  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  const spanPenalty = (maxFret - minFret) * 2;
  const mutedCount = voicing.strings.filter((fret) => fret === 'x').length;

  let jumpPenalty = 0;
  for (let i = 0; i < voicing.strings.length - 1; i += 1) {
    const current = voicing.strings[i];
    const next = voicing.strings[i + 1];
    if (current !== 'x' && next !== 'x') {
      const diff = Math.abs(current - next);
      if (diff > 3) {
        jumpPenalty += diff - 3;
      }
    }
  }

  const bassIndex = voicing.strings.findIndex((fret) => fret !== 'x');
  const bassPitch = bassIndex >= 0 ? voicing.stringPitches[bassIndex] : null;
  const bassPenalty = bassPitch !== null && bassPitch !== chord.root ? 2 : 0;

  const stringPenalty = Math.abs(targetStrings - frets.length);
  const fifthPenalty = chord.type === 'seventh' && !hasFifth(voicing, chord) ? 2 : 0;

  return spanPenalty + jumpPenalty + mutedCount + bassPenalty + stringPenalty + fifthPenalty;
};

export const generateChordVoicings = (
  chord: DiatonicChord,
  startFret: number,
  span: number,
  accidentalMode: AccidentalMode
): ChordVoicing[] => {
  const cacheKey = getVoicingCacheKey(chord, startFret, span, accidentalMode);
  if (voicingCache.has(cacheKey)) {
    return voicingCache.get(cacheKey) || [];
  }

  const allowOpen = startFret === 1;
  const windowStart = allowOpen ? 0 : startFret;
  const windowEnd = Math.min(allowOpen ? 3 : startFret + WINDOW_FRET_SPAN, TOTAL_FRETS - 1);
  const toneSet = new Set<PitchClass>(chord.tones);
  const muteRequiredIntervals = getMuteRequiredIntervals(chord);
  const candidatesPerString: CandidateFret[][] = STANDARD_TUNING.map((openPitch) => {
    const candidates: CandidateFret[] = [];
    for (let fret = windowStart; fret <= windowEnd; fret += 1) {
      const pitchClass = normalizePitch(openPitch + fret);
      if (toneSet.has(pitchClass)) {
        candidates.push({ fret, pitchClass });
      }
    }
    return candidates;
  });
  const hasRequiredToneOnString = STANDARD_TUNING.map((openPitch) => {
    for (let fret = windowStart; fret <= windowEnd; fret += 1) {
      const interval = normalizePitch(openPitch + fret - chord.root);
      if (muteRequiredIntervals.has(interval)) {
        return true;
      }
    }
    return false;
  });

  const voicings: ChordVoicing[] = [];
  const seenPatterns = new Set<string>();

  const minStrings = 3;
  const maxStrings = 6;
  const targetStrings = chord.type === 'seventh' ? 4 : 3;
  const requiredIntervals = new Set(chord.requiredIntervals);

  const selection: Array<CandidateFret | null> = new Array(6).fill(null);

  const recordCandidate = () => {
    const activeStrings = selection.filter((value) => value !== null) as CandidateFret[];
    const activeCount = activeStrings.length;
    if (activeCount < minStrings || activeCount > maxStrings) {
      return;
    }

    const intervalsPresent = new Set<number>();
    const frets: number[] = [];
    selection.forEach((choice, stringIndex) => {
      if (!choice) {
        return;
      }
      const interval = normalizePitch(choice.pitchClass - chord.root);
      intervalsPresent.add(interval);
      frets.push(choice.fret);
    });

    let missingRequired = false;
    requiredIntervals.forEach((interval) => {
      if (!intervalsPresent.has(interval)) {
        missingRequired = true;
      }
    });
    if (missingRequired) {
      return;
    }

    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);
    if (maxFret - minFret > WINDOW_FRET_SPAN) {
      return;
    }

    const toneNames: Array<string | null> = selection.map((choice) =>
      choice ? getNoteName(choice.pitchClass, accidentalMode) : null
    );
    const stringPitches: Array<PitchClass | null> = selection.map((choice) =>
      choice ? choice.pitchClass : null
    );
    const strings = selection.map((choice) => (choice ? choice.fret : 'x'));
    for (let stringIndex = 0; stringIndex < strings.length; stringIndex += 1) {
      if (strings[stringIndex] === 'x' && hasRequiredToneOnString[stringIndex]) {
        return;
      }
    }
    const pattern = strings.join('-');
    if (seenPatterns.has(pattern)) {
      return;
    }
    seenPatterns.add(pattern);

    voicings.push({
      strings,
      fretSpan: { min: minFret, max: maxFret },
      tones: toneNames,
      stringPitches,
      windowStart: startFret,
      windowEnd,
    });
  };

  const walk = (stringIndex: number, activeCount: number) => {
    if (stringIndex === 6) {
      recordCandidate();
      return;
    }

    const remaining = 6 - stringIndex;
    if (activeCount > maxStrings || activeCount + remaining < minStrings) {
      return;
    }

    const candidates = candidatesPerString[stringIndex];
    selection[stringIndex] = null;
    walk(stringIndex + 1, activeCount);

    candidates.forEach((candidate) => {
      selection[stringIndex] = candidate;
      walk(stringIndex + 1, activeCount + 1);
      selection[stringIndex] = null;
    });
  };

  walk(0, 0);

  let filteredVoicings = voicings;
  if (chord.type === 'triad') {
    const hasCompleteTriad = voicings.some((voicing) => hasFifth(voicing, chord));
    if (hasCompleteTriad) {
      filteredVoicings = voicings.filter((voicing) => hasFifth(voicing, chord));
    }
  }

  const scored = filteredVoicings
    .map((voicing) => ({
      voicing,
      score: getVoicingScore(voicing, chord, targetStrings),
    }))
    .sort((a, b) => a.score - b.score);
  const sortedVoicings = scored.map((entry) => entry.voicing).slice(0, MAX_VOICINGS_PER_POSITION);

  voicingCache.set(cacheKey, sortedVoicings);
  return sortedVoicings;
};

export const generateChordVoicing = (
  chord: DiatonicChord,
  startFret: number,
  span: number,
  accidentalMode: AccidentalMode
): ChordVoicing | null => {
  const voicings = generateChordVoicings(chord, startFret, span, accidentalMode);
  return voicings[0] || null;
};

export const findNearestVoicingPosition = (
  chord: DiatonicChord,
  startFret: number,
  span: number,
  minStartFret: number,
  maxStartFret: number,
  accidentalMode: AccidentalMode
): number | null => {
  for (let offset = 0; offset <= maxStartFret; offset += 1) {
    const lower = startFret - offset;
    const upper = startFret + offset;
    if (lower >= minStartFret) {
      const voicings = generateChordVoicings(chord, lower, span, accidentalMode);
      if (voicings.length) {
        return lower;
      }
    }
    if (upper <= maxStartFret && upper >= minStartFret) {
      const voicings = generateChordVoicings(chord, upper, span, accidentalMode);
      if (voicings.length) {
        return upper;
      }
    }
  }

  return null;
};
