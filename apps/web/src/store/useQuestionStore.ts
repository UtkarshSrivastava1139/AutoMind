import { create } from 'zustand';
import type {
  QuestionParseResult,
  QuestionSolveResult,
  AmbiguityFlag,
} from '@automind/schemas';

// ── Types ──────────────────────────────────────────────────────

type SolverStatus =
  | 'idle'
  | 'parsing'
  | 'parsed'
  | 'clarification'
  | 'solving'
  | 'solved'
  | 'explaining'
  | 'error';

interface QuestionStore {
  // State
  questionText: string;
  status: SolverStatus;
  error: string | null;

  // Parse results
  taskType: string | null;
  confidence: number | null;
  reasoning: string | null;
  parseResult: QuestionParseResult | null;
  ambiguities: AmbiguityFlag[];
  needsClarification: boolean;

  // Solve results
  solveResult: QuestionSolveResult | null;

  // Explanation
  explanation: string | null;
  explanationModel: string | null;

  // Latency tracking
  parseLatencyMs: number | null;
  solveLatencyMs: number | null;
  explainLatencyMs: number | null;

  // Actions
  setQuestionText: (text: string) => void;
  submitQuestion: () => Promise<void>;
  solve: () => Promise<void>;
  requestExplanation: () => Promise<void>;
  reset: () => void;
}

// ── Store ──────────────────────────────────────────────────────

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  // Initial state
  questionText: '',
  status: 'idle',
  error: null,
  taskType: null,
  confidence: null,
  reasoning: null,
  parseResult: null,
  ambiguities: [],
  needsClarification: false,
  solveResult: null,
  explanation: null,
  explanationModel: null,
  parseLatencyMs: null,
  solveLatencyMs: null,
  explainLatencyMs: null,

  setQuestionText: (text) => set({ questionText: text }),

  submitQuestion: async () => {
    const { questionText } = get();
    if (!questionText.trim()) return;

    set({
      status: 'parsing',
      error: null,
      parseResult: null,
      solveResult: null,
      explanation: null,
      ambiguities: [],
      needsClarification: false,
    });

    try {
      const res = await fetch('/api/question/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText: questionText.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({
          status: 'error',
          error: data.message || data.error || 'Failed to parse question',
        });
        return;
      }

      set({
        status: data.needsClarification ? 'clarification' : 'parsed',
        taskType: data.taskType,
        confidence: data.confidence,
        reasoning: data.reasoning,
        parseResult: data.parseResult,
        ambiguities: data.ambiguities || [],
        needsClarification: data.needsClarification,
        parseLatencyMs: data.latencyMs,
      });

      // Auto-solve if no clarification needed
      if (!data.needsClarification) {
        // Small delay for UX smoothness
        setTimeout(() => get().solve(), 300);
      }
    } catch (err) {
      set({
        status: 'error',
        error: `Network error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  },

  solve: async () => {
    const { questionText, parseResult } = get();
    if (!parseResult) return;

    set({ status: 'solving', error: null, solveResult: null });

    try {
      const res = await fetch('/api/question/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText: questionText.trim(), parseResult }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({
          status: 'error',
          error: data.message || data.error || 'Failed to solve question',
        });
        return;
      }

      set({
        status: 'solved',
        solveResult: data,
        solveLatencyMs: data.latencyMs,
      });
    } catch (err) {
      set({
        status: 'error',
        error: `Network error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  },

  requestExplanation: async () => {
    const { questionText, parseResult, solveResult } = get();
    if (!parseResult || !solveResult?.automaton) return;

    set({ status: 'explaining' });

    try {
      const res = await fetch('/api/question/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: questionText.trim(),
          parseResult,
          automaton: solveResult.automaton,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({
          status: 'solved',
          error: data.message || 'Failed to generate explanation',
        });
        return;
      }

      set({
        status: 'solved',
        explanation: data.explanation,
        explanationModel: data.model,
        explainLatencyMs: data.latencyMs,
      });
    } catch (err) {
      set({
        status: 'solved',
        error: `Explanation error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  },

  reset: () => set({
    questionText: '',
    status: 'idle',
    error: null,
    taskType: null,
    confidence: null,
    reasoning: null,
    parseResult: null,
    ambiguities: [],
    needsClarification: false,
    solveResult: null,
    explanation: null,
    explanationModel: null,
    parseLatencyMs: null,
    solveLatencyMs: null,
    explainLatencyMs: null,
  }),
}));
