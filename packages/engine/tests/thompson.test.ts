import { describe, it, expect } from 'vitest';
import { parseRegex } from '../src/regex-parser';
import { astToNFA } from '../src/thompson';
import { simulateNFA } from '../src/nfa-simulator';

describe('Thompson Construction', () => {
  it('should build NFA for single char and accept', () => {
    const ast = parseRegex('a');
    const nfa = astToNFA(ast);
    expect(nfa.type).toBe('NFA');
    expect(simulateNFA(nfa, 'a').accepted).toBe(true);
    expect(simulateNFA(nfa, 'b').accepted).toBe(false);
  });

  it('should build NFA for concat', () => {
    const ast = parseRegex('ab');
    const nfa = astToNFA(ast);
    expect(simulateNFA(nfa, 'ab').accepted).toBe(true);
    expect(simulateNFA(nfa, 'a').accepted).toBe(false);
  });

  it('should build NFA for union', () => {
    const ast = parseRegex('a|b');
    const nfa = astToNFA(ast);
    expect(simulateNFA(nfa, 'a').accepted).toBe(true);
    expect(simulateNFA(nfa, 'b').accepted).toBe(true);
    expect(simulateNFA(nfa, 'ab').accepted).toBe(false);
  });

  it('should build NFA for star', () => {
    const ast = parseRegex('a*');
    const nfa = astToNFA(ast);
    expect(simulateNFA(nfa, '').accepted).toBe(true);
    expect(simulateNFA(nfa, 'a').accepted).toBe(true);
    expect(simulateNFA(nfa, 'aaa').accepted).toBe(true);
    expect(simulateNFA(nfa, 'b').accepted).toBe(false);
  });
  
  it('should build NFA for complex regex', () => {
    const ast = parseRegex('(a|b)*abb');
    const nfa = astToNFA(ast);
    expect(simulateNFA(nfa, 'abb').accepted).toBe(true);
    expect(simulateNFA(nfa, 'ababb').accepted).toBe(true);
    expect(simulateNFA(nfa, 'aaaaaabb').accepted).toBe(true);
    expect(simulateNFA(nfa, 'aba').accepted).toBe(false);
  });
});
