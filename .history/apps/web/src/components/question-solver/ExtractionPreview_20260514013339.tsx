"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import { ClipboardList, AlertTriangle } from 'lucide-react';

export function ExtractionPreview() {
  const { status, taskType, confidence, reasoning, parseResult, parseLatencyMs, solve } = useQuestionStore();

  if (!parseResult || status === 'idle' || status === 'parsing') return null;

  const confidenceColor =
    (confidence ?? 0) >= 0.85 ? 'var(--color-success)' :
    (confidence ?? 0) >= 0.6 ? 'var(--color-warning)' :
    'var(--color-error)';

  const confidenceLabel =
    (confidence ?? 0) >= 0.85 ? 'High' :
    (confidence ?? 0) >= 0.6 ? 'Medium' :
    'Low';

  return (
    <div className="extraction-preview glass-card">
      <h3 className="extraction-title" style={{ display: 'flex', alignItems: 'center' }}>
        <ClipboardList className="text-primary mr-2" size={20} style={{ marginRight: '8px' }} />
        Extraction
      </h3>

      <div className="extraction-grid">
        <div className="extraction-field">
          <span className="field-label">Task Type</span>
          <span className="field-value task-type-badge">{taskType}</span>
        </div>

        <div className="extraction-field">
          <span className="field-label">Confidence</span>
          <span className="field-value" style={{ color: confidenceColor }}>
            {Math.round((confidence ?? 0) * 100)}% ({confidenceLabel})
          </span>
        </div>

        <div className="extraction-field">
          <span className="field-label">Alphabet</span>
          <span className="field-value">
            {'{' + parseResult.alphabet.join(', ') + '}'}
          </span>
        </div>

        {parseLatencyMs && (
          <div className="extraction-field">
            <span className="field-label">Parse Time</span>
            <span className="field-value">{(parseLatencyMs / 1000).toFixed(1)}s</span>
          </div>
        )}
      </div>

      <div className="extraction-section">
        <span className="field-label">Language</span>
        <p className="language-description">{parseResult.languageDescription}</p>
      </div>

      {parseResult.atomicConstraints.length > 0 && (
        <div className="extraction-section">
          <span className="field-label">Constraints</span>
          <ul className="constraints-list">
            {parseResult.atomicConstraints.map((c, i) => (
              <li key={i} className="constraint-item">
                <span className="constraint-type">{c.type}</span>
                <span className="constraint-desc">{c.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {parseResult.assumptions.length > 0 && (
        <div className="extraction-section">
          <span className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} className="text-warning" /> Assumptions
          </span>
          <ul className="assumptions-list">
            {parseResult.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {reasoning && (
        <div className="extraction-section">
          <span className="field-label">Reasoning</span>
          <p className="reasoning-text">{reasoning}</p>
        </div>
      )}

      {status === 'clarification' && (
        <div className="extraction-actions" style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--color-warning)', fontSize: '0.9rem' }}>
            ⚠ Please review the constraints and assumptions above. If they look correct, you can proceed.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => solve()}
            style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold' }}
          >
            Generate Automaton ➔
          </button>
        </div>
      )}
    </div>
  );
}
