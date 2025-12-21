import React from 'react';
import { Message } from '../types';
import { emotionColors } from '../utils/emotionParser';
import { TrendingUp, Activity } from 'lucide-react';

interface EmotionTrendChartProps {
  messages: Message[];
  onClose: () => void;
}

const EmotionTrendChart: React.FC<EmotionTrendChartProps> = ({ messages, onClose }) => {
  // Filter only model messages that have emotion data
  const dataPoints = messages
    .filter(m => m.role === 'model' && m.emotionData)
    .map((m, index) => ({
      ...m.emotionData!,
      index: index + 1
    }));

  if (dataPoints.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg animate-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-blue-500"/>
                Emotional Journey
            </h3>
            <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
        </div>
        <p className="text-sm text-slate-500 text-center py-8">
          Keep chatting to see your emotional patterns emerge.
        </p>
      </div>
    );
  }

  // Calculate SVG path
  const width = 300;
  const height = 150;
  const padding = 20;
  
  const getX = (i: number) => {
    if (dataPoints.length === 1) return width / 2;
    return padding + (i / (dataPoints.length - 1)) * (width - padding * 2);
  };
  
  const getY = (intensity: number) => {
    // Invert Y because SVG 0 is top
    // Intensity 1-10 -> Height - padding
    return height - padding - ((intensity / 10) * (height - padding * 2));
  };

  const points = dataPoints.map((d, i) => `${getX(i)},${getY(d.intensity)}`).join(' ');

  // Get current state
  const current = dataPoints[dataPoints.length - 1];
  const avgIntensity = (dataPoints.reduce((acc, curr) => acc + curr.intensity, 0) / dataPoints.length).toFixed(1);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xl shadow-blue-500/5 animate-in slide-in-from-bottom-4">
       <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500"/>
                    Emotional Map
                </h3>
                <p className="text-xs text-slate-400 mt-1">Real-time intensity tracking</p>
            </div>
            <button onClick={onClose} className="text-xs font-medium text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-full transition-colors">
                Hide
            </button>
        </div>

        <div className="relative h-[160px] w-full mb-4">
            {/* Y-Axis Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-300 pointer-events-none">
                <div className="border-b border-dashed border-slate-100 w-full text-right pr-2">High</div>
                <div className="border-b border-dashed border-slate-100 w-full text-right pr-2">Med</div>
                <div className="w-full text-right pr-2">Low</div>
            </div>

            {/* Chart */}
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Connection Line */}
                <polyline 
                    fill="none" 
                    stroke="#e2e8f0" 
                    strokeWidth="2" 
                    points={points} 
                />
                
                {/* Data Points */}
                {dataPoints.map((d, i) => (
                    <g key={i}>
                        <circle 
                            cx={getX(i)} 
                            cy={getY(d.intensity)} 
                            r="5" 
                            fill={emotionColors[d.emotion] || "#94a3b8"} 
                            stroke="white"
                            strokeWidth="2"
                            className="shadow-sm transition-all duration-500 hover:r-8"
                        />
                        {/* Tooltip-ish text for last point */}
                        {i === dataPoints.length - 1 && (
                            <text 
                                x={getX(i)} 
                                y={getY(d.intensity) - 10} 
                                textAnchor="middle" 
                                fontSize="10" 
                                fill={emotionColors[d.emotion] || "#64748b"} 
                                fontWeight="bold"
                                className="capitalize"
                            >
                                {d.emotion} ({d.intensity})
                            </text>
                        )}
                    </g>
                ))}
            </svg>
        </div>

        {/* Insight Chips */}
        <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detected Patterns</p>
            <div className="flex flex-wrap gap-2">
                {current.keywords.map((k, i) => (
                    <span 
                        key={i} 
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100"
                    >
                        #{k}
                    </span>
                ))}
            </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs">
            <span className="text-slate-400">Average Intensity: <strong className="text-slate-700">{avgIntensity}/10</strong></span>
            <span className="text-slate-400">Sessions: <strong className="text-slate-700">{dataPoints.length}</strong></span>
        </div>
    </div>
  );
};

export default EmotionTrendChart;
