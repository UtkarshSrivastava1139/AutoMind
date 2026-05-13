"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import { QuestionInput } from '@web/components/question-solver/QuestionInput';
import { ExtractionPreview } from '@web/components/question-solver/ExtractionPreview';
import { SolutionDiagram } from '@web/components/question-solver/SolutionDiagram';
import { TransitionTableView } from '@web/components/question-solver/TransitionTableView';
import { TestCasePanel } from '@web/components/question-solver/TestCasePanel';
import { ExplanationPanel } from '@web/components/question-solver/ExplanationPanel';
import { PencilLoader } from '@web/components/ui/PencilLoader';
import { useState } from 'react';

export default function QuestionSolverPage() {
  const { status, error, solveResult } = useQuestionStore();
  const [isExporting, setIsExporting] = useState(false);

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

      const opt = {
        margin: 10,
        filename: `automata-solution-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
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
    <div className="question-solver-page">
      {/* Header */}
      <div className="qs-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="qs-page-title">Question Solver</h1>
          <p className="qs-page-subtitle">
            Paste a Theory of Automata question → get a verified solution
          </p>
        </div>
        
        {status === 'solved' || status === 'explaining' ? (
          <button 
            className="btn btn-secondary"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            data-html2canvas-ignore
          >
            {isExporting ? <span className="spinner spinner-sm" /> : (
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
        <div className="qs-error-banner" data-html2canvas-ignore>
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Results Area */}
      <div id="pdf-export-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        {(status === 'parsed' || status === 'clarification' || status === 'solving' || status === 'solved' || status === 'explaining') && (
        <div className="qs-results-grid">
          {/* Left Column: Extraction + Test Cases */}
          <div className="qs-left-column">
            <ExtractionPreview />
            <TestCasePanel />
          </div>

          {/* Right Column: Diagram + Table */}
          <div className="qs-right-column">
            {status === 'solving' ? (
              <div className="qs-solving-indicator">
                <PencilLoader />
                <p style={{ marginTop: '1rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>Analyzing & Generating Automaton...</p>
              </div>
            ) : (
              <>
                <SolutionDiagram />
                <TransitionTableView />
              </>
            )}
          </div>
        </div>
      )}

      {/* Explanation — full width below */}
      {(status === 'solved' || status === 'explaining') && solveResult && (
        <ExplanationPanel />
      )}
      </div>

      {/* Verification Status Footer */}
      {solveResult && status === 'solved' && (
        <div className="qs-status-footer" data-html2canvas-ignore>
          <div className="status-info">
            <span className={`verification-badge ${solveResult.status}`}>
              {solveResult.status === 'verified' ? '✓ Engine Verified' : '⚠ Partially Verified'}
            </span>
            <span className="candidates-info">
              {solveResult.candidatesEvaluated} candidate(s) evaluated
            </span>
          </div>
          <p className="verification-note">
            All formal results are verified by the deterministic engine. AI is used only for interpretation and explanation.
          </p>
        </div>
      )}
    </div>
  );
}
