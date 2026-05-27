import type { Automaton, AtomicConstraint } from '@automind/schemas';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateAutomaton(automaton: Automaton): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const stateSet = new Set(automaton.states);
  
  if (!stateSet.has(automaton.startState)) {
    errors.push(`Start state '${automaton.startState}' does not exist in the state set.`);
  }

  for (const acceptState of automaton.acceptStates) {
    if (!stateSet.has(acceptState)) {
      errors.push(`Accept state '${acceptState}' does not exist in the state set.`);
    }
  }

  for (const transition of automaton.transitions) {
    if (!stateSet.has(transition.from)) {
      errors.push(`Transition from unknown state '${transition.from}'.`);
    }
    if (!stateSet.has(transition.to)) {
      errors.push(`Transition to unknown state '${transition.to}'.`);
    }
    if (transition.symbol !== 'ε' && !automaton.alphabet.includes(transition.symbol)) {
      errors.push(`Transition with unknown symbol '${transition.symbol}'.`);
    }
  }

  if (automaton.type === 'DFA') {
    // DFA check: For every state and every symbol, there must be exactly one transition
    // and no epsilon transitions.
    for (const state of automaton.states) {
      for (const symbol of automaton.alphabet) {
        const matchingTransitions = automaton.transitions.filter(
          (t) => t.from === state && t.symbol === symbol
        );
        if (matchingTransitions.length === 0) {
          errors.push(`Missing transition for state '${state}' on symbol '${symbol}'.`);
        } else if (matchingTransitions.length > 1) {
          errors.push(`Multiple transitions (${matchingTransitions.length}) for state '${state}' on symbol '${symbol}' (NFA behavior).`);
        }
      }
    }
    
    const epsTransitions = automaton.transitions.filter(t => t.symbol === 'ε');
    if (epsTransitions.length > 0) {
      errors.push(`DFA cannot have epsilon transitions.`);
    }
  }

  // Warning: Unreachable states (simple BFS)
  const reachable = new Set<string>();
  const queue: string[] = [];
  if (stateSet.has(automaton.startState)) {
      queue.push(automaton.startState);
      reachable.add(automaton.startState);
  }

  while (queue.length > 0) {
    const current: string = queue.shift()!;
    const outgoing = automaton.transitions.filter((t) => t.from === current);
    for (const transition of outgoing) {
      if (!reachable.has(transition.to)) {
        reachable.add(transition.to);
        queue.push(transition.to);
      }
    }
  }

  for (const state of automaton.states) {
    if (!reachable.has(state)) {
      warnings.push(`State '${state}' is unreachable.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function isCompleteDFA(automaton: Automaton): boolean {
  if (automaton.type !== 'DFA') return false;
  
  const stateSet = new Set(automaton.states);
  if (!stateSet.has(automaton.startState)) return false;
  for (const accept of automaton.acceptStates) {
    if (!stateSet.has(accept)) return false;
  }
  
  const epsTransitions = automaton.transitions.filter(t => t.symbol === 'ε' || t.symbol === 'epsilon');
  if (epsTransitions.length > 0) return false;

  for (const state of automaton.states) {
    for (const symbol of automaton.alphabet) {
      let count = 0;
      for (const t of automaton.transitions) {
        if (t.from === state && t.symbol === symbol) {
          count++;
          if (!stateSet.has(t.to)) return false;
        }
      }
      if (count !== 1) return false;
    }
  }
  
  return true;
}

export interface SATResult {
  isSatisfiable: boolean;
  contradictionReason?: string;
}

export function checkConstraintSAT(constraints: AtomicConstraint[]): SATResult {
  let minLen = 0;
  let maxLen = Infinity;
  let exactLen: number | undefined;

  let startsWith: string | null = null;
  let endsWith: string | null = null;

  let minPatternLength = 0;

  for (const c of constraints) {
    if (c.type === 'length_min' && typeof c.value === 'number') {
      minLen = Math.max(minLen, c.value);
    }
    if (c.type === 'length_max' && typeof c.value === 'number') {
      maxLen = Math.min(maxLen, c.value);
    }
    if (c.type === 'length_exact' && typeof c.value === 'number') {
      if (exactLen !== undefined && exactLen !== c.value) {
        return { isSatisfiable: false, contradictionReason: `Conflicting exact lengths: ${exactLen} and ${c.value}` };
      }
      exactLen = c.value;
    }
    if (c.type === 'starts_with' && c.target) {
      if (!startsWith || c.target.length > startsWith.length) {
        startsWith = c.target;
      }
      minPatternLength = Math.max(minPatternLength, c.target.length);
    }
    if (c.type === 'ends_with' && c.target) {
      if (!endsWith || c.target.length > endsWith.length) {
        endsWith = c.target;
      }
      minPatternLength = Math.max(minPatternLength, c.target.length);
    }
    if (c.type === 'contains' && c.target) {
      minPatternLength = Math.max(minPatternLength, c.target.length);
    }
  }

  if (minLen > maxLen) {
    return { isSatisfiable: false, contradictionReason: `Minimum length (${minLen}) is greater than maximum length (${maxLen})` };
  }

  if (exactLen !== undefined) {
    if (exactLen < minLen) {
      return { isSatisfiable: false, contradictionReason: `Exact length (${exactLen}) is less than minimum length (${minLen})` };
    }
    if (exactLen > maxLen) {
      return { isSatisfiable: false, contradictionReason: `Exact length (${exactLen}) is greater than maximum length (${maxLen})` };
    }
  }

  let effectiveMax = exactLen !== undefined ? exactLen : maxLen;
  if (minPatternLength > effectiveMax) {
    return { isSatisfiable: false, contradictionReason: `A pattern constraint requires at least ${minPatternLength} characters, but maximum length is ${effectiveMax}` };
  }

  if (startsWith && endsWith && effectiveMax !== Infinity) {
    if (effectiveMax < startsWith.length + endsWith.length) {
      const overlapLen = startsWith.length + endsWith.length - effectiveMax;
      if (overlapLen > 0) {
        const endOfStart = startsWith.substring(startsWith.length - overlapLen);
        const startOfEnd = endsWith.substring(0, overlapLen);
        if (endOfStart !== startOfEnd) {
          return { isSatisfiable: false, contradictionReason: `Prefix '${startsWith}' and suffix '${endsWith}' cannot overlap within max length ${effectiveMax}` };
        }
      }
    }
  }

  return { isSatisfiable: true };
}
