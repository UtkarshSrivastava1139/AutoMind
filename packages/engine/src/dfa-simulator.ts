import type { Automaton, SimulationResult, SimulationStep } from '@automind/schemas';
import { validateAutomaton } from './validator';

export function simulateDFA(
  automaton: Automaton,
  input: string
): SimulationResult {
  const validation = validateAutomaton(automaton);
  if (!validation.valid && automaton.type === 'DFA') {
    return {
      accepted: false,
      steps: [],
      finalStates: [],
      warnings: ['Cannot simulate invalid DFA: ' + validation.errors.join(', ')]
    };
  }

  const steps: SimulationStep[] = [];
  let currentState = automaton.startState;
  
  steps.push({
    index: 0,
    symbol: null,
    activeStates: [currentState],
    consumedInput: '',
    remainingInput: input,
    note: 'Start'
  });

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    
    if (!automaton.alphabet.includes(symbol)) {
       return {
         accepted: false,
         steps,
         finalStates: [currentState],
         warnings: [`Simulation failed: Input symbol '${symbol}' is not in the alphabet.`]
       };
    }

    const transition = automaton.transitions.find(t => t.from === currentState && t.symbol === symbol);
    
    if (!transition) {
       // Should not happen if DFA is fully validated, but just in case
       return {
         accepted: false,
         steps,
         finalStates: [currentState],
         warnings: [`Simulation failed: No transition found for state '${currentState}' on symbol '${symbol}'.`]
       };
    }

    currentState = transition.to;
    
    steps.push({
      index: i + 1,
      symbol,
      activeStates: [currentState],
      consumedInput: input.substring(0, i + 1),
      remainingInput: input.substring(i + 1),
      note: `Transitioned to ${currentState} on '${symbol}'`
    });
  }

  const accepted = automaton.acceptStates.includes(currentState);

  return {
    accepted,
    steps,
    finalStates: [currentState],
    warnings: validation.warnings
  };
}
