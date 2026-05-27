"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import { TestTubes, Check, X, AlertOctagon } from 'lucide-react';

export function TestCasePanel() {
  const { solveResult } = useQuestionStore();

  if (!solveResult) return null;

  const { positiveTests, negativeTests, counterexamples } = solveResult;
  const allTestsPassed = [...positiveTests, ...negativeTests].every((t) => t.passed);
  const allPassed = allTestsPassed && counterexamples.length === 0;

  return (
    <div className="glass-card rounded-2xl border border-border shadow-md overflow-hidden flex flex-col bg-bg-app">
      <div className="bg-bg-card/50 px-5 py-4 border-b border-border flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
            <TestTubes size={16} />
          </div>
          <h3 className="font-display font-semibold text-text-primary text-base">Test Cases</h3>
        </div>
        {allPassed ? (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-success/20 text-success border border-success/30 shadow-sm uppercase tracking-wider">All Passed</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-warning/20 text-warning border border-warning/30 shadow-sm uppercase tracking-wider">Issues Found</span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-6">
        {positiveTests.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-semibold text-success tracking-wider border-b border-border/50 pb-1">Should Accept</h4>
            <div className="flex flex-col gap-2">
              {positiveTests.map((t, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${t.passed ? 'bg-success/5 border-success/20 text-success' : 'bg-error/5 border-error/20 text-error'}`}>
                  <span className="shrink-0 flex items-center justify-center bg-bg-app p-1 rounded-full shadow-sm border border-border">
                    {t.passed ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                  </span>
                  <code className="font-mono text-sm font-semibold truncate flex-1">{t.input === '' ? 'ε (empty)' : `"${t.input}"`}</code>
                  {!t.passed && (
                    <span className="text-xs opacity-80 whitespace-nowrap bg-bg-app px-2 py-0.5 rounded border border-border hidden sm:inline">got: {t.actual ? 'accepted' : 'rejected'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {negativeTests.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-semibold text-error tracking-wider border-b border-border/50 pb-1">Should Reject</h4>
            <div className="flex flex-col gap-2">
              {negativeTests.map((t, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${t.passed ? 'bg-success/5 border-success/20 text-success' : 'bg-error/5 border-error/20 text-error'}`}>
                  <span className="shrink-0 flex items-center justify-center bg-bg-app p-1 rounded-full shadow-sm border border-border">
                    {t.passed ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                  </span>
                  <code className="font-mono text-sm font-semibold truncate flex-1">{t.input === '' ? 'ε (empty)' : `"${t.input}"`}</code>
                  {!t.passed && (
                    <span className="text-xs opacity-80 whitespace-nowrap bg-bg-app px-2 py-0.5 rounded border border-border hidden sm:inline">got: {t.actual ? 'accepted' : 'rejected'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {counterexamples.length > 0 && (
          <div className="flex flex-col gap-3 mt-2 border-t border-error/20 pt-5">
            <h4 className="text-xs uppercase font-semibold text-error flex items-center gap-1.5"><AlertOctagon size={14} /> Counterexamples</h4>
            <div className="flex flex-col gap-2">
              {counterexamples.map((ce, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
                  <AlertOctagon size={14} className="shrink-0 mt-0.5" /> 
                  <span className="text-text-secondary font-mono text-xs break-all">{typeof ce === 'string' ? ce : String(ce)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
