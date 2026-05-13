import { create } from 'zustand';
import { Automaton, RegexASTNode } from '@automind/schemas';
import { parseRegex, astToNFA, convertNfaToDfa, minimizeDFA, resetStateCounter } from '@automind/engine';

interface RegexStore {
  pattern: string;
  ast: RegexASTNode | null;
  nfa: Automaton | null;
  dfa: Automaton | null;
  minimizedDfa: Automaton | null;
  error: string | null;
  setPattern: (pattern: string) => void;
  convert: () => void;
  reset: () => void;
}

export const useRegexStore = create<RegexStore>((set, get) => ({
  pattern: '',
  ast: null,
  nfa: null,
  dfa: null,
  minimizedDfa: null,
  error: null,

  setPattern: (pattern) => set({ pattern, error: null }),

  convert: () => {
    const { pattern } = get();
    if (!pattern.trim()) {
      set({ error: 'Please enter a regular expression.', ast: null, nfa: null, dfa: null, minimizedDfa: null });
      return;
    }

    try {
      resetStateCounter();
      // 1. Parse into AST
      const ast = parseRegex(pattern);
      
      // 2. Convert AST to NFA (Thompson's Construction)
      const nfa = astToNFA(ast);
      
      // 3. Convert NFA to DFA (Subset Construction)
      const { dfa } = convertNfaToDfa(nfa);
      
      // 4. Minimize DFA (Hopcroft's Algorithm)
      const { minDfa } = minimizeDFA(dfa);
      
      set({
        ast,
        nfa,
        dfa,
        minimizedDfa: minDfa,
        error: null,
      });
    } catch (err: any) {
      set({ 
        error: err.message || 'Failed to convert regular expression.',
        ast: null,
        nfa: null,
        dfa: null,
        minimizedDfa: null
      });
    }
  },

  reset: () => set({
    pattern: '',
    ast: null,
    nfa: null,
    dfa: null,
    minimizedDfa: null,
    error: null
  })
}));