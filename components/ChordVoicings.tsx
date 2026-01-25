import React, { useMemo, useState } from 'react';
import { AccidentalMode, ChordVoicing, DiatonicChord, PitchClass } from '../types';
import { generateChordVoicing, findNearestVoicingPosition } from '../lib/chords';

type FilterMode = 'all' | 'triad' | 'seventh';
type DensityMode = 'comfortable' | 'compact';

interface ChordVoicingsProps {
  triads: DiatonicChord[];
  sevenths: DiatonicChord[];
  accidentalMode: AccidentalMode;
  startFret: number;
  maxStartFret: number;
  positionSpan: number;
  onStartFretChange: (fret: number) => void;
  onPositionSpanChange: (span: number) => void;
  hoveredChordId: string | null;
  selectedChordId: string | null;
  onHoverChord: (id: string | null) => void;
  onSelectChord: (id: string | null) => void;
}

const getOrdinal = (value: number): string => {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
};

const formatToneSummary = (voicing: ChordVoicing | null, chord: DiatonicChord): string => {
  const toneNames = voicing?.tones.filter((tone): tone is string => Boolean(tone)) || [];
  if (!toneNames.length) {
    return chord.toneNames.join('-');
  }

  const unique = Array.from(new Set(toneNames));

  return unique.join('-');
};

const ChordDiagram: React.FC<{
  voicing: ChordVoicing;
  startFret: number;
  span: number;
  root: PitchClass;
  compact: boolean;
}> = ({ voicing, startFret, span, root, compact }) => {
  const width = compact ? 110 : 130;
  const height = compact ? 140 : 165;
  const paddingTop = 20;
  const paddingBottom = 18;
  const paddingLeft = 18;
  const paddingRight = 18;
  const fretCount = Math.max(5, span + 1);
  const gridWidth = width - paddingLeft - paddingRight;
  const gridHeight = height - paddingTop - paddingBottom;
  const stringSpacing = gridWidth / 5;
  const fretSpacing = gridHeight / fretCount;
  const showNut = startFret <= 1;

  const stringX = (stringIndex: number) => paddingLeft + stringIndex * stringSpacing;
  const fretY = (fretIndex: number) => paddingTop + fretIndex * fretSpacing;

  return (
    <svg width={width} height={height} className="block">
      {Array.from({ length: 6 }).map((_, stringIndex) => (
        <line
          key={`string-${stringIndex}`}
          x1={stringX(stringIndex)}
          x2={stringX(stringIndex)}
          y1={fretY(0)}
          y2={fretY(fretCount)}
          stroke="#475569"
          strokeWidth={1}
        />
      ))}

      {Array.from({ length: fretCount + 1 }).map((_, fretIndex) => (
        <line
          key={`fret-${fretIndex}`}
          x1={stringX(0)}
          x2={stringX(5)}
          y1={fretY(fretIndex)}
          y2={fretY(fretIndex)}
          stroke={fretIndex === 0 && showNut ? '#e2e8f0' : '#334155'}
          strokeWidth={fretIndex === 0 && showNut ? 2.5 : 1}
        />
      ))}

      {startFret > 1 && (
        <text
          x={4}
          y={fretY(1) - 4}
          fill="#94a3b8"
          fontSize={compact ? 9 : 10}
          fontFamily="JetBrains Mono, monospace"
        >
          {getOrdinal(startFret)} fret
        </text>
      )}

      {voicing.strings.map((fret, stringIndex) => {
        const x = stringX(stringIndex);
        if (fret === 'x') {
          return (
            <text
              key={`muted-${stringIndex}`}
              x={x}
              y={fretY(0) - 6}
              fill="#94a3b8"
              fontSize={compact ? 10 : 11}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              x
            </text>
          );
        }
        if (fret === 0) {
          return (
            <circle
              key={`open-${stringIndex}`}
              cx={x}
              cy={fretY(0) - 6}
              r={compact ? 3.5 : 4}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1.2}
            />
          );
        }

        const offset = fret - startFret;
        if (offset < 0 || offset >= fretCount) {
          return null;
        }
        const y = fretY(offset + 0.5);
        const isRoot = voicing.stringPitches[stringIndex] === root;
        return (
          <circle
            key={`note-${stringIndex}`}
            cx={x}
            cy={y}
            r={compact ? 6 : 7}
            fill="#1e293b"
            stroke={isRoot ? '#10b981' : '#94a3b8'}
            strokeWidth={isRoot ? 2 : 1.2}
          />
        );
      })}
    </svg>
  );
};

