import React from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/shared/StatCard';
import { TaskCard } from '../components/shared/TaskCard';
import { InsightCard } from '../components/shared/InsightCard';
import { learner, topics } from '../data/mockData';
import { Flame, Target, Zap, ArrowRight, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <AppShell pageTitle="Welcome back, Alex!" pageSubtitle="Ready to continue mastering Computer Science?">
      <div className="space-y-8 max-w-5xl">
        {/* Next Best Action Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 shadow-lg">
          <div className="relative z-10 md:w-2/3">
            <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm mb-4">
              <Zap className="mr-2 h-4 w-4 text-yellow-300" /> Next Best Action
            </div>
            <h2 className="text-3xl font-bold mb-2">Practice Python Functions</h2>
            <p className="text-indigo-100 mb-6 text-lg">
              Your mastery is currently at 48%. We've prepared a custom practice session based on your recent mistakes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50" onClick={() => navigate('/practice/quiz')}>
                Start Practice <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white border-white/20 border">
                Why this?
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
            value={`${learner.streak} Days`} 
            icon={Flame} 
            colorClass="text-orange-500" 
          />
          <StatCard 
            title="Overall Mastery" 
            value={`${learner.overallMastery}%`} 
            icon={Target} 
            colorClass="text-indigo-500" 
          />
          <StatCard 
            title="Learning Efficiency" 
            value={`${learner.learningEfficiency}/100`} 
            icon={Zap} 
            colorClass="text-yellow-500" 
            subtitle="Optimal session length"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Plan */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold">Today's Plan</h3>
            <Card className="p-6">
              <div className="space-y-4">
                <TaskCard name="Functions Practice" duration="15 min" type="practice" />
                <TaskCard name="Quick Recall" duration="10 min" type="review" />
                <TaskCard name="Mini Quiz" duration="10 min" type="quiz" />
              </div>
            </Card>

            <InsightCard 
              type="info"
              title="Optimal Timing"
              description="You learn most efficiently during 30–45 minute sessions. Taking a break soon is recommended."
              className="mt-6"
            />
          </div>

          {/* Learning Twin Snapshot */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Twin Snapshot</h3>
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Strongest Topic</p>
                  <p className="font-medium text-dark">{learner.strongest}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Needs Focus</p>
                  <p className="font-medium text-danger">{learner.weakest}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Best Session</p>
                  <p className="font-medium text-dark">{learner.preferredSession}</p>
                </div>
                
                <Button variant="secondary" className="w-full mt-4" onClick={() => navigate('/learning-twin')}>
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
