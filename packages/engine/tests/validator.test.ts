import { describe, it, expect } from 'vitest';
import { validateAutomaton } from '../src/validator';
import type { Automaton } from '@automind/schemas';

describe('Automaton Validator', () => {
  it('should validate a correct DFA', () => {
    const dfa: Automaton = {
      type: 'DFA',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q1'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q0', to: 'q0', symbol: '1' },
        { from: 'q1', to: 'q0', symbol: '0' },
        { from: 'q1', to: 'q1', symbol: '1' },
      ]
    };
    
    const result = validateAutomaton(dfa);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should find missing transitions in a DFA', () => {
    const incompleteDFA: Automaton = {
      type: 'DFA',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q1'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q1', to: 'q1', symbol: '1' },
      ]
    };
    
    const result = validateAutomaton(incompleteDFA);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Missing transition'))).toBe(true);
  });

  it('should fail DFA validation if epsilon transitions exist', () => {
    const invalidDFA: Automaton = {
      type: 'DFA',
      states: ['q0'],
      alphabet: ['0'],
      startState: 'q0',
      acceptStates: ['q0'],
      transitions: [
        { from: 'q0', to: 'q0', symbol: '0' },
        { from: 'q0', to: 'q0', symbol: 'ε' },
      ]
    };
    
    const result = validateAutomaton(invalidDFA);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('cannot have epsilon'))).toBe(true);
  });

  it('should warn about unreachable states', () => {
    const nfa: Automaton = {
      type: 'NFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0'],
      startState: 'q0',
      acceptStates: ['q0'],
      transitions: [
        { from: 'q0', to: 'q0', symbol: '0' },
        { from: 'q2', to: 'q1', symbol: '0' },
      ]
    };
    
    const result = validateAutomaton(nfa);
    expect(result.valid).toBe(true); // NFA can have missing transitions
    expect(result.warnings.some(w => w.includes('unreachable'))).toBe(true);
  });
});
