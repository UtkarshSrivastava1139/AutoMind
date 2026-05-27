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
import { validateAutomaton, isCompleteDFA } from './validator';
import { generateTestStrings } from './test-generator';
import type { OracleFunction } from './oracle';

/**
 * Returns a completed DFA by adding a sink state if any transitions are missing.
 * Does not mutate the original DFA.
 */
export function completeDFA(dfa: Automaton): Automaton {
  if (dfa.type !== 'DFA') {
    throw new Error('Only DFAs can be completed.');
  }

  // Clone to avoid mutating diagnostic artifacts
  const completed: Automaton = {
    ...dfa,
    states: [...dfa.states],
    transitions: dfa.transitions.map(t => ({ ...t })),
    acceptStates: [...dfa.acceptStates]
  };

  const sinkState = '__sink__';
  let sinkAdded = false;

  for (const state of completed.states) {
    for (const symbol of completed.alphabet) {
      const hasTransition = completed.transitions.some(
        t => t.from === state && t.symbol === symbol
      );

      if (!hasTransition) {
        if (!sinkAdded) {
          completed.states.push(sinkState);
          // Add self-loops for the sink state
          for (const s of completed.alphabet) {
            completed.transitions.push({ from: sinkState, to: sinkState, symbol: s });
          }
          sinkAdded = true;
        }
        completed.transitions.push({ from: state, to: sinkState, symbol });
      }
    }
  }

  return completed;
}

/**
 * Verify a candidate automaton against extracted parse results.
 * Tests all positive examples, negative examples, and additional bounded strings.
 */
export function verifyCandidateAutomaton(
  candidate: Automaton,
  parseResult: Pick<QuestionParseResult, 'positiveExamples' | 'negativeExamples' | 'alphabet' | 'atomicConstraints'>,
  oracle?: OracleFunction
): VerificationResult {
  const structuralIssues: string[] = [];

  // ── Structural checks on ORIGINAL machine ─────────────────────
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

  // Note: State invariants are not yet implemented. Random walk stub removed.

  // ── Prepare Completed Machine for Checking ────────────────────
  const testCandidate = candidate.type === 'DFA' ? completeDFA(candidate) : candidate;

  // ── Test positive examples ──────────────────────────────────
  const positiveResults: TestCaseResult[] = [];
  const counterexamples: string[] = [];

  for (const input of parseResult.positiveExamples) {
    try {
      const result = runSimulation(testCandidate, input);
      const passed = result.accepted === true;
      positiveResults.push({ input, expected: true, actual: result.accepted, passed });

      if (!passed) {
        counterexamples.push(`"${input}" should be ACCEPTED but was REJECTED`);
      }
    } catch (err) {
      positiveResults.push({ input, expected: true, actual: false, passed: false });
      counterexamples.push(`"${input}" caused simulation crash: ${err}`);
      structuralIssues.push(`Simulation crashed on input "${input}"`);
    }
  }

  // ── Test negative examples ──────────────────────────────────
  const negativeResults: TestCaseResult[] = [];

  for (const input of parseResult.negativeExamples) {
    try {
      const result = runSimulation(testCandidate, input);
      const passed = result.accepted === false;
      negativeResults.push({ input, expected: false, actual: result.accepted, passed });

      if (!passed) {
        counterexamples.push(`"${input}" should be REJECTED but was ACCEPTED`);
      }
    } catch (err) {
      negativeResults.push({ input, expected: false, actual: true, passed: false });
      counterexamples.push(`"${input}" caused simulation crash: ${err}`);
      structuralIssues.push(`Simulation crashed on input "${input}"`);
    }
  }

  // ── Bounded exhaustive check (short strings) ────────────────
  if (oracle) {
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
        const candidateResult = runSimulation(testCandidate, input);
        const expected = oracle(input);
        
        if (candidateResult.accepted !== expected) {
          if (counterexamples.length < 10) {
            counterexamples.push(
              `"${input}" should be ${expected ? 'ACCEPTED' : 'REJECTED'} but was ${candidateResult.accepted ? 'ACCEPTED' : 'REJECTED'}`
            );
          } else if (counterexamples.length === 10) {
            counterexamples.push(`...and more bounded string failures.`);
          }
        }
      } catch (err) {
        structuralIssues.push(`Simulation crashed on input "${input}"`);
      }
    }
  }

  // ── Final verdict ───────────────────────────────────────────
  const passed = counterexamples.length === 0 && structuralIssues.length === 0;

  let rejectionReason: string | undefined;
  if (!passed) {
    const reasons: string[] = [];
    const posFails = positiveResults.filter((r) => !r.passed).length;
    const negFails = negativeResults.filter((r) => !r.passed).length;
    
    if (posFails > 0) reasons.push(`${posFails} positive example(s) failed`);
    if (negFails > 0) reasons.push(`${negFails} negative example(s) failed`);
    if (counterexamples.length > posFails + negFails) {
      reasons.push(`${counterexamples.length - posFails - negFails} bounded check(s) failed`);
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

/**
 * Mathematically proves whether two completed DFAs accept exactly the same language.
 * Uses a BFS over the cross-product of the machines.
 */
export function proveDFAEquivalence(m1: Automaton, m2: Automaton): { equivalent: boolean; counterexample?: string } {
  if (m1.type !== 'DFA' || m2.type !== 'DFA') {
    return { equivalent: false, counterexample: 'Equivalence proof only supports DFAs' };
  }

  const sortedAlpha1 = [...m1.alphabet].sort().join(',');
  const sortedAlpha2 = [...m2.alphabet].sort().join(',');
  if (sortedAlpha1 !== sortedAlpha2) {
    return { equivalent: false, counterexample: 'Alphabets do not match' };
  }

  // Ensure both machines are complete before traversing
  const c1 = isCompleteDFA(m1) ? m1 : completeDFA(m1);
  const c2 = isCompleteDFA(m2) ? m2 : completeDFA(m2);

  const queue: [string, string, string][] = [[c1.startState, c2.startState, ""]];
  const visited = new Set<string>();
  visited.add(`${c1.startState},${c2.startState}`);

  const findTarget = (transitions: Automaton['transitions'], from: string, symbol: string) => {
    return transitions.find(t => t.from === from && t.symbol === symbol)!.to;
  };

  while (queue.length > 0) {
    const [q1, q2, path] = queue.shift()!;

    const accept1 = c1.acceptStates.includes(q1);
    const accept2 = c2.acceptStates.includes(q2);

    if (accept1 !== accept2) {
      return { equivalent: false, counterexample: path };
    }

    for (const sym of c1.alphabet) {
      const t1 = findTarget(c1.transitions, q1, sym);
      const t2 = findTarget(c2.transitions, q2, sym);

      const pairKey = `${t1},${t2}`;
      if (!visited.has(pairKey)) {
        visited.add(pairKey);
        queue.push([t1, t2, path + sym]);
      }
    }
  }

  return { equivalent: true };
}
