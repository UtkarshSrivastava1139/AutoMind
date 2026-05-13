/**
 * Question Solver Orchestrator
 *
 * Coordinates the full pipeline:
 *   Question → Classify → Extract → Ambiguity Check →
 *   Generate Candidate → Verify → Build Result
 *
 * Supports: build_dfa, regex_to_nfa (MVP scope)
 */

import { OpenRouterClient } from './openrouter-client';
import type {
  QuestionParseResult,
  QuestionSolveResult,
  Automaton,
  AmbiguityFlag,
  TaskClassification,
} from '@automind/schemas';
import { classifyQuestion, extractConstraints, detectAmbiguities } from './question-parser';
import { generateExplanation } from './explanation-builder';
import { DFA_CONSTRUCTION_HINT_PROMPT } from './question-prompts';
import {
  verifyCandidateAutomaton,
  buildTransitionTable,
  parseRegex,
  astToNFA,
  resetStateCounter,
} from '@automind/engine';

// ── Types ──────────────────────────────────────────────────────

export interface ParseStageResult {
  success: true;
  classification: TaskClassification;
  parseResult: QuestionParseResult;
  ambiguities: AmbiguityFlag[];
  overallAssessment: string;
  needsClarification: boolean;
}

export interface ParseStageError {
  success: false;
  error: string;
  stage: 'classify' | 'extract' | 'ambiguity';
}

export interface SolveStageResult {
  success: true;
  result: QuestionSolveResult;
}

export interface SolveStageError {
  success: false;
  error: string;
  stage: 'generate' | 'verify' | 'no_candidate';
}

// ── Parse Stage ────────────────────────────────────────────────

/**
 * Run the parse pipeline: classify → extract → detect ambiguities.
 * Returns structured parse result or asks for clarification.
 */
export async function parseQuestion(
  client: OpenRouterClient,
  questionText: string
): Promise<ParseStageResult | ParseStageError> {
  // Step 1: Classify
  const classification = await classifyQuestion(client, questionText);
  if (!classification.success) {
    return { success: false, error: classification.error, stage: 'classify' };
  }

  // Check for unsupported types
  if (classification.data.taskType === 'unsupported') {
    return {
      success: false,
      error: `This question type is not supported yet. Detected category: ${classification.data.reasoning}. Try a DFA, NFA, or regex question.`,
      stage: 'classify',
    };
  }

  // MVP: only support build_dfa and regex_to_nfa
  const supportedTypes = ['build_dfa', 'regex_to_nfa'];
  if (!supportedTypes.includes(classification.data.taskType)) {
    return {
      success: false,
      error: `"${classification.data.taskType}" is not supported in the current version. Supported types: DFA construction and regex-to-NFA conversion.`,
      stage: 'classify',
    };
  }

  // Step 2: Extract constraints
  const extraction = await extractConstraints(client, questionText, classification.data.taskType);
  if (!extraction.success) {
    return { success: false, error: extraction.error, stage: 'extract' };
  }

  // Step 3: Detect ambiguities
  const ambiguityResult = await detectAmbiguities(client, extraction.data);

  // Merge LLM-detected ambiguities with extraction's own flags
  const allAmbiguities = [
    ...extraction.data.ambiguityFlags,
    ...ambiguityResult.ambiguities,
  ];

  const needsClarification =
    ambiguityResult.overallAssessment === 'needs_clarification' ||
    extraction.data.confidence < 0.6 ||
    allAmbiguities.length > 0;

  return {
    success: true,
    classification: classification.data,
    parseResult: extraction.data,
    ambiguities: allAmbiguities,
    overallAssessment: ambiguityResult.overallAssessment,
    needsClarification,
  };
}

// ── Solve Stage ────────────────────────────────────────────────

/**
 * Generate a candidate solution and verify it.
 * The generation strategy depends on the task type.
 */
export async function solveQuestion(
  client: OpenRouterClient,
  questionText: string,
  parseResult: QuestionParseResult
): Promise<SolveStageResult | SolveStageError> {
  switch (parseResult.taskType) {
    case 'build_dfa':
      return solveBuildDFA(client, questionText, parseResult);
    case 'regex_to_nfa':
      return solveRegexToNFA(parseResult);
    default:
      return {
        success: false,
        error: `Task type "${parseResult.taskType}" is not supported for solving.`,
        stage: 'generate',
      };
  }
}

