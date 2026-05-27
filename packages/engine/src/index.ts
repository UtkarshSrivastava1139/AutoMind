// Core Algorithms Export

// Simulators
export { simulateDFA } from './dfa-simulator';
export { simulateNFA, getEpsilonClosure } from './nfa-simulator';

// Parsers & Converters
export { parseRegex, tokenizeRegex } from './regex-parser';
export { astToNFA, resetStateCounter } from './thompson';
export { convertNfaToDfa } from './subset-construction';
export { minimizeDFA } from './hopcroft';

// Utils
export { validateAutomaton } from './validator';
export type { ValidationResult } from './validator';

// Question Solver
export { verifyCandidateAutomaton } from './question-verifier';
export { generateTestStrings, generateEdgeCaseStrings } from './test-generator';
export { buildTransitionTable } from './transition-table';
export { buildDeterministicOracle, buildDeterministicDFA } from './oracle';
export type { OracleFunction } from './oracle';
export { lookupCanonicalCache } from './cache-manager';
