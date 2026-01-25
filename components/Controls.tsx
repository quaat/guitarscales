import React from 'react';
import { ScaleConfig, LabelMode, AccidentalMode } from '../types';
import { getNoteName } from '../lib/musicTheory';
import { Settings, RefreshCw } from 'lucide-react';

interface ControlsProps {
  scales: ScaleConfig[];
  selectedScaleId: string;
  onScaleChange: (id: string) => void;
  rootNote: number;
  onRootChange: (note: number) => void;
  modeIndex: number;
  onModeChange: (index: number) => void;
  labelMode: LabelMode;
  onLabelModeChange: (mode: LabelMode) => void;
  accidentalMode: AccidentalMode;
  onAccidentalModeChange: (mode: AccidentalMode) => void;
  onReset: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  scales,
  selectedScaleId,
  onScaleChange,
  rootNote,
  onRootChange,
  modeIndex,
  onModeChange,
  labelMode,
  onLabelModeChange,
  accidentalMode,
  onAccidentalModeChange,
  onReset
}) => {
  const currentScale = scales.find(s => s.id === selectedScaleId) || scales[0];
  
  return (
    <div className="bg-surface rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col gap-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Settings size={16} /> Configuration
        </h2>
        <button 
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
          title="Reset to C Major"
        >
          <RefreshCw size={12} /> Reset
        </button>
      </div>

      <div className="space-y-4">
        {/* Root Note Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Root Note</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Array.from({length: 12}).map((_, index) => (
              <button
                key={index}
                onClick={() => onRootChange(index)}
                className={`
                  px-2 py-2 text-sm rounded-lg font-mono transition-all duration-200
                  ${rootNote === index 
                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] font-bold transform scale-105' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}
                `}
              >
                {getNoteName(index, accidentalMode)}
              </button>
            ))}
          </div>
        </div>

        {/* Scale Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Scale</label>
          <select 
            value={selectedScaleId}
            onChange={(e) => onScaleChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none cursor-pointer hover:border-slate-600"
            style={{ backgroundImage: 'none' }}
          >
            {scales.map(scale => (
              <option key={scale.id} value={scale.id}>
                {scale.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Selector */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
             <label className="text-xs font-medium text-slate-300">Mode</label>
             <span className="text-[10px] text-slate-500 font-mono">
                {currentScale.modeNames?.[modeIndex] ? `Rotation ${modeIndex + 1}` : 'Default'}
             </span>
          </div>
         
          <div className="relative">
             <select 
              value={modeIndex}
              onChange={(e) => onModeChange(Number(e.target.value))}
              disabled={!currentScale.modeNames}
              className={`
                w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 
                focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none
                ${!currentScale.modeNames ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-600'}
              `}
            >
              {currentScale.modeNames ? (
                currentScale.modeNames.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))
              ) : (
                <option value={0}>Standard</option>
              )}
            </select>
          </div>
        </div>

        {/* Display Toggles Group */}
        <div className="pt-2 border-t border-slate-700/50 space-y-4">
           {/* Fretboard Labels */}
           <div>
              <label className="text-xs font-medium text-slate-300 mb-2 block">Fretboard Labels</label>
              <div className="flex bg-slate-900 p-1 rounded-lg">
                <button
                    onClick={() => onLabelModeChange('note')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      labelMode === 'note' 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  Notes
                </button>
                <button
                    onClick={() => onLabelModeChange('degree')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      labelMode === 'degree' 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  Degrees
                </button>
              </div>
           </div>

           {/* Accidentals */}
           <div>
              <label className="text-xs font-medium text-slate-300 mb-2 block">Accidentals</label>
              <div className="flex bg-slate-900 p-1 rounded-lg">
                <button
                    onClick={() => onAccidentalModeChange('sharp')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      accidentalMode === 'sharp' 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  ♯ Sharps
                </button>
                <button
                    onClick={() => onAccidentalModeChange('flat')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      accidentalMode === 'flat' 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  ♭ Flats
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};