"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import { QuestionInput } from '@web/components/question-solver/QuestionInput';
import { ExtractionPreview } from '@web/components/question-solver/ExtractionPreview';
import { SolutionDiagram } from '@web/components/question-solver/SolutionDiagram';
import { TransitionTableView } from '@web/components/question-solver/TransitionTableView';
import { TestCasePanel } from '@web/components/question-solver/TestCasePanel';
import { ExplanationPanel } from '@web/components/question-solver/ExplanationPanel';
import { PencilLoader } from '@web/components/ui/PencilLoader';
import { AlertTriangle, CheckCircle2, PenLine, Cpu, Brain, Scan, Cog, ShieldCheck, Printer } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const PARSE_STEPS = [
  { icon: Scan, label: "Reading your question…", sub: "Classifying problem type" },
  { icon: Brain, label: "Extracting constraints…", sub: "Identifying alphabet, language rules" },
  { icon: ShieldCheck, label: "Checking for ambiguity…", sub: "Validating extracted parameters" },
];

const SOLVE_MESSAGES = [
  "Constructing automaton…",
  "Building state machine…",
  "Minimizing states…",
  "Running verification…"
];

export default function QuestionSolverPage() {
  const { status, error, solveResult } = useQuestionStore();
  const [isExporting, setIsExporting] = useState(false);
  const [parseStepIdx, setParseStepIdx] = useState(0);
  const [solveMsgIdx, setSolveMsgIdx] = useState(0);

  // Parsing step animation
  useEffect(() => {
    if (status === 'parsing') {
      setParseStepIdx(0);
      const interval = setInterval(() => {
        setParseStepIdx((prev) => (prev < PARSE_STEPS.length - 1 ? prev + 1 : prev));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Solving message animation
  useEffect(() => {
    if (status === 'solving') {
      setSolveMsgIdx(0);
      const interval = setInterval(() => {
        setSolveMsgIdx((prev) => (prev < SOLVE_MESSAGES.length - 1 ? prev + 1 : prev));
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handlePrint = useCallback(() => {
    setIsExporting(true);
    // Small delay to let state update render, then print
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 100);
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Question Solver</h1>
          <p className="text-sm text-text-muted mt-1">
            Paste a Theory of Automata question → get a verified solution
          </p>
        </div>
        
        {(status === 'solved' || status === 'explaining') && (
          <button 
            className="px-4 py-2 bg-bg-card hover:bg-primary/10 text-primary border border-primary/20 rounded-xl transition-all shadow-sm font-semibold text-sm flex items-center gap-2 h-fit"
            onClick={handlePrint}
            disabled={isExporting}
          >
            {isExporting ? <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"/> : (
              <Printer size={16} />
            )}
            {isExporting ? 'Preparing…' : 'Print / Save PDF'}
          </button>
        )}
      </div>

      {/* Input */}
      <div className="print:hidden">
        <QuestionInput />
      </div>

      {/* Error */}
      {error && status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 text-error rounded-xl shadow-lg print:hidden">
          <AlertTriangle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Idle State */}
      {status === 'idle' && (
        <div className="mt-6 p-8 md:p-12 glass-card rounded-2xl border border-border/50 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary-light mb-6 border border-primary/20">
            <Cpu size={32} />
          </div>
          <h3 className="text-xl font-display font-semibold text-text-primary mb-3">
            How Question Solver Works
          </h3>
          <p className="text-sm text-text-secondary max-w-lg mx-auto mb-10 leading-relaxed">
            Our specialized engine converts plain English automata questions into formally verified computational models.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted mb-3 border border-border">
                <PenLine size={18} />
              </div>
              <h4 className="text-sm font-semibold text-text-primary mb-1">1. Ask a Question</h4>
              <p className="text-xs text-text-muted text-center px-4">Paste any DFA/NFA/Regex question in plain text.</p>
            </div>
            <div className="flex flex-col items-center relative">
              <div className="hidden md:block absolute top-5 -left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="hidden md:block absolute top-5 -right-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-light mb-3 border border-primary/20">
                <Cpu size={18} />
              </div>
              <h4 className="text-sm font-semibold text-text-primary mb-1">2. AI Extraction</h4>
              <p className="text-xs text-text-muted text-center px-4">AI extracts formal parameters and test cases.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success mb-3 border border-success/20">
                <CheckCircle2 size={18} />
              </div>
              <h4 className="text-sm font-semibold text-text-primary mb-1">3. Verified Output</h4>
              <p className="text-xs text-text-muted text-center px-4">Deterministic engine generates & validates the model.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Parsing Loader ── */}
      {status === 'parsing' && (
        <div className="mt-4 glass-card rounded-2xl border border-border/50 p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[320px] relative overflow-hidden">
          {/* Animated background pulse */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse" />
          
          {/* Brain icon with glow */}
          <div className="relative mb-8">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Brain size={36} className="text-primary animate-pulse" />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex flex-col gap-4 w-full max-w-sm">
            {PARSE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === parseStepIdx;
              const isDone = i < parseStepIdx;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                    isActive
                      ? 'bg-primary/10 border border-primary/30 shadow-lg shadow-primary/10'
                      : isDone
                      ? 'bg-success/5 border border-success/20 opacity-70'
                      : 'bg-bg-card/30 border border-border/30 opacity-40'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isActive ? 'bg-primary/20 text-primary' : isDone ? 'bg-success/20 text-success' : 'bg-bg-card text-text-muted'
                  }`}>
                    {isDone ? <CheckCircle2 size={16} /> : isActive ? <Icon size={16} className="animate-pulse" /> : <Icon size={16} />}
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : isDone ? 'text-success' : 'text-text-muted'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-text-muted truncate">{step.sub}</p>
                  </div>
                  {isActive && (
                    <span className="ml-auto w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Print Header (only visible in print) ── */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold text-black">AutoMind — Question Solver</h1>
        <p className="text-sm text-gray-600 mt-1">Generated solution • {new Date().toLocaleDateString()}</p>
        <hr className="mt-3 border-gray-300" />
      </div>

      {/* Results Area */}
      <div id="pdf-export-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        {(status === 'parsed' || status === 'clarification' || status === 'solving' || status === 'solved' || status === 'explaining') && (
        <div className="qs-results-grid grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 items-start w-full print:block">
          {/* Left Column: Extraction + Test Cases */}
          <div className="qs-left-column flex flex-col gap-6 w-full print:mb-6">
            <ExtractionPreview />
            <TestCasePanel />
          </div>

          {/* Right Column: Diagram + Table */}
          <div className="qs-right-column flex flex-col gap-6 w-full min-w-0">
            {status === 'solving' ? (
              <div className="min-h-[400px] glass-card flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-border bg-bg-app shadow-2xl relative overflow-hidden print:hidden">
                <PencilLoader />
                <p className="mt-6 text-primary font-semibold tracking-wide animate-pulse">
                  {SOLVE_MESSAGES[solveMsgIdx]}
                </p>
              </div>
            ) : (
              <>
                <div className="w-full glass-card rounded-2xl border border-border bg-bg-app overflow-hidden shadow-2xl flex flex-col items-center relative lg:sticky lg:top-20 lg:z-10 print:shadow-none print:border-gray-300 print:sticky-none print:static">
                  <SolutionDiagram />
                </div>
                <TransitionTableView />
                {solveResult && <ExplanationPanel />}
              </>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Verification Status Footer */}
      {solveResult && status === 'solved' && (
        <div className="glass-card mt-8 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 print:bg-gray-50 print:border-gray-300">
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm flex items-center gap-2 ${solveResult.status === 'verified' ? 'bg-success/20 text-success border border-success/30 print:bg-green-100 print:text-green-800 print:border-green-300' : 'bg-warning/20 text-warning border border-warning/30 print:bg-yellow-100 print:text-yellow-800 print:border-yellow-300'}`}>
              {solveResult.status === 'verified' ? (
                <><CheckCircle2 size={16} /> Engine Verified</>
              ) : (
                <><AlertTriangle size={16} /> Partially Verified</>
              )}
            </span>
            <span className="text-sm font-medium text-text-muted bg-bg-app px-3 py-1 rounded-lg border border-border shadow-inner print:bg-white print:shadow-none">
              {solveResult.candidatesEvaluated} candidate(s) evaluated
            </span>
          </div>
          <p className="text-xs text-text-muted/80 max-w-sm text-center md:text-right hidden sm:block">
            All formal results are verified by the deterministic engine. AI is used only for interpretation and explanation.
          </p>
        </div>
      )}
    </div>
  );
}
