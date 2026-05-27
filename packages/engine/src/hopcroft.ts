import type { Automaton } from '@automind/schemas';
import { isCompleteDFA } from './validator';
import { completeDFA, proveDFAEquivalence } from './question-verifier';

export interface DFAMinimizationStep {
  stepNumber: number;
  description: string;
  partitions?: string[][];
}

export function minimizeDFA(dfa: Automaton): { minDfa: Automaton; steps: DFAMinimizationStep[] } {
  if (dfa.type !== 'DFA') {
    throw new Error('Input must be a DFA');
  }

  const steps: DFAMinimizationStep[] = [];
  
  // 1. Ensure DFA is complete before minimization
  const completeInputDfa = isCompleteDFA(dfa) ? dfa : completeDFA(dfa);

  // 2. Remove unreachable states
  const reachable = new Set<string>();
  const queue = [completeInputDfa.startState];
  reachable.add(completeInputDfa.startState);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const outgoing = completeInputDfa.transitions.filter(t => t.from === current);
    for (const transition of outgoing) {
      if (!reachable.has(transition.to)) {
        reachable.add(transition.to);
        queue.push(transition.to);
      }
    }
  }

  // A completely safe, reachable, and completed reference DFA for final equivalence
  const referenceDfa: Automaton = {
    ...completeInputDfa,
    states: completeInputDfa.states.filter(s => reachable.has(s)),
    transitions: completeInputDfa.transitions.filter(t => reachable.has(t.from) && reachable.has(t.to)),
    acceptStates: completeInputDfa.acceptStates.filter(s => reachable.has(s))
  };

  // 3. Initialize partitions
  const acceptSet = new Set(referenceDfa.acceptStates);
  const nonAcceptSet = new Set([...reachable].filter(s => !acceptSet.has(s)));

  let partitions = [acceptSet, nonAcceptSet].filter(p => p.size > 0);
  
  steps.push({
    stepNumber: 1,
    partitions: partitions.map(p => Array.from(p).sort()),
    description: 'Initial partitions: Accept and Non-Accept reachable states'
  });

  // 4. Refine partitions
  let changed = true;
  let stepCount = 1;
  while (changed) {
    changed = false;
    const newPartitions: Set<string>[] = [];

    for (const partition of partitions) {
      if (partition.size <= 1) {
        newPartitions.push(partition);
        continue;
      }

      // Map: serialized target partitions -> subset of states
      const splitMap = new Map<string, Set<string>>();

      for (const state of partition) {
        const signatureParts = [];
        for (const symbol of referenceDfa.alphabet) {
          const transition = referenceDfa.transitions.find(t => t.from === state && t.symbol === symbol)!;
          const target = transition.to;
          const targetPartitionIndex = partitions.findIndex(p => p.has(target));
          signatureParts.push(targetPartitionIndex.toString());
        }
        
        const signature = signatureParts.join(',');
        if (!splitMap.has(signature)) {
          splitMap.set(signature, new Set());
        }
        splitMap.get(signature)!.add(state);
      }

      if (splitMap.size > 1) {
        changed = true;
        for (const subset of splitMap.values()) {
          newPartitions.push(subset);
        }
      } else {
        newPartitions.push(partition);
      }
    }

    if (changed) {
      partitions = newPartitions;
      stepCount++;
      steps.push({
        stepNumber: stepCount,
        partitions: partitions.map(p => Array.from(p).sort()),
        description: 'Refined partitions based on transition targets'
      });
    }
  }

  // 5. Build Minimized DFA
  const minStates: string[] = [];
  const minAcceptStates: string[] = [];
  let minStartState = '';
  const minTransitions: Automaton['transitions'] = [];
  
  const stateRepMap = new Map<string, string>();

  partitions.forEach((partition, index) => {
    const repName = `m${index}`;
    minStates.push(repName);
    
    partition.forEach(state => {
      stateRepMap.set(state, repName);
      if (state === referenceDfa.startState) {
        minStartState = repName;
      }
      if (referenceDfa.acceptStates.includes(state) && !minAcceptStates.includes(repName)) {
        minAcceptStates.push(repName);
      }
    });
  });

  partitions.forEach((partition, index) => {
    const repName = `m${index}`;
    const sampleState = Array.from(partition)[0]; 

    for (const symbol of referenceDfa.alphabet) {
      const transition = referenceDfa.transitions.find(t => t.from === sampleState && t.symbol === symbol)!;
      const targetRep = stateRepMap.get(transition.to)!;
      minTransitions.push({
        from: repName,
        to: targetRep,
        symbol
      });
    }
  });

  const minDfa: Automaton = {
    type: 'DFA',
    states: minStates,
    alphabet: referenceDfa.alphabet,
    startState: minStartState,
    acceptStates: minAcceptStates,
    transitions: minTransitions
  };

  // 6. Safety check: ensure the minimized DFA is mathematically equivalent to the reachable completed input
  const eqCheck = proveDFAEquivalence(referenceDfa, minDfa);
  if (!eqCheck.equivalent) {
    throw new Error(`Minimization produced an inequivalent machine! Counterexample: "${eqCheck.counterexample}"`);
  }

  return { minDfa, steps };
}