// ── build_dfa strategy ─────────────────────────────────────────

async function solveBuildDFA(
  client: OpenRouterClient,
  questionText: string,
  parseResult: QuestionParseResult
): Promise<SolveStageResult | SolveStageError> {
  // Ask LLM for a suggested DFA structure
  const candidate = await requestDFACandidate(client, parseResult);
  if (!candidate.success) {
    return { success: false, error: candidate.error, stage: 'generate' };
  }

  // Verify the candidate
  const verification = verifyCandidateAutomaton(candidate.automaton, parseResult);

  if (!verification.passed) {
    // Try once more with feedback
    const retry = await requestDFACandidate(client, parseResult, verification.counterexamples);
    if (!retry.success) {
      return buildUnverifiedResult(candidate.automaton, parseResult, verification);
    }

    const retryVerification = verifyCandidateAutomaton(retry.automaton, parseResult);
    if (!retryVerification.passed) {
      return buildUnverifiedResult(retry.automaton, parseResult, retryVerification);
    }

    // Retry passed
    return buildVerifiedResult(retry.automaton, parseResult, retryVerification);
  }

  return buildVerifiedResult(candidate.automaton, parseResult, verification);
}

async function requestDFACandidate(
  client: OpenRouterClient,
  parseResult: QuestionParseResult,
  counterexamples?: string[]
): Promise<{ success: true; automaton: Automaton } | { success: false; error: string }> {
  let prompt = DFA_CONSTRUCTION_HINT_PROMPT
    .replace('{{languageDescription}}', parseResult.languageDescription)
    .replace('{{alphabet}}', JSON.stringify(parseResult.alphabet))
    .replace('{{constraints}}', parseResult.atomicConstraints.map((c) => c.description).join('\n'))
    .replace('{{positiveExamples}}', JSON.stringify(parseResult.positiveExamples))
    .replace('{{negativeExamples}}', JSON.stringify(parseResult.negativeExamples));

  if (counterexamples && counterexamples.length > 0) {
    prompt += `\n\nPREVIOUS ATTEMPT FAILED. Counterexamples:\n${counterexamples.join('\n')}\nPlease fix these issues in your new attempt.`;
  }

  const messages = [
    { role: 'system' as const, content: prompt },
    { role: 'user' as const, content: 'Generate the DFA.' },
  ];

  const result = await client.chat(messages, { jsonMode: true, temperature: 0.2, maxTokens: 2000 });
  if (!result.success) {
    return { success: false, error: `DFA generation failed: ${result.error}` };
  }

  const parsed = OpenRouterClient.parseJSON<Record<string, unknown>>(result.content);
  if (!parsed.success) {
    return { success: false, error: `DFA JSON parse failed: ${parsed.error}` };
  }

  const data = parsed.data;

  // Build Automaton from LLM response
  try {
    const automaton: Automaton = {
      type: 'DFA',
      states: data.states as string[],
      alphabet: parseResult.alphabet,
      startState: data.startState as string,
      acceptStates: data.acceptStates as string[],
      transitions: (data.transitions as Array<{ from: string; to: string; symbol: string }>).map((t) => ({
        from: t.from,
        to: t.to,
        symbol: t.symbol,
      })),
    };

    return { success: true, automaton };
  } catch (err) {
    return { success: false, error: `Failed to construct automaton: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ── regex_to_nfa strategy ──────────────────────────────────────

function solveRegexToNFA(
  parseResult: QuestionParseResult
): SolveStageResult | SolveStageError {
  // Extract the regex from the language description or notes
  const regexPattern = extractRegexFromParseResult(parseResult);
  if (!regexPattern) {
    return {
      success: false,
      error: 'Could not extract a regex pattern from the question. Please provide the regex explicitly.',
      stage: 'generate',
    };
  }

  try {
    // Use existing engine: parse → Thompson → NFA
    resetStateCounter();
    const ast = parseRegex(regexPattern);
    const nfa = astToNFA(ast);

    // Verify the NFA
    const verification = verifyCandidateAutomaton(nfa, parseResult);

    const table = buildTransitionTable(nfa);
    const diagramData = automatonToDiagramData(nfa);

    return {
      success: true,
      result: {
        status: verification.passed ? 'verified' : 'partial',
        automaton: nfa,
        regex: regexPattern,
        transitionTable: table,
        diagramData,
        positiveTests: verification.positiveResults,
        negativeTests: verification.negativeResults,
        counterexamples: verification.counterexamples,
        candidatesEvaluated: 1,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `Regex conversion failed: ${err instanceof Error ? err.message : String(err)}`,
      stage: 'generate',
    };
  }
}

function extractRegexFromParseResult(parseResult: QuestionParseResult): string | null {
  // Look for regex in constraints
  for (const constraint of parseResult.atomicConstraints) {
    if (constraint.type === 'pattern' && constraint.target) {
      return constraint.target;
    }
  }

  // Try to extract from language description
  const regexMatch = parseResult.languageDescription.match(/(?:regex|regular expression|pattern)\s*[:=]?\s*[`"']?([^\s`"']+)[`"']?/i);
  if (regexMatch) return regexMatch[1];

  // Check notes
  if (parseResult.notes) {
    const notesMatch = parseResult.notes.match(/(?:regex|pattern)\s*[:=]?\s*[`"']?([^\s`"']+)[`"']?/i);
    if (notesMatch) return notesMatch[1];
  }

  // If the language description itself looks like a regex
  const desc = parseResult.languageDescription.trim();
  if (/^[a-zA-Z0-9()|*+?.\\]+$/.test(desc) && desc.length < 100) {
    return desc;
  }

  return null;
}

// ── Result builders ────────────────────────────────────────────

function buildVerifiedResult(
  automaton: Automaton,
  parseResult: QuestionParseResult,
  verification: { positiveResults: any[]; negativeResults: any[]; counterexamples: string[] }
): SolveStageResult {
  const table = buildTransitionTable(automaton);
  const diagramData = automatonToDiagramData(automaton);

  return {
    success: true,
    result: {
      status: 'verified',
      automaton,
      transitionTable: table,
      diagramData,
      positiveTests: verification.positiveResults,
      negativeTests: verification.negativeResults,
      counterexamples: [],
      candidatesEvaluated: 1,
    },
  };
}

function buildUnverifiedResult(
  automaton: Automaton,
  parseResult: QuestionParseResult,
  verification: { positiveResults: any[]; negativeResults: any[]; counterexamples: string[]; rejectionReason?: string }
): SolveStageResult {
  const table = buildTransitionTable(automaton);
  const diagramData = automatonToDiagramData(automaton);

  return {
    success: true,
    result: {
      status: 'partial',
      automaton,
      transitionTable: table,
      diagramData,
      positiveTests: verification.positiveResults,
      negativeTests: verification.negativeResults,
      counterexamples: verification.counterexamples,
      candidatesEvaluated: 2,
    },
  };
}

// ── Diagram data conversion ────────────────────────────────────

function automatonToDiagramData(automaton: Automaton) {
  const SPACING_X = 180;
  const SPACING_Y = 120;
  const COLS = 4;

  const nodes = automaton.states.map((state, i) => ({
    id: state,
    label: state,
    position: {
      x: 100 + (i % COLS) * SPACING_X,
      y: 100 + Math.floor(i / COLS) * SPACING_Y,
    },
    isStart: state === automaton.startState,
    isAccept: automaton.acceptStates.includes(state),
  }));

  // Merge transitions between same state pairs
  const edgeMap = new Map<string, string[]>();
  for (const t of automaton.transitions) {
    const key = `${t.from}->${t.to}`;
    if (!edgeMap.has(key)) edgeMap.set(key, []);
    edgeMap.get(key)!.push(t.symbol);
  }

  const edges = Array.from(edgeMap.entries()).map(([key, symbols]) => {
    const [source, target] = key.split('->');
    return {
      id: `edge-${key}`,
      source,
      target,
      label: symbols.join(', '),
    };
  });

  return { nodes, edges };
}

// ── Full pipeline convenience ──────────────────────────────────

export { generateExplanation } from './explanation-builder';
