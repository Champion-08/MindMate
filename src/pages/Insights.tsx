import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { InsightCard } from '../components/shared/InsightCard';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import {
  getInsights,
  markInsightRead,
  getProfile,
  getTopics,
  getUserMistakes,
  getQuizHistory
} from '../lib/db';
import { insights as mockInsights } from '../data/mockData';

export default function Insights() {
  const navigate = useNavigate();
  const { user, showToast } = useAppContext();

  const [insights, setInsights] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const [insRes, profRes, topRes, misRes, quizRes] = await Promise.all([
          getInsights(user!.id),
          getProfile(user!.id),
          getTopics(user!.id),
          getUserMistakes(user!.id),
          getQuizHistory(user!.id),
        ]);

        if (insRes.data) setInsights(insRes.data);
        if (profRes.data) setProfile(profRes.data);
        if (topRes.data) setTopics(topRes.data);
        if (misRes.data) setMistakes(misRes.data);
        if (quizRes.data) setQuizHistory(quizRes.data);
      } catch (err) {
        console.error('Failed to load insights data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleAction = async (id: string, action: string) => {
    showToast(`Action started: ${action}`, 'success');
    if (user) {
      await markInsightRead(id);
      setInsights((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_read: true } : i))
      );
    }
    if (action.toLowerCase().includes('quiz') || action.toLowerCase().includes('practice')) {
      navigate('/practice/adaptive-quiz');
    } else if (action.toLowerCase().includes('concept') || action.toLowerCase().includes('review')) {
      navigate('/practice/mistake-review');
    } else if (action.toLowerCase().includes('schedule')) {
      navigate('/planner');
    }
  };

  const displayInsights =
    insights.length > 0 ? insights.filter((i) => !i.is_read) : mockInsights;

  // Real or synthetic weekly progression
  const progressionData = [
    { day: 'Mon', accuracy: 72, retention: 78 },
    { day: 'Tue', accuracy: 75, retention: 80 },
    { day: 'Wed', accuracy: 68, retention: 76 },
    { day: 'Thu', accuracy: 84, retention: 82 },
    { day: 'Fri', accuracy: 88, retention: 85 },
    { day: 'Sat', accuracy: 82, retention: 86 },
    { day: 'Sun', accuracy: 91, retention: 89 },
  ];

  // Topic mastery bars
  const topicData =
    topics.length > 0
      ? topics.slice(0, 5).map((t) => ({ name: t.name, mastery: Math.round(t.mastery || 50) }))
      : [
          { name: 'Variables', mastery: 92 },
          { name: 'Conditions', mastery: 86 },
          { name: 'Loops', mastery: 61 },
          { name: 'Functions', mastery: 48 },
          { name: 'DBMS', mastery: 82 },
        ];

  const overallMastery = Math.round(profile?.overall_mastery ?? 72);
  const efficiency = Math.round(profile?.learning_efficiency ?? 84);
  const unresolvedMistakes = mistakes.filter((m) => !m.resolved).length;

  return (
    <AppShell
      pageTitle="Learning Insights"
      pageSubtitle="Cognitive analytics, mistake patterns, and personalized study recommendations"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Core Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-5 border border-border flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-muted block font-medium">Overall Mastery</span>
              <span className="text-2xl font-bold text-dark">{overallMastery}%</span>
            </div>
          </Card>

          <Card className="p-5 border border-border flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-muted block font-medium">Learning Efficiency</span>
              <span className="text-2xl font-bold text-dark">{efficiency}/100</span>
            </div>
          </Card>

          <Card className="p-5 border border-border flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-muted block font-medium">Retention Index</span>
              <span className="text-2xl font-bold text-dark">87%</span>
            </div>
          </Card>

          <Card className="p-5 border border-border flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-muted block font-medium">Unresolved Gaps</span>
              <span className="text-2xl font-bold text-dark">{unresolvedMistakes}</span>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progression Area Chart */}
          <Card className="p-6 border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-dark flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> 7-Day Accuracy Trend
                </h3>
                <p className="text-xs text-muted">Daily performance vs long-term retention</p>
              </div>
              <Badge variant="default" className="text-xs">
                +12% This Week
              </Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressionData}>
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      borderColor: 'var(--color-border, #e2e8f0)',
                      borderRadius: '12px',
                      color: 'var(--color-dark, #0f172a)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorAcc)"
                    name="Accuracy %"
                  />
                  <Area
                    type="monotone"
                    dataKey="retention"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRet)"
                    name="Retention %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Topic Mastery Bar Chart */}
          <Card className="p-6 border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-dark flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" /> Topic Mastery Distribution
                </h3>
                <p className="text-xs text-muted">Relative proficiency across key subjects</p>
              </div>
              <span className="text-xs font-semibold text-primary">5 Core Topics</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      borderColor: 'var(--color-border, #e2e8f0)',
                      borderRadius: '12px',
                      color: 'var(--color-dark, #0f172a)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="mastery" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Mastery %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Mistake Pattern Recovery Alert */}
        {unresolvedMistakes > 0 && (
          <Card className="p-6 border-red-500/30 bg-red-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-dark">
                  {unresolvedMistakes} Unresolved Learning Mistake{unresolvedMistakes > 1 ? 's' : ''} Detected
                </h4>
                <p className="text-xs sm:text-sm text-muted">
                  MindMate identified repeated question errors. Resolving these will boost your retention index by up to +6%.
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/practice/mistake-review')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold shrink-0 flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Resolve in Mistake Review
            </Button>
          </Card>
        )}

        {/* Actionable Cognitive Insights List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-dark">AI Behavioral Insights</h3>
            <span className="text-xs text-muted">Generated from quiz timings & answer patterns</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {displayInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                type={insight.type}
                title={insight.title}
                description={insight.description}
                action={insight.action}
                onAction={() => handleAction(insight.id, insight.action)}
              />
            ))}
          </div>
        </div>

        {/* Deeper Insights Callout */}
        <div className="p-6 bg-surface border border-dashed border-border rounded-2xl text-center space-y-3">
          <div className="p-3 rounded-full bg-primary/10 text-primary w-fit mx-auto">
            <Sparkles className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-dark">Personalized Twin Calibration</h4>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            MindMate's adaptive twin model continuously fine-tunes question difficulty and pacing to match your natural cognitive flow.
          </p>
          <div className="pt-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/learning-twin')}
              className="font-bold text-xs"
            >
              Inspect Adaptive Twin Profile
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
