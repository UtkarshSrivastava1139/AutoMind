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
  RunMetrics,
} from '@automind/schemas';
import { AutomatonSchema } from '@automind/schemas';
import { classifyQuestion, extractConstraints, detectAmbiguities } from './question-parser';
import { generateExplanation } from './explanation-builder';
import { DFA_CONSTRUCTION_HINT_PROMPT } from './question-prompts';
import {
  verifyCandidateAutomaton,
  buildTransitionTable,
  parseRegex,
  astToNFA,
  resetStateCounter,
  generateEdgeCaseStrings,
  generateTestStrings,
  simulateNFA,
  buildDeterministicOracle,
  buildDeterministicDFA,
  lookupCanonicalCache,
  checkConstraintSAT,
  buildMemoryReachableDFA,
  minimizeDFA,
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
    extraction.data.confidence < 0.6;

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
  // Tier 1: Canonical Cache
  const cached = lookupCanonicalCache(questionText, parseResult.alphabet);
  if (cached) {
    const vStart = Date.now();
    const verification = verifyCandidateAutomaton(cached, parseResult);
    const vTime = Date.now() - vStart;
    const metrics: RunMetrics = {
      statesBeforeMinimization: cached.states.length,
      statesAfterMinimization: cached.states.length,
      compositionTimeMs: 0,
      verificationTimeMs: vTime,
      tierUsed: 'cache',
      fallbackTriggered: false
    };
    return buildVerifiedResult(cached, parseResult, verification, metrics);
  }

  // SAT Check
  const satCheck = checkConstraintSAT(parseResult.atomicConstraints);
  if (!satCheck.isSatisfiable) {
    return {
      success: false,
      error: `Logical Contradiction Detected: ${satCheck.contradictionReason}. This language is mathematically impossible to construct.`,
      stage: 'generate'
    };
  }

  // Tier 2: Deterministic Construction
  let deterministicDFA: Automaton | null = null;
  let fallbackTriggered = false;
  let fallbackReason: string | undefined = undefined;

  const compStart = Date.now();
  if (parseResult.atomicConstraints.length === 1) {
    deterministicDFA = buildDeterministicDFA(parseResult);
  } else if (parseResult.atomicConstraints.length > 1) {
    const hasUnsupported = parseResult.atomicConstraints.some(c => c.type === 'custom' || c.type === 'pattern');
    if (!hasUnsupported) {
      try {
        deterministicDFA = buildMemoryReachableDFA(
          parseResult.alphabet,
          parseResult.atomicConstraints,
          parseResult.constraintExpressionTree,
          64
        );
      } catch (e) {
        fallbackTriggered = true;
        fallbackReason = e instanceof Error ? e.message : String(e);
      }
    } else {
      fallbackTriggered = true;
      fallbackReason = 'Cannot deterministically construct product with custom or pattern constraints';
    }
  }

  if (deterministicDFA) {
    const statesBefore = deterministicDFA.states.length;
    deterministicDFA = minimizeDFA(deterministicDFA).minDfa;
    const statesAfter = deterministicDFA.states.length;
    const compTime = Date.now() - compStart;

    const vStart = Date.now();
    const verification = verifyCandidateAutomaton(deterministicDFA, parseResult);
    const vTime = Date.now() - vStart;

    const metrics: RunMetrics = {
      statesBeforeMinimization: statesBefore,
      statesAfterMinimization: statesAfter,
      compositionTimeMs: compTime,
      verificationTimeMs: vTime,
      tierUsed: 'deterministic',
      fallbackTriggered: false
    };

    return buildVerifiedResult(deterministicDFA, parseResult, verification, metrics);
  }

  // Tier 3: Programmatic Oracle Seeding
  const oracle = buildDeterministicOracle(parseResult);
  if (oracle) {
    parseResult.positiveExamples = [];
    parseResult.negativeExamples = [];
    
    const mappedConstraints = parseResult.atomicConstraints.map((c) => ({
      type: c.type,
      target: c.target ?? undefined,
      value: c.value ?? undefined,
    }));
    const edgeCases = [
      ...generateEdgeCaseStrings(parseResult.alphabet, mappedConstraints),
      ...generateTestStrings(parseResult.alphabet, 4)
    ];
    
    const uniqueEdges = Array.from(new Set(edgeCases));
    for (const edge of uniqueEdges) {
      if (oracle(edge)) parseResult.positiveExamples.push(edge);
      else parseResult.negativeExamples.push(edge);
    }
  } else {
    // Fallback: implicit regex oracle
    const implicitRegex = extractRegexFromParseResult(parseResult);
    if (implicitRegex) {
      try {
        resetStateCounter();
        const nfaOracle = astToNFA(parseRegex(implicitRegex));
        const mappedConstraints = parseResult.atomicConstraints.map((c) => ({
          type: c.type,
          target: c.target ?? undefined,
          value: c.value ?? undefined,
        }));
        const edgeCases = generateEdgeCaseStrings(parseResult.alphabet, mappedConstraints);
        for (const edge of edgeCases) {
          if (!parseResult.positiveExamples.includes(edge) && !parseResult.negativeExamples.includes(edge)) {
            const sim = simulateNFA(nfaOracle, edge);
            if (sim.accepted) parseResult.positiveExamples.push(edge);
            else parseResult.negativeExamples.push(edge);
          }
        }
      } catch (e) {
      }
    }
  }

  // Tier 4: Iterative LLM Refinement
  const MAX_ATTEMPTS = 3;
  let bestCandidate = null;
  let bestVerification = null;
  let bestMetrics: RunMetrics | undefined = undefined;
  let counterexamples: string[] = [];
  
  const llmStart = Date.now();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = await requestDFACandidate(client, parseResult, counterexamples);
    if (!candidate.success) {
      if (attempt === 0) return { success: false, error: candidate.error, stage: 'generate' };
      break;
    }

    const vStart = Date.now();
    const verification = verifyCandidateAutomaton(candidate.automaton, parseResult, oracle || undefined);
    const vTime = Date.now() - vStart;
    
    const metrics: RunMetrics = {
      statesBeforeMinimization: candidate.automaton.states.length,
      statesAfterMinimization: candidate.automaton.states.length,
      compositionTimeMs: Date.now() - llmStart,
      verificationTimeMs: vTime,
      tierUsed: 'llm',
      fallbackTriggered,
      fallbackReason
    };
    
    if (verification.passed) {
      return buildVerifiedResult(candidate.automaton, parseResult, verification, metrics);
    }

    bestCandidate = candidate.automaton;
    bestVerification = verification;
    bestMetrics = metrics;

    counterexamples = verification.counterexamples.slice(0, 5);
  }

  return buildUnverifiedResult(bestCandidate!, parseResult, bestVerification!, bestMetrics);
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

  // Validate the structure with Zod
  const validationResult = AutomatonSchema.safeParse({
    type: 'DFA',
    states: (data as any).states,
    alphabet: parseResult.alphabet,
    startState: (data as any).startState,
    acceptStates: (data as any).acceptStates,
    transitions: (data as any).transitions,
  });

  if (!validationResult.success) {
    return { success: false, error: `Invalid automaton structure from AI: ${validationResult.error.message}` };
  }

  return { success: true, automaton: validationResult.data };
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
  verification: { positiveResults: any[]; negativeResults: any[]; counterexamples: string[] },
  metrics?: RunMetrics
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
      metrics,
    },
  };
}

function buildUnverifiedResult(
  automaton: Automaton,
  parseResult: QuestionParseResult,
  verification: { positiveResults: any[]; negativeResults: any[]; counterexamples: string[]; rejectionReason?: string },
  metrics?: RunMetrics
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
      metrics,
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
