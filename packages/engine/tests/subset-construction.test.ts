import { describe, it, expect } from 'vitest';
import { parseRegex } from '../src/regex-parser';
import { astToNFA } from '../src/thompson';
import { convertNfaToDfa } from '../src/subset-construction';
import { simulateDFA } from '../src/dfa-simulator';

describe('Subset Construction', () => {
  it('should convert NFA to DFA', () => {
    // Regex: (a|b)*abb
    const ast = parseRegex('(a|b)*abb');
    const nfa = astToNFA(ast);
    const { dfa, steps } = convertNfaToDfa(nfa);

    expect(dfa.type).toBe('DFA');
    expect(steps.length).toBeGreaterThan(0);
    
    // Test DFA accuracy
    expect(simulateDFA(dfa, 'abb').accepted).toBe(true);
    expect(simulateDFA(dfa, 'ababb').accepted).toBe(true);
    expect(simulateDFA(dfa, 'bbaaabb').accepted).toBe(true);
    
    expect(simulateDFA(dfa, 'ab').accepted).toBe(false);
    expect(simulateDFA(dfa, 'abba').accepted).toBe(false);
  });
});
