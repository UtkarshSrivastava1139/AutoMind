import { describe, it, expect } from 'vitest';
import { buildDeterministicOracle, buildDeterministicDFA } from '../src/oracle';
import { simulateDFA } from '../src/dfa-simulator';
import type { QuestionParseResult } from '@automind/schemas';

describe('Oracle Builder', () => {
  it('builds a deterministic oracle for parity constraint', () => {
    const parseResult: QuestionParseResult = {
      taskType: 'build_dfa',
      targetFormalism: 'DFA',
      alphabet: ['a', 'b'],
      languageDescription: 'even a',
      atomicConstraints: [
        { type: 'parity', target: 'a', value: 0, description: 'even a' }
      ],
      positiveExamples: [], negativeExamples: [], assumptions: [], ambiguityFlags: [], confidence: 1
    };

    const oracle = buildDeterministicOracle(parseResult);
    expect(oracle).toBeDefined();
    
    // even a's
    expect(oracle!('')).toBe(true);
    expect(oracle!('b')).toBe(true);
    expect(oracle!('a')).toBe(false);
    expect(oracle!('aa')).toBe(true);
    expect(oracle!('bab')).toBe(false);
    expect(oracle!('aba')).toBe(true);
  });

  it('builds a deterministic oracle for numeric divisibility', () => {
    const parseResult: QuestionParseResult = {
      taskType: 'build_dfa',
      targetFormalism: 'DFA',
      alphabet: ['0', '1'],
      languageDescription: 'divisible by 3',
      atomicConstraints: [
        { type: 'divisibility', target: '', value: 3, description: 'divisible by 3' }
      ],
      positiveExamples: [], negativeExamples: [], assumptions: [], ambiguityFlags: [], confidence: 1
    };

    const oracle = buildDeterministicOracle(parseResult);
    expect(oracle).toBeDefined();
    
    expect(oracle!('')).toBe(true); // 0
    expect(oracle!('0')).toBe(true); // 0
    expect(oracle!('11')).toBe(true); // 3
    expect(oracle!('110')).toBe(true); // 6
    expect(oracle!('1')).toBe(false); // 1
    expect(oracle!('10')).toBe(false); // 2
  });
});

describe('Deterministic DFA Builder', () => {
  it('builds a correct DFA for starts_with', () => {
    const parseResult: QuestionParseResult = {
      taskType: 'build_dfa',
      targetFormalism: 'DFA',
      alphabet: ['a', 'b'],
      languageDescription: 'starts with ab',
      atomicConstraints: [
        { type: 'starts_with', target: 'ab', value: 0, description: 'starts with ab' }
      ],
      positiveExamples: [], negativeExamples: [], assumptions: [], ambiguityFlags: [], confidence: 1
    };

    const dfa = buildDeterministicDFA(parseResult);
    expect(dfa).toBeDefined();
    
    expect(simulateDFA(dfa!, 'ab').accepted).toBe(true);
    expect(simulateDFA(dfa!, 'aba').accepted).toBe(true);
    expect(simulateDFA(dfa!, 'a').accepted).toBe(false);
    expect(simulateDFA(dfa!, 'ba').accepted).toBe(false);
    expect(simulateDFA(dfa!, '').accepted).toBe(false);
  });

  it('builds a correct DFA for ends_with', () => {
    const parseResult: QuestionParseResult = {
      taskType: 'build_dfa',
      targetFormalism: 'DFA',
      alphabet: ['0', '1'],
      languageDescription: 'ends with 01',
      atomicConstraints: [
        { type: 'ends_with', target: '01', value: 0, description: 'ends with 01' }
      ],
      positiveExamples: [], negativeExamples: [], assumptions: [], ambiguityFlags: [], confidence: 1
    };

    const dfa = buildDeterministicDFA(parseResult);
    expect(dfa).toBeDefined();
    
    expect(simulateDFA(dfa!, '01').accepted).toBe(true);
    expect(simulateDFA(dfa!, '101').accepted).toBe(true);
    expect(simulateDFA(dfa!, '001').accepted).toBe(true);
    expect(simulateDFA(dfa!, '10').accepted).toBe(false);
    expect(simulateDFA(dfa!, '1010').accepted).toBe(false);
    expect(simulateDFA(dfa!, '').accepted).toBe(false);
  });
});
