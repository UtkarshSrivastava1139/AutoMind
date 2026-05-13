import { describe, it, expect } from 'vitest';
import { simulateDFA } from '../src/dfa-simulator';
import type { Automaton } from '@automind/schemas';

describe('DFA Simulator', () => {
  const dfaEvenZeros: Automaton = {
    type: 'DFA',
    states: ['q0', 'q1'],
    alphabet: ['0', '1'],
    startState: 'q0',
    acceptStates: ['q0'],
    transitions: [
      { from: 'q0', to: 'q1', symbol: '0' },
      { from: 'q0', to: 'q0', symbol: '1' },
      { from: 'q1', to: 'q0', symbol: '0' },
      { from: 'q1', to: 'q1', symbol: '1' },
    ]
  };

  it('should accept strings with even number of zeros', () => {
    expect(simulateDFA(dfaEvenZeros, '').accepted).toBe(true);
    expect(simulateDFA(dfaEvenZeros, '00').accepted).toBe(true);
    expect(simulateDFA(dfaEvenZeros, '10101').accepted).toBe(true);
    expect(simulateDFA(dfaEvenZeros, '111').accepted).toBe(true);
  });

  it('should reject strings with odd number of zeros', () => {
    expect(simulateDFA(dfaEvenZeros, '0').accepted).toBe(false);
    expect(simulateDFA(dfaEvenZeros, '10').accepted).toBe(false);
    expect(simulateDFA(dfaEvenZeros, '000').accepted).toBe(false);
  });

  it('should generate proper trace steps', () => {
    const result = simulateDFA(dfaEvenZeros, '01');
    expect(result.steps).toHaveLength(3);
    
    expect(result.steps[0]).toEqual({
      index: 0,
      symbol: null,
      activeStates: ['q0'],
      consumedInput: '',
      remainingInput: '01',
      note: 'Start'
    });

    expect(result.steps[1]).toEqual({
      index: 1,
      symbol: '0',
      activeStates: ['q1'],
      consumedInput: '0',
      remainingInput: '1',
      note: "Transitioned to q1 on '0'"
    });

    expect(result.steps[2]).toEqual({
      index: 2,
      symbol: '1',
      activeStates: ['q1'],
      consumedInput: '01',
      remainingInput: '',
      note: "Transitioned to q1 on '1'"
    });
  });

  it('should fail elegantly on invalid alphabet symbols', () => {
    const result = simulateDFA(dfaEvenZeros, '02');
    expect(result.accepted).toBe(false);
    expect(result.warnings.some(w => w.includes('not in the alphabet'))).toBe(true);
  });
});
