"use client";

import { useRegexStore } from '@/store/useRegexStore';
import { AutomatonViewer } from './AutomatonViewer';
import { ChevronRight, GitCommit, FileJson, CheckCircle } from 'lucide-react';

export function ConversionPipeline() {
  const { pattern, ast, nfa, dfa, minimizedDfa } = useRegexStore();

  if (!pattern) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Pattern Display */}
      <div className="glass-card p-4 sm:p-5 mb-2 border border-border shadow-sm rounded-xl">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-text-muted font-medium uppercase tracking-wider text-xs">Target Pattern</span>
            <span className="font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-md">{pattern}</span>
          </div>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="space-y-4 relative">
        {/* Decorative dotted line connecting the steps */}
        <div className="absolute left-1/2 top-4 bottom-8 w-px bg-border/50 border-l border-dashed border-border" style={{ marginLeft: '-0.5px', zIndex: -1 }}></div>

        {/* AST */}
        {ast && (
          <div className="relative group">
            <div className="glass-card p-4 sm:p-5 border border-border bg-bg-card/50 shadow-md rounded-xl transition-all duration-300 hover:shadow-xl hover:border-border/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FileJson size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">Step 1: Abstract Syntax Tree</h4>
                  <p className="text-xs text-text-muted">Parsed structure of the regular expression</p>
                </div>
              </div>
              <div className="text-xs text-text-secondary font-mono bg-bg-app border border-border p-3 rounded-lg overflow-auto max-h-40 custom-scrollbar shadow-inner">
                <pre>{JSON.stringify(ast, null, 2)}</pre>
              </div>
            </div>
            
            <div className="flex justify-center py-2 h-10 items-center">
              <div className="bg-bg-app border border-border rounded-full p-1 opacity-70">
                <ChevronRight className="text-text-muted" size={16} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
          </div>
        )}

        {/* NFA */}
        {nfa && (
          <div className="relative group">
            <AutomatonViewer
              automaton={nfa}
              title="Step 2: NFA (Thompson's Construction)"
              description={`${nfa.states.length} states with ε-transitions`}
              icon={<GitCommit className="text-blue-400" size={18} />}
            />
            <div className="flex justify-center py-2 h-10 items-center">
              <div className="bg-bg-app border border-border rounded-full p-1 opacity-70">
                <ChevronRight className="text-text-muted" size={16} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
          </div>
        )}

        {/* DFA */}
        {dfa && (
          <div className="relative group">
            <AutomatonViewer
              automaton={dfa}
              title="Step 3: DFA (Subset Construction)"
              description={`${dfa.states.length} states with complete deterministic transitions`}
              icon={<GitCommit className="text-violet-400" size={18} />}
            />
            <div className="flex justify-center py-2 h-10 items-center">
              <div className="bg-bg-app border border-border rounded-full p-1 opacity-70">
                <ChevronRight className="text-text-muted" size={16} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
          </div>
        )}

        {/* Minimized DFA */}
        {minimizedDfa && (
          <div className="relative group">
            <AutomatonViewer
              automaton={minimizedDfa}
              title="Step 4: Minimized DFA (Hopcroft's Algorithm)"
              description={`${minimizedDfa.states.length} optimized states`}
              icon={<CheckCircle className="text-emerald-400" size={18} />}
              showOpenInSimulator={true}
            />
          </div>
        )}
      </div>

      {/* Summary */}
      {minimizedDfa && (
        <div className="mt-8 mb-6 glass-card p-5 sm:p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
          
          <div className="relative z-10">
            <h4 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <CheckCircle size={18} />
              Optimization Summary
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-sm">
              <div className="bg-bg-app/50 border border-border p-3 rounded-lg">
                <span className="text-text-muted text-xs uppercase tracking-wider mb-1 block">NFA States</span>
                <span className="block text-2xl font-bold text-text-primary font-display">{nfa?.states.length || 0}</span>
              </div>
              <div className="bg-bg-app/50 border border-border p-3 rounded-lg">
                <span className="text-text-muted text-xs uppercase tracking-wider mb-1 block">DFA States</span>
                <span className="block text-2xl font-bold text-text-primary font-display">{dfa?.states.length || 0}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg shadow-inner">
                <span className="text-emerald-400/80 text-xs uppercase tracking-wider mb-1 block">Final States</span>
                <span className="block text-2xl font-bold text-emerald-400 font-display">{minimizedDfa.states.length}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg shadow-inner">
                <span className="text-emerald-400/80 text-xs uppercase tracking-wider mb-1 block">Reduction</span>
                <span className="block text-2xl font-bold text-emerald-400 font-display">
                  {dfa && minimizedDfa ? Math.max(0, Math.round(((dfa.states.length - minimizedDfa.states.length) / Math.max(dfa.states.length, 1)) * 100)) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}