import React from 'react';
import { ScaleCalculatedData, AccidentalMode } from '../types';
import { getNoteName } from '../lib/musicTheory';

interface ScaleInfoProps {
  data: ScaleCalculatedData;
  scaleName: string;
  modeName: string;
  accidentalMode: AccidentalMode;
}

export const ScaleInfo: React.FC<ScaleInfoProps> = ({ data, scaleName, modeName, accidentalMode }) => {
  const rootNoteName = getNoteName(data.rootNote, accidentalMode);
  
  return (
    <div className="bg-surface rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-100 mb-1">{modeName}</h3>
          <p className="text-sm text-slate-400">Parent: {scaleName}</p>
        </div>
        <div className="flex gap-2">
           {/* Chips for formula */}
           {data.formula.map((degree, i) => (
             <div 
               key={i} 
               className={`
                 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold font-mono border
                 ${degree === '1' 
                    ? 'bg-primary/10 border-primary/40 text-primary' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'}
               `}
               title={`Interval: ${data.intervals[i]} semitones`}
             >
               {degree}
             </div>
           ))}
        </div>
      </div>
      
      <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
        This pattern repeats across the fretboard. The <span className="text-primary font-bold">1</span> represents the root note ({rootNoteName}). 
        Use the controls to toggle between note names and scale degrees.
      </p>
    </div>
  );
};