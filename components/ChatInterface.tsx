import React, { useState, useEffect, useRef } from 'react';
import { Send, Menu, Sparkles, AlertCircle, RefreshCw, Wind, Shield } from 'lucide-react';
import { Message } from '../types';
import { sendMessageToGemini, generateDeepReflection, initChatSession } from '../services/geminiService';
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
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      const responseText = await sendMessageToGemini(userMsg.text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
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
    
    // Construct context from last few messages
    const context = messages.slice(-5).map(m => `${m.role}: ${m.text}`).join('\n');
    
    try {
        const reflection = await generateDeepReflection(context);
        const reflectionMsg: Message = {
            id: Date.now().toString(),
            role: 'model',
            text: `**Deep Reflection:**\n\n${reflection}`,
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

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg">
             {/* Simple Logo Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span className="font-semibold text-slate-800">MindShield</span>
        </div>
        <div className="flex items-center space-x-2">
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

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-100 p-4">
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