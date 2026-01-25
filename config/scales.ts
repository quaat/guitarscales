import { ScaleConfig } from '../types';

const scales: ScaleConfig[] = [
  {
    "id": "major",
    "name": "Major (Ionian)",
    "intervals": [0, 2, 4, 5, 7, 9, 11],
    "modeNames": ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"],
    "tags": ["diatonic", "fundamental"]
  },
  {
    "id": "harmonic_minor",
    "name": "Harmonic Minor",
    "intervals": [0, 2, 3, 5, 7, 8, 11],
    "modeNames": ["Harmonic Minor", "Locrian ♮6", "Ionian #5", "Dorian #4", "Phrygian Dominant", "Lydian #2", "Super Locrian bb7"],
    "tags": ["minor", "classical"]
  },
  {
    "id": "melodic_minor",
    "name": "Melodic Minor (Ascending)",
    "intervals": [0, 2, 3, 5, 7, 9, 11],
    "modeNames": ["Melodic Minor", "Dorian b2", "Lydian Augmented", "Lydian Dominant", "Mixolydian b6", "Locrian #2", "Super Locrian"],
    "tags": ["jazz", "minor"]
  },
  {
    "id": "minor_pentatonic",
    "name": "Minor Pentatonic",
    "intervals": [0, 3, 5, 7, 10],
    "modeNames": ["Minor Pentatonic", "Major Pentatonic", "Suspended Pentatonic", "Man Gong", "Ritusen"],
    "tags": ["pentatonic", "blues", "rock"]
  },
  {
    "id": "major_pentatonic",
    "name": "Major Pentatonic",
    "intervals": [0, 2, 4, 7, 9],
    "tags": ["pentatonic", "country"]
  },
  {
    "id": "blues",
    "name": "Blues Scale",
    "intervals": [0, 3, 5, 6, 7, 10],
    "tags": ["blues", "rock"]
  },
  {
    "id": "whole_tone",
    "name": "Whole Tone",
    "intervals": [0, 2, 4, 6, 8, 10],
    "tags": ["symmetrical"]
  },
  {
    "id": "diminished_wh",
    "name": "Diminished (Whole-Half)",
    "intervals": [0, 2, 3, 5, 6, 8, 9, 11],
    "tags": ["symmetrical", "jazz"]
  }
];

export default scales;