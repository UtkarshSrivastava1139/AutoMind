import type { Automaton, SimulationResult, SimulationStep } from '@automind/schemas';
import { validateAutomaton } from './validator';

export function getEpsilonClosure(
  states: string[],
  transitions: Automaton['transitions']
): string[] {
  const closure = new Set<string>(states);
  const stack = [...states];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const epsTransitions = transitions.filter(t => t.from === current && t.symbol === 'ε');
    
    for (const t of epsTransitions) {
      if (!closure.has(t.to)) {
        closure.add(t.to);
        stack.push(t.to);
      }
    }
  }

  return Array.from(closure).sort();
}

export function simulateNFA(
  automaton: Automaton,
  input: string
): SimulationResult {
  const validation = validateAutomaton(automaton);
  if (!validation.valid) {
    return {
      accepted: false,
      steps: [],
      finalStates: [],
      warnings: ['Cannot simulate invalid NFA: ' + validation.errors.join(', ')]
    };
  }

  const steps: SimulationStep[] = [];
  
  let currentStates = getEpsilonClosure([automaton.startState], automaton.transitions);

  steps.push({
    index: 0,
    symbol: null,
    activeStates: currentStates,
    consumedInput: '',
    remainingInput: input,
    note: currentStates.length > 1 ? 'Start with epsilon closure' : 'Start'
  });

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    
    if (!automaton.alphabet.includes(symbol)) {
       return {
         accepted: false,
         steps,
         finalStates: currentStates,
         warnings: [`Simulation failed: Input symbol '${symbol}' is not in the alphabet.`]
       };
    }

    const nextStatesSet = new Set<string>();

    for (const state of currentStates) {
      const activeTransitions = automaton.transitions.filter(t => t.from === state && t.symbol === symbol);
      for (const t of activeTransitions) {
        nextStatesSet.add(t.to);
      }
    }

    // Apply epsilon closure to next states
    currentStates = getEpsilonClosure(Array.from(nextStatesSet), automaton.transitions);

    steps.push({
      index: i + 1,
      symbol,
      activeStates: currentStates,
      consumedInput: input.substring(0, i + 1),
      remainingInput: input.substring(i + 1),
      note: currentStates.length === 0 ? 'Machine stalled' : ''
    });

    if (currentStates.length === 0) {
      break;
    }
  }

  const accepted = currentStates.some(state => automaton.acceptStates.includes(state));

  return {
    accepted,
    steps,
    finalStates: currentStates,
    warnings: validation.warnings
  };
}
