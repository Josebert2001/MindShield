import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, RefreshCw, Wind, Shield, BarChart2, Clock, Globe, Mic, MicOff, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Message } from '../types';
import { sendMessageToGemini, generateDeepReflection, initChatSession, generateImage, transcribeAudio } from '../services/geminiService';
import { parseEmotionMetadata, cleanAIText } from '../utils/emotionParser';
import EmotionTrendChart from './EmotionTrendChart';
import EmotionTimeline from './EmotionTimeline';
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
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          // Extract the base64 part (remove "data:audio/webm;base64,")
          const base64Audio = base64String.split(',')[1];
          const mimeType = base64String.split(',')[0].split(':')[1].split(';')[0];

          try {
            const transcript = await transcribeAudio(base64Audio, mimeType);
            if (transcript) {
              setInputText(prev => {
                const needsSpace = prev.length > 0 && !prev.endsWith(' ');
                return prev + (needsSpace ? ' ' : '') + transcript;
              });
            }
          } catch (error) {
            console.error("Transcription failed", error);
            // Fallback or error notification could go here
          } finally {
            setIsTranscribing(false);
            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const handleImageGeneration = async (size: '1K' | '2K' | '4K') => {
      setShowImageOptions(false);
      const prompt = inputText.trim();
      if (!prompt) return;

      setIsGeneratingImage(true);
      // Clear input
      setInputText('');

      // Add user message indicating request
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: `Visualize: ${prompt} (${size})`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMsg]);

      try {
        const imageData = await generateImage(prompt, size);
        
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: `Here is a visualization for "${prompt}".`,
            timestamp: Date.now(),
            imageUrl: imageData
        };
        setMessages(prev => [...prev, botMsg]);

      } catch (error) {
        console.error(error);
        const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "I couldn't generate the image at this time. Please try again.",
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsGeneratingImage(false);
      }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (isListening) {
        stopListening();
    }

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
      <header className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm z-20">
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
          
          {/* Content Wrapper to handle scroll independently */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            
            {/* Real-Time Emotion Timeline - Placed at the top of the chat */}
            <EmotionTimeline 
                messages={messages} 
                isLoading={isLoading} 
                onClick={() => setShowInsights(true)} 
            />

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
                    {/* Render Image if available */}
                    {msg.imageUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-white/20">
                            <img src={msg.imageUrl} alt="Generated visualization" className="w-full h-auto" />
                        </div>
                    )}

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
                {(isLoading || isGeneratingImage) && (
                <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-4 flex space-x-2 items-center">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                        {isGeneratingImage && <span className="ml-2 text-xs text-slate-400">Visualizing...</span>}
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </main>
          </div>
          
          {/* Insights Panel - Absolute on mobile, Sidebar on Desktop */}
          {showInsights && (
             <div className="absolute bottom-0 left-0 right-0 sm:relative sm:w-80 sm:border-l sm:border-slate-100 bg-slate-50/50 backdrop-blur-sm sm:backdrop-blur-none sm:bg-slate-50 z-20 p-4 sm:p-0 flex flex-col justify-end sm:justify-start h-full">
                 <div className="sm:p-4 h-full overflow-y-auto">
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
            
            {/* Image Generation Popover */}
            {showImageOptions && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-bottom-2 z-50 min-w-[180px]">
                <p className="text-xs font-semibold text-slate-400 px-2 py-1 mb-1 uppercase tracking-wider">Image Size</p>
                <button onClick={() => handleImageGeneration('1K')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">1K (Standard)</button>
                <button onClick={() => handleImageGeneration('2K')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">2K (High Res)</button>
                <button onClick={() => handleImageGeneration('4K')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">4K (Ultra HD)</button>
              </div>
            )}

            <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : isTranscribing ? "Transcribing..." : "Type how you're feeling..."}
                className="w-full bg-transparent border-none focus:ring-0 p-4 max-h-32 min-h-[56px] resize-none text-slate-700 placeholder:text-slate-400 text-base"
                rows={1}
            />
            
            <div className="flex items-center pb-2 pr-2 gap-1">
                 {/* Image Gen Button */}
                 <button
                    onClick={() => {
                        if (inputText.trim()) {
                            setShowImageOptions(!showImageOptions);
                        } else {
                            alert("Please describe what you want to visualize first.");
                        }
                    }}
                    disabled={isLoading || isGeneratingImage}
                    className={`p-2 rounded-xl transition-all ${
                        showImageOptions 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Visualize Safe Place"
                >
                    <ImageIcon size={20} />
                </button>

                {/* Mic Button */}
                <button
                    onClick={toggleListening}
                    disabled={isLoading || isTranscribing}
                    className={`p-2 rounded-xl transition-all ${
                        isListening 
                        ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse ring-2 ring-red-200' 
                        : isTranscribing 
                        ? 'text-blue-500 bg-blue-50'
                        : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title={isListening ? "Stop Listening" : "Start Dictation"}
                >
                    {isTranscribing ? <Loader2 size={20} className="animate-spin" /> : isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                {/* Send Button */}
                <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoading}
                    className="p-2 ml-1 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                >
                    <Send size={20} />
                </button>
            </div>
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