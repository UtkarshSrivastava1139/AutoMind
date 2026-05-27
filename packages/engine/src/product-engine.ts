import type { Automaton, AtomicConstraint, BooleanExpr } from '@automind/schemas';

export interface PrimitiveMachine {
  initialState: string;
  transition: (state: string, symbol: string) => string;
  isAccepting: (state: string) => boolean;
}

function assertSingleSymbolTarget(target: string | undefined, constraintType: string): string | null {
  if (!target || target === '') return null;
  if (target.length === 1) return target;
  throw new Error(`Unsupported deterministic ${constraintType}: target length > 1 is not supported ("${target}")`);
}

function longestSuffixPrefix(target: string, text: string): number {
  for (let len = Math.min(target.length, text.length); len > 0; len--) {
    if (text.endsWith(target.slice(0, len))) {
      return len;
    }
  }
  return 0;
}

type CounterType = 'exact' | 'min' | 'max' | 'parity' | 'divisibility';

function makeBoundedCounterMachine(
  target: string | null,
  value: number,
  type: CounterType
): PrimitiveMachine {
  return {
    initialState: '0',
    transition: (s, sym) => {
      if (s === 'GT' || s === 'GE') return s;
      
      const count = parseInt(s, 10);
      const isMatch = target === null || sym === target;
      
      if (!isMatch) return s;

      if (type === 'parity') {
        return ((count + 1) % 2).toString();
      }
      if (type === 'divisibility') {
        return ((count + 1) % value).toString();
      }

      const nextCount = count + 1;
      
      if (type === 'max' && nextCount > value) return 'GT';
      if (type === 'exact' && nextCount > value) return 'GT';
      if (type === 'min' && nextCount >= value) return 'GE';
      
      return nextCount.toString();
    },
    isAccepting: (s) => {
      if (type === 'parity') {
        return parseInt(s, 10) === value; // value is 0 for even, 1 for odd
      }
      if (type === 'divisibility') {
        const count = s === 'GT' || s === 'GE' ? value + 1 : parseInt(s, 10);
        return count === 0;
      }
      if (type === 'exact') return s !== 'GT' && s !== 'GE' && parseInt(s, 10) === value;
      if (type === 'min') return s === 'GE' || (s !== 'GT' && parseInt(s, 10) >= value);
      if (type === 'max') return s !== 'GT' && s !== 'GE' && parseInt(s, 10) <= value;
      return false;
    }
  };
}

export function createPrimitiveMachine(alphabet: string[], c: AtomicConstraint): PrimitiveMachine {
  const value = c.value ?? 0;

  switch (c.type) {
    case 'parity': {
      const target = assertSingleSymbolTarget(c.target, 'parity');
      return makeBoundedCounterMachine(target, value || 0, 'parity');
    }

    case 'starts_with': {
      const N = (c.target || '').length;
      const targetStr = c.target || '';
      return {
        initialState: '0',
        transition: (s, sym) => {
          if (s === 'DEAD') return 'DEAD';
          const i = parseInt(s, 10);
          if (i === N) return s; // Full match, self loop
          if (sym === targetStr[i]) return (i + 1).toString();
          return 'DEAD';
        },
        isAccepting: (s) => s === N.toString()
      };
    }

    case 'ends_with': {
      const N = (c.target || '').length;
      const targetStr = c.target || '';
      return {
        initialState: '0',
        transition: (s, sym) => {
          const i = parseInt(s, 10);
          const currentPrefix = targetStr.slice(0, i);
          const nextMatch = currentPrefix + sym;
          return longestSuffixPrefix(targetStr, nextMatch).toString();
        },
        isAccepting: (s) => s === N.toString()
      };
    }

    case 'contains': {
      const N = (c.target || '').length;
      const targetStr = c.target || '';
      return {
        initialState: '0',
        transition: (s, sym) => {
          const i = parseInt(s, 10);
          if (i === N) return s; // absorbing
          const currentPrefix = targetStr.slice(0, i);
          const nextMatch = currentPrefix + sym;
          return longestSuffixPrefix(targetStr, nextMatch).toString();
        },
        isAccepting: (s) => s === N.toString()
      };
    }

    case 'not_contains': {
      const N = (c.target || '').length;
      const targetStr = c.target || '';
      return {
        initialState: '0',
        transition: (s, sym) => {
          const i = parseInt(s, 10);
          if (i === N) return s; // absorbing
          const currentPrefix = targetStr.slice(0, i);
          const nextMatch = currentPrefix + sym;
          return longestSuffixPrefix(targetStr, nextMatch).toString();
        },
        isAccepting: (s) => s !== N.toString()
      };
    }

    case 'divisibility': {
      const isBinary = (!c.target || c.target === '') && alphabet.includes('0') && alphabet.includes('1') && alphabet.length === 2;
      if (isBinary) {
        return {
          initialState: '0',
          transition: (s, sym) => {
            const r = parseInt(s, 10);
            const bit = sym === '1' ? 1 : 0;
            return ((r * 2 + bit) % value).toString();
          },
          isAccepting: (s) => s === '0'
        };
      }
      const target = assertSingleSymbolTarget(c.target, 'divisibility');
      return makeBoundedCounterMachine(target, value, 'divisibility');
    }

    case 'length_exact':
    case 'length_min':
    case 'length_max': {
      const type = c.type === 'length_exact' ? 'exact' : (c.type === 'length_min' ? 'min' : 'max');
      return makeBoundedCounterMachine(null, value, type);
    }

    case 'count_exact':
    case 'count_min':
    case 'count_max': {
      const target = assertSingleSymbolTarget(c.target, c.type);
      const type = c.type === 'count_exact' ? 'exact' : (c.type === 'count_min' ? 'min' : 'max');
      return makeBoundedCounterMachine(target, value, type);
    }

    default:
      throw new Error(`Unsupported constraint type for deterministic product: ${c.type}`);
  }
}

function findConstraintIndex(constraints: AtomicConstraint[], desc: string): number {
  const idx = constraints.findIndex(c => c.description === desc);
  if (idx === -1) throw new Error(`Constraint not found in boolean formula: ${desc}`);
  return idx;
}

export function evaluateBooleanAccept(
  stateVars: string[],
  machines: PrimitiveMachine[],
  constraints: AtomicConstraint[],
  formula: BooleanExpr | undefined
): boolean {
  if (formula === undefined) {
    for (let i = 0; i < machines.length; i++) {
      if (!machines[i].isAccepting(stateVars[i])) return false;
    }
    return true;
  }

  if (typeof formula === 'string') {
    const idx = findConstraintIndex(constraints, formula);
    return machines[idx].isAccepting(stateVars[idx]);
  }

  if (formula.operator === 'NOT') {
    return !evaluateBooleanAccept(stateVars, machines, constraints, formula.child);
  } else if (formula.operator === 'AND') {
    return evaluateBooleanAccept(stateVars, machines, constraints, formula.left) &&
           evaluateBooleanAccept(stateVars, machines, constraints, formula.right);
  } else if (formula.operator === 'OR') {
    return evaluateBooleanAccept(stateVars, machines, constraints, formula.left) ||
           evaluateBooleanAccept(stateVars, machines, constraints, formula.right);
  } else if (formula.operator === 'XOR') {
    return evaluateBooleanAccept(stateVars, machines, constraints, formula.left) !==
           evaluateBooleanAccept(stateVars, machines, constraints, formula.right);
  }

  throw new Error(`Invalid boolean operator: ${(formula as any).operator}`);
}

export function buildMemoryReachableDFA(
  alphabet: string[],
  constraints: AtomicConstraint[],
  formula?: BooleanExpr,
  stateLimit = 64
): Automaton {
  const machines = constraints.map(c => createPrimitiveMachine(alphabet, c));
  
  const startVariables: string[] = machines.map(m => m.initialState);

  const stateIdMap = new Map<string, string>();
  let stateCounter = 0;
  
  const serialize = (vars: string[]) => vars.join('|');
  
  const startKey = serialize(startVariables);
  stateIdMap.set(startKey, `q${stateCounter++}`);
  
  const queue: string[][] = [startVariables];
  const visited = new Set<string>([startKey]);
  
  const stateKeys = [startKey];
  const transitions: Automaton['transitions'] = [];
  const acceptStates = new Set<string>();

  if (evaluateBooleanAccept(startVariables, machines, constraints, formula)) {
    acceptStates.add(startKey);
  }

  while (queue.length > 0) {
    const currentVars = queue.shift()!;
    const currentKey = serialize(currentVars);

    for (const sym of alphabet) {
      const targetVars: string[] = [];
      for (let i = 0; i < machines.length; i++) {
        targetVars.push(machines[i].transition(currentVars[i], sym));
      }

      const targetKey = serialize(targetVars);
      
      if (!visited.has(targetKey)) {
        if (stateKeys.length >= stateLimit) {
          throw new Error(`State space limit exceeded (${stateLimit}) before resolving state ${targetKey}`);
        }
        
        visited.add(targetKey);
        stateKeys.push(targetKey);
        stateIdMap.set(targetKey, `q${stateCounter++}`);
        queue.push(targetVars);

        if (evaluateBooleanAccept(targetVars, machines, constraints, formula)) {
          acceptStates.add(targetKey);
        }
      }
      
      transitions.push({ 
        from: stateIdMap.get(currentKey)!, 
        to: stateIdMap.get(targetKey)!, 
        symbol: sym 
      });
    }
  }

  return {
    type: 'DFA',
    states: stateKeys.map(k => stateIdMap.get(k)!),
    alphabet,
    startState: stateIdMap.get(startKey)!,
    acceptStates: Array.from(acceptStates).map(k => stateIdMap.get(k)!),
    transitions
  };
}
