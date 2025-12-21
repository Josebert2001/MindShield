import React, { useState, useEffect } from 'react';
import { X, Play, Pause } from 'lucide-react';

interface BreathingToolProps {
  onClose: () => void;
}

const BreathingTool: React.FC<BreathingToolProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [text, setText] = useState('Ready?');

  useEffect(() => {
    // Fixed: Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to avoid namespace error
    let interval: ReturnType<typeof setInterval>;
    let cycle = 0; // 0: Inhale, 1: Hold, 2: Exhale, 3: Hold

    if (isActive) {
      // Box breathing cycle: 4-4-4-4
      const runCycle = () => {
        switch(cycle) {
          case 0:
            setText('Inhale...');
            break;
          case 1:
            setText('Hold...');
            break;
          case 2:
            setText('Exhale...');
            break;
          case 3:
            setText('Hold...');
            break;
        }
        cycle = (cycle + 1) % 4;
      };

      runCycle(); // Initial run
      interval = setInterval(runCycle, 4000); // Update every 4 seconds
    } else {
      setText('Ready?');
    }

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
      >
        <X size={32} />
      </button>

      <h2 className="text-2xl font-light text-white mb-12">Box Breathing</h2>

      {/* Breathing Circle */}
      <div className="relative flex items-center justify-center w-64 h-64">
        <div 
          className={`absolute w-full h-full rounded-full bg-blue-500/30 blur-xl transition-all duration-[4000ms] ease-in-out ${isActive && (text === 'Inhale...' || text === 'Hold...') ? 'scale-110 opacity-100' : 'scale-75 opacity-50'}`}
        ></div>
        <div 
          className={`relative z-10 w-48 h-48 rounded-full border-2 border-white/20 flex items-center justify-center bg-slate-800 shadow-2xl transition-all duration-[4000ms] ease-in-out ${isActive && text === 'Inhale...' ? 'scale-110' : 'scale-100'}`}
        >
          <span className="text-xl font-medium text-blue-100 transition-all duration-500">
            {text}
          </span>
        </div>
      </div>

      <p className="mt-12 text-slate-400 text-center max-w-sm">
        Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. 
        This technique helps calm your nervous system.
      </p>

      <button
        onClick={() => setIsActive(!isActive)}
        className="mt-8 flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95"
      >
        {isActive ? (
          <>
            <Pause size={20} />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play size={20} />
            <span>Start</span>
          </>
        )}
      </button>
    </div>
  );
};

export default BreathingTool;