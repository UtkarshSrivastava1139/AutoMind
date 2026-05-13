import { describe, it, expect } from 'vitest';
import { simulateNFA, getEpsilonClosure } from '../src/nfa-simulator';
import type { Automaton } from '@automind/schemas';

describe('NFA Simulator', () => {
  const nfaEpsilon: Automaton = {
    type: 'NFA',
    states: ['q0', 'q1', 'q2'],
    alphabet: ['0', '1'],
    startState: 'q0',
    acceptStates: ['q2'],
    transitions: [
      { from: 'q0', to: 'q1', symbol: 'ε' },
      { from: 'q1', to: 'q1', symbol: '0' },
      { from: 'q1', to: 'q2', symbol: '1' },
      { from: 'q2', to: 'q2', symbol: '0' },
      { from: 'q2', to: 'q2', symbol: '1' },
    ]
  };

  it('should compute epsilon closure correctly', () => {
    const closure = getEpsilonClosure(['q0'], nfaEpsilon.transitions);
    expect(closure).toEqual(['q0', 'q1']);
  });

  it('should accept strings ending in 1 or starting with 1 depending on NFA', () => {
    // This NFA accepts strings containing at least one '1'
    expect(simulateNFA(nfaEpsilon, '1').accepted).toBe(true);
    expect(simulateNFA(nfaEpsilon, '00100').accepted).toBe(true);
  });

  it('should reject strings without 1', () => {
    expect(simulateNFA(nfaEpsilon, '').accepted).toBe(false);
    expect(simulateNFA(nfaEpsilon, '000').accepted).toBe(false);
  });

  it('should track multiple active states', () => {
    const nfaMultiple: Automaton = {
      type: 'NFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      startState: 'q0',
      acceptStates: ['q2'],
      transitions: [
        { from: 'q0', to: 'q0', symbol: 'a' },
        { from: 'q0', to: 'q1', symbol: 'a' },
        { from: 'q1', to: 'q2', symbol: 'b' },
      ]
    };

    const result = simulateNFA(nfaMultiple, 'ab');
    expect(result.accepted).toBe(true);
    
    // Step 0: start at q0
    expect(result.steps[0].activeStates).toEqual(['q0']);
    
    // Step 1: after 'a', active states are q0 and q1
    expect(result.steps[1].activeStates.sort()).toEqual(['q0', 'q1']);
    
    // Step 2: after 'b', active states are q2 (from q1), q0 dies
    expect(result.steps[2].activeStates).toEqual(['q2']);
  });
});
