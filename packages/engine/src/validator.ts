import type { Automaton } from '@automind/schemas';

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
          errors.push(`Multiple transitions for state '${state}' on symbol '${symbol}' (NFA behavior).`);
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
