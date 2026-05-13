// Quiz data with questions about automata theory
export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'string-acceptance' | 'trace-transition';
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}

export interface QuizSet {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  questions: QuizQuestion[];
  estimatedTime: number; // in minutes
}

export const quizData: QuizSet[] = [
  {
    id: 'dfa-basics',
    title: 'DFA Basics',
    description: 'Learn the fundamentals of Deterministic Finite Automata',
    difficulty: 'easy',
    topic: 'DFA',
    estimatedTime: 10,
    questions: [
      {
        id: 'dfa-1',
        type: 'true-false',
        difficulty: 'easy',
        topic: 'DFA',
        question: 'In a DFA, every state must have exactly one outgoing transition for each symbol in the alphabet.',
        correctAnswer: 'true',
        explanation: 'Correct! The "D" in DFA stands for "Deterministic", meaning there is exactly one transition per state-symbol pair. This guarantees that the machine is completely defined.',
      },
      {
        id: 'dfa-2',
        type: 'multiple-choice',
        difficulty: 'easy',
        topic: 'DFA',
        question: 'How many accepting states can a DFA have?',
        options: ['Exactly one', 'Zero or more', 'At most two', 'It must equal the number of states'],
        correctAnswer: 1,
        explanation: 'A DFA can have zero or more accepting states. Some DFAs have no accepting states (reject all strings), while others have multiple accepting states.',
      },
      {
        id: 'dfa-3',
        type: 'string-acceptance',
        difficulty: 'medium',
        topic: 'DFA',
        question: 'Does the DFA with alphabet {a, b}, start state q0, accepting state q1, and transitions (q0, a) → q1, (q0, b) → q0, (q1, a) → q0, (q1, b) → q1 accept the string "aab"?',
        correctAnswer: 'no',
        explanation: 'Let\'s trace: q0 --a--> q1 --a--> q0 --b--> q0. We end at q0, which is not an accepting state, so the string is rejected.',
      },
    ],
  },
  {
    id: 'nfa-intro',
    title: 'NFA Introduction',
    description: 'Understand Non-deterministic Finite Automata',
    difficulty: 'medium',
    topic: 'NFA',
    estimatedTime: 12,
    questions: [
      {
        id: 'nfa-1',
        type: 'true-false',
        difficulty: 'medium',
        topic: 'NFA',
        question: 'In an NFA, a state can have multiple transitions on the same symbol.',
        correctAnswer: 'true',
        explanation: 'Yes! NFAs allow multiple transitions for the same state-symbol pair. This non-determinism is what makes NFAs more flexible than DFAs.',
      },
      {
        id: 'nfa-2',
        type: 'multiple-choice',
        difficulty: 'medium',
        topic: 'NFA',
        question: 'Every DFA is also an NFA. Is this statement true?',
        options: ['True', 'False', 'Only if it has no cycles', 'Only if it is minimized'],
        correctAnswer: 0,
        explanation: 'True! A DFA is a special case of an NFA where each state has exactly one transition per symbol. An NFA that satisfies this constraint is effectively a DFA.',
      },
      {
        id: 'nfa-3',
        type: 'true-false',
        difficulty: 'hard',
        topic: 'NFA',
        question: 'Epsilon transitions (ε-transitions) allow an NFA to move from one state to another without consuming any symbol from the input string.',
        correctAnswer: 'true',
        explanation: 'Correct! Epsilon transitions are spontaneous moves that the NFA can take. They are useful for simulating certain language constructs like optional patterns.',
      },
    ],
  },
  {
    id: 'regex-conversion',
    title: 'Regex to Automata Conversion',
    description: 'Practice converting regular expressions into automata',
    difficulty: 'hard',
    topic: 'Regex',
    estimatedTime: 15,
    questions: [
      {
        id: 'regex-1',
        type: 'multiple-choice',
        difficulty: 'medium',
        topic: 'Regex',
        question: 'Which of the following regular expressions describes strings over {a, b} that contain at least one "a"?',
        options: ['(a|b)*', '(b*a)*', '(b*ab*)*', 'b*ab*'],
        correctAnswer: 1,
        explanation: 'The regex b*ab* matches zero or more b\'s, followed by at least one a, followed by zero or more b\'s. This ensures at least one "a" appears in the string.',
      },
      {
        id: 'regex-2',
        type: 'true-false',
        difficulty: 'hard',
        topic: 'Regex',
        question: 'The regex (a|b)* represents all possible strings over the alphabet {a, b}, including the empty string.',
        correctAnswer: 'true',
        explanation: 'Yes! The Kleene star (*) allows zero or more repetitions, so (a|b)* matches zero a\'s or b\'s (the empty string), one symbol, two symbols, or any number of symbols.',
      },
    ],
  },
  {
    id: 'dfa-minimization',
    title: 'DFA Minimization',
    description: 'Learn to minimize DFAs using state equivalence',
    difficulty: 'hard',
    topic: 'DFA Minimization',
    estimatedTime: 14,
    questions: [
      {
        id: 'min-1',
        type: 'true-false',
        difficulty: 'hard',
        topic: 'DFA Minimization',
        question: 'Two states in a DFA are equivalent if, for every input string, both states lead to acceptance or both lead to rejection.',
        correctAnswer: 'true',
        explanation: 'Exactly! Equivalent states can be merged into a single state without changing the language accepted by the DFA. Minimization removes these redundant states.',
      },
      {
        id: 'min-2',
        type: 'multiple-choice',
        difficulty: 'hard',
        topic: 'DFA Minimization',
        question: 'What is the primary goal of DFA minimization?',
        options: [
          'To speed up the DFA simulation',
          'To reduce the number of states while preserving the accepted language',
          'To convert the DFA into an NFA',
          'To eliminate ε-transitions',
        ],
        correctAnswer: 1,
        explanation: 'DFA minimization reduces the number of states while preserving the language. This results in a simpler automaton that is often easier to understand and implement.',
      },
    ],
  },
  {
    id: 'dfa-nfa-equivalence',
    title: 'DFA and NFA Equivalence',
    description: 'Understand the conversion between DFAs and NFAs',
    difficulty: 'medium',
    topic: 'DFA/NFA',
    estimatedTime: 13,
    questions: [
      {
        id: 'equiv-1',
        type: 'true-false',
        difficulty: 'medium',
        topic: 'DFA/NFA',
        question: 'Every NFA can be converted to an equivalent DFA using the subset construction algorithm.',
        correctAnswer: 'true',
        explanation: 'Yes! The subset construction (also called powerset construction) converts any NFA into a DFA that accepts the same language. The states of the resulting DFA correspond to subsets of the NFA\'s states.',
      },
      {
        id: 'equiv-2',
        type: 'multiple-choice',
        difficulty: 'medium',
        topic: 'DFA/NFA',
        question: 'If an NFA has n states, what is the maximum number of states in the equivalent DFA after subset construction?',
        options: ['n', 'n²', '2ⁿ', 'n!'],
        correctAnswer: 2,
        explanation: 'In the worst case, the resulting DFA can have 2ⁿ states because each state in the DFA corresponds to a subset of the NFA\'s n states.',
      },
    ],
  },
];

export function getQuizSetById(id: string): QuizSet | undefined {
  return quizData.find((qs) => qs.id === id);
}

export function getQuizSetsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): QuizSet[] {
  return quizData.filter((qs) => qs.difficulty === difficulty);
}
