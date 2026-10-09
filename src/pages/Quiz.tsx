import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { QuizQuestion } from '../components/shared/QuizQuestion';
import { QuizResult } from '../components/shared/QuizResult';
import { quizQuestions as mockQuestions } from '../data/mockData';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiStartQuizSession, apiSubmitAnswer, apiCompleteQuizSession } from '../services/api';

export default function Quiz() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Use modulo so we can loop questions if we want 10 but only have 5 mocks
  const currentQuestion = mockQuestions[currentIndex % mockQuestions.length];
  const totalQuestions = 5; // Fixed at 5 for this demo

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const idRes = await apiStartQuizSession('Python Functions');
        const id = (idRes as any)?.data?.sessionId || idRes;
        setSessionId(id);
      } catch (e) {
        console.error(e);
      }
    };
    startQuiz();
  }, []);

  const handleSelectOption = async (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    const isCorrect = index === currentQuestion.correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (sessionId) {
      try {
        await apiSubmitAnswer(sessionId, {
          question: currentQuestion.question,
          selectedOption: index,
          correctOption: currentQuestion.correct,
          isCorrect,
          topic: currentQuestion.topic || 'Python Functions'
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleNext = async () => {
    if (currentIndex + 1 >= totalQuestions) {
      setIsComplete(true);
      if (sessionId) {
        try {
          await apiCompleteQuizSession(sessionId, {
            score,
            total: totalQuestions,
            mainGap: 'default arguments'
          });
        } catch (e) {
          console.error(e);
        }
      }
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
