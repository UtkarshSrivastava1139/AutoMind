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
    <div className="glass-card rounded-2xl border border-border shadow-md bg-bg-app overflow-hidden flex flex-col">
      <div className="bg-bg-card/50 px-5 py-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 border border-yellow-400/20">
            <Lightbulb size={16} />
          </div>
          <h3 className="font-display font-semibold text-text-primary text-base">Explanation</h3>
        </div>
        {!explanation && status !== 'explaining' && (
          <button 
            onClick={requestExplanation} 
            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-all shadow shadow-primary/20"
          >
            Generate
          </button>
        )}
      </div>

      {status === 'explaining' && (
        <div className="p-8 flex items-center justify-center gap-3 text-text-muted">
          <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-medium animate-pulse">Generating explanation...</span>
        </div>
      )}

      {explanation && (
        <div className="p-5 flex flex-col">
          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:text-text-primary prose-a:text-primary hover:prose-a:text-primary/80">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({node, ...props}) => <h4 className="text-lg font-bold mt-4 mb-2 text-text-primary" {...props} />,
                h3: ({node, ...props}) => <h5 className="text-base font-bold mt-3 mb-2 text-text-primary" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 text-text-secondary" {...props} />,
                li: ({node, ...props}) => <li className="mb-1 text-text-secondary list-disc ml-4" {...props} />,
                ul: ({node, ...props}) => <ul className="mb-4" {...props} />,
                code: ({className, children, ...props}) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <code className={className} {...props}>{children}</code>
                  ) : (
                    <code className="bg-bg-card border border-border text-primary px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                  );
                },
              }}
            >
              {explanation}
            </ReactMarkdown>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2 items-center">
            <span className="flex items-center gap-1.5 bg-bg-card border border-border px-2.5 py-1 rounded text-xs font-medium text-text-muted">
              <Bot size={12} /> AI-Generated
            </span>
            {explanationModel && <span className="bg-bg-card border border-border px-2.5 py-1 rounded text-xs font-medium text-text-muted">{explanationModel}</span>}
            {explainLatencyMs && <span className="bg-bg-card border border-border px-2.5 py-1 rounded text-xs font-medium text-text-muted font-mono">{(explainLatencyMs / 1000).toFixed(1)}s</span>}
          </div>
        </div>
      )}
    </div>
  );
}
