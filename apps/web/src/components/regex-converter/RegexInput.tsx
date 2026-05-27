"use client";

import { useRegexStore } from '@web/store/useRegexStore';
import { Zap, X, Play } from 'lucide-react';

const EXAMPLE_REGEXES = [
  '(a|b)*abb',
  '0(0|1)*1',
  '(a|b)*a(a|b)*',
  'a*b*c*',
  '(01|10)*',
];

export function RegexInput() {
  const { pattern, setPattern, convert, error, reset } = useRegexStore();
  const isLoading = false; // No async operations in convert

  return (
    <div className="glass-card p-5 sm:p-6 mb-2 border border-border bg-bg-card/50 shadow-xl rounded-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xl font-bold flex items-center gap-2 font-display text-text-primary">
          <Zap className="text-primary fill-primary/20" size={24} />
          Regular Expression Converter
        </h2>
      </div>

      <p className="text-sm text-text-muted mb-5 leading-relaxed max-w-3xl">
        Enter a regular expression and convert it to NFA â†’ DFA â†’ Minimized DFA using Thompson's, Subset Construction, and Hopcroft's algorithms.
      </p>

      <div className="space-y-4">
        <div className="relative group">
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && convert()}
            placeholder="e.g., (a|b)*abb, 0(0|1)*1, a*b*c*"
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3.5 text-text-primary font-mono placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
            disabled={isLoading}
            spellCheck={false}
          />
          {pattern && (
            <button
              className="absolute right-3 top-3.5 text-text-muted hover:text-red-400 p-1 rounded-md transition-colors bg-bg-app hover:bg-red-500/10"
              onClick={() => setPattern('')}
              title="Clear input"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm flex items-start gap-2">
            <span className="font-semibold">Error:</span>
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mt-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mr-1">Examples:</span>
            {EXAMPLE_REGEXES.map((example, i) => (
              <button
                key={i}
                className="text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary px-3 py-1.5 rounded-full transition-all hover:border-white/10 active:scale-95"
                onClick={() => setPattern(example)}
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {pattern && (
              <button
                className="flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold bg-bg-card hover:bg-white/5 text-text-secondary border border-border transition-all"
                onClick={reset}
              >
                Reset
              </button>
            )}
            <button
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                !pattern.trim() || isLoading
                  ? 'bg-bg-card text-text-muted border border-border opacity-50 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 border border-primary/20'
              }`}
              onClick={convert}
              disabled={!pattern.trim() || isLoading}
            >
              <Play size={16} fill="currentColor" />
              Convert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
