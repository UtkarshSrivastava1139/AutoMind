/**
 * Transition table builder
 *
 * Converts an Automaton into a structured table representation
 * with start (→) and accept (*) state markers.
 */

import type { Automaton } from '@automind/schemas';
import type { TransitionTable } from '@automind/schemas';

/**
 * Build a transition table from an automaton.
 *
 * @example
 * // DFA with states q0, q1, q2 and alphabet [0, 1]
 * // Returns:
 * // headers: ["State", "0", "1"]
 * // rows: [["→q0", "q1", "q0"], ["q1", "q1", "*q2"], ["*q2", "q1", "q0"]]
 */
export function buildTransitionTable(automaton: Automaton): TransitionTable {
  const symbols = [...automaton.alphabet];

  // For NFA, include ε if any epsilon transitions exist
  if (automaton.type === 'NFA') {
    const hasEpsilon = automaton.transitions.some((t) => t.symbol === 'ε');
    if (hasEpsilon && !symbols.includes('ε')) {
      symbols.push('ε');
    }
  }

  const headers = ['State', ...symbols];
  const rows: string[][] = [];

  for (const state of automaton.states) {
    // Build state label with markers
    let stateLabel = state;
    const isStart = state === automaton.startState;
    const isAccept = automaton.acceptStates.includes(state);

    if (isStart && isAccept) {
      stateLabel = `→*${state}`;
    } else if (isStart) {
      stateLabel = `→${state}`;
    } else if (isAccept) {
      stateLabel = `*${state}`;
    }

    const row: string[] = [stateLabel];

    for (const symbol of symbols) {
      const targets = automaton.transitions
        .filter((t) => t.from === state && t.symbol === symbol)
        .map((t) => t.to);

      if (targets.length === 0) {
        row.push('∅');
      } else if (automaton.type === 'DFA') {
        row.push(targets[0]);
      } else {
        // NFA: show set notation
        row.push(`{${targets.join(', ')}}`);
      }
    }

    rows.push(row);
  }

  return { headers, rows };
}
