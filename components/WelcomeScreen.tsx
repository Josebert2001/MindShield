import React from 'react';
import { Shield, MessageCircle, Lock } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full animate-in slide-in-from-bottom-8 duration-700">
        
        <div className="mb-8 flex justify-center">
          <div className="bg-white p-4 rounded-2xl shadow-xl shadow-blue-100/50">
            <Shield className="w-16 h-16 text-blue-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-800 mb-2">MindShield</h1>
        <p className="text-lg text-slate-500 mb-8 font-light">
          Private, AI-powered support for your emotional wellbeing.
        </p>

        <div className="grid gap-4 mb-10 text-left">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-4">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">100% Private</h3>
              <p className="text-sm text-slate-500">No login required. Chats are not stored after you leave.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-4">
             <div className="bg-green-50 p-2 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Judgment-Free</h3>
              <p className="text-sm text-slate-500">Vent, reflect, and find grounding with a compassionate AI.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-medium py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Chatting
        </button>
        
        <p className="mt-6 text-xs text-slate-400">
          MindShield is an automated support tool, not a replacement for professional therapy.
          <br/>If you are in crisis, please contact local emergency services.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
