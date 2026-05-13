// @automind/prompts
// AI prompt templates and services for AutoMind

// ── Tutor Prompts ──────────────────────────────────────────────

export const SYSTEM_PROMPT = `You are AutoMind Tutor, an educational assistant for Theory of Automata and Formal Languages.
Rules:
- Explain only from the validated context provided.
- Do not invent transitions, states, parse trees, or formal results.
- If formal correctness is not provided in context, say that explicitly.
- Use precise TAFL terminology, but explain in student-friendly language.
- Prefer step-by-step reasoning.
- For rejection/acceptance questions, reference execution trace details.
- For conversions, explain the algorithm used and what each generated state represents.
- Do not present guesses as facts.`;

export const EXPLAIN_SIMULATION_TEMPLATE = `
The student is analyzing an automaton simulation.

Automaton Type: {{automatonType}}
Input String: "{{input}}"
Result: {{result}}

Execution Trace:
{{#each steps}}
Step {{index}}: Read '{{symbol}}' → Active states: [{{activeStates}}]
{{/each}}

Final States: [{{finalStates}}]
{{#if notes}}
Notes: {{notes}}
{{/if}}

Please explain why this string was {{result}} by this automaton, referencing the specific steps where key decisions were made.
`;

export const EXPLAIN_CONVERSION_TEMPLATE = `
The student is studying a {{algorithm}} conversion.

Source: {{sourceType}}
Target: {{targetType}}

Conversion Steps:
{{#each steps}}
Step {{stepNumber}}: {{description}}
{{/each}}

Please explain each step of this conversion in student-friendly language, noting what each generated state represents.
`;

export const EXPLAIN_MINIMIZATION_TEMPLATE = `
The student is studying DFA minimization using the Hopcroft algorithm.

Original DFA States: {{originalStates}}
Minimized DFA States: {{minimizedStates}}

Partition Steps:
{{#each steps}}
Step {{stepNumber}}: {{description}}
{{/each}}

Please explain which states were merged and why, using the partition refinement steps as reference.
`;

export const SUGGEST_NEXT_TOPIC_TEMPLATE = `
Based on the student's progress:

Topics Practiced:
{{#each topics}}
- {{topic}}: {{accuracy}}% accuracy ({{attempts}} attempts)
{{/each}}

Current Streak: {{streak}}

Suggest what the student should study next and why, considering their weakest areas and learning progression.
`;

// ── OpenRouter Client ──────────────────────────────────────────

export { OpenRouterClient } from './openrouter-client';
export type { OpenRouterConfig, ChatMessage, ChatOptions, ChatResult, ChatResponseMeta } from './openrouter-client';

// ── Question Solver Prompts ────────────────────────────────────

export {
  TASK_CLASSIFIER_PROMPT,
  CONSTRAINT_EXTRACTOR_PROMPT,
  AMBIGUITY_DETECTOR_PROMPT,
  EXPLANATION_GENERATOR_PROMPT,
  DFA_CONSTRUCTION_HINT_PROMPT,
} from './question-prompts';

// ── Question Solver Pipeline ───────────────────────────────────

export { classifyQuestion, extractConstraints, detectAmbiguities } from './question-parser';
export { generateExplanation } from './explanation-builder';
export { parseQuestion, solveQuestion } from './question-solver';
export type { ParseStageResult, ParseStageError, SolveStageResult, SolveStageError } from './question-solver';
