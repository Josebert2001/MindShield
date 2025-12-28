import React from 'react';
import { Message } from '../types';
import { emotionColors } from '../utils/emotionParser';

interface EmotionTimelineProps {
  messages: Message[];
  isLoading: boolean;
  onClick: () => void;
}

const EmotionTimeline: React.FC<EmotionTimelineProps> = ({ messages, isLoading, onClick }) => {
  // Extract only messages that have analyzed emotion data
  const emotionSegments = messages
    .filter((m) => m.role === 'model' && m.emotionData)
    .map((m) => ({
      id: m.id,
      ...m.emotionData!
    }));

  if (emotionSegments.length === 0 && !isLoading) return null;

  return (
    <div 
      className="w-full bg-white border-b border-slate-100 py-3 px-4 sm:px-6 cursor-pointer hover:bg-slate-50 transition-colors group"
      onClick={onClick}
      role="button"
      aria-label="View emotional insights"
    >
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          Emotional Timeline
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 ml-1 font-normal lowercase">
            (click for details)
          </span>
        </span>
        {emotionSegments.length > 0 && (
            <span className="text-[10px] text-slate-400">
                Current: <span style={{ color: emotionColors[emotionSegments[emotionSegments.length-1].emotion] }} className="font-bold capitalize">
                    {emotionSegments[emotionSegments.length-1].emotion}
                </span>
            </span>
        )}
      </div>
      
      {/* The Timeline Bar */}
      <div className="h-3 w-full flex rounded-full overflow-hidden bg-slate-100 ring-1 ring-slate-200">
        {emotionSegments.map((seg, idx) => (
          <div
            key={seg.id}
            className="h-full relative group/segment first:rounded-l-full last:rounded-r-full hover:brightness-110 transition-all duration-300 ease-out"
            style={{ 
              width: `${100 / (emotionSegments.length + (isLoading ? 1 : 0))}%`,
              backgroundColor: emotionColors[seg.emotion] || '#94a3b8',
              opacity: 0.8 + (seg.intensity / 50) // Subtle opacity shift based on intensity (0.8 to 1.0)
            }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[150px] bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover/segment:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl flex flex-col items-center">
                <span className="font-bold capitalize text-xs mb-0.5" style={{ color: emotionColors[seg.emotion] }}>
                    {seg.emotion}
                </span>
                <span className="text-slate-300 mb-1">Intensity: {seg.intensity}/10</span>
                <div className="flex flex-wrap gap-1 justify-center">
                    {seg.keywords.slice(0, 2).map((k, i) => (
                        <span key={i} className="bg-white/10 px-1 rounded text-[9px]">{k}</span>
                    ))}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        ))}

        {/* Loading/Thinking Indicator */}
        {isLoading && (
            <div 
                className="h-full bg-slate-200 animate-pulse relative"
                style={{ width: `${100 / (emotionSegments.length + 1)}%` }}
            >
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
        )}
      </div>
    </div>
  );
};

export default EmotionTimeline;