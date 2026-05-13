"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lightbulb, Bot } from 'lucide-react';

export function ExplanationPanel() {
  const { explanation, explanationModel, explainLatencyMs, status, solveResult, requestExplanation } = useQuestionStore();

  if (status !== 'solved' && status !== 'explaining') return null;
  if (!solveResult) return null;

  return (
    <div className="explanation-panel glass-card">
      <div className="explanation-header">
        <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center' }}>
          <Lightbulb className="text-yellow-400 mr-2" size={20} />
          Explanation
        </h3>
        {!explanation && status !== 'explaining' && (
          <button onClick={requestExplanation} className="explain-btn">
            Generate Explanation
          </button>
        )}
      </div>

      {status === 'explaining' && (
        <div className="explanation-loading">
          <span className="spinner" />
          <span>Generating explanation...</span>
        </div>
      )}

      {explanation && (
        <>
          <div className="explanation-content" style={{ padding: '0.5rem', lineHeight: '1.6' }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({node, ...props}) => <h4 className="explanation-heading" {...props} />,
                h3: ({node, ...props}) => <h5 className="explanation-heading" style={{fontSize: '1.1rem'}} {...props} />,
                p: ({node, ...props}) => <p className="explanation-text" style={{marginBottom: '0.8rem'}} {...props} />,
                li: ({node, ...props}) => <li className="explanation-point" style={{marginBottom: '0.4rem', marginLeft: '1.5rem'}} {...props} />,
                ul: ({node, ...props}) => <ul style={{listStyleType: 'disc', marginBottom: '1rem'}} {...props} />,
                code: ({node, ...props}) => <code style={{background: 'var(--color-bg-workspace)', padding: '0.2rem 0.4rem', borderRadius: '4px', color: 'var(--color-primary-light)'}} {...props} />,
              }}
            >
              {explanation}
            </ReactMarkdown>
          </div>
          <div className="explanation-meta" style={{ marginTop: '1.5rem', display: 'flex', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', alignItems: 'center' }}>
            <span className="ai-badge" style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--color-bg-workspace)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              <Bot size={14} className="mr-1" style={{ marginRight: '4px' }} /> AI-Generated
            </span>
            {explanationModel && <span className="model-tag" style={{ background: 'var(--color-bg-workspace)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{explanationModel}</span>}
            {explainLatencyMs && <span className="latency-tag" style={{ background: 'var(--color-bg-workspace)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{(explainLatencyMs / 1000).toFixed(1)}s</span>}
          </div>
        </>
      )}
    </div>
  );
}
