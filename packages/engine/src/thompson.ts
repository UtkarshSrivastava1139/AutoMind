import type { Automaton, RegexASTNode } from '@automind/schemas';

// Helper to generate unique state names
let stateCounter = 0;
function nextState(): string {
  return `q${stateCounter++}`;
}

export function resetStateCounter() {
  stateCounter = 0;
}

export function astToNFA(ast: RegexASTNode): Automaton {
  resetStateCounter();
  const nfa = buildNFA(ast);
  nfa.type = 'NFA';
  return nfa;
}

function buildNFA(node: RegexASTNode): Automaton {
  switch (node.type) {
    case 'CHAR': {
      const start = nextState();
      const accept = nextState();
      return {
        type: 'NFA',
        states: [start, accept],
        alphabet: [node.value!],
        startState: start,
        acceptStates: [accept],
        transitions: [{ from: start, to: accept, symbol: node.value! }]
      };
    }
    case 'EPSILON': {
      const start = nextState();
      const accept = nextState();
      return {
        type: 'NFA',
        states: [start, accept],
        alphabet: [],
        startState: start,
        acceptStates: [accept],
        transitions: [{ from: start, to: accept, symbol: 'ε' }]
      };
    }
    case 'CONCAT': {
      const left = buildNFA(node.left!);
      const right = buildNFA(node.right!);
      
      const newTransitions = [
        ...left.transitions,
        ...right.transitions,
        // Connect left accept to right start
        ...left.acceptStates.map(acc => ({ from: acc, to: right.startState, symbol: 'ε' }))
      ];
      
      return {
        type: 'NFA',
        states: Array.from(new Set([...left.states, ...right.states])),
        alphabet: Array.from(new Set([...left.alphabet, ...right.alphabet])),
        startState: left.startState,
        acceptStates: right.acceptStates,
        transitions: newTransitions
      };
    }
    case 'UNION': {
      const left = buildNFA(node.left!);
      const right = buildNFA(node.right!);
      
      const start = nextState();
      const accept = nextState();
      
      const newTransitions = [
        ...left.transitions,
        ...right.transitions,
        { from: start, to: left.startState, symbol: 'ε' },
        { from: start, to: right.startState, symbol: 'ε' },
        ...left.acceptStates.map(acc => ({ from: acc, to: accept, symbol: 'ε' })),
        ...right.acceptStates.map(acc => ({ from: acc, to: accept, symbol: 'ε' }))
      ];
      
      return {
        type: 'NFA',
        states: Array.from(new Set([start, accept, ...left.states, ...right.states])),
        alphabet: Array.from(new Set([...left.alphabet, ...right.alphabet])),
        startState: start,
        acceptStates: [accept],
        transitions: newTransitions
      };
    }
    case 'STAR': {
      const child = buildNFA(node.child!);
      const start = nextState();
      const accept = nextState();
      
      const newTransitions = [
        ...child.transitions,
        { from: start, to: child.startState, symbol: 'ε' },
        { from: start, to: accept, symbol: 'ε' },
        ...child.acceptStates.map(acc => ({ from: acc, to: child.startState, symbol: 'ε' })),
        ...child.acceptStates.map(acc => ({ from: acc, to: accept, symbol: 'ε' }))
      ];
      
      return {
        type: 'NFA',
        states: Array.from(new Set([start, accept, ...child.states])),
        alphabet: child.alphabet,
        startState: start,
        acceptStates: [accept],
        transitions: newTransitions
      };
    }
    case 'PLUS': {
      const child = buildNFA(node.child!);
      const start = nextState();
      const accept = nextState();
      
      const newTransitions = [
        ...child.transitions,
        { from: start, to: child.startState, symbol: 'ε' },
        ...child.acceptStates.map(acc => ({ from: acc, to: child.startState, symbol: 'ε' })),
        ...child.acceptStates.map(acc => ({ from: acc, to: accept, symbol: 'ε' }))
      ];
      
      return {
        type: 'NFA',
        states: Array.from(new Set([start, accept, ...child.states])),
        alphabet: child.alphabet,
        startState: start,
        acceptStates: [accept],
        transitions: newTransitions
      };
    }
    case 'OPTIONAL': {
      const child = buildNFA(node.child!);
      const start = nextState();
      const accept = nextState();
      
      const newTransitions = [
        ...child.transitions,
        { from: start, to: child.startState, symbol: 'ε' },
        { from: start, to: accept, symbol: 'ε' },
        ...child.acceptStates.map(acc => ({ from: acc, to: accept, symbol: 'ε' }))
      ];
      
      return {
        type: 'NFA',
        states: Array.from(new Set([start, accept, ...child.states])),
        alphabet: child.alphabet,
        startState: start,
        acceptStates: [accept],
        transitions: newTransitions
      };
    }
    default:
      throw new Error(`Unsupported AST node type: ${node.type}`);
  }
}
