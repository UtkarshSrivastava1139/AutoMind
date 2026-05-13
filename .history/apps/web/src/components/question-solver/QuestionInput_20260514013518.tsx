"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import { Brain, X, Play } from 'lucide-react';

const EXAMPLE_QUESTIONS = [
  "Design a DFA that accepts all binary strings ending in 01",
  "Build a DFA for binary strings divisible by 3",
  "Design a DFA over {a,b} that accepts strings with even number of a's",
  "Convert (a|b)*abb to an NFA",
  "Convert the regex 0(0|1)*1 to NFA",
];

export function QuestionInput() {
  const { questionText, setQuestionText, submitQuestion, status, reset } = useQuestionStore();
  const isLoading = status === 'parsing' || status === 'solving' || status === 'explaining';

  return (
    <div className="question-input-container">
      <div className="question-input-header">
        <h2 className="question-input-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain className="text-secondary" size={24} />
          Ask a Question
        </h2>
        {status !== 'idle' && (
          <button onClick={reset} className="question-reset-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <X size={16} /> Reset
          </button>
        )}
      </div>

      <div className="question-textarea-wrapper">
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Paste your automata theory question here..."
          className="question-textarea"
          rows={3}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submitQuestion();
            }
          }}
        />
        <button
          onClick={submitQuestion}
          disabled={isLoading || !questionText.trim()}
          className="question-solve-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              {status === 'parsing' ? 'Analyzing...' : status === 'solving' ? 'Solving...' : 'Working...'}
            </>
          ) : (
            <>Solve <Play size={16} fill="currentColor" /></>
          )}
        </button>
      </div>

      <div className="question-examples">
        <span className="examples-label">Try:</span>
        {EXAMPLE_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => {
              setQuestionText(q);
              // Don't auto-submit; let user review
            }}
            className="example-chip"
            disabled={isLoading}
          >
            {q.length > 50 ? q.slice(0, 50) + '...' : q}
          </button>
        ))}
      </div>
    </div>
  );
}
