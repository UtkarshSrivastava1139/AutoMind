import { describe, it, expect } from 'vitest';
import { buildMemoryReachableDFA, createPrimitiveMachine } from '../src/product-engine';
import { buildDeterministicOracle } from '../src/oracle';
import { completeDFA, proveDFAEquivalence } from '../src/question-verifier';
import { buildTransitionTable } from '../src/transition-table';
import { simulateDFA } from '../src/dfa-simulator';
import type { QuestionParseResult, Automaton } from '@automind/schemas';

describe('Semantic Alignment & DFA Correctness', () => {

  // helper to quickly build a 1-constraint DFA
  function buildTestDFA(alphabet: string[], cType: any, target: string | undefined, value: number) {
    return buildMemoryReachableDFA(alphabet, [{ type: cType, target, value, description: 'test' }]);
  }

  describe('DFA Correctness', () => {
    it('handles parity of a (even)', () => {
      const dfa = buildTestDFA(['a', 'b'], 'parity', 'a', 0);
      expect(simulateDFA(dfa, '').accepted).toBe(true);
      expect(simulateDFA(dfa, 'b').accepted).toBe(true);
      expect(simulateDFA(dfa, 'a').accepted).toBe(false);
      expect(simulateDFA(dfa, 'aa').accepted).toBe(true);
      expect(simulateDFA(dfa, 'bab').accepted).toBe(false);
    });

    it('handles count_exact of symbol a', () => {
      const dfa = buildTestDFA(['a', 'b'], 'count_exact', 'a', 2);
      expect(simulateDFA(dfa, 'aa').accepted).toBe(true);
      expect(simulateDFA(dfa, 'baa').accepted).toBe(true);
      expect(simulateDFA(dfa, 'aaba').accepted).toBe(false);
      expect(simulateDFA(dfa, 'a').accepted).toBe(false);
    });

    it('handles ends_with("01")', () => {
      const dfa = buildTestDFA(['0', '1'], 'ends_with', '01', 0);
      expect(simulateDFA(dfa, '01').accepted).toBe(true);
      expect(simulateDFA(dfa, '101').accepted).toBe(true);
      expect(simulateDFA(dfa, '001').accepted).toBe(true);
      expect(simulateDFA(dfa, '1010').accepted).toBe(false);
    });

    it('handles contains("ab")', () => {
      const dfa = buildTestDFA(['a', 'b'], 'contains', 'ab', 0);
      expect(simulateDFA(dfa, 'ab').accepted).toBe(true);
      expect(simulateDFA(dfa, 'bab').accepted).toBe(true);
      expect(simulateDFA(dfa, 'aba').accepted).toBe(true);
      expect(simulateDFA(dfa, 'ba').accepted).toBe(false);
    });

    it('handles not_contains("aa")', () => {
      const dfa = buildTestDFA(['a', 'b'], 'not_contains', 'aa', 0);
      expect(simulateDFA(dfa, 'ab').accepted).toBe(true);
      expect(simulateDFA(dfa, 'baba').accepted).toBe(true);
      expect(simulateDFA(dfa, 'baa').accepted).toBe(false); // contains aa
    });

    it('handles starts_with("ab")', () => {
      const dfa = buildTestDFA(['a', 'b'], 'starts_with', 'ab', 0);
      expect(simulateDFA(dfa, 'ab').accepted).toBe(true);
      expect(simulateDFA(dfa, 'aba').accepted).toBe(true);
      expect(simulateDFA(dfa, 'a').accepted).toBe(false);
      expect(simulateDFA(dfa, 'b').accepted).toBe(false);
    });

    it('handles length_exact(2)', () => {
      const dfa = buildTestDFA(['a', 'b'], 'length_exact', '', 2);
      expect(simulateDFA(dfa, 'aa').accepted).toBe(true);
      expect(simulateDFA(dfa, 'ab').accepted).toBe(true);
      expect(simulateDFA(dfa, 'a').accepted).toBe(false);
      expect(simulateDFA(dfa, 'aaa').accepted).toBe(false);
    });
    
    it('handles boolean conjunction (starts_with a AND ends_with b)', () => {
      const constraints: any = [
        { type: 'starts_with', target: 'a', value: 0, description: 'c1' },
        { type: 'ends_with', target: 'b', value: 0, description: 'c2' }
      ];
      const formula = { operator: 'AND', left: 'c1', right: 'c2' };
      const dfa = buildMemoryReachableDFA(['a', 'b'], constraints, formula as any);
      
      expect(simulateDFA(dfa, 'ab').accepted).toBe(true);
      expect(simulateDFA(dfa, 'aab').accepted).toBe(true);
      expect(simulateDFA(dfa, 'a').accepted).toBe(false);
      expect(simulateDFA(dfa, 'b').accepted).toBe(false);
      expect(simulateDFA(dfa, 'ba').accepted).toBe(false);
    });
  });

  describe('Strict Semantic Rejections', () => {
    it('rejects multi-char count_exact in engine', () => {
      expect(() => {
        buildTestDFA(['a', 'b'], 'count_exact', 'ab', 2);
      }).toThrow(/target length > 1 is not supported/);
    });

    it('rejects multi-char parity in engine', () => {
      expect(() => {
        buildTestDFA(['a', 'b'], 'parity', 'ab', 0);
      }).toThrow(/target length > 1 is not supported/);
    });
    
    it('rejects multi-char count_exact in oracle', () => {
      const parseResult: QuestionParseResult = {
        taskType: 'build_dfa',
        targetFormalism: 'DFA',
        alphabet: ['a', 'b'],
        languageDescription: 'count ab',
        atomicConstraints: [
          { type: 'count_exact', target: 'ab', value: 2, description: 'count ab' }
        ],
        positiveExamples: [], negativeExamples: [], assumptions: [], ambiguityFlags: [], confidence: 1
      };
      
      const oracle = buildDeterministicOracle(parseResult);
      expect(oracle).toBeNull(); // explicit fallback requirement
    });
  });

  describe('Verifier and Tables', () => {
    it('completeDFA adds a sink state if missing transitions', () => {
      const incompleteDFA: Automaton = {
        type: 'DFA',
        states: ['q0'],
        alphabet: ['0', '1'],
        startState: 'q0',
        acceptStates: ['q0'],
        transitions: [
          { from: 'q0', to: 'q0', symbol: '0' }
          // missing 1
        ]
      };
      
      const c = completeDFA(incompleteDFA);
      expect(c.states.includes('__sink__')).toBe(true);
      expect(c.transitions.find(t => t.from === 'q0' && t.symbol === '1')?.to).toBe('__sink__');
    });

    it('proveDFAEquivalence finds mismatch', () => {
      const m1 = buildTestDFA(['0', '1'], 'ends_with', '0', 0);
      const m2 = buildTestDFA(['0', '1'], 'ends_with', '1', 0);
      
      const result = proveDFAEquivalence(m1, m2);
      expect(result.equivalent).toBe(false);
      expect(typeof result.counterexample).toBe('string');
    });

    it('transition-table throws on malformed DFA duplicate transitions', () => {
      const malformedDFA: Automaton = {
        type: 'DFA',
        states: ['q0'],
        alphabet: ['0'],
        startState: 'q0',
        acceptStates: [],
        transitions: [
          { from: 'q0', to: 'q0', symbol: '0' },
          { from: 'q0', to: 'q0', symbol: '0' } // duplicate!
        ]
      };
      
      expect(() => {
        buildTransitionTable(malformedDFA);
      }).toThrow(/Invalid DFA/);
    });
  });
});
