import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Controls } from './components/Controls';
import { Fretboard } from './components/Fretboard';
import { ScaleInfo } from './components/ScaleInfo';
import { ChordVoicings } from './components/ChordVoicings';
import { ProgressionControls } from './components/ProgressionControls';
import scalesData from './config/scales';
import scaleDescriptions from './config/scaleDescriptions.json';
import {
  AccidentalMode,
  LabelMode,
  ProgressionStepDisplay,
  ScaleConfig,
  TimeSignature,
} from './types';
import { calculateScaleData, getNoteName } from './lib/musicTheory';
import {
  buildDiatonicChords,
  formatChordNameFromTones,
  generateChordVoicings,
  getDiatonicChordTones,
} from './lib/chords';
import { TOTAL_FRETS } from './lib/constants';
import { parseRomanProgression } from './lib/romanNumerals';
import { Music, Share2 } from 'lucide-react';

const TIME_SIGNATURE_OPTIONS: Array<TimeSignature & { label: string }> = [
  { label: '2/4', beatsPerBar: 2, beatUnit: 4 },
  { label: '3/4', beatsPerBar: 3, beatUnit: 4 },
  { label: '4/4', beatsPerBar: 4, beatUnit: 4 },
  { label: '6/8', beatsPerBar: 6, beatUnit: 8 },
  { label: '7/8', beatsPerBar: 7, beatUnit: 8 },
  { label: '12/8', beatsPerBar: 12, beatUnit: 8 },
];

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatProgressionForUrl = (input: string) => input.trim().replace(/[\s,–-]+/g, '-');

const App: React.FC = () => {
  // --- State ---
  const [rootNote, setRootNote] = useState<number>(0); // 0 = C
  const [selectedScaleId, setSelectedScaleId] = useState<string>('major');
  const [modeIndex, setModeIndex] = useState<number>(0);
  const [labelMode, setLabelMode] = useState<LabelMode>('note');
  const [accidentalMode, setAccidentalMode] = useState<AccidentalMode>('sharp');
  const [startFret, setStartFret] = useState<number>(1);
  const [positionSpan, setPositionSpan] = useState<number>(3);
  const [hoveredChordId, setHoveredChordId] = useState<string | null>(null);
  const [selectedChordId, setSelectedChordId] = useState<string | null>(null);
  const [voicingSelections, setVoicingSelections] = useState<Record<string, number>>({});
  const [progressionInput, setProgressionInput] = useState<string>('I V vi IV');
  const [bpm, setBpm] = useState<number>(120);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>({
    beatsPerBar: 4,
    beatUnit: 4,
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(false);
  const minStartFret = 1;
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentStepIndexRef = useRef<number>(currentStepIndex);
  const currentBeatRef = useRef<number>(currentBeat);

  // --- Load Config ---
  const scales: ScaleConfig[] = scalesData;
  const scaleDescriptionsMap = scaleDescriptions as Record<string, string>;

  // --- Logic ---
  const currentScale = useMemo(() =>
    scales.find(s => s.id === selectedScaleId) || scales[0],
  [selectedScaleId, scales]);

  // Reset mode if scale changes and new scale doesn't have that many modes
  useEffect(() => {
    if (currentScale.modeNames && modeIndex >= currentScale.modeNames.length) {
      setModeIndex(0);
    } else if (!currentScale.modeNames) {
      setModeIndex(0);
    }
  }, [currentScale, modeIndex]);

  // Derived Data
  const scaleData = useMemo(() =>
    calculateScaleData(rootNote, currentScale, modeIndex),
  [rootNote, currentScale, modeIndex]);

  const uniqueScaleNotes = useMemo(() => Array.from(new Set(scaleData.notes)), [scaleData.notes]);
  const isHeptatonic = scaleData.notes.length === 7 && uniqueScaleNotes.length === 7;

  const currentModeName = currentScale.modeNames
    ? currentScale.modeNames[modeIndex]
    : currentScale.name;
  const scaleDescription = scaleDescriptionsMap[currentScale.id] || '';

  const progressionParse = useMemo(
    () => parseRomanProgression(progressionInput),
    [progressionInput]
  );
  const progressionSteps = progressionParse.steps;
  const progressionPreviewSteps: ProgressionStepDisplay[] = useMemo(() => {
    if (!isHeptatonic) {
      return [];
    }

    return progressionSteps.map((step, index) => {
      const chordTones = getDiatonicChordTones(scaleData.notes, step.degree, step.extension);
      const chordName = chordTones.length
        ? formatChordNameFromTones(chordTones[0], chordTones, accidentalMode)
        : 'N/A';
      const toneNames = chordTones.map((tone) => getNoteName(tone, accidentalMode));

      return {
        id: `${step.raw}-${index}`,
        roman: step.raw,
        chordName,
        toneNames,
        degree: step.degree,
        extension: step.extension,
        chordTones,
      };
    });
  }, [progressionSteps, scaleData.notes, accidentalMode, isHeptatonic]);

  const canPlayProgression =
    isHeptatonic && progressionParse.errors.length === 0 && progressionSteps.length > 0;
  const isPlaybackDisabled = !canPlayProgression && !isPlaying;

  const { triads, sevenths } = useMemo(
    () => buildDiatonicChords(scaleData, accidentalMode),
    [scaleData, accidentalMode]
  );
  const allChords = useMemo(() => [...triads, ...sevenths], [triads, sevenths]);
  const chordById = useMemo(() => {
    return new Map(allChords.map((chord) => [chord.id, chord]));
  }, [allChords]);

  const maxStartFret = useMemo(
    () => Math.max(minStartFret, TOTAL_FRETS - (positionSpan + 1)),
    [positionSpan, minStartFret]
  );

  const activeChord = useMemo(() => {
    if (hoveredChordId && chordById.has(hoveredChordId)) {
      return chordById.get(hoveredChordId) || null;
    }
    if (selectedChordId && chordById.has(selectedChordId)) {
      return chordById.get(selectedChordId) || null;
    }
    return null;
  }, [hoveredChordId, selectedChordId, chordById]);

  const activeVoicing = useMemo(() => {
    if (!activeChord) {
      return null;
    }
    const voicings = generateChordVoicings(activeChord, startFret, positionSpan, accidentalMode);
    if (!voicings.length) {
      return null;
    }
    const index = voicingSelections[activeChord.id] ?? 0;
    return voicings[Math.min(index, voicings.length - 1)] || null;
  }, [activeChord, startFret, positionSpan, accidentalMode, voicingSelections]);

  const activeVoicingPitches = useMemo(() => {
    if (!activeVoicing) {
      return undefined;
    }
    return activeVoicing.stringPitches.filter((pitch): pitch is number => pitch !== null);
  }, [activeVoicing]);

  const activeHighlightNotes = useMemo(() => {
    if (activeVoicingPitches && activeVoicingPitches.length) {
      return activeVoicingPitches;
    }
    return activeChord?.tones;
  }, [activeVoicingPitches, activeChord]);

  const currentProgressionStep = useMemo(() => {
    if (!progressionPreviewSteps.length) {
      return null;
    }
    const index = Math.min(currentStepIndex, progressionPreviewSteps.length - 1);
    return progressionPreviewSteps[index] || null;
  }, [progressionPreviewSteps, currentStepIndex]);

  const playbackChordTones = useMemo(() => {
    if (!isPlaying || !currentProgressionStep) {
      return undefined;
    }
    return currentProgressionStep.chordTones;
  }, [isPlaying, currentProgressionStep]);

  const activeProgressionChordId = useMemo(() => {
    if (!isPlaying || !currentProgressionStep) {
      return null;
    }
    const prefix = currentProgressionStep.extension === '7' ? 'seventh' : 'triad';
    return `${prefix}-${currentProgressionStep.degree - 1}`;
  }, [isPlaying, currentProgressionStep]);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    currentBeatRef.current = currentBeat;
  }, [currentBeat]);

  // --- Handlers ---
  const handleReset = () => {
    setRootNote(0); // C
    setSelectedScaleId('major');
    setModeIndex(0);
    setLabelMode('note');
    setAccidentalMode('sharp');
    setStartFret(minStartFret);
    setPositionSpan(3);
    setHoveredChordId(null);
    setSelectedChordId(null);
    setVoicingSelections({});
    setProgressionInput('I V vi IV');
    setBpm(120);
    setTimeSignature({ beatsPerBar: 4, beatUnit: 4 });
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setCurrentBeat(0);
    setMetronomeEnabled(false);
  };

  const handleShare = () => {
     const url = new URL(window.location.href);
     url.searchParams.set('root', rootNote.toString());
     url.searchParams.set('scale', selectedScaleId);
     url.searchParams.set('mode', modeIndex.toString());
     url.searchParams.set('accidental', accidentalMode);
     const formattedProgression = formatProgressionForUrl(progressionInput);
     if (formattedProgression) {
       url.searchParams.set('prog', formattedProgression);
     } else {
       url.searchParams.delete('prog');
     }
     url.searchParams.set('bpm', bpm.toString());
     url.searchParams.set('ts', `${timeSignature.beatsPerBar}/${timeSignature.beatUnit}`);
     navigator.clipboard.writeText(url.toString());
     alert("URL copied to clipboard!");
  };

  // --- Load from URL on mount ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('root');
    const s = params.get('scale');
    const m = params.get('mode');
    const a = params.get('accidental');
    const p = params.get('prog');
    const bpmParam = params.get('bpm');
    const tsParam = params.get('ts');

    if (r) setRootNote(Number(r));
    if (s && scales.some(sc => sc.id === s)) setSelectedScaleId(s);
    if (m) setModeIndex(Number(m));
    if (a === 'sharp' || a === 'flat') setAccidentalMode(a as AccidentalMode);
    if (p) setProgressionInput(p);
    if (bpmParam) {
      const parsedBpm = Number(bpmParam);
      if (Number.isFinite(parsedBpm)) {
        setBpm(clampNumber(Math.round(parsedBpm), 30, 300));
      }
    }
    if (tsParam) {
      const match = TIME_SIGNATURE_OPTIONS.find(
        (option) => `${option.beatsPerBar}/${option.beatUnit}` === tsParam
      );
      if (match) {
        setTimeSignature({ beatsPerBar: match.beatsPerBar, beatUnit: match.beatUnit });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setVoicingSelections({});
  }, [rootNote, selectedScaleId, modeIndex, startFret, positionSpan, accidentalMode]);

  useEffect(() => {
    if (currentStepIndex >= progressionSteps.length && progressionSteps.length > 0) {
      setCurrentStepIndex(0);
    }
    if (!progressionSteps.length) {
      setCurrentStepIndex(0);
    }
  }, [progressionSteps.length, currentStepIndex]);

  useEffect(() => {
    if (isPlaying && !canPlayProgression) {
      setIsPlaying(false);
    }
  }, [isPlaying, canPlayProgression]);

  const handleStartFretChange = (value: number) => {
    const clamped = Math.min(Math.max(value, minStartFret), maxStartFret);
    setStartFret(clamped);
  };

  const handleBpmChange = (value: number) => {
    if (!Number.isFinite(value)) {
      return;
    }
    setBpm(clampNumber(Math.round(value), 30, 300));
  };

  const handleTimeSignatureChange = (next: TimeSignature) => {
    setTimeSignature(next);
  };

  const ensureAudioContext = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return null;
    }
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playMetronomeClick = useCallback(
    (isDownbeat: boolean) => {
      if (!metronomeEnabled) {
        return;
      }
      const ctx = ensureAudioContext();
      if (!ctx) {
        return;
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = isDownbeat ? 1000 : 720;
      gain.gain.setValueAtTime(isDownbeat ? 0.08 : 0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    },
    [metronomeEnabled, ensureAudioContext]
  );

  const handleTogglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (!canPlayProgression) {
      return;
    }
    setIsPlaying(true);
    setCurrentBeat(0);
    currentBeatRef.current = 0;
    if (metronomeEnabled) {
      playMetronomeClick(true);
    }
  };

  const handleResetStep = () => {
    setCurrentStepIndex(0);
    setCurrentBeat(0);
    currentBeatRef.current = 0;
  };

  const handleProgressionStepSelect = (index: number) => {
    if (index < 0 || index >= progressionSteps.length) {
      return;
    }
    setCurrentStepIndex(index);
    currentStepIndexRef.current = index;
    setCurrentBeat(0);
    currentBeatRef.current = 0;
  };

  useEffect(() => {
    if (startFret > maxStartFret) {
      setStartFret(maxStartFret);
      return;
    }
    if (startFret < minStartFret) {
      setStartFret(minStartFret);
    }
  }, [startFret, maxStartFret, minStartFret]);

  useEffect(() => {
    if (selectedChordId && !chordById.has(selectedChordId)) {
      setSelectedChordId(null);
    }
    if (hoveredChordId && !chordById.has(hoveredChordId)) {
      setHoveredChordId(null);
    }
  }, [selectedChordId, hoveredChordId, chordById]);

  useEffect(() => {
    if (!isPlaying || !canPlayProgression) {
      return;
    }

    const beatDurationMs = (60 / bpm) * 1000 * (4 / timeSignature.beatUnit);
    let nextTickAt = performance.now() + beatDurationMs;
    let rafId = 0;
    let cancelled = false;

    const loop = () => {
      if (cancelled) {
        return;
      }
      const now = performance.now();
      while (now >= nextTickAt) {
        const nextBeat = (currentBeatRef.current + 1) % timeSignature.beatsPerBar;
        currentBeatRef.current = nextBeat;
        setCurrentBeat(nextBeat);
        const isDownbeat = nextBeat === 0;

        if (isDownbeat) {
          setCurrentStepIndex((prev) => {
            const nextStep = progressionSteps.length ? (prev + 1) % progressionSteps.length : 0;
            currentStepIndexRef.current = nextStep;
            return nextStep;
          });
        }

        playMetronomeClick(isDownbeat);
        nextTickAt += beatDurationMs;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [
    isPlaying,
    canPlayProgression,
    bpm,
    timeSignature.beatUnit,
    timeSignature.beatsPerBar,
    progressionSteps.length,
    playMetronomeClick,
  ]);

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-primary/30">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-primary to-accent p-2 rounded-lg">
              <Music className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">GuitarScales</h1>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Interactive Fretboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button
               onClick={handleShare}
               className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
               title="Copy Link"
             >
               <Share2 size={18} />
             </button>

          </div>
        </div>
      </header>

      <main className="w-full px-4 lg:px-0 py-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Left Panel: Controls */}
          <aside className="w-full lg:w-[320px] lg:sticky lg:top-24 h-fit z-40 shrink-0">
            <Controls
              scales={scales}
              selectedScaleId={selectedScaleId}
              onScaleChange={setSelectedScaleId}
              rootNote={rootNote}
              onRootChange={setRootNote}
              modeIndex={modeIndex}
              onModeChange={setModeIndex}
              labelMode={labelMode}
              onLabelModeChange={setLabelMode}
              accidentalMode={accidentalMode}
              onAccidentalModeChange={setAccidentalMode}
              onReset={handleReset}
            />

            <ProgressionControls
              progressionInput={progressionInput}
              onProgressionInputChange={setProgressionInput}
              parseErrors={progressionParse.errors}
              previewSteps={progressionPreviewSteps}
              isHeptatonic={isHeptatonic}
              bpm={bpm}
              onBpmChange={handleBpmChange}
              timeSignature={timeSignature}
              timeSignatureOptions={TIME_SIGNATURE_OPTIONS}
              onTimeSignatureChange={handleTimeSignatureChange}
              isPlaying={isPlaying}
              onTogglePlayback={handleTogglePlayback}
              onResetStep={handleResetStep}
              metronomeEnabled={metronomeEnabled}
              onMetronomeToggle={() => setMetronomeEnabled((current) => !current)}
              isPlaybackDisabled={isPlaybackDisabled}
            />

            {/* Legend (Hidden on small mobile to save space, optional) */}
            <div className="mt-6 p-4 rounded-lg border border-slate-800/50 hidden md:block">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary ring-2 ring-primary/30"></div>
                  <span className="text-xs text-slate-400">Root Note</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-surface border border-slate-600"></div>
                  <span className="text-xs text-slate-400">Scale Interval</span>
                </div>
                {isPlaying && (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-amber-400/70 bg-slate-900"></div>
                    <span className="text-xs text-slate-400">Chord tones (current step)</span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Panel: Visualization */}
          <section className="flex-1 min-w-0 space-y-6 lg:pr-6">

            {/* Scale Info Card */}
            <ScaleInfo
              data={scaleData}
              scaleName={currentScale.name}
              modeName={currentModeName}
              accidentalMode={accidentalMode}
              description={scaleDescription}
            />

            {/* Fretboard Area */}
            <div className="bg-[#0d1117] rounded-xl p-1 sm:p-2 border border-slate-800 shadow-2xl relative overflow-hidden group">
               {/* Decorative Gradient Glow */}
               <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>

               <div className="relative z-10 bg-[#0d1117] rounded-lg">
                  <Fretboard
                    data={scaleData}
                    labelMode={labelMode}
                    accidentalMode={accidentalMode}
                    highlightNotes={activeHighlightNotes}
                    highlightRoot={activeChord?.root}
                    progressionChordTones={playbackChordTones}
                  />
               </div>
            </div>

            <ChordVoicings
              triads={triads}
              sevenths={sevenths}
              accidentalMode={accidentalMode}
              startFret={startFret}
              minStartFret={minStartFret}
              maxStartFret={maxStartFret}
              positionSpan={positionSpan}
              onStartFretChange={handleStartFretChange}
              onPositionSpanChange={(span) => setPositionSpan(Math.min(span, TOTAL_FRETS - 1))}
              voicingSelections={voicingSelections}
              onVoicingSelect={(chordId, index) =>
                setVoicingSelections((current) => ({ ...current, [chordId]: index }))
              }
              hoveredChordId={hoveredChordId}
              selectedChordId={selectedChordId}
              onHoverChord={setHoveredChordId}
              onSelectChord={setSelectedChordId}
              progressionSteps={progressionPreviewSteps}
              currentProgressionStepIndex={currentStepIndex}
              isProgressionPlaying={isPlaying}
              onProgressionStepSelect={handleProgressionStepSelect}
              activeProgressionChordId={activeProgressionChordId}
            />

            <div className="text-center text-xs text-slate-600 mt-8">
              <p>Fretboard visualization uses Standard Tuning (E A D G B E).</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
