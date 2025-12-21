import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInterface from './components/ChatInterface';
import BreathingTool from './components/BreathingTool';
import { View } from './types';

function App() {
  const [currentView, setCurrentView] = useState<View>(View.WELCOME);
  const [previousView, setPreviousView] = useState<View>(View.WELCOME);

  const startChat = () => {
    setCurrentView(View.CHAT);
  };

  const exitChat = () => {
    // We use a confirm dialog to prevent accidental exits.
    // Instead of window.location.reload() which can be blocked in some environments,
    // we simply reset the React state. This unmounts ChatInterface, destroying the chat history.
    if (window.confirm("Are you sure you want to end this session? Your conversation history will be cleared.")) {
        setCurrentView(View.WELCOME);
        setPreviousView(View.WELCOME);
    }
  };

  const toggleBreathing = () => {
    if (currentView === View.BREATHE) {
        setCurrentView(previousView);
    } else {
        setPreviousView(currentView);
        setCurrentView(View.BREATHE);
    }
  };

  return (
    <div className="antialiased text-slate-900">
      {currentView === View.WELCOME && (
        <WelcomeScreen onStart={startChat} />
      )}
      
      {currentView === View.CHAT && (
        <ChatInterface 
            onExit={exitChat} 
            onOpenBreathing={toggleBreathing}
        />
      )}

      {currentView === View.BREATHE && (
        <BreathingTool onClose={toggleBreathing} />
      )}
    </div>
  );
}

export default App;