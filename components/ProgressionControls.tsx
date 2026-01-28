import React from 'react';
import {
  ProgressionStepDisplay,
  RomanParseError,
  TimeSignature,
} from '../types';

interface TimeSignatureOption extends TimeSignature {
  label: string;
}

interface ProgressionControlsProps {
  progressionInput: string;
  onProgressionInputChange: (value: string) => void;
  parseErrors: RomanParseError[];
  previewSteps: ProgressionStepDisplay[];
  isHeptatonic: boolean;
  bpm: number;
  onBpmChange: (value: number) => void;
  timeSignature: TimeSignature;
  timeSignatureOptions: TimeSignatureOption[];
  onTimeSignatureChange: (value: TimeSignature) => void;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  onResetStep: () => void;
  metronomeEnabled: boolean;
  onMetronomeToggle: () => void;
  isPlaybackDisabled: boolean;
}

export const ProgressionControls: React.FC<ProgressionControlsProps> = ({
  progressionInput,
  onProgressionInputChange,
  parseErrors,
  previewSteps,
  isHeptatonic,
  bpm,
  onBpmChange,
  timeSignature,
  timeSignatureOptions,
  onTimeSignatureChange,
  isPlaying,
  onTogglePlayback,
  onResetStep,
  metronomeEnabled,
  onMetronomeToggle,
  isPlaybackDisabled,
}) => {
  const errorMessage = !isHeptatonic
    ? 'Roman numeral progressions currently require a 7-note scale.'
    : parseErrors[0]?.message;

  return (
    <div className="bg-surface rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col gap-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Progression
        </h2>
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
          Roman Numerals
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-300" htmlFor="progression-input">
          Progression Input
        </label>
        <input
          id="progression-input"
          type="text"
          value={progressionInput}
          onChange={(event) => onProgressionInputChange(event.target.value)}
          placeholder="I V vi IV"
          disabled={!isHeptatonic}
          aria-invalid={Boolean(errorMessage)}
          className={`w-full bg-slate-800 border rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow ${
            !isHeptatonic ? 'opacity-60 cursor-not-allowed' : 'hover:border-slate-600'
          } ${errorMessage ? 'border-rose-500/60' : 'border-slate-700'}`}
        />
        {errorMessage ? (
          <p className="text-xs text-rose-400">{errorMessage}</p>
        ) : (
          <p className="text-[11px] text-slate-500">
            Separate chords with spaces, commas, or dashes (e.g., I-V-vi-IV).
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">Parsed Preview</span>
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            {previewSteps.length} step{previewSteps.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {previewSteps.length ? (
            previewSteps.map((step) => (
              <div
                key={step.id}
                className="px-3 py-2 rounded-lg border border-slate-700/70 bg-slate-900/60"
              >
                <div className="text-xs font-mono text-slate-100">{step.roman}</div>
                <div className="text-xs text-slate-300">{step.chordName}</div>
                <div className="text-[10px] text-slate-500">{step.toneNames.join('-')}</div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500">No valid steps parsed yet.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300" htmlFor="progression-bpm">
            BPM (Quarter-note)
          </label>
          <input
            id="progression-bpm"
            type="number"
            min={30}
            max={300}
            value={bpm}
            onChange={(event) => onBpmChange(event.target.valueAsNumber)}
            disabled={!isHeptatonic}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300" htmlFor="progression-time-signature">
            Time Signature
          </label>
          <select
            id="progression-time-signature"
            value={`${timeSignature.beatsPerBar}/${timeSignature.beatUnit}`}
            onChange={(event) => {
              const next = timeSignatureOptions.find(
                (option) => `${option.beatsPerBar}/${option.beatUnit}` === event.target.value
              );
              if (next) {
                onTimeSignatureChange({ beatsPerBar: next.beatsPerBar, beatUnit: next.beatUnit });
              }
            }}
            disabled={!isHeptatonic}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none cursor-pointer hover:border-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundImage: 'none' }}
          >
            {timeSignatureOptions.map((option) => (
              <option key={option.label} value={`${option.beatsPerBar}/${option.beatUnit}`}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onTogglePlayback}
          disabled={isPlaybackDisabled}
          aria-pressed={isPlaying}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            isPlaying
              ? 'bg-rose-500/90 text-white hover:bg-rose-400'
              : 'bg-primary text-slate-900 hover:bg-primary/80'
          } ${isPlaybackDisabled ? 'opacity-50 cursor-not-allowed hover:bg-primary' : ''}`}
        >
          {isPlaying ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={onResetStep}
          disabled={!previewSteps.length}
          className="px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Step
        </button>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={metronomeEnabled}
            onChange={() => onMetronomeToggle()}
            disabled={!isHeptatonic}
            className="accent-primary"
          />
          Metronome
        </label>
      </div>
    </div>
  );
};
