import React from 'react';
import { ScaleCalculatedData, LabelMode, AccidentalMode, PitchClass } from '../types';
import { STANDARD_TUNING, TOTAL_FRETS, MARKERS, STRING_NAMES } from '../lib/constants';
import { normalizePitch, getNoteName } from '../lib/musicTheory';

interface FretboardProps {
  data: ScaleCalculatedData;
  labelMode: LabelMode;
  accidentalMode: AccidentalMode;
  highlightNotes?: PitchClass[];
  highlightRoot?: PitchClass;
}

export const Fretboard: React.FC<FretboardProps> = ({
  data,
  labelMode,
  accidentalMode,
  highlightNotes,
  highlightRoot,
}) => {
  const { rootNote, notes, formula } = data;
  const highlightSet = highlightNotes ? new Set(highlightNotes) : null;

  // Helper to check if a note is in scale
  const getNoteInfo = (stringIndex: number, fretIndex: number) => {
    const openNote = STANDARD_TUNING[stringIndex];
    const currentPitch = normalizePitch(openNote + fretIndex);

    const scaleIndex = notes.indexOf(currentPitch);
    const isInScale = scaleIndex !== -1;
    const isRoot = currentPitch === rootNote;
    const degree = isInScale ? formula[scaleIndex] : null;
    const noteName = getNoteName(currentPitch, accidentalMode);

    const isHighlighted = highlightSet ? highlightSet.has(currentPitch) : false;
    const isHighlightRoot = typeof highlightRoot === 'number' && highlightRoot === currentPitch;

    return { isInScale, isRoot, degree, noteName, currentPitch, isHighlighted, isHighlightRoot };
  };

  return (
    <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
      {/* Container for the fretboard grid */}
      <div className="min-w-[800px] select-none relative p-4">

        {/* Fret Markers (Dots) Background Layer */}
        <div className="absolute inset-0 top-[3rem] bottom-[2rem] pointer-events-none">
           {/* We render markers based on fret positions.
               The fretboard grid has 13 columns (0..12).
               Each cell is roughly equal width.
           */}
        </div>

        {/* Main Grid: 6 strings (rows) x 13 frets (cols) */}
        <div className="grid grid-rows-[repeat(6,minmax(40px,1fr))] gap-y-0 relative bg-[#161b22] rounded-r-xl border-r-4 border-slate-800 shadow-2xl">

          {/* Fret Numbers (Top) */}
          <div className="absolute -top-8 left-0 right-0 flex pl-[3rem]">
             {Array.from({ length: TOTAL_FRETS }).map((_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-slate-500 font-mono">
                  {i}
                </div>
             ))}
          </div>

          {/* Fret Lines (Vertical Wires) */}
          {/* Fret 0 is the Nut (thick line). Frets 1-12 are thin lines. */}
          <div className="absolute inset-0 flex pl-[3rem] pointer-events-none">
             {Array.from({ length: TOTAL_FRETS }).map((_, i) => (
               <div
                 key={i}
                 className={`flex-1 border-r ${i === 0 ? 'border-r-4 border-slate-400' : 'border-slate-700'} h-full relative`}
               >
                 {/* Single Dots */}
                 {MARKERS.includes(i) && i !== 12 && (
                    <div className="absolute top-1/2 left-1/2 transform translate-x-[50%] -translate-y-1/2 w-5 h-5 rounded-full bg-stone-500 shadow-inner z-0"></div>
                 )}
                 {/* Double Dots for 12th fret */}
                 {i === 12 && (
                    <>
                      <div className="absolute top-[35%] left-1/2 transform translate-x-[50%] -translate-y-1/2 w-5 h-5 rounded-full bg-stone-500 shadow-inner z-0"></div>
                      <div className="absolute top-[65%] left-1/2 transform translate-x-[50%] -translate-y-1/2 w-5 h-5 rounded-full bg-stone-500 shadow-inner z-0"></div>
                    </>
                 )}
               </div>
             ))}
          </div>

          {/* Strings and Notes */}
          {[...STANDARD_TUNING].reverse().map((_, displayRowIndex) => {
            // STANDARD_TUNING is Low E to High E.
            // Visually, High E is usually top (row 0), Low E is bottom.
            // So we reverse the index for visual mapping:
            // displayRowIndex 0 -> High E (index 5 in STANDARD_TUNING)
            const stringIndex = 5 - displayRowIndex;

            return (
              <div key={stringIndex} className="relative flex items-center pl-[3rem]">
                {/* String Line */}
                <div
                  className="absolute left-0 right-0 bg-slate-500 shadow-sm z-0"
                  style={{ height: `${1 + (stringIndex * 0.5)}px`, opacity: 0.6 }}
                ></div>

                {/* String Label (Left) */}
                <div className="absolute left-0 w-[3rem] text-center -translate-y-[1px]">
                   <span className="text-xs font-bold text-slate-400 font-mono">
                     {STRING_NAMES[stringIndex]}
                   </span>
                </div>

                {/* Frets for this string */}
                {Array.from({ length: TOTAL_FRETS }).map((_, fretIndex) => {
                   const { isInScale, isRoot, degree, noteName, isHighlighted, isHighlightRoot } = getNoteInfo(stringIndex, fretIndex);

                   // The fret area. Notes are centered in the fret box (except nut).
                   // The vertical lines define the END of the fret.
                   // So note sits between border-right of prev and border-right of current.
                   // The logic above for vertical lines uses `flex-1 border-r`.
                   // So we just center the content in the flex cell.

                   return (
                     <div key={fretIndex} className="flex-1 flex justify-center items-center z-10 relative h-full">
                        {isInScale && (
                          <div className="relative flex items-center justify-center">
                            <div
                               className={`
                                 peer relative flex items-center justify-center
                                 w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-md cursor-help transition-all duration-300
                                 ${isHighlightRoot
                                   ? 'ring-2 ring-primary/80 ring-offset-2 ring-offset-[#161b22]'
                                   : isHighlighted
                                     ? 'ring-2 ring-accent/60 ring-offset-2 ring-offset-[#161b22]'
                                     : ''
                                 }
                                 ${isRoot
                                    ? 'bg-primary text-slate-900 ring-2 ring-primary/50 ring-offset-2 ring-offset-[#161b22] font-bold scale-110'
                                    : 'bg-surface text-slate-200 border border-slate-600 hover:border-slate-400 hover:scale-110 hover:bg-slate-700'
                                 }
                               `}
                            >
                              <span className="text-[10px] sm:text-xs font-mono">
                                {labelMode === 'note' ? noteName : degree}
                              </span>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-slate-900 text-white text-xs rounded-md shadow-xl opacity-0 peer-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 flex flex-col items-center gap-0.5">
                               <span className="font-bold text-primary">{noteName}</span>
                               <span className="text-slate-400 text-[10px] uppercase tracking-wide">
                                 {degree} • {isRoot ? 'Root' : 'Interval'}
                               </span>
                               {/* Arrow */}
                               <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                            </div>
                          </div>
                        )}

                        {/* Ghost note for hover effect on empty frets (optional feature, keeping it clean for now) */}
                     </div>
                   );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
