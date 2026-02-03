import { ChordVoicing, PitchClass } from '../types';

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const CONTROL_CHANGE = 0xB0;

const STANDARD_TUNING_MIDI = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

export const isMidiSupported = (): boolean => {
  return typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function';
};

export const requestMidiAccess = async (): Promise<MIDIAccess> => {
  if (!isMidiSupported()) {
    throw new Error('Web MIDI is not supported in this browser.');
  }
  return navigator.requestMIDIAccess({ sysex: false });
};

export const listOutputs = (access: MIDIAccess): MIDIOutput[] => {
  return Array.from(access.outputs.values());
};

export const allNotesOff = (output: MIDIOutput, channel = 0, notes: number[] = []) => {
  output.send([CONTROL_CHANGE | channel, 123, 0]);
  notes.forEach((note) => {
    output.send([NOTE_OFF | channel, note, 0]);
  });
};

export const sendChord = (
  output: MIDIOutput,
  notes: number[],
  velocity: number,
  durationMs: number,
  options?: { strumMs?: number; channel?: number }
): (() => void) => {
  const channel = options?.channel ?? 0;
  const strumMs = Math.max(0, options?.strumMs ?? 0);
  const uniqueNotes = Array.from(new Set(notes)).filter((note) => Number.isFinite(note));
  const timeouts: number[] = [];

  uniqueNotes.forEach((note, index) => {
    const delay = strumMs ? index * strumMs : 0;
    const timeoutId = window.setTimeout(() => {
      output.send([NOTE_ON | channel, note, Math.max(0, Math.min(127, velocity))]);
    }, delay);
    timeouts.push(timeoutId);
  });

  const offTimeout = window.setTimeout(() => {
    uniqueNotes.forEach((note) => {
      output.send([NOTE_OFF | channel, note, 0]);
    });
  }, Math.max(0, durationMs));
  timeouts.push(offTimeout);

  return () => {
    timeouts.forEach((id) => clearTimeout(id));
    uniqueNotes.forEach((note) => {
      output.send([NOTE_OFF | channel, note, 0]);
    });
  };
};

export const getMidiNotesFromVoicing = (voicing: ChordVoicing): number[] => {
  return voicing.strings
    .map((fret, stringIndex) => {
      if (fret === 'x') {
        return null;
      }
      return STANDARD_TUNING_MIDI[stringIndex] + fret;
    })
    .filter((note): note is number => typeof note === 'number');
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const buildNeutralChordVoicing = (
  chordTones: PitchClass[],
  previousNotes: number[] = [],
  range: { min: number; max: number } = { min: 40, max: 76 }
): number[] => {
  if (!chordTones.length) {
    return [];
  }

  const uniqueTones = chordTones.filter((tone, index) => chordTones.indexOf(tone) === index);
  const rootPc = uniqueTones[0];
  const target = previousNotes.length
    ? previousNotes.reduce((sum, note) => sum + note, 0) / previousNotes.length
    : 52;

  let bestRoot: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let octave = 2; octave <= 5; octave += 1) {
    const candidate = (octave + 1) * 12 + rootPc;
    if (candidate < range.min || candidate > range.max) {
      continue;
    }
    const distance = Math.abs(candidate - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestRoot = candidate;
    }
  }

  if (bestRoot === null) {
    let fallback = (Math.round(target / 12) * 12) + rootPc;
    while (fallback < range.min) fallback += 12;
    while (fallback > range.max) fallback -= 12;
    bestRoot = clamp(fallback, range.min, range.max);
  }

  const notes: number[] = [bestRoot];
  let lastNote = bestRoot;

  uniqueTones.slice(1).forEach((tone) => {
    let candidate = Math.floor(lastNote / 12) * 12 + tone;
    while (candidate <= lastNote) {
      candidate += 12;
    }
    if (candidate > range.max && candidate - 12 > lastNote) {
      candidate -= 12;
    }
    notes.push(candidate);
    lastNote = candidate;
  });

  return notes;
};
