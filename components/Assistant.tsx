import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage, CarState } from '../types';
import { generateRaceAnalysis } from '../services/gemini';
import { DRIVERS } from '../services/trackData';

interface AssistantProps {
  cars: CarState[];
  raceTime: number;
}

export const Assistant: React.FC<AssistantProps> = ({ cars, raceTime }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: "Radio check. I'm your Race Engineer. I have access to real-time telemetry. How's the car feeling?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await generateRaceAnalysis(input, cars, DRIVERS, raceTime);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-l border-slate-700 w-80 backdrop-blur-md">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-emerald-400 font-bold flex items-center gap-2">
          <Bot size={20} />
          Race Engineer AI
        </h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-slate-700 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-slate-700 rounded-lg p-3 rounded-bl-none">
              <Loader2 className="animate-spin text-emerald-400" size={16} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about race strategy..."
            className="flex-1 bg-slate-950 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-white"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-[10px] text-slate-500 mt-2 text-center">
          Powered by Gemini 2.5 Flash
        </div>
      </div>
    </div>
  );
};