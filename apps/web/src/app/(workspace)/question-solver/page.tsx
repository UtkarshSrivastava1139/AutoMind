"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import { QuestionInput } from '@web/components/question-solver/QuestionInput';
import { ExtractionPreview } from '@web/components/question-solver/ExtractionPreview';
import { SolutionDiagram } from '@web/components/question-solver/SolutionDiagram';
import { TransitionTableView } from '@web/components/question-solver/TransitionTableView';
import { TestCasePanel } from '@web/components/question-solver/TestCasePanel';
import { ExplanationPanel } from '@web/components/question-solver/ExplanationPanel';
import { PencilLoader } from '@web/components/ui/PencilLoader';
import { AlertTriangle, CheckCircle2, PenLine, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';

const PROGRESS_MESSAGES = [
  "Extracting entities...",
  "Synthesizing logic...",
  "Building automaton...",
  "Running verification..."
];

export default function QuestionSolverPage() {
  const { status, error, solveResult } = useQuestionStore();
  const [isExporting, setIsExporting] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (status === 'solving') {
      setLoadingMsgIdx(0);
      const interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev));
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('pdf-export-wrapper');
      
      if (!element) throw new Error("Export content not found");

      // Create a clean clone for PDF export (avoid React Flow and other interactive elements)
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Remove any interactive elements that don't render well in PDF
      clone.querySelectorAll('[data-html2canvas-ignore]').forEach(el => el.remove());
      clone.querySelectorAll('.svg-pan-zoom').forEach(el => el.remove());

      // Force background colors explicitly on the clone to ensure dark mode rendering
      clone.style.backgroundColor = '#0f172a';
      clone.style.color = '#e2e8f0';
      clone.style.padding = '16px';
      
      // Make grid single-column in the PDF so the diagram and table expand to full page width
      const grid = clone.querySelector('.qs-results-grid') as HTMLElement;
      if (grid) {
        grid.style.display = 'flex';
        grid.style.flexDirection = 'column';
        grid.style.gap = '24px';
      }
      
      const leftCol = clone.querySelector('.qs-left-column') as HTMLElement;
      if (leftCol) leftCol.style.width = '100%';
      
      const rightCol = clone.querySelector('.qs-right-column') as HTMLElement;
      if (rightCol) rightCol.style.width = '100%';

      const opt = {
        margin: 10,
        filename: `automata-solution-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#0f172a', // Use dark background for PDF to match app theme
          logging: false,
          allowTaint: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(clone).save();
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.textContent = 'PDF downloaded successfully!';
      successMsg.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--color-success);
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 0.9rem;
      `;
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      
      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.textContent = 'PDF generation failed. Try using print instead.';
      errorMsg.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--color-error);
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 0.9rem;
      `;
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
      
      // Fallback to native print
      setTimeout(() => window.print(), 500);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Question Solver</h1>
          <p className="text-sm text-text-muted mt-1">
            Paste a Theory of Automata question → get a verified solution
          </p>
        </div>
        
        {status === 'solved' || status === 'explaining' ? (
          <button 
            className="px-4 py-2 bg-bg-card hover:bg-primary/10 text-primary border border-primary/20 rounded-xl transition-all shadow-sm font-semibold text-sm flex items-center gap-2 h-fit"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            data-html2canvas-ignore
          >
            {isExporting ? <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"/> : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            )}
            {isExporting ? 'Generating PDF...' : 'Download PDF'}
          </button>
        ) : null}
      </div>

      {/* Input */}
      <QuestionInput />

      {/* Error */}
      {error && status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 text-error rounded-xl shadow-lg" data-html2canvas-ignore>
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

      {/* Results Area */}
      <div id="pdf-export-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        {(status === 'parsed' || status === 'clarification' || status === 'solving' || status === 'solved' || status === 'explaining') && (
        <div className="qs-results-grid grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 items-start w-full">
          {/* Left Column: Extraction + Test Cases */}
          <div className="qs-left-column flex flex-col gap-6 w-full">
            <ExtractionPreview />
            <TestCasePanel />
          </div>

          {/* Right Column: Diagram + Table */}
          <div className="qs-right-column flex flex-col gap-6 w-full min-w-0">
            {status === 'solving' ? (
              <div className="min-h-[400px] glass-card flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-border bg-bg-app shadow-2xl relative overflow-hidden">
                <PencilLoader />
                <p className="mt-6 text-primary font-semibold tracking-wide animate-pulse">
                  {PROGRESS_MESSAGES[loadingMsgIdx]}
                </p>
              </div>
            ) : (
              <>
                <div className="w-full glass-card rounded-2xl border border-border bg-bg-app overflow-hidden shadow-2xl flex flex-col items-center relative lg:sticky lg:top-20 lg:z-10">
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
        <div className="glass-card mt-8 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5" data-html2canvas-ignore>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm flex items-center gap-2 ${solveResult.status === 'verified' ? 'bg-success/20 text-success border border-success/30' : 'bg-warning/20 text-warning border border-warning/30'}`}>
              {solveResult.status === 'verified' ? (
                <><CheckCircle2 size={16} /> Engine Verified</>
              ) : (
                <><AlertTriangle size={16} /> Partially Verified</>
              )}
            </span>
            <span className="text-sm font-medium text-text-muted bg-bg-app px-3 py-1 rounded-lg border border-border shadow-inner">
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


