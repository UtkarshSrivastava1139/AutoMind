"use client";

import { useRegexStore } from '@web/store/useRegexStore';
import { AutomatonViewer } from './AutomatonViewer';
import { ChevronRight } from 'lucide-react';

export function ConversionPipeline() {
  const { pattern, ast, nfa, dfa, minimizedDfa } = useRegexStore();

  if (!pattern) return null;

  return (
    <div className="space-y-6">
      {/* Pattern Display */}
      <div className="glass-card p-4 bg-slate-900/20 border border-slate-700/50">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-slate-400">Pattern:</span>
            <span className="font-mono ml-2 text-slate-100 bg-slate-800/50 px-3 py-1 rounded">{pattern}</span>
          </div>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="space-y-2">
        {/* AST */}
        {ast && (
          <>
            <div className="glass-card p-4 bg-slate-900/20 border border-slate-700/50">
              <h4 className="font-semibold text-slate-200 mb-2">Step 1: Parse AST</h4>
              <div className="text-xs text-slate-400 font-mono bg-slate-800/30 p-3 rounded overflow-auto max-h-32">
                <pre>{JSON.stringify(ast, null, 2)}</pre>
              </div>
            </div>
            <div className="flex justify-center">
              <ChevronRight className="text-slate-500" size={20} style={{ transform: 'rotate(90deg)' }} />
            </div>
          </>
        )}

        {/* NFA */}
        {nfa && (
          <>
            <AutomatonViewer
              automaton={nfa}
              title="Step 2: NFA (Thompson's Construction)"
              description={`${nfa.states.length} states with epsilon transitions`}
            />
            <div className="flex justify-center">
              <ChevronRight className="text-slate-500" size={20} style={{ transform: 'rotate(90deg)' }} />
            </div>
          </>
        )}

        {/* DFA */}
        {dfa && (
          <>
            <AutomatonViewer
              automaton={dfa}
              title="Step 3: DFA (Subset Construction)"
              description={`${dfa.states.length} states with complete transitions`}
            />
            <div className="flex justify-center">
              <ChevronRight className="text-slate-500" size={20} style={{ transform: 'rotate(90deg)' }} />
            </div>
          </>
        )}

        {/* Minimized DFA */}
        {minimizedDfa && (
          <AutomatonViewer
            automaton={minimizedDfa}
            title="Step 4: Minimized DFA (Hopcroft's Algorithm)"
            description={`${minimizedDfa.states.length} states (optimized)`}
          />
        )}
      </div>

      {/* Summary */}
      {minimizedDfa && (
        <div className="glass-card p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/50">
          <h4 className="font-semibold text-green-300 mb-3">Conversion Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400">NFA States:</span>
              <span className="block font-bold text-slate-100">{nfa?.states.length || 0}</span>
            </div>
            <div>
              <span className="text-slate-400">DFA States:</span>
              <span className="block font-bold text-slate-100">{dfa?.states.length || 0}</span>
            </div>
            <div>
              <span className="text-slate-400">Minimized States:</span>
              <span className="block font-bold text-green-300">{minimizedDfa.states.length}</span>
            </div>
            <div>
              <span className="text-slate-400">Reduction:</span>
              <span className="block font-bold text-green-300">
                {dfa && minimizedDfa ? Math.round(((dfa.states.length - minimizedDfa.states.length) / dfa.states.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}