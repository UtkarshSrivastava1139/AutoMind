"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import { Brain, X, Play } from 'lucide-react';

const EXAMPLE_QUESTIONS = [
  "Design a DFA that accepts all binary strings ending in 01",
  "Build a DFA for binary strings divisible by 3",
  "Design a DFA over {a,b} that accepts strings with even number of a's",
  "Convert (a|b)*abb to an NFA",
  "Convert the regex 0(0|1)*1 to NFA",
];

export function QuestionInput() {
  const { questionText, setQuestionText, submitQuestion, status, reset } = useQuestionStore();
  const isLoading = status === 'parsing' || status === 'solving' || status === 'explaining';

  return (
    <div className="glass-card rounded-2xl border border-border shadow-md bg-bg-app p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Brain className="text-secondary" size={24} />
          Ask a Question
        </h2>
        {status !== 'idle' && (
          <button onClick={reset} className="text-text-muted hover:text-text-primary text-sm flex items-center gap-1 transition-colors">
            <X size={16} /> Reset
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Paste your automata theory question here..."
          className="w-full bg-bg-card border border-border rounded-xl p-4 pr-32 text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none shadow-inner custom-scrollbar"
          rows={3}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submitQuestion();
            }
          }}
        />
        <button
          onClick={submitQuestion}
          disabled={isLoading || !questionText.trim()}
          className="absolute bottom-3 right-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              {status === 'parsing' ? 'Analyzing...' : status === 'solving' ? 'Solving...' : 'Working...'}
            </>
          ) : (
            <>Solve <Play size={16} fill="currentColor" /></>
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted mr-1">Try:</span>
        {EXAMPLE_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => {
              setQuestionText(q);
              // Don't auto-submit; let user review
            }}
            className="text-xs px-3 py-1.5 rounded-full bg-bg-card border border-border hover:border-primary/30 hover:bg-primary/5 text-text-secondary transition-colors truncate max-w-[200px]"
            disabled={isLoading}
          >
            {q.length > 50 ? q.slice(0, 50) + '...' : q}
          </button>
        ))}
      </div>
    </div>
  );
}

