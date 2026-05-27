import type { QuestionParseResult, Automaton, AtomicConstraint } from '@automind/schemas';
import { parseRegex } from './regex-parser';
import { astToNFA, resetStateCounter } from './thompson';
import { simulateNFA } from './nfa-simulator';

export type OracleFunction = (input: string) => boolean;

function isBinaryAlphabet(alphabet: string[]): boolean {
  return alphabet.length === 2 && alphabet.includes('0') && alphabet.includes('1');
}

function countOccurrences(input: string, target?: string | null): number {
  if (!target || target === '') return input.length;
  if (target.length === 1) {
    let count = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === target) count++;
    }
    return count;
  }
  throw new Error(`Unsupported deterministic count semantics: target length > 1 ("${target}")`);
}

function isSingleSymbolOrEmpty(target?: string | null): boolean {
  return !target || target.length <= 1;
}

/**
 * Builds a deterministic programmatic oracle for the parsed constraints.
 * This function evaluates a string against all constraints.
 */
export function buildDeterministicOracle(parseResult: QuestionParseResult): OracleFunction | null {
  const { alphabet, atomicConstraints } = parseResult;

  // We build a list of evaluator functions. All must pass (conjunctive).
  const evaluators: Array<(input: string) => boolean> = [];

  for (const c of atomicConstraints) {
    const target = c.target || '';
    const value = c.value ?? 0;

    switch (c.type) {
      case 'starts_with':
        evaluators.push(input => input.startsWith(target));
        break;
      case 'ends_with':
        evaluators.push(input => input.endsWith(target));
        break;
      case 'contains':
        evaluators.push(input => input.includes(target));
        break;
      case 'not_contains':
        evaluators.push(input => !input.includes(target));
        break;
      case 'length_exact':
        evaluators.push(input => input.length === value);
        break;
      case 'length_min':
        evaluators.push(input => input.length >= value);
        break;
      case 'length_max':
        evaluators.push(input => input.length <= value);
        break;
      case 'count_exact':
        if (!isSingleSymbolOrEmpty(c.target)) return null;
        evaluators.push(input => countOccurrences(input, c.target) === value);
        break;
      case 'count_min':
        if (!isSingleSymbolOrEmpty(c.target)) return null;
        evaluators.push(input => countOccurrences(input, c.target) >= value);
        break;
      case 'count_max':
        if (!isSingleSymbolOrEmpty(c.target)) return null;
        evaluators.push(input => countOccurrences(input, c.target) <= value);
        break;
      case 'parity':
        if (!isSingleSymbolOrEmpty(c.target)) return null;
        evaluators.push(input => countOccurrences(input, c.target) % 2 === (value || 0));
        break;
      case 'divisibility':
        if ((!c.target || c.target === '') && isBinaryAlphabet(alphabet)) {
          // Binary number divisibility
          evaluators.push(input => {
            if (input === '') return true; // empty string conceptually 0, divisible by anything
            let num = 0;
            for (let i = 0; i < input.length; i++) {
              num = (num * 2 + (input[i] === '1' ? 1 : 0)) % value;
            }
            return num === 0;
          });
        } else {
          // Otherwise, divisibility of count/length
          if (!isSingleSymbolOrEmpty(c.target)) return null;
          evaluators.push(input => countOccurrences(input, c.target) % value === 0);
        }
        break;
      case 'pattern':
        if (target) {
          try {
            resetStateCounter();
            const ast = parseRegex(target);
            const nfa = astToNFA(ast);
            evaluators.push(input => simulateNFA(nfa, input).accepted);
          } catch {
            return null;
          }
        }
        break;
      case 'custom':
        return null;
      default:
        return null;
    }
  }

  return (input: string) => {
    // Check if the input consists only of alphabet symbols
    for (const char of input) {
      if (!alphabet.includes(char)) return false;
    }
    return evaluators.every(evaluate => evaluate(input));
  };
}

/**
 * Directly construct a perfect DFA if the task is simple enough.
 */
export function buildDeterministicDFA(parseResult: QuestionParseResult): Automaton | null {
  const { alphabet, atomicConstraints } = parseResult;

  // We only construct if there is exactly 1 constraint for now.
  if (atomicConstraints.length !== 1) return null;

  const c = atomicConstraints[0];
  const target = c.target || '';
  const value = c.value ?? 0;

  switch (c.type) {
    case 'parity':
      if (!isSingleSymbolOrEmpty(c.target)) return null;
      return buildParityDFA(alphabet, target, value);
    case 'starts_with':
      return target.length > 0 ? buildStartsWithDFA(alphabet, target) : null;
    case 'ends_with':
      return target.length > 0 ? buildEndsWithDFA(alphabet, target) : null;
    case 'contains':
      return target.length > 0 ? buildContainsDFA(alphabet, target) : null;
    case 'divisibility':
      if ((!c.target || c.target === '') && isBinaryAlphabet(alphabet)) {
        return buildDivisibilityDFA(alphabet, value, target);
      } else if (isSingleSymbolOrEmpty(c.target)) {
        return buildDivisibilityDFA(alphabet, value, target);
      }
      return null;
    default:
      return null;
  }
}

