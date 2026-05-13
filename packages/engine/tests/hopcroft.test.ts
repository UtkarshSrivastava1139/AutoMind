import { describe, it, expect } from 'vitest';
import { minimizeDFA } from '../src/hopcroft';
import type { Automaton } from '@automind/schemas';
import { simulateDFA } from '../src/dfa-simulator';

describe('Hopcroft Minimization', () => {
  it('should minimize redundant states', () => {
    // DFA that accepts even number of 0s, with redundant states
    const unoptimizedDFA: Automaton = {
      type: 'DFA',
      states: ['q0', 'q1', 'q2', 'q3'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q0', 'q2'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q0', to: 'q2', symbol: '1' },
        { from: 'q1', to: 'q0', symbol: '0' },
        { from: 'q1', to: 'q3', symbol: '1' },
        { from: 'q2', to: 'q3', symbol: '0' },
        { from: 'q2', to: 'q2', symbol: '1' },
        { from: 'q3', to: 'q2', symbol: '0' },
        { from: 'q3', to: 'q3', symbol: '1' },
      ]
    };

    const { minDfa, steps } = minimizeDFA(unoptimizedDFA);
    
    // Originally 4 states, optimized should be 2 states (one for even, one for odd 0s)
    expect(minDfa.states.length).toBe(2);
    expect(steps.length).toBeGreaterThan(0);

    // Should still work the same
    expect(simulateDFA(minDfa, '').accepted).toBe(true);
    expect(simulateDFA(minDfa, '00').accepted).toBe(true);
    expect(simulateDFA(minDfa, '10101').accepted).toBe(true);
    expect(simulateDFA(minDfa, '0').accepted).toBe(false);
    expect(simulateDFA(minDfa, '1000').accepted).toBe(false);
  });
});
