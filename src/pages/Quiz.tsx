import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { QuizQuestion } from '../components/shared/QuizQuestion';
import { QuizResult } from '../components/shared/QuizResult';
import { quizQuestions } from '../data/mockData';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { saveQuizSession, recordQuestionAttempt } from '../lib/db';
import { useMastery } from '../hooks/useMastery';
import { useStudyStreak } from '../hooks/useStudyStreak';

export default function Quiz() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const { recordAnswer } = useMastery();
  const { recordStudyActivity } = useStudyStreak();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Use modulo so we can loop questions if we want 10 but only have 5 mocks
  const currentQuestion = quizQuestions[currentIndex % quizQuestions.length];
  const totalQuestions = 5;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    const isCorrect = index === currentQuestion.correct;
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    recordAnswer(currentQuestion.topic, isCorrect);

    if (user) {
      recordQuestionAttempt(user.id, {
        question_id: `q-legacy-${currentQuestion.id}`,
        subject_id: 'computer-science',
        topic_id: 'python-functions',
        topic_name: currentQuestion.topic,
        difficulty: 2,
        question_text: currentQuestion.question,
        selected_option: index,
        correct_option: currentQuestion.correct,
        is_correct: isCorrect,
        explanation: currentQuestion.explanation,
        options: currentQuestion.options,
        resolved: isCorrect,
      }).catch(() => {});
    }
  };

  const handleNext = async () => {
    if (currentIndex + 1 >= totalQuestions) {
      recordStudyActivity();
      if (user) {
        const accuracy = (score / totalQuestions) * 100;
        await saveQuizSession(user.id, {
          topic: 'Python Functions',
          score,
          total: totalQuestions,
          accuracy,
          main_gap: accuracy < 100 ? 'Default Arguments' : ''
        });
      }
      setIsComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  if (isComplete) {
    return (
      <AppShell pageTitle="Quiz Complete">
        <QuizResult score={score} total={totalQuestions} topic="Python Functions" />
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Adaptive Quiz" pageSubtitle="Topic: Python Functions">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm font-medium text-muted">
            Question {currentIndex + 1} of {totalQuestions}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/practice')} className="text-muted">
            <X className="h-4 w-4 mr-2" /> Exit Quiz
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full mb-8">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
          />
        </div>

        <QuizQuestion 
          question={currentQuestion}
          selectedOption={selectedOption}
          onSelectOption={handleSelectOption}
          isAnswered={isAnswered}
        />

        {isAnswered && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className={`p-4 rounded-xl border mb-6 ${
              selectedOption === currentQuestion.correct 
                ? 'bg-green-50 border-green-200 text-green-900' 
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <h4 className="font-semibold mb-2">
                {selectedOption === currentQuestion.correct ? 'Correct!' : 'Not quite right.'}
              </h4>
              <p className="text-sm opacity-90">{currentQuestion.explanation}</p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleNext} size="lg">
                {currentIndex + 1 >= totalQuestions ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
