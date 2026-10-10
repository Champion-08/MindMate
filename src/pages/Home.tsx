import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/shared/StatCard';
import { TaskCard } from '../components/shared/TaskCard';
import { InsightCard } from '../components/shared/InsightCard';
import { learner as mockLearner } from '../data/mockData';
import { useMastery } from '../hooks/useMastery';
import { useStudyStreak } from '../hooks/useStudyStreak';
import { Flame, Target, Zap, ArrowRight, Brain, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getProfile, getTopics, getPlannerTasks } from '../lib/db';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAppContext();

  // Integrated real-time mastery and streak tracking
  const {
    weakestTopic,
    strongestTopic,
    overallMastery: masteryFromHook,
  } = useMastery();

  const {
    currentStreak,
    longestStreak,
    studyDates,
  } = useStudyStreak();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [strongest, setStrongest] = useState<string>('');
  const [weakest, setWeakest] = useState<string>('');
  const [todayTasks, setTodayTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    async function loadData() {
      try {
        const [profRes, topicsRes, tasksRes] = await Promise.all([
          getProfile(user!.id),
          getTopics(user!.id),
          getPlannerTasks(user!.id),
        ]);

        if (profRes.data) setProfile(profRes.data);

        if (topicsRes.data && topicsRes.data.length > 0) {
          const sorted = [...topicsRes.data].sort((a, b) => b.mastery - a.mastery);
          setStrongest(sorted[0].name);
          setWeakest(sorted[sorted.length - 1].name);
        }

        if (tasksRes.data && tasksRes.data.length > 0) {
          const todayWeekday = new Date().toLocaleDateString('en-US', { weekday: 'short' });
          setTodayTasks(tasksRes.data.filter((t) => t.day === todayWeekday));
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Priority: live hook calculation -> Supabase profile -> mock fallback
  const displayStreak = currentStreak || profile?.streak || mockLearner.streak;
  const displayMastery = masteryFromHook || profile?.overall_mastery || mockLearner.overallMastery;
  const learningEfficiency = profile?.learning_efficiency ?? mockLearner.learningEfficiency;
  const prefSession = profile?.preferred_session ?? mockLearner.preferredSession;

  const displayStrongest = strongestTopic?.name || strongest || mockLearner.strongest;
  const displayWeakest = weakestTopic?.name || weakest || mockLearner.weakest;

  const displayTasks =
    todayTasks.length > 0
      ? todayTasks
      : [
          { name: 'Functions Practice', duration: '15 min', type: 'practice' },
          { name: 'Quick Recall', duration: '10 min', type: 'review' },
          { name: 'Mini Quiz', duration: '10 min', type: 'quiz' },
        ];

  // 7-day study streak week calculation
  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    date.setDate(date.getDate() + mondayOffset + index);

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');

    return {
      label: date.toLocaleDateString('en', { weekday: 'short' }),
      number: date.getDate(),
      key,
      isToday: key === todayKey,
      studied: studyDates.includes(key),
    };
  });

  return (
    <AppShell
      pageTitle={`Welcome back, ${user?.name || mockLearner.name}!`}
      pageSubtitle="Ready to continue mastering Computer Science?"
    >
      <div className="space-y-8 max-w-5xl">
        {/* Next Best Action Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 shadow-lg">
          <div className="relative z-10 md:w-2/3">
            <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm mb-4">
              <Zap className="mr-2 h-4 w-4 text-yellow-300" /> Next Best Action
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Practice {displayWeakest}
            </h2>
            <p className="text-indigo-100 mb-6 text-lg">
              Your mastery is currently at {weakestTopic?.mastery ?? displayMastery}%. MindMate recommends focusing on this topic to strengthen your understanding.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-medium"
                onClick={() => navigate('/practice/quiz')}
              >
                Start Practice <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white border-white/20 border"
                onClick={() => navigate('/learn')}
              >
                Ask MindMate
              </Button>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 opacity-20">
            <Brain className="h-64 w-64" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Current Streak"
            value={`${displayStreak} Days`}
            icon={Flame}
            colorClass="text-orange-500"
            subtitle="Consecutive study days"
          />
          <StatCard
            title="Overall Mastery"
            value={`${displayMastery}%`}
            icon={Target}
            colorClass="text-indigo-500"
          />
          <StatCard
            title="Learning Efficiency"
            value={`${learningEfficiency}/100`}
            icon={Zap}
            colorClass="text-yellow-500"
            subtitle="Optimal session length"
          />
        </div>

        {/* Study Streak Calendar Widget */}
        <Card className="space-y-5 p-6 border border-border shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-dark">
                <Flame className="h-5 w-5 text-orange-500" />
                Your Study Streak
              </h3>
              <p className="mt-1 text-sm text-muted">
                Every study day helps build your learning habit.
              </p>
            </div>
            <div className="rounded-xl bg-orange-50 px-4 py-2 text-right border border-orange-100">
              <p className="text-xs font-medium text-orange-700">Personal best</p>
              <p className="text-2xl font-bold text-orange-600">
                {longestStreak || displayStreak} days
              </p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {weekDays.map((day) => (
              <div key={day.key} className="flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted">{day.label}</span>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    day.studied
                      ? 'bg-orange-500 text-white shadow-sm'
                      : day.isToday
                      ? 'border-2 border-orange-400 text-orange-600 bg-orange-50/50'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  title={day.studied ? 'Study activity completed' : 'No study activity recorded'}
                >
                  {day.studied ? <Check className="h-4 w-4" /> : day.number}
                </div>
                {day.isToday && (
                  <span className="text-xs font-semibold text-orange-600">
                    Today
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Plan and Twin Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Plan */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-dark">Today's Plan</h3>
            <Card className="p-6">
              <div className="space-y-4">
                {displayTasks.map((t, i) => (
                  <TaskCard key={i} name={t.name} duration={t.duration} type={t.type as any} />
                ))}
              </div>
            </Card>

            <InsightCard
              type="info"
              title="Optimal Timing"
              description={`You learn most efficiently during ${prefSession} sessions. Taking a break soon is recommended.`}
              className="mt-6"
            />
          </div>

          {/* Learning Twin Snapshot */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-dark">Twin Snapshot</h3>
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">
                    Strongest Topic
                  </p>
                  <p className="font-medium text-dark">{displayStrongest}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">
                    Needs Focus
                  </p>
                  <p className="font-medium text-danger">{displayWeakest}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">
                    Best Session
                  </p>
                  <p className="font-medium text-dark">{prefSession}</p>
                </div>

                <Button
                  variant="secondary"
                  className="w-full mt-4"
                  onClick={() => navigate('/learning-twin')}
                >
                  View Full Twin
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
