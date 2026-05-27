"use client";

import { useQuizStore } from '@web/store/useQuizStore';
import { QuizSelector } from '@web/components/quiz/QuizSelector';
import { QuizRunner } from '@web/components/quiz/QuizRunner';

export default function QuizPage() {
  const { isQuizActive } = useQuizStore();

  return (
    <div className="min-h-full bg-bg-app p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {isQuizActive ? <QuizRunner /> : <QuizSelector />}
      </div>
    </div>
  );
}
