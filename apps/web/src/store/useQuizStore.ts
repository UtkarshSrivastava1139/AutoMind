import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizSet, QuizQuestion } from '@web/lib/quiz-data';

interface QuizAttempt {
  id: string;
  quizSetId: string;
  quizSetTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Record<string, string | number>; // questionId -> answer
  timestamp: number;
  timeTaken: number; // in seconds
}

interface QuizStore {
  // Current attempt state
  currentQuizSet: QuizSet | null;
  currentQuestionIndex: number;
  userAnswers: Record<string, string | number>;
  startTime: number | null;
  isQuizActive: boolean;

  // History
  attempts: QuizAttempt[];

  // Actions
  startQuiz: (quizSet: QuizSet) => void;
  answerQuestion: (questionId: string, answer: string | number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishQuiz: () => QuizAttempt | null;
  resetQuiz: () => void;
  clearHistory: () => void;

  // Getters
  getCurrentQuestion: () => QuizQuestion | null;
  getProgress: () => { current: number; total: number };
  getAttemptByQuizSet: (quizSetId: string) => QuizAttempt[];
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      currentQuizSet: null,
      currentQuestionIndex: 0,
      userAnswers: {},
      startTime: null,
      isQuizActive: false,
      attempts: [],

      startQuiz: (quizSet) => {
        set({
          currentQuizSet: quizSet,
          currentQuestionIndex: 0,
          userAnswers: {},
          startTime: Date.now(),
          isQuizActive: true,
        });
      },

      answerQuestion: (questionId, answer) => {
        set((state) => ({
          userAnswers: {
            ...state.userAnswers,
            [questionId]: answer,
          },
        }));
      },

      nextQuestion: () => {
        const { currentQuizSet, currentQuestionIndex } = get();
        if (currentQuizSet && currentQuestionIndex < currentQuizSet.questions.length - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
      },

      previousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },

      finishQuiz: () => {
        const { currentQuizSet, userAnswers, startTime, attempts } = get();
        if (!currentQuizSet || !startTime) return null;

        let correctCount = 0;
        currentQuizSet.questions.forEach((q) => {
          if (userAnswers[q.id] === q.correctAnswer) {
            correctCount++;
          }
        });

        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const percentage = Math.round((correctCount / currentQuizSet.questions.length) * 100);

        const attempt: QuizAttempt = {
          id: `attempt-${Date.now()}`,
          quizSetId: currentQuizSet.id,
          quizSetTitle: currentQuizSet.title,
          score: correctCount,
          totalQuestions: currentQuizSet.questions.length,
          percentage,
          answers: userAnswers,
          timestamp: Date.now(),
          timeTaken,
        };

        set({
          attempts: [...attempts, attempt],
          isQuizActive: false,
          currentQuizSet: null,
          userAnswers: {},
          startTime: null,
        });

        return attempt;
      },

      resetQuiz: () => {
        set({
          currentQuizSet: null,
          currentQuestionIndex: 0,
          userAnswers: {},
          startTime: null,
          isQuizActive: false,
        });
      },

      clearHistory: () => {
        set({ attempts: [] });
      },

      getCurrentQuestion: () => {
        const { currentQuizSet, currentQuestionIndex } = get();
        if (!currentQuizSet) return null;
        return currentQuizSet.questions[currentQuestionIndex] || null;
      },

      getProgress: () => {
        const { currentQuizSet, currentQuestionIndex } = get();
        if (!currentQuizSet) return { current: 0, total: 0 };
        return {
          current: currentQuestionIndex + 1,
          total: currentQuizSet.questions.length,
        };
      },

      getAttemptByQuizSet: (quizSetId) => {
        const { attempts } = get();
        return attempts.filter((a) => a.quizSetId === quizSetId);
      },
    }),
    {
      name: 'quiz-store',
    }
  )
);