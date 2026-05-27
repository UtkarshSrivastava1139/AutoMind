import { z } from 'zod';

// ============================================================
// Question Solver — Task Types
// ============================================================

export const TaskTypeSchema = z.enum([
  'build_dfa',
  'build_nfa',
  'build_regex',
  'regex_to_nfa',
  'nfa_to_dfa',
  'minimize_dfa',
  'explain',
  'unsupported',
]);
export type TaskType = z.infer<typeof TaskTypeSchema>;

export const TargetFormalismSchema = z.enum(['DFA', 'NFA', 'REGEX', 'TRANSITION_TABLE']);
export type TargetFormalism = z.infer<typeof TargetFormalismSchema>;

// ============================================================
// Atomic Constraints — structured language properties
// ============================================================

export const AtomicConstraintTypeSchema = z.enum([
  'starts_with',
  'ends_with',
  'contains',
  'not_contains',
  'length_exact',
  'length_min',
  'length_max',
  'count_min',
  'count_max',
  'count_exact',
  'divisibility',
  'parity',
  'pattern',
  'custom',
]);

export const AtomicConstraintSchema = z.object({
  type: AtomicConstraintTypeSchema,
  target: z.string().nullable().optional(),
  value: z.number().nullable().optional(),
  description: z.string(),
});
export type AtomicConstraint = z.infer<typeof AtomicConstraintSchema>;

// ============================================================
// State Semantics
// ============================================================

export const StateVectorSchema = z.record(z.string(), z.any());
export type StateVector = z.infer<typeof StateVectorSchema>;

// ============================================================
// Boolean AST Expression
// ============================================================

export const BooleanExprSchema: z.ZodType<any> = z.lazy(() => z.union([
  z.object({
    operator: z.enum(['AND', 'OR', 'XOR']),
    left: BooleanExprSchema,
    right: BooleanExprSchema,
  }),
  z.object({
    operator: z.literal('NOT'),
    child: BooleanExprSchema,
  }),
  z.string() // refers to a constraint description
]));

export type BooleanExpr = {
  operator: 'AND' | 'OR' | 'XOR';
  left: BooleanExpr;
  right: BooleanExpr;
} | {
  operator: 'NOT';
  child: BooleanExpr;
} | string;

// ============================================================
// Ambiguity Flags
// ============================================================

export const AmbiguityFlagSchema = z.object({
  field: z.string(),
  issue: z.string(),
  suggestions: z.array(z.string()),
});
export type AmbiguityFlag = z.infer<typeof AmbiguityFlagSchema>;

// ============================================================
// Task Classification Result
// ============================================================

export const TaskClassificationSchema = z.object({
  taskType: TaskTypeSchema,
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});
export type TaskClassification = z.infer<typeof TaskClassificationSchema>;

// ============================================================
// Question Parse Result (LLM extraction output)
// ============================================================

export const QuestionParseResultSchema = z.object({
  taskType: TaskTypeSchema,
  targetFormalism: TargetFormalismSchema,
  alphabet: z.array(z.string()),
  languageDescription: z.string(),
  atomicConstraints: z.array(AtomicConstraintSchema),
  constraintExpressionTree: BooleanExprSchema.optional(),
  positiveExamples: z.array(z.string()),
  negativeExamples: z.array(z.string()),
  assumptions: z.array(z.string()),
  ambiguityFlags: z.array(AmbiguityFlagSchema),
  confidence: z.number().min(0).max(1),
  notes: z.string().optional(),
});
export type QuestionParseResult = z.infer<typeof QuestionParseResultSchema>;

// ============================================================
// Verification Result
// ============================================================

export const TestCaseResultSchema = z.object({
  input: z.string(),
  expected: z.boolean(),
  actual: z.boolean(),
  passed: z.boolean(),
});
export type TestCaseResult = z.infer<typeof TestCaseResultSchema>;

export const VerificationResultSchema = z.object({
  passed: z.boolean(),
  positiveResults: z.array(TestCaseResultSchema),
  negativeResults: z.array(TestCaseResultSchema),
  counterexamples: z.array(z.string()),
  rejectionReason: z.string().optional(),
  structuralIssues: z.array(z.string()),
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;

// ============================================================
// Transition Table
// ============================================================

export const TransitionTableSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});
export type TransitionTable = z.infer<typeof TransitionTableSchema>;

// ============================================================
// Question Solve Result (final verified output)
// ============================================================

export const VerificationStatusSchema = z.enum(['verified', 'partial', 'unverified']);

export const RunMetricsSchema = z.object({
  statesBeforeMinimization: z.number(),
  statesAfterMinimization: z.number(),
  compositionTimeMs: z.number(),
  verificationTimeMs: z.number(),
  tierUsed: z.enum(['cache', 'deterministic', 'oracle_seed', 'llm']),
  fallbackTriggered: z.boolean(),
  fallbackReason: z.string().optional()
});
export type RunMetrics = z.infer<typeof RunMetricsSchema>;

export const QuestionSolveResultSchema = z.object({
  status: VerificationStatusSchema,
  automaton: z.object({
    type: z.enum(['DFA', 'NFA']),
    states: z.array(z.string()),
    alphabet: z.array(z.string()),
    startState: z.string(),
    acceptStates: z.array(z.string()),
    transitions: z.array(z.object({
      from: z.string(),
      to: z.string(),
      symbol: z.string(),
    })),
  }).optional(),
  regex: z.string().optional(),
  transitionTable: TransitionTableSchema.optional(),
  diagramData: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }).optional(),
  positiveTests: z.array(TestCaseResultSchema),
  negativeTests: z.array(TestCaseResultSchema),
  counterexamples: z.array(z.string()),
  candidatesEvaluated: z.number(),
  explanation: z.string().optional(),
  metrics: RunMetricsSchema.optional(),
});
export type QuestionSolveResult = z.infer<typeof QuestionSolveResultSchema>;

// ============================================================
// Layout Generation Result
// ============================================================

export const AILayoutResponseSchema = z.record(
  z.string(),
  z.object({
    x: z.number(),
    y: z.number(),
  })
);
export type AILayoutResponse = z.infer<typeof AILayoutResponseSchema>;
