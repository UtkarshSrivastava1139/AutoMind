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
    <div className="h-full w-full flex flex-col rounded-xl overflow-hidden border border-border bg-bg-app/50 shadow-2xl relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>
      
      {/* Header */}
      <div className="glass-card p-5 border-b border-border bg-bg-card/40 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-text-primary">AutoMind Tutor</h1>
            <p className="text-xs text-text-muted tracking-wide">Ask me anything about automata theory</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2.5 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all active:scale-95"
          title="Clear chat history"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar z-10">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-lg glass-card p-6 sm:p-8 rounded-2xl border border-border bg-bg-card/30">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary mb-3">Welcome to AutoMind Tutor</h2>
              <p className="text-text-muted leading-relaxed mb-6 text-sm sm:text-base">
                I'm here to help you understand Theory of Automata and Formal Languages. Ask me any question about DFAs, NFAs, regular expressions, and more!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[90%] sm:max-w-[85%] px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-sm overflow-hidden ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'glass-card bg-bg-card/60 text-text-primary border border-border rounded-bl-sm'
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
                        p: ({node, ...props}) => <p className="mb-3 text-text-secondary" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1.5 ml-4 list-disc marker:text-primary text-text-secondary" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-4" {...props} />,
                        ol: ({node, ...props}) => <ol className="mb-4 list-decimal ml-4 marker:text-primary text-text-secondary" {...props} />,
                        code: ({node, ...props}) => <code className="bg-bg-app/80 px-1.5 py-0.5 rounded text-secondary font-mono text-xs border border-border/50 shadow-inner" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-bg-app p-4 rounded-xl my-4 overflow-x-auto text-[13px] border border-border custom-scrollbar shadow-inner" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto my-4 text-text-secondary"><table className="min-w-full divide-y divide-border border border-border rounded-lg overflow-hidden" {...props} /></div>,
                        thead: ({node, ...props}) => <thead className="bg-bg-app/50" {...props} />,
                        th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider border-b border-border" {...props} />,
                        td: ({node, ...props}) => <td className="px-4 py-3 text-sm whitespace-nowrap border-b border-border/50" {...props} />,
                        tbody: ({node, ...props}) => <tbody className="divide-y divide-border/50 bg-bg-card/20" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-secondary pl-4 py-1 my-3 bg-secondary/10 text-text-muted italic rounded-r-lg" {...props} />,
                      }}
                    >
                      {(msg.content || '').replace(/\\\((.*?)\\\)/g, '$$$1$$').replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')}
                    </ReactMarkdown>
                  </div>
                )}
                <p className={`text-[10px] uppercase tracking-wider font-semibold mt-3 ${msg.role === 'user' ? 'text-primary-foreground/70' : 'text-text-muted'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-card bg-bg-card/60 border border-border px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-3">
              <Bot className="w-5 h-5 text-primary opacity-70 animate-pulse" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm shadow-inner flex items-center gap-2">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Suggested Questions */}
      {showSuggestions && messages.length === 0 && (
        <div className="px-6 pb-6 z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={16} className="text-secondary" />
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Suggested Questions</p>
          </div>
          <div className="flex flex-col gap-2">
            {SUGGESTED_QUESTIONS.map((question, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-left text-sm px-4 py-3 bg-bg-card border border-border hover:border-primary/50 hover:bg-primary/5 rounded-xl text-text-muted transition-all duration-200 hover:text-text-primary hover:shadow-md hover:-translate-y-0.5 truncate"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="glass-card p-4 sm:p-5 border-t border-border bg-bg-card/40 z-10 relative">
        <div className="flex gap-3 max-w-4xl mx-auto items-end relative">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'inherit';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(input);
                e.currentTarget.style.height = 'inherit';
              }
            }}
            placeholder="Ask me anything about automata..."
            className="flex-1 w-0 bg-bg-app/80 border border-border rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 text-text-primary text-sm sm:text-base placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner resize-none min-h-[52px] max-h-[120px] custom-scrollbar"
            disabled={isLoading}
            rows={1}
          />
          <button
            onClick={() => {
              handleSendMessage(input);
              const textarea = document.querySelector('textarea');
              if (textarea) textarea.style.height = 'inherit';
            }}
            disabled={!input.trim() || isLoading}
            className={`p-3.5 sm:px-6 sm:py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 
              ${!input.trim() || isLoading 
                ? 'bg-bg-app border border-border text-text-muted opacity-50 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 active:translate-y-0 active:scale-95'
              }`}
          >
            <Send size={18} className="shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}