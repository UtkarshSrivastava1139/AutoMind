"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import { ClipboardList, AlertTriangle, ArrowRight } from 'lucide-react';

export function ExtractionPreview() {
  const { status, taskType, confidence, reasoning, parseResult, parseLatencyMs, solve } = useQuestionStore();

  if (!parseResult || status === 'idle' || status === 'parsing') return null;

  const confidenceColor =
    (confidence ?? 0) >= 0.85 ? 'text-success' :
    (confidence ?? 0) >= 0.6 ? 'text-warning' :
    'text-error';

  const confidenceLabel =
    (confidence ?? 0) >= 0.85 ? 'High' :
    (confidence ?? 0) >= 0.6 ? 'Medium' :
    'Low';

  return (
    <div className="glass-card bg-bg-app rounded-2xl border border-border shadow-md overflow-hidden flex flex-col">
      <div className="bg-bg-card/50 px-5 py-4 border-b border-border flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <ClipboardList size={16} />
        </div>
        <h3 className="font-display font-semibold text-text-primary text-base">Extraction</h3>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-semibold text-text-muted tracking-wider">Task Type</span>
            <span className="text-sm font-medium bg-bg-card px-2 py-1 rounded inline-block w-fit border border-border shadow-sm">{taskType}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-semibold text-text-muted tracking-wider">Confidence</span>
            <span className={`text-sm font-bold ${confidenceColor}`}>
              {Math.round((confidence ?? 0) * 100)}% ({confidenceLabel})
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-semibold text-text-muted tracking-wider">Alphabet</span>
            <span className="text-sm font-mono text-secondary bg-secondary/10 px-2 py-1 rounded-md border border-secondary/20 w-fit">
              {'{' + parseResult.alphabet.join(', ') + '}'}
            </span>
          </div>

          {parseLatencyMs && (
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-semibold text-text-muted tracking-wider">Parse Time</span>
              <span className="text-sm font-mono text-text-secondary">{parseLatencyMs}ms</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 border-t border-border pt-4">
          <span className="text-xs uppercase font-semibold text-text-muted tracking-wider">Language</span>
          <p className="text-sm text-text-primary bg-bg-card p-3 rounded-lg border border-border shadow-inner">{parseResult.languageDescription}</p>
        </div>

        {parseResult.atomicConstraints.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-semibold text-text-muted tracking-wider">Constraints</span>
            <ul className="flex flex-col gap-2">
              {parseResult.atomicConstraints.map((c, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 text-sm bg-bg-card/50 p-2 rounded-lg border border-border">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary font-mono text-xs rounded border border-primary/20 shrink-0">{c.type}</span>
                  <span className="text-text-secondary">{c.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {parseResult.assumptions.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <span className="text-xs uppercase font-semibold text-warning tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={14} /> Assumptions
            </span>
            <ul className="list-disc list-inside text-sm text-text-secondary pl-2 space-y-1">
              {parseResult.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {reasoning && (
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <span className="text-xs uppercase font-semibold text-text-muted tracking-wider">Reasoning</span>
            <p className="text-sm text-text-secondary font-serif leading-relaxed bg-bg-card p-3 rounded-lg border border-border italic opacity-80">{reasoning}</p>
          </div>
        )}

        {status === 'clarification' && (
          <div className="mt-2 border-t border-border pt-5 flex flex-col items-center">
            <p className="flex items-start justify-center gap-2 mb-4 text-warning bg-warning/10 p-3 rounded-lg border border-warning/20 text-sm">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>Please review the constraints and assumptions above. If they look correct, you can proceed.</span>
            </p>
            <button 
              className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2" 
              onClick={() => solve()}
            >
              Generate Automaton <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
