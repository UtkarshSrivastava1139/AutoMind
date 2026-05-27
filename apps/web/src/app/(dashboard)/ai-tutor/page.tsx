"use client";

import { TutorChat } from '@/components/ai-tutor/TutorChat';
import { Bot, Sparkles } from 'lucide-react';

export default function AITutorPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-4 flex flex-col gap-1.5">
        <h1 className="text-xl sm:text-2xl font-display font-bold text-text-primary flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Bot size={20} className="fill-primary/20" />
          </div>
          AI Tutor
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary border border-secondary/20 flex items-center gap-1 ml-1">
            <Sparkles size={10} className="fill-secondary/30" />
            Beta
          </span>
        </h1>
        <p className="text-text-muted text-xs sm:text-sm max-w-3xl leading-relaxed">
          Ask questions, get step-by-step algorithmic explanations, and demystify automata concepts with your intelligent learning companion.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <TutorChat />
      </div>
    </div>
  );
}
