import type { Node, Edge } from '@xyflow/react';
import type { Automaton } from '@automind/schemas';

export function automatonToNodesEdges(automaton: Automaton) {
  const nodes: Node[] = automaton.states.map((stateId, i) => {
    const isStart = stateId === automaton.startState;
    const isAccept = automaton.acceptStates.includes(stateId);

    return {
      id: stateId,
      type: 'state',
      position: { x: 100 + (i % 4) * 150, y: 100 + Math.floor(i / 4) * 150 },
      data: {
        label: stateId,
        isStart,
        isAccept,
      },
    };
  });

  const edges: Edge[] = automaton.transitions.map((t, i) => ({
    id: `e-${t.from}-${t.to}-${i}`,
    source: t.from,
    target: t.to,
    type: 'transition',
    data: { label: t.symbol },
  }));

  return { nodes, edges };
}