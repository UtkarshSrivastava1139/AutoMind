import type { Automaton } from '@automind/schemas';
import { getEpsilonClosure } from './nfa-simulator';

export interface NFAtoDFAStep {
  stepNumber: number;
  description: string;
  nfaStates?: string[];
}

export function convertNfaToDfa(nfa: Automaton): { dfa: Automaton; steps: NFAtoDFAStep[] } {
  if (nfa.type !== 'NFA') {
    throw new Error('Input must be an NFA');
  }

  const dfaStates: string[] = [];
  const dfaTransitions: Automaton['transitions'] = [];
  const dfaAcceptStates: string[] = [];
  const steps: NFAtoDFAStep[] = [];
  
  // Mapping from stringified sorted subset to new state name
  const stateMap = new Map<string, string>();
  const unmarkedStates: string[] = [];

  // Initial state is epsilon closure of NFA start state
  const initialClosure = getEpsilonClosure([nfa.startState], nfa.transitions);
  const initialKey = initialClosure.join(',');
  const dfaStartState = `s0`;
  
  stateMap.set(initialKey, dfaStartState);
  unmarkedStates.push(initialKey);
  dfaStates.push(dfaStartState);

  if (initialClosure.some(s => nfa.acceptStates.includes(s))) {
    dfaAcceptStates.push(dfaStartState);
  }

  let stateCounter = 1;
  const alphabet = nfa.alphabet.filter(s => s !== 'ε');

  while (unmarkedStates.length > 0) {
    const currentKey = unmarkedStates.shift()!;
    const currentSubset = currentKey.split(',').filter(Boolean);
    const currentDfaState = stateMap.get(currentKey)!;

    for (const symbol of alphabet) {
      // Find all reachable states on this symbol
      const reachableOnSymbol = new Set<string>();
      for (const nfaState of currentSubset) {
        const matchingTransitions = nfa.transitions.filter(
          t => t.from === nfaState && t.symbol === symbol
        );
        for (const t of matchingTransitions) {
          reachableOnSymbol.add(t.to);
        }
      }

      // Epsilon closure of reachable states
      const targetClosure = getEpsilonClosure(Array.from(reachableOnSymbol), nfa.transitions);
      if (targetClosure.length === 0) continue; 
      
      const targetKey = targetClosure.join(',');
      let targetDfaState = stateMap.get(targetKey);

      if (!targetDfaState) {
        targetDfaState = `s${stateCounter++}`;
        stateMap.set(targetKey, targetDfaState);
        unmarkedStates.push(targetKey);
        dfaStates.push(targetDfaState);

        if (targetClosure.some(s => nfa.acceptStates.includes(s))) {
          dfaAcceptStates.push(targetDfaState);
        }
      }

      dfaTransitions.push({
        from: currentDfaState,
        to: targetDfaState,
        symbol
      });

      let stepCount = steps.length + 1;
      steps.push({
        stepNumber: stepCount,
        nfaStates: targetClosure,
        description: `δ(${currentDfaState}, ${symbol}) = ε-closure({${Array.from(reachableOnSymbol).join(',')}}) = {${targetKey}} -> ${targetDfaState}`
      });
    }
  }

  // To make it a strict DFA, we should ensure every state has a transition for every alphabet symbol.
  // If not, point to a dead state.
  const deadState = `dead`;
  let deadStateNeeded = false;

  const strictDfaTransitions = [...dfaTransitions];

  for (const state of dfaStates) {
    for (const symbol of alphabet) {
      const hasTransition = strictDfaTransitions.some(t => t.from === state && t.symbol === symbol);
      if (!hasTransition) {
        deadStateNeeded = true;
        strictDfaTransitions.push({ from: state, to: deadState, symbol });
      }
    }
  }

  if (deadStateNeeded) {
    dfaStates.push(deadState);
    for (const symbol of alphabet) {
      strictDfaTransitions.push({ from: deadState, to: deadState, symbol });
    }
  }

  const dfa: Automaton = {
    type: 'DFA',
    states: dfaStates,
    alphabet,
    startState: dfaStartState,
    acceptStates: dfaAcceptStates,
    transitions: strictDfaTransitions
  };

  return { dfa, steps };
}
