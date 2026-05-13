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
    <div className="test-case-panel glass-card">
      <h3 className="panel-title">
        🧪 Test Cases
        {allPassed ? (
          <span className="badge badge-success">All Passed</span>
        ) : (
          <span className="badge badge-warning">Issues Found</span>
        )}
      </h3>

      {positiveTests.length > 0 && (
        <div className="test-section">
          <h4 className="test-section-title">Should Accept</h4>
          <div className="test-list">
            {positiveTests.map((t, i) => (
              <div key={i} className={`test-item ${t.passed ? 'test-pass' : 'test-fail'}`}>
                <span className="test-icon">{t.passed ? '✓' : '✗'}</span>
                <code className="test-input">{t.input === '' ? 'ε (empty)' : `"${t.input}"`}</code>
                {!t.passed && (
                  <span className="test-detail">got: {t.actual ? 'accepted' : 'rejected'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {negativeTests.length > 0 && (
        <div className="test-section">
          <h4 className="test-section-title">Should Reject</h4>
          <div className="test-list">
            {negativeTests.map((t, i) => (
              <div key={i} className={`test-item ${t.passed ? 'test-pass' : 'test-fail'}`}>
                <span className="test-icon">{t.passed ? '✓' : '✗'}</span>
                <code className="test-input">{t.input === '' ? 'ε (empty)' : `"${t.input}"`}</code>
                {!t.passed && (
                  <span className="test-detail">got: {t.actual ? 'accepted' : 'rejected'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {counterexamples.length > 0 && (
        <div className="test-section">
          <h4 className="test-section-title counterexample-title">⚠ Counterexamples</h4>
          <div className="test-list">
            {counterexamples.map((c, i) => (
              <div key={i} className="test-item test-fail">
                <span className="test-icon">!</span>
                <span className="test-detail">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