// ── DFA Construction Algorithms ───────────────────────────────

function buildParityDFA(alphabet: string[], target: string, value: number): Automaton {
  const states = ['q0', 'q1'];
  const startState = 'q0';
  const acceptStates = [value === 1 ? 'q1' : 'q0']; // 1 is odd, 0 is even
  const transitions: Automaton['transitions'] = [];

  for (const s of states) {
    for (const sym of alphabet) {
      if (!target || sym === target) {
        // Flip state
        transitions.push({ from: s, to: s === 'q0' ? 'q1' : 'q0', symbol: sym });
      } else {
        // Self loop
        transitions.push({ from: s, to: s, symbol: sym });
      }
    }
  }

  return { type: 'DFA', states, alphabet, startState, acceptStates, transitions };
}

function buildStartsWithDFA(alphabet: string[], target: string): Automaton {
  const N = target.length;
  const states = Array.from({ length: N + 1 }, (_, i) => `q${i}`);
  const deadState = 'q_dead';
  states.push(deadState);

  const transitions: Automaton['transitions'] = [];

  for (let i = 0; i < N; i++) {
    for (const sym of alphabet) {
      if (sym === target[i]) {
        transitions.push({ from: `q${i}`, to: `q${i + 1}`, symbol: sym });
      } else {
        transitions.push({ from: `q${i}`, to: deadState, symbol: sym });
      }
    }
  }

  // qN self loops
  for (const sym of alphabet) {
    transitions.push({ from: `q${N}`, to: `q${N}`, symbol: sym });
  }

  // deadState self loops
  for (const sym of alphabet) {
    transitions.push({ from: deadState, to: deadState, symbol: sym });
  }

  return { type: 'DFA', states, alphabet, startState: 'q0', acceptStates: [`q${N}`], transitions };
}

function getLongestPrefixSuffixLength(target: string, currentMatch: string): number {
  for (let len = Math.min(target.length, currentMatch.length); len > 0; len--) {
    if (currentMatch.endsWith(target.slice(0, len))) {
      return len;
    }
  }
  return 0;
}

function buildEndsWithDFA(alphabet: string[], target: string): Automaton {
  const N = target.length;
  const states = Array.from({ length: N + 1 }, (_, i) => `q${i}`);
  const transitions: Automaton['transitions'] = [];

  for (let i = 0; i <= N; i++) {
    const currentPrefix = target.slice(0, i);
    for (const sym of alphabet) {
      const nextMatch = currentPrefix + sym;
      const j = getLongestPrefixSuffixLength(target, nextMatch);
      transitions.push({ from: `q${i}`, to: `q${j}`, symbol: sym });
    }
  }

  return { type: 'DFA', states, alphabet, startState: 'q0', acceptStates: [`q${N}`], transitions };
}

function buildContainsDFA(alphabet: string[], target: string): Automaton {
  const N = target.length;
  const states = Array.from({ length: N + 1 }, (_, i) => `q${i}`);
  const transitions: Automaton['transitions'] = [];

  for (let i = 0; i < N; i++) {
    const currentPrefix = target.slice(0, i);
    for (const sym of alphabet) {
      const nextMatch = currentPrefix + sym;
      const j = getLongestPrefixSuffixLength(target, nextMatch);
      transitions.push({ from: `q${i}`, to: `q${j}`, symbol: sym });
    }
  }

  // qN self loops
  for (const sym of alphabet) {
    transitions.push({ from: `q${N}`, to: `q${N}`, symbol: sym });
  }

  return { type: 'DFA', states, alphabet, startState: 'q0', acceptStates: [`q${N}`], transitions };
}

function buildDivisibilityDFA(alphabet: string[], value: number, target: string): Automaton | null {
  if (value <= 0) return null;

  const isNumeric = (!target || target === '') && isBinaryAlphabet(alphabet);
  const states = Array.from({ length: value }, (_, i) => `q${i}`);
  const transitions: Automaton['transitions'] = [];

  for (let r = 0; r < value; r++) {
    for (const sym of alphabet) {
      if (isNumeric) {
        const bit = sym === '1' ? 1 : 0;
        const nextR = (r * 2 + bit) % value;
        transitions.push({ from: `q${r}`, to: `q${nextR}`, symbol: sym });
      } else {
        if (!target || sym === target) {
          transitions.push({ from: `q${r}`, to: `q${(r + 1) % value}`, symbol: sym });
        } else {
          transitions.push({ from: `q${r}`, to: `q${r}`, symbol: sym });
        }
      }
    }
  }

  return { type: 'DFA', states, alphabet, startState: 'q0', acceptStates: ['q0'], transitions };
}
