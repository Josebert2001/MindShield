import React from 'react';
import { MessageCircle, Lock } from 'lucide-react';
import Logo from './Logo';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full animate-in slide-in-from-bottom-8 duration-700">
        
        <div className="mb-8 flex justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-100/50 hover:scale-105 transition-transform duration-500 ease-out">
            <Logo className="w-20 h-20" variant="color" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">MindShield</h1>
        <p className="text-lg text-slate-500 mb-10 font-light">
          Private, AI-powered support for your emotional wellbeing.
        </p>

        <div className="grid gap-4 mb-10 text-left">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4 hover:shadow-md transition-shadow">
            <div className="bg-blue-50 p-3 rounded-xl">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">100% Private</h3>
              <p className="text-sm text-slate-500 mt-1">No login required. Chats are not stored after you leave.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4 hover:shadow-md transition-shadow">
             <div className="bg-green-50 p-3 rounded-xl">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Judgment-Free</h3>
              <p className="text-sm text-slate-500 mt-1">Vent, reflect, and find grounding with a compassionate AI.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-medium py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-center gap-2"
        >
          <span>Start Chatting</span>
          <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
        
        <p className="mt-8 text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          MindShield is an automated support tool, not a replacement for professional therapy.
          If you are in crisis, please contact local emergency services.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;