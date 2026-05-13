import { z } from 'zod';

// ============================================================
// Automaton Types
// ============================================================

export const TransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  symbol: z.string(), // Use 'ε' or 'epsilon' for epsilon transitions
});

export const AutomatonSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['DFA', 'NFA']),
  states: z.array(z.string()).min(1),
  alphabet: z.array(z.string()),
  transitions: z.array(TransitionSchema),
  startState: z.string(),
  acceptStates: z.array(z.string()),
});

export type Transition = z.infer<typeof TransitionSchema>;
export type Automaton = z.infer<typeof AutomatonSchema>;

// ============================================================
// Simulation Types
// ============================================================

export const SimulationStepSchema = z.object({
  index: z.number(),
  symbol: z.string().nullable(),
  activeStates: z.array(z.string()),
  consumedInput: z.string(),
  remainingInput: z.string(),
  note: z.string().optional(),
});

export const SimulationResultSchema = z.object({
  accepted: z.boolean(),
  steps: z.array(SimulationStepSchema),
  finalStates: z.array(z.string()),
  warnings: z.array(z.string()),
});

export type SimulationStep = z.infer<typeof SimulationStepSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;

// ============================================================
// Regex Types
// ============================================================

export const RegexInputSchema = z.object({
  pattern: z.string().min(1).max(500),
});

export type RegexInput = z.infer<typeof RegexInputSchema>;

export type RegexTokenType =
  | 'CHAR'
  | 'UNION'
  | 'STAR'
  | 'PLUS'
  | 'OPTIONAL'
  | 'LPAREN'
  | 'RPAREN'
  | 'CONCAT'
  | 'EPSILON';

export interface RegexToken {
  type: RegexTokenType;
  value: string;
  position: number;
}

export type RegexASTNodeType =
  | 'CHAR'
  | 'EPSILON'
  | 'UNION'
  | 'CONCAT'
  | 'STAR'
  | 'PLUS'
  | 'OPTIONAL';

export interface RegexASTNode {
  type: RegexASTNodeType;
  value?: string;
  left?: RegexASTNode;
  right?: RegexASTNode;
  child?: RegexASTNode;
}

// ============================================================
// Conversion Types
// ============================================================

export interface ConversionStep {
  stepNumber: number;
  description: string;
  intermediateAutomaton?: Automaton;
  metadata?: Record<string, unknown>;
}

export interface ConversionResult {
  result: Automaton;
  steps: ConversionStep[];
  algorithm: string;
}

// ============================================================
// Quiz Types
// ============================================================

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const QuizQuestionTypeSchema = z.enum([
  'mcq',
  'string_acceptance',
  'transition_trace',
  'construction',
  'regex_conversion',
]);
export type QuizQuestionType = z.infer<typeof QuizQuestionTypeSchema>;

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  difficulty: Difficulty;
  config: Record<string, unknown>; // Type-specific config
  answer: Record<string, unknown>; // Correct answer
  explanation: string;
}

export interface QuizSet {
  id: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
}

export interface QuizAttemptResult {
  score: number;
  total: number;
  accuracy: number;
  results: {
    questionId: string;
    correct: boolean;
    userAnswer: unknown;
    explanation: string;
  }[];
}

// ============================================================
// Progress Types
// ============================================================

export interface TopicProgress {
  topic: string;
  attempts: number;
  correct: number;
  accuracy: number;
  lastPracticedAt: string | null;
}

export interface UserProgress {
  totalAttempts: number;
  totalCorrect: number;
  overallAccuracy: number;
  streak: number;
  topics: TopicProgress[];
}

// ============================================================
// AI Types
// ============================================================

export const AIContextTypeSchema = z.enum([
  'explain_simulation',
  'explain_conversion',
  'explain_minimization',
  'suggest_next_topic',
  'general_question',
]);
export type AIContextType = z.infer<typeof AIContextTypeSchema>;

export interface AIExplainRequest {
  contextType: AIContextType;
  context: Record<string, unknown>;
  userQuestion?: string;
}

export interface AIExplainResponse {
  explanation: string;
  safetyFlags: string[];
  metadata: {
    model: string;
    latencyMs: number;
  };
}

// ============================================================
// Project Types
// ============================================================

export const ProjectTypeSchema = z.enum([
  'DFA',
  'NFA',
  'regex-workspace',
  'quiz-solution',
]);
export type ProjectType = z.infer<typeof ProjectTypeSchema>;

export interface GraphNodePosition {
  x: number;
  y: number;
}

export interface GraphNode {
  id: string;
  label: string;
  position: GraphNodePosition;
  isStart: boolean;
  isAccept: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string; // transition symbol(s)
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

// ============================================================
// Question Solver Types
// ============================================================

export * from './question-schemas';
