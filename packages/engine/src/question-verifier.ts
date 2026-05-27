/**
 * Candidate automaton verifier
 *
 * Tests a candidate automaton against positive/negative examples
 * and performs structural checks. Pure deterministic — no AI.
 */

import type { Automaton } from '@automind/schemas';
import type { VerificationResult, TestCaseResult, QuestionParseResult } from '@automind/schemas';
import { simulateDFA } from './dfa-simulator';
import { simulateNFA } from './nfa-simulator';
import { validateAutomaton } from './validator';
import { generateTestStrings } from './test-generator';
import type { OracleFunction } from './oracle';

/**
 * Verify a candidate automaton against extracted parse results.
 * Tests all positive examples (must accept), negative examples (must reject),
 * and additional bounded strings for coverage.
 */
export function verifyCandidateAutomaton(
  candidate: Automaton,
  parseResult: Pick<QuestionParseResult, 'positiveExamples' | 'negativeExamples' | 'alphabet'>,
  oracle?: OracleFunction
): VerificationResult {
  const structuralIssues: string[] = [];

  // ── Structural checks ───────────────────────────────────────
  const validation = validateAutomaton(candidate);
  if (!validation.valid) {
    return {
      passed: false,
      positiveResults: [],
      negativeResults: [],
      counterexamples: [],
      rejectionReason: `Structural validation failed: ${validation.errors.join('; ')}`,
      structuralIssues: validation.errors,
    };
  }

  if (validation.warnings.length > 0) {
    structuralIssues.push(...validation.warnings);
  }

  // Check reachability of accept states
  const reachableStates = getReachableStates(candidate);
  for (const acceptState of candidate.acceptStates) {
    if (!reachableStates.has(acceptState)) {
      structuralIssues.push(`Accept state '${acceptState}' is unreachable from start state.`);
    }
  }

  // ── Test positive examples ──────────────────────────────────
  const positiveResults: TestCaseResult[] = [];
  const counterexamples: string[] = [];

  for (const input of parseResult.positiveExamples) {
    const result = runSimulation(candidate, input);
    const passed = result.accepted === true;
    positiveResults.push({ input, expected: true, actual: result.accepted, passed });

    if (!passed) {
      counterexamples.push(`"${input}" should be ACCEPTED but was REJECTED`);
    }
  }

  // ── Test negative examples ──────────────────────────────────
  const negativeResults: TestCaseResult[] = [];

  for (const input of parseResult.negativeExamples) {
    const result = runSimulation(candidate, input);
    const passed = result.accepted === false;
    negativeResults.push({ input, expected: false, actual: result.accepted, passed });

    if (!passed) {
      counterexamples.push(`"${input}" should be REJECTED but was ACCEPTED`);
    }
  }

  // ── Bounded exhaustive check (short strings) ────────────────
  // Generate strings up to length 6 (or less for large alphabets) for additional coverage
  let maxLen = 6;
  if (parseResult.alphabet.length >= 4) maxLen = 4;
  else if (parseResult.alphabet.length === 3) maxLen = 5;

  const boundedStrings = generateTestStrings(parseResult.alphabet, maxLen);
  const existingInputs = new Set([
    ...parseResult.positiveExamples,
    ...parseResult.negativeExamples,
  ]);

  for (const input of boundedStrings) {
    if (existingInputs.has(input)) continue;

    try {
      const candidateResult = runSimulation(candidate, input);
      
      // If we have an oracle, we can do an exhaustive equivalence check
      if (oracle) {
        const expected = oracle(input);
        if (candidateResult.accepted !== expected) {
          counterexamples.push(
            `"${input}" should be ${expected ? 'ACCEPTED' : 'REJECTED'} but was ${candidateResult.accepted ? 'ACCEPTED' : 'REJECTED'}`
          );
        }
      }
    } catch {
      structuralIssues.push(`Simulation crashed on input "${input}"`);
    }
  }

  // ── Final verdict ───────────────────────────────────────────
  const allPositivePassed = positiveResults.every((r) => r.passed);
  const allNegativePassed = negativeResults.every((r) => r.passed);
  const noCounterexamples = counterexamples.length === 0 || counterexamples.every(c => c.includes("should be"));
  
  // Actually, we already captured positive/negative failures in counterexamples
  // So passed is strictly true if there are no counterexamples and no structural issues
  const passed = allPositivePassed && allNegativePassed && counterexamples.length === 0 && structuralIssues.length === 0;

  let rejectionReason: string | undefined;
  if (!passed) {
    const reasons: string[] = [];
    if (!allPositivePassed) {
      const failCount = positiveResults.filter((r) => !r.passed).length;
      reasons.push(`${failCount} positive example(s) failed`);
    }
    if (!allNegativePassed) {
      const failCount = negativeResults.filter((r) => !r.passed).length;
      reasons.push(`${failCount} negative example(s) failed`);
    }
    if (structuralIssues.length > 0) {
      reasons.push(`${structuralIssues.length} structural issue(s)`);
    }
    rejectionReason = reasons.join('; ');
  }

  return {
    passed,
    positiveResults,
    negativeResults,
    counterexamples,
    rejectionReason,
    structuralIssues,
  };
}

// ── Helpers ───────────────────────────────────────────────────

function runSimulation(automaton: Automaton, input: string) {
  if (automaton.type === 'DFA') {
    return simulateDFA(automaton, input);
  } else {
    return simulateNFA(automaton, input);
  }
}

function getReachableStates(automaton: Automaton): Set<string> {
  const reachable = new Set<string>();
  const queue = [automaton.startState];
  reachable.add(automaton.startState);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const t of automaton.transitions) {
      if (t.from === current && !reachable.has(t.to)) {
        reachable.add(t.to);
        queue.push(t.to);
      }
    }
  }

  return reachable;
}
