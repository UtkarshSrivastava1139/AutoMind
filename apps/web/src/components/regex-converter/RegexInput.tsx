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
    <div className="glass-card p-6 mb-6 glow-on-hover transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          <Zap className="text-secondary" size={24} />
          Regular Expression Converter
        </h2>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Enter a regular expression and convert it to NFA → DFA → Minimized DFA using Thompson's, Subset Construction, and Hopcroft's algorithms.
      </p>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && convert()}
            placeholder="e.g., (a|b)*abb, 0(0|1)*1, a*b*c*"
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:bg-slate-900/80 transition-all"
            disabled={isLoading}
            spellCheck={false}
          />
          {pattern && (
            <button
              className="absolute right-3 top-3 text-slate-500 hover:text-red-400 p-1 rounded-md transition-colors"
              onClick={() => setPattern('')}
              title="Clear input"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_REGEXES.map((example, i) => (
              <button
                key={i}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-all hover:border-slate-500 active:scale-95"
                onClick={() => setPattern(example)}
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {pattern && (
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                onClick={reset}
              >
                Reset
              </button>
            )}
            <button
              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                !pattern.trim() || isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)] hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.6)] transform hover:-translate-y-0.5 active:translate-y-0'
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