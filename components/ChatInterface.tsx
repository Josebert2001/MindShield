import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, RefreshCw, Wind, Shield, BarChart2, Clock, Globe } from 'lucide-react';
import { Message } from '../types';
import { sendMessageToGemini, generateDeepReflection, initChatSession } from '../services/geminiService';
import { parseEmotionMetadata, cleanAIText } from '../utils/emotionParser';
import EmotionTrendChart from './EmotionTrendChart';
import Logo from './Logo';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  onExit: () => void;
  onOpenBreathing: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onExit, onOpenBreathing }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Init session on mount
    initChatSession();
    
    // Add welcome message
    setMessages([
      {
        id: 'init-1',
        role: 'model',
        text: "Hi. I'm MindShield. I'm here to listen without judgment. How are you feeling right now?",
        timestamp: Date.now()
      }
    ]);

    // Start session timer
    const timerInterval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showInsights]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const { text: rawResponse, groundingChunks } = await sendMessageToGemini(userMsg.text);
      
      // Parse Logic
      const emotionData = parseEmotionMetadata(rawResponse);
      const cleanText = cleanAIText(rawResponse);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: cleanText,
        timestamp: Date.now(),
        emotionData: emotionData,
        groundingChunks: groundingChunks
      };
      
      setMessages(prev => [...prev, botMsg]);
      
      // Auto-show insights if intensity is high
      if (emotionData && emotionData.intensity >= 8) {
        setShowInsights(true);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please check your internet or try again in a moment.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      // Refocus input for continued typing
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleDeepReflection = async () => {
    if (messages.length < 3 || isReflecting || isLoading) return; // Need some context
    
    setIsReflecting(true);
    
    // Construct context from last few messages (cleaning them first just in case)
    const context = messages.slice(-5).map(m => `${m.role}: ${cleanAIText(m.text)}`).join('\n');
    
    try {
        const reflection = await generateDeepReflection(context);
        const cleanReflection = cleanAIText(reflection);
        
        const reflectionMsg: Message = {
            id: Date.now().toString(),
            role: 'model',
            text: `**Deep Reflection:**\n\n${cleanReflection}`,
            timestamp: Date.now(),
            isThinking: true
        };
        setMessages(prev => [...prev, reflectionMsg]);
    } catch (e) {
        console.error(e);
    } finally {
        setIsReflecting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 15 minutes threshold for break suggestion
  const showBreakPrompt = sessionDuration > 900;

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg flex items-center justify-center">
             <Logo className="w-5 h-5" variant="white" />
          </div>
          <span className="font-semibold text-slate-800 hidden sm:inline tracking-tight">MindShield</span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Session Timer */}
            <div className={`flex items-center px-3 py-1.5 rounded-full border text-xs font-medium transition-colors duration-300 ${
                showBreakPrompt 
                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}>
                <Clock size={12} className={`mr-1.5 ${showBreakPrompt ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>{formatTime(sessionDuration)}</span>
                {showBreakPrompt && (
                    <button 
                        onClick={onOpenBreathing}
                        className="ml-2 pl-2 border-l border-amber-200 hover:text-amber-900 animate-pulse hidden sm:inline"
                    >
                        Time for a break?
                    </button>
                )}
            </div>

            <div className="h-6 w-px bg-slate-100 mx-1"></div>

            <button 
                onClick={() => setShowInsights(!showInsights)}
                className={`p-2 rounded-full transition-colors flex items-center space-x-1 px-3 ${showInsights ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
                title="Emotional Insights"
            >
                <BarChart2 size={18} />
            </button>
            <button 
                onClick={onOpenBreathing}
                className="text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 p-2 rounded-full transition-colors flex items-center space-x-1 px-3"
                title="Grounding Exercise"
            >
                <Wind size={18} />
                <span className="text-sm font-medium hidden sm:inline">Breathe</span>
            </button>
            <button 
                onClick={onExit}
                className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
                Exit
            </button>
        </div>
      </header>

      {/* Main Content Area - Split for Insights */}
      <div className="flex-1 overflow-hidden relative flex flex-col sm:flex-row">
          
          {/* Messages Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-sm sm:text-base leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  } ${msg.isThinking ? 'border-l-4 border-l-purple-400 bg-purple-50' : ''}`}
                >
                  <ReactMarkdown 
                    className={`markdown ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'}`}
                    components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>

                  {/* Grounding Sources */}
                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100/50">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
                        <Globe size={10} /> Sources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.groundingChunks.map((chunk, idx) => (
                          chunk.web?.uri ? (
                            <a 
                              key={idx} 
                              href={chunk.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`text-xs px-2 py-1 rounded border truncate max-w-[200px] transition-colors ${
                                msg.role === 'user' 
                                  ? 'bg-white/10 border-white/20 text-blue-100 hover:bg-white/20' 
                                  : 'bg-slate-50 border-slate-200 text-blue-600 hover:bg-slate-100 hover:underline'
                              }`}
                            >
                              {chunk.web.title || new URL(chunk.web.uri).hostname}
                            </a>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-4 flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>
          
          {/* Insights Panel - Absolute on mobile, Sidebar on Desktop */}
          {showInsights && (
             <div className="absolute bottom-0 left-0 right-0 sm:relative sm:w-80 sm:border-l sm:border-slate-100 bg-slate-50/50 backdrop-blur-sm sm:backdrop-blur-none sm:bg-slate-50 z-20 p-4 sm:p-0 flex flex-col justify-end sm:justify-start">
                 <div className="sm:p-4">
                    <EmotionTrendChart messages={messages} onClose={() => setShowInsights(false)} />
                 </div>
             </div>
          )}
      </div>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-100 p-4 z-30">
        <div className="max-w-4xl mx-auto flex flex-col space-y-3">
            {/* Contextual Actions */}
            {messages.length > 2 && (
                <div className="flex justify-center space-x-3 pb-2">
                    <button 
                        onClick={handleDeepReflection}
                        disabled={isReflecting || isLoading}
                        className={`text-xs flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${
                            isReflecting 
                            ? 'bg-purple-100 text-purple-700 border-purple-200 animate-pulse' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200'
                        }`}
                    >
                        {isReflecting ? (
                            <>
                                <RefreshCw size={12} className="animate-spin" />
                                <span>Reflecting Deeply...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={12} />
                                <span>Deep Reflection</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            <div className="relative flex items-end bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
            <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type how you're feeling..."
                className="w-full bg-transparent border-none focus:ring-0 p-4 max-h-32 min-h-[56px] resize-none text-slate-700 placeholder:text-slate-400 text-base"
                rows={1}
            />
            <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="p-3 mr-1 mb-1 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
                <Send size={20} />
            </button>
            </div>
            
            <div className="text-center">
                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Shield size={10} />
                    <span>Private & Secure. Chats are not saved.</span>
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;