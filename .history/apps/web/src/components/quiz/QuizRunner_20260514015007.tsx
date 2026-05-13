"use client";

import { useQuizStore } from '@web/store/useQuizStore';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function QuizRunner() {
  const { currentQuizSet, currentQuestionIndex, userAnswers, answerQuestion, nextQuestion, previousQuestion, finishQuiz, resetQuiz, getCurrentQuestion, getProgress } = useQuizStore();
  const [elapsed, setElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const question = getCurrentQuestion();
  const progress = getProgress();

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentQuizSet || !question) return null;

  const handleFinish = () => {
    const attempt = finishQuiz();
    if (attempt) {
      setResult(attempt);
      setShowResults(true);
    }
  };

  if (showResults && result) {
    return (
      <div className="glass-card p-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">{currentQuizSet.title} - Results</h2>
          <div className={`text-4xl font-bold mb-2 ${result.percentage >= 70 ? 'text-green-400' : 'text-red-400'}`}>
            {result.score}/{result.totalQuestions}
          </div>
          <div className="text-lg font-semibold text-slate-300 mb-4">{result.percentage}%</div>
          <p className="text-slate-400">
            Time: {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {currentQuizSet.questions.map((q) => {
            const userAnswer = result.answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-900/20 border-green-700/50' : 'bg-red-900/20 border-red-700/50'}`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? <CheckCircle2 className="text-green-400 flex-shrink-0 mt-1" size={20} /> : <XCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />}
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2">{q.question}</h4>
                    <p className={`text-sm mb-1 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                      Your answer: <strong>{String(userAnswer)}</strong>
                    </p>
                    {!isCorrect && <p className="text-sm text-slate-300 mb-1">Correct answer: <strong>{String(q.correctAnswer)}</strong></p>}
                    <p className="text-sm text-slate-400 italic">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            resetQuiz();
            setShowResults(false);
            setElapsed(0);
          }}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  const isAnswered = question.id in userAnswers;
  const isLastQuestion = currentQuestionIndex === currentQuizSet.questions.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="glass-card p-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-white">{currentQuizSet.title}</h2>
          <p className="text-sm text-slate-400">
            Question {progress.current} of {progress.total}
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Clock size={16} />
          <span className="font-mono">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-slate-800/50 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${((progress.current - 1) / progress.total) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="glass-card p-8 mb-6">
        <h3 className="text-lg font-bold text-white mb-6">{question.question}</h3>

        {question.type === 'multiple-choice' && (
          <div className="space-y-3">
            {question.options?.map((option, i) => (
              <button
                key={i}
                onClick={() => answerQuestion(question.id, i)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  userAnswers[question.id] === i
                    ? 'border-blue-500 bg-blue-900/20 text-blue-100'
                    : 'border-slate-700/50 bg-slate-800/20 hover:border-slate-600 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      userAnswers[question.id] === i ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                    }`}
                  >
                    {userAnswers[question.id] === i && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>
        )}

        {question.type === 'true-false' && (
          <div className="flex gap-4">
            {['true', 'false'].map((opt) => (
              <button
                key={opt}
                onClick={() => answerQuestion(question.id, opt)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all font-semibold ${
                  userAnswers[question.id] === opt
                    ? 'border-blue-500 bg-blue-900/20 text-blue-100'
                    : 'border-slate-700/50 bg-slate-800/20 hover:border-slate-600 text-slate-300'
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        )}

        {question.type === 'string-acceptance' && (
          <div className="flex gap-4">
            {['yes', 'no'].map((opt) => (
              <button
                key={opt}
                onClick={() => answerQuestion(question.id, opt)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all font-semibold ${
                  userAnswers[question.id] === opt
                    ? 'border-blue-500 bg-blue-900/20 text-blue-100'
                    : 'border-slate-700/50 bg-slate-800/20 hover:border-slate-600 text-slate-300'
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex-1 px-4 py-3 rounded-lg border border-slate-700/50 text-slate-300 hover:bg-slate-800/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        {!isLastQuestion ? (
          <button
            onClick={nextQuestion}
            disabled={!isAnswered}
            className="flex-1 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-slate-800 text-white disabled:text-slate-500 disabled:cursor-not-allowed font-semibold transition-all flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!isAnswered}
            className="flex-1 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-slate-800 text-white disabled:text-slate-500 disabled:cursor-not-allowed font-semibold transition-all"
          >
            Finish Quiz
          </button>
        )}
      </div>
    </div>
  );
}