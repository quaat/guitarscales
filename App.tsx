import React, { useState, useEffect, useMemo } from 'react';
import { Controls } from './components/Controls';
import { Fretboard } from './components/Fretboard';
import { ScaleInfo } from './components/ScaleInfo';
import scalesData from './config/scales';
import { ScaleConfig, LabelMode, AccidentalMode } from './types';
import { calculateScaleData } from './lib/musicTheory';
import { Music, Github, Share2 } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [rootNote, setRootNote] = useState<number>(0); // 0 = C
  const [selectedScaleId, setSelectedScaleId] = useState<string>('major');
  const [modeIndex, setModeIndex] = useState<number>(0);
  const [labelMode, setLabelMode] = useState<LabelMode>('note');
  const [accidentalMode, setAccidentalMode] = useState<AccidentalMode>('sharp');

  // --- Load Config ---
  const scales: ScaleConfig[] = scalesData;

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

  const currentModeName = currentScale.modeNames 
    ? currentScale.modeNames[modeIndex] 
    : currentScale.name;

  // --- Handlers ---
  const handleReset = () => {
    setRootNote(0); // C
    setSelectedScaleId('major');
    setModeIndex(0);
    setLabelMode('note');
    setAccidentalMode('sharp');
  };

  const handleShare = () => {
     const url = new URL(window.location.href);
     url.searchParams.set('root', rootNote.toString());
     url.searchParams.set('scale', selectedScaleId);
     url.searchParams.set('mode', modeIndex.toString());
     url.searchParams.set('accidental', accidentalMode);
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
    
    if (r) setRootNote(Number(r));
    if (s && scales.some(sc => sc.id === s)) setSelectedScaleId(s);
    if (m) setModeIndex(Number(m));
    if (a === 'sharp' || a === 'flat') setAccidentalMode(a as AccidentalMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-primary/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-primary to-accent p-2 rounded-lg">
              <Music className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">ScaleCanvas</h1>
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
             <a href="#" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors">
               <Github size={14} /> <span>GitHub</span>
             </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit z-40">
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
              </div>
            </div>
          </div>

          {/* Right Panel: Visualization */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Scale Info Card */}
            <ScaleInfo 
              data={scaleData}
              scaleName={currentScale.name}
              modeName={currentModeName}
              accidentalMode={accidentalMode}
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
                  />
               </div>
            </div>
            
            <div className="text-center text-xs text-slate-600 mt-8">
              <p>Fretboard visualization uses Standard Tuning (E A D G B E).</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;