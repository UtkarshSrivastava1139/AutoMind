"use client";

import { useTutorStore } from '@web/store/useTutorStore';
import { useEffect, useRef, useState } from 'react';
import { Send, Trash2, MessageCircle, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const SUGGESTED_QUESTIONS = [
  'What is the difference between a DFA and an NFA?',
  'How does Thompson\'s Construction work?',
  'Explain the Subset Construction algorithm',
  'What is Hopcroft\'s minimization algorithm?',
  'Can you give an example of an NFA that cannot be easily converted to a DFA?',
  'How do epsilon transitions affect NFA behavior?',
];

export function TutorChat() {
  const { messages, isLoading, error, sendMessage, clearChat, setError } = useTutorStore();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(messages.length === 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    setInput('');
    setShowSuggestions(false);
    await sendMessage(text);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="glass-card p-4 border-b border-slate-700/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bot className="text-secondary" size={24} />
          <div>
            <h1 className="font-bold text-white">AutoMind Tutor</h1>
            <p className="text-xs text-slate-400">Ask me anything about automata theory</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-red-400 transition-all"
          title="Clear chat history"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Bot className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-200 mb-2">Welcome to AutoMind Tutor</h2>
              <p className="text-slate-400 mb-6">
                I'm here to help you understand Theory of Automata and Formal Languages. Ask me any question about DFAs, NFAs, regular expressions, and more!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-2xl lg:max-w-3xl px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        h2: ({node, ...props}) => <h4 className="font-bold text-lg mt-5 mb-2 text-indigo-300" {...props} />,
                        h3: ({node, ...props}) => <h5 className="font-bold text-base mt-4 mb-2 text-blue-300" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-emerald-300" {...props} />,
                        em: ({node, ...props}) => <em className="text-amber-200/90" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 text-slate-200" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1.5 ml-4 list-disc marker:text-blue-400 text-slate-200" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-4" {...props} />,
                        ol: ({node, ...props}) => <ol className="mb-4 list-decimal ml-4 marker:text-blue-400 text-slate-200" {...props} />,
                        code: ({node, ...props}) => <code className="bg-slate-900/60 px-1.5 py-0.5 rounded text-fuchsia-300 font-mono text-xs border border-slate-700/50" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-slate-950 p-4 rounded-lg my-4 overflow-x-auto text-[13px] border border-slate-700/50 shadow-inner" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto my-4 text-slate-200"><table className="min-w-full divide-y divide-slate-700 border border-slate-700 rounded-lg" {...props} /></div>,
                        thead: ({node, ...props}) => <thead className="bg-slate-800/80" {...props} />,
                        th: ({node, ...props}) => <th className="px-4 py-2 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider border-b border-slate-700" {...props} />,
                        td: ({node, ...props}) => <td className="px-4 py-2 text-sm whitespace-nowrap border-b border-slate-700/50" {...props} />,
                        tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-700/50 bg-slate-800/20" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-400 pl-4 py-1 my-3 bg-indigo-900/10 text-slate-300 italic rounded-r" {...props} />,
                      }}
                    >
                      {msg.content.replace(/\\\((.*?)\\\)/g, '$$$1$$').replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')}
                    </ReactMarkdown>
                  </div>
                )}
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {showSuggestions && messages.length === 0 && (
        <div className="px-6 pb-6">
          <p className="text-sm text-slate-400 mb-3">Suggested questions:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SUGGESTED_QUESTIONS.map((question, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-left text-sm px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg text-slate-300 transition-all hover:text-slate-100 truncate"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="glass-card p-4 border-t border-slate-700/50">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(input)}
            placeholder="Ask me anything about automata theory..."
            className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:bg-slate-900/80 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}