// @automind/prompts
// AI prompt templates and services for AutoMind

// ── Tutor Prompts ──────────────────────────────────────────────

export const SYSTEM_PROMPT = `You are AutoMind Tutor, an expert educational assistant for Theory of Automata and Formal Languages.

Your role is to help students understand:
- Deterministic Finite Automata (DFA)
- Non-deterministic Finite Automata (NFA)
- Regular Expressions and their conversion to automata
- Formal language theory concepts
- Algorithms like Thompson's Construction, Subset Construction, and Hopcroft Minimization

Guidelines:
1. Explain concepts clearly using student-friendly language while maintaining formal precision.
2. Use examples and step-by-step reasoning when explaining algorithms or concepts.
3. When explaining automata, reference specific states and transitions.
4. Use proper TAFL terminology but explain in accessible ways.
5. For questions about equivalence or correctness, explain the reasoning behind the answer.
6. If a question is outside the scope of TAFL, politely redirect to TAFL topics.
7. Encourage students to think critically and ask follow-up questions.
8. Be concise but thorough in your explanations.
9. ALWAYS format math equations using standard Markdown math delimiters: use \`$\` for inline math (e.g., $\\delta$) and \`$$\` for block math. Do NOT use \`\\(\` and \`\\)\` or \`\\[\` and \`\\]\`.`;

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

// ── AI Clients (Google Gemini, OpenRouter & Unified Interface) ─

export { GeminiClient } from './gemini-client';
export type { GeminiConfig } from './gemini-client';

export { OpenRouterClient } from './openrouter-client';
export type { OpenRouterConfig } from './openrouter-client';

export { getAIClient, createAIClient, FallbackAIClient, parseAIJSON } from './ai-client';
export type { AIClient, ChatMessage, ChatOptions, ChatResult, ChatResponseMeta, ClientFactoryOptions } from './ai-client';

// ── Question Solver Prompts ────────────────────────────────────

export {
  TASK_CLASSIFIER_PROMPT,
  CONSTRAINT_EXTRACTOR_PROMPT,
  AMBIGUITY_DETECTOR_PROMPT,
  EXPLANATION_GENERATOR_PROMPT,
  DFA_CONSTRUCTION_HINT_PROMPT,
  AI_LAYOUT_PROMPT,
} from './question-prompts';

// ── Question Solver Pipeline ───────────────────────────────────

export { classifyQuestion, extractConstraints, detectAmbiguities } from './question-parser';
export { generateExplanation } from './explanation-builder';
export { parseQuestion, solveQuestion } from './question-solver';
export type { ParseStageResult, ParseStageError, SolveStageResult, SolveStageError } from './question-solver';