export const ChordVoicings: React.FC<ChordVoicingsProps> = ({
  triads,
  sevenths,
  accidentalMode,
  startFret,
  maxStartFret,
  positionSpan,
  onStartFretChange,
  onPositionSpanChange,
  hoveredChordId,
  selectedChordId,
  onHoverChord,
  onSelectChord,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [densityMode, setDensityMode] = useState<DensityMode>('comfortable');

  const chords = useMemo(() => {
    if (filterMode === 'triad') {
      return triads;
    }
    if (filterMode === 'seventh') {
      return sevenths;
    }
    return [...triads, ...sevenths];
  }, [filterMode, triads, sevenths]);

  const chordEntries = useMemo(
    () =>
      chords.map((chord) => ({
        chord,
        voicing: generateChordVoicing(chord, startFret, positionSpan, accidentalMode),
      })),
    [chords, startFret, positionSpan, accidentalMode]
  );

  const handleSelect = (chordId: string, element: HTMLDivElement) => {
    const nextId = selectedChordId === chordId ? null : chordId;
    onSelectChord(nextId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleFindNearest = (chord: DiatonicChord) => {
    const nearest = findNearestVoicingPosition(chord, startFret, positionSpan, maxStartFret, accidentalMode);
    if (nearest !== null) {
      onStartFretChange(nearest);
    }
  };

  const toggleDensity = () => {
    setDensityMode((current) => (current === 'comfortable' ? 'compact' : 'comfortable'));
  };

  return (
    <section className="bg-[#111211] rounded-xl border border-slate-800 p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Diatonic Chords</h3>
            <p className="text-xs text-slate-500">Built from scale tones of the selected mode.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-mono uppercase tracking-wide">Position</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={maxStartFret}
                value={startFret}
                onChange={(event) => onStartFretChange(Number(event.target.value))}
                className="w-32 accent-primary"
              />
              <span className="text-xs text-slate-300 w-8 text-right">{startFret}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Triads</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-300 font-mono">
              {triads.map((chord) => (
                <div key={chord.id} className="flex items-center justify-between">
                  <span className="text-slate-500">{chord.degreeLabel}</span>
                  <span>{chord.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">7th Chords</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-300 font-mono">
              {sevenths.map((chord) => (
                <div key={chord.id} className="flex items-center justify-between">
                  <span className="text-slate-500">{chord.degreeLabel}</span>
                  <span>{chord.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/70 pt-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Chord Voicings</h3>
            <p className="text-xs text-slate-500">Playable shapes around the selected start fret.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex rounded-full border border-slate-700 overflow-hidden">
              {(['all', 'triad', 'seventh'] as FilterMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 uppercase tracking-wide ${
                    filterMode === mode
                      ? 'bg-primary text-slate-900'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'all' ? 'All' : mode === 'triad' ? 'Triads' : '7th'}
                </button>
              ))}
            </div>
            <button
              onClick={toggleDensity}
              className="px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
            >
              {densityMode === 'comfortable' ? 'Comfortable' : 'Compact'}
            </button>
          </div>
        </div>

        <div
          className={`grid gap-4 ${
            densityMode === 'comfortable'
              ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {chordEntries.map(({ chord, voicing }) => {
            const isActive = hoveredChordId === chord.id || selectedChordId === chord.id;
            return (
              <div
                key={chord.id}
                role="button"
                tabIndex={0}
                onMouseEnter={() => onHoverChord(chord.id)}
                onMouseLeave={() => onHoverChord(null)}
                onClick={(event) => handleSelect(chord.id, event.currentTarget)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelect(chord.id, event.currentTarget);
                  }
                }}
                className={`rounded-xl border p-4 transition cursor-pointer ${
                  isActive
                    ? 'border-accent/60 ring-2 ring-accent/40 bg-slate-900/70'
                    : 'border-slate-800/70 bg-slate-900/40 hover:border-slate-700'
                } ${densityMode === 'compact' ? 'p-3' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{chord.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">{chord.degreeLabel}</div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{accidentalMode === 'sharp' ? '#' : 'b'}</span>
                </div>

                {voicing ? (
                  <ChordDiagram
                    voicing={voicing}
                    startFret={startFret}
                    span={positionSpan}
                    root={chord.root}
                    compact={densityMode === 'compact'}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-slate-700 rounded-lg h-[140px] gap-2">
                    <span>No easy voicing in this position.</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onPositionSpanChange(positionSpan + 2);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      >
                        Widen range (+2)
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleFindNearest(chord);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      >
                        Find nearest
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-[10px] text-slate-500 font-mono uppercase tracking-wide">
                  Tones: <span className="text-slate-300">{formatToneSummary(voicing, chord)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
