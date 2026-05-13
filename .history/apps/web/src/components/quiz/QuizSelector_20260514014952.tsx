"use client";

import { quizData } from '@web/lib/quiz-data';
import { useQuizStore } from '@web/store/useQuizStore';
import { BookOpen, Clock, BarChart3, Play } from 'lucide-react';

export function QuizSelector() {
  const { startQuiz, attempts, getAttemptByQuizSet } = useQuizStore();

  const difficultyColor = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400',
  };

  const difficultyBg = {
    easy: 'bg-green-900/20 border-green-700/50',
    medium: 'bg-yellow-900/20 border-yellow-700/50',
    hard: 'bg-red-900/20 border-red-700/50',
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <BookOpen className="text-secondary" size={24} />
          Practice Quizzes
        </h2>
        <p className="text-slate-400">Test your automata theory knowledge with interactive quizzes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizData.map((quiz) => {
          const quizAttempts = getAttemptByQuizSet(quiz.id);
          const bestAttempt = quizAttempts.length > 0 ? quizAttempts.reduce((best, current) => (current.percentage > best.percentage ? current : best)) : null;

          return (
            <div
              key={quiz.id}
              className={`glass-card p-6 hover:border-secondary/50 transition-all duration-300 ${
                difficultyBg[quiz.difficulty]
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{quiz.title}</h3>
                  <p className="text-sm text-slate-400">{quiz.description}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${difficultyColor[quiz.difficulty]} bg-slate-800/50`}>
                  {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <BookOpen size={14} />
                  {quiz.questions.length} questions
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {quiz.estimatedTime} min
                </div>
              </div>

              {bestAttempt && (
                <div className="bg-slate-800/30 rounded p-3 mb-4">
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <BarChart3 size={14} className="text-green-400" />
                    <span className="text-slate-300">Best score:</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {bestAttempt.score}/{bestAttempt.totalQuestions}
                    <span className="text-sm ml-2 text-slate-400">({bestAttempt.percentage}%)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {quizAttempts.length} {quizAttempts.length === 1 ? 'attempt' : 'attempts'}
                  </p>
                </div>
              )}

              <button
                onClick={() => startQuiz(quiz)}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play size={16} fill="currentColor" />
                Start Quiz
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}