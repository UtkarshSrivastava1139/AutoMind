import type { Automaton } from '@automind/schemas';

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
  
  // 1. Remove unreachable states
  const reachable = new Set<string>();
  const queue = [dfa.startState];
  reachable.add(dfa.startState);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const outgoing = dfa.transitions.filter(t => t.from === current);
    for (const transition of outgoing) {
      if (!reachable.has(transition.to)) {
        reachable.add(transition.to);
        queue.push(transition.to);
      }
    }
  }

  // 2. Initialize partitions
  const acceptSet = new Set(dfa.acceptStates.filter(s => reachable.has(s)));
  const nonAcceptSet = new Set([...reachable].filter(s => !acceptSet.has(s)));

  let partitions = [acceptSet, nonAcceptSet].filter(p => p.size > 0);
  
  steps.push({
    stepNumber: 1,
    partitions: partitions.map(p => Array.from(p).sort()),
    description: 'Initial partitions: Accept and Non-Accept states'
  });

  // 3. Refine partitions
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

      // We need to split the partition if elements go to different target partitions
      // Map: serialized target partitions -> subset of states
      const splitMap = new Map<string, Set<string>>();

      for (const state of partition) {
        // signature is a string representing which partition each symbol goes to
        const signatureParts = [];
        for (const symbol of dfa.alphabet) {
          const transition = dfa.transitions.find(t => t.from === state && t.symbol === symbol);
          if (!transition) {
            signatureParts.push('-1'); // Dead/missing transition
          } else {
            const target = transition.to;
            const targetPartitionIndex = partitions.findIndex(p => p.has(target));
            signatureParts.push(targetPartitionIndex.toString());
          }
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
        description: 'Refined partitions'
      });
    }
  }

  // 4. Build Minimized DFA
  const minStates: string[] = [];
  const minAcceptStates: string[] = [];
  let minStartState = '';
  const minTransitions: Automaton['transitions'] = [];
  
  // Mapping from original state to new representative state
  const stateRepMap = new Map<string, string>();

  partitions.forEach((partition, index) => {
    const repName = `m${index}`;
    minStates.push(repName);
    
    partition.forEach(state => {
      stateRepMap.set(state, repName);
      if (state === dfa.startState) {
        minStartState = repName;
      }
      if (dfa.acceptStates.includes(state) && !minAcceptStates.includes(repName)) {
        minAcceptStates.push(repName);
      }
    });
  });

  // Build transitions
  partitions.forEach((partition, index) => {
    const repName = `m${index}`;
    const sampleState = Array.from(partition)[0]; // Use first element as sample

    for (const symbol of dfa.alphabet) {
      const transition = dfa.transitions.find(t => t.from === sampleState && t.symbol === symbol);
      if (transition) {
        const targetRep = stateRepMap.get(transition.to);
        if (targetRep) {
          minTransitions.push({
            from: repName,
            to: targetRep,
            symbol
          });
        }
      }
    }
  });

  const minDfa: Automaton = {
    type: 'DFA',
    states: minStates,
    alphabet: dfa.alphabet,
    startState: minStartState,
    acceptStates: minAcceptStates,
    transitions: minTransitions
  };

  return { minDfa, steps };
}
