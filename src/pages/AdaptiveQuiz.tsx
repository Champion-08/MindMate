import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import {
  Brain,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Flame,
  Sparkles,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import {
  getQuestionsByTopicAndLanguage,
  TOPICS,
  LanguageCode,
  AdaptiveQuestionItem
} from '../data/learningContent';
import {
  recordQuestionAttempt,
  saveQuizSession,
  completePlannerTaskActivity,
  recordLearningWin
} from '../lib/db';

export default function AdaptiveQuiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, language, showToast } = useAppContext();

  const queryTopicId = searchParams.get('topic') || 'python-functions';
  const queryTaskId = searchParams.get('taskId');

  const [selectedTopic, setSelectedTopic] = useState<string>(queryTopicId);
  const [difficulty, setDifficulty] = useState<number>(2); // 1-5
  const [streak, setStreak] = useState<number>(0);
  const [questionPool, setQuestionPool] = useState<AdaptiveQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [difficultyDelta, setDifficultyDelta] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [taskCompletedNotice, setTaskCompletedNotice] = useState<boolean>(false);

  // Load questions for topic & language
  useEffect(() => {
    const { questions } = getQuestionsByTopicAndLanguage(selectedTopic, language as LanguageCode);
    // Sort / filter loosely by starting difficulty if available
    const sorted = [...questions].sort((a, b) => a.difficulty - b.difficulty);
    setQuestionPool(sorted);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTotalAnswered(0);
    setStreak(0);
    setIsComplete(false);
    setTaskCompletedNotice(false);
  }, [selectedTopic, language]);

  const currentQuestion = questionPool[currentIndex] || questionPool[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || isAnswered || !currentQuestion) return;

    const correct = selectedOption === currentQuestion.correct;
    setIsAnswered(true);
    setIsCorrect(correct);
    setTotalAnswered((prev) => prev + 1);

    if (correct) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      // Adaptive increase difficulty
      if (difficulty < 5) {
        setDifficulty((prev) => Math.min(5, prev + 1));
        setDifficultyDelta('+1 Difficulty');
      } else {
        setDifficultyDelta('Max Mastery Level');
      }
    } else {
      setStreak(0);
      // Adaptive decrease difficulty
      if (difficulty > 1) {
        setDifficulty((prev) => Math.max(1, prev - 1));
        setDifficultyDelta('-1 Level for Reinforcement');
      } else {
        setDifficultyDelta('Focus on Fundamentals');
      }
    }

    // Persist attempt to database & mistakes tracker
    if (user) {
      try {
        await recordQuestionAttempt(user.id, {
          question_id: currentQuestion.id,
          subject_id: 'computer-science',
          topic_id: currentQuestion.topicId,
          topic_name: TOPICS.find((t) => t.id === currentQuestion.topicId)?.name || 'General',
          difficulty: currentQuestion.difficulty,
          question_text: currentQuestion.question,
          selected_option: selectedOption,
          correct_option: currentQuestion.correct,
          is_correct: correct,
          explanation: currentQuestion.explanation,
          options: currentQuestion.options,
          resolved: correct,
        });
      } catch (err) {
        console.warn('Failed to record attempt:', err);
      }
    }
  };

  const handleNext = async () => {
    setDifficultyDelta(null);
    const nextIdx = currentIndex + 1;

    // Finish session after 6 adaptive questions or when pool exhausted
    if (nextIdx >= Math.min(questionPool.length, 6)) {
      setIsComplete(true);
      await finishSession();
    } else {
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const finishSession = async () => {
    const finalTotal = totalAnswered;
    const finalScore = score;
    const accuracy = finalTotal > 0 ? Math.round((finalScore / finalTotal) * 100) : 0;

    if (user) {
      try {
        // 1. Save quiz session
        await saveQuizSession(user.id, {
          topic: TOPICS.find((t) => t.id === selectedTopic)?.name || 'Adaptive Practice',
          score: finalScore,
          total: finalTotal,
          accuracy,
          main_gap: accuracy < 70 ? 'Topic Fundamentals' : undefined,
        });

        // 2. Validate linked planner task if present
        if (queryTaskId) {
          await completePlannerTaskActivity(queryTaskId, user.id, 'quiz');
          setTaskCompletedNotice(true);
          showToast('Planner activity successfully verified and completed!', 'success');
        }

        // 3. Record Learning Win if milestone reached
        if (accuracy >= 80) {
          await recordLearningWin(user.id, {
            title: `High Accuracy in ${TOPICS.find((t) => t.id === selectedTopic)?.name || 'Adaptive Quiz'}`,
            description: `Achieved ${accuracy}% accuracy across adaptive difficulty levels.`,
            category: 'quiz',
            icon: 'Trophy',
            metric_value: `${accuracy}%`,
          });
        }
      } catch (e) {
        console.error('Failed to complete session:', e);
      }
    }
  };

  const getDifficultyLabel = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 'Novice (Level 1)';
      case 2:
        return 'Foundational (Level 2)';
      case 3:
        return 'Intermediate (Level 3)';
      case 4:
        return 'Advanced (Level 4)';
      case 5:
        return 'Mastery (Level 5)';
      default:
        return `Level ${lvl}`;
    }
  };

  return (
    <AppShell
      pageTitle="Adaptive Quiz"
      pageSubtitle="Real-time dynamic difficulty scaling with comprehensive mistake tracking"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Topic & Difficulty Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted font-medium">Topic Focus:</span>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={isAnswered || totalAnswered > 0}
                className="block text-sm font-bold text-dark bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
              >
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id} className="bg-surface text-dark">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-dark">
                {getDifficultyLabel(difficulty)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-500/10 px-2.5 py-1.5 rounded-xl">
              <Flame className="h-4 w-4" />
              <span>{streak} Streak</span>
            </div>
          </div>
        </div>

        {!isComplete && currentQuestion && (
          <Card className="p-6 sm:p-8 space-y-6 border border-border shadow-sm">
            {/* Header with question progress & difficulty badge */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Question {currentIndex + 1} of {Math.min(questionPool.length, 6)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[11px]">
                    Difficulty {currentQuestion.difficulty}/5
                  </Badge>
                  {difficultyDelta && (
                    <span className="text-xs font-medium text-primary animate-pulse">
                      {difficultyDelta}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-dark">Score: {score}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-dark leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt: string, idx: number) => {
                let btnStyle =
                  'border-border bg-surface hover:border-primary/50 text-dark';
                let icon = null;

                if (selectedOption === idx) {
                  btnStyle = 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20';
                }

                if (isAnswered) {
                  if (idx === currentQuestion.correct) {
                    btnStyle =
                      'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/30';
                    icon = <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
                  } else if (selectedOption === idx) {
                    btnStyle =
                      'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 font-semibold ring-2 ring-red-500/30';
                    icon = <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
                  } else {
                    btnStyle = 'opacity-50 border-border text-muted';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-xs font-bold text-muted bg-gray-50 dark:bg-slate-800">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm sm:text-base">{opt}</span>
                    </div>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation card after answering */}
            {isAnswered && (
              <div
                className={`p-4 rounded-xl border animate-in fade-in duration-200 ${
                  isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-dark'
                    : 'border-red-500/30 bg-red-500/5 text-dark'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <Sparkles className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      {isCorrect ? 'Correct! MindMate Analysis:' : 'Mistake Logged for Review:'}
                    </p>
                    <p className="text-sm text-dark/90 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-border">
              {!isAnswered ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-2.5 font-bold"
                >
                  Confirm Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="px-6 py-2.5 font-bold flex items-center gap-2">
                  {currentIndex + 1 >= Math.min(questionPool.length, 6)
                    ? 'Complete Quiz'
                    : 'Next Adaptive Question'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Quiz Completed Summary */}
        {isComplete && (
          <Card className="p-8 sm:p-10 text-center space-y-6 border border-border">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-dark">
                Adaptive Session Completed!
              </h2>
              <p className="text-sm text-muted max-w-md mx-auto">
                Your knowledge model has been updated with real question responses and difficulty calibrations.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto py-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-border">
                <span className="text-xs text-muted block">Score</span>
                <span className="text-xl font-bold text-dark">
                  {score}/{totalAnswered}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-border">
                <span className="text-xs text-muted block">Accuracy</span>
                <span className="text-xl font-bold text-primary">
                  {totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-border">
                <span className="text-xs text-muted block">Peak Level</span>
                <span className="text-xl font-bold text-purple-600">
                  Lvl {difficulty}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-border">
                <span className="text-xs text-muted block">Mistakes</span>
                <span className="text-xl font-bold text-amber-500">
                  {totalAnswered - score}
                </span>
              </div>
            </div>

            {taskCompletedNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold max-w-lg mx-auto flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Linked Planner Task has been marked Completed!
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {totalAnswered - score > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => navigate('/practice/mistake-review')}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Review Mistakes
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => navigate('/learning-win')}
                className="flex items-center gap-2"
              >
                <Award className="h-4 w-4" /> View Learning Wins
              </Button>
              <Button
                onClick={() => {
                  setIsComplete(false);
                  setCurrentIndex(0);
                  setSelectedOption(null);
                  setIsAnswered(false);
                  setScore(0);
                  setTotalAnswered(0);
                  setStreak(0);
                }}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" /> Practice Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/planner')}
              >
                Return to Planner
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
