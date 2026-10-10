import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ChartCard } from '../components/shared/ChartCard';
import { InsightCard } from '../components/shared/InsightCard';
import { topics as mockTopics, weeklyData } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getTopics } from '../lib/db';

export default function Progress() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      try {
        const res = await getTopics(user!.id);
        if (res.data) setTopics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const displayTopics = topics.length > 0 ? topics : mockTopics;
  const overallMastery = topics.length > 0 
    ? Math.round(topics.reduce((acc, t) => acc + t.mastery, 0) / topics.length)
    : 72;

  const sorted = [...displayTopics].sort((a,b) => a.mastery - b.mastery);
  const weakest = sorted.length > 0 ? sorted[0] : null;

  return (
    <AppShell pageTitle="Progress" pageSubtitle="Track your mastery over time">
      <div className="max-w-6xl space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Col - Mastery & Topics */}
          <div className="lg:col-span-3 space-y-8">
            <Card className="p-8 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
              <div>
                <h3 className="text-lg font-semibold text-dark mb-1">Overall Mastery</h3>
                <p className="text-muted text-sm max-w-sm mb-4">You're making steady progress towards your goal. Keep it up!</p>
                <div className="flex items-center gap-2 text-success font-medium text-sm">
                  <TrendingUp className="h-4 w-4" /> +5% this week
                </div>
              </div>
              
              <div className="relative h-32 w-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="60" className="stroke-indigo-100" strokeWidth="8" fill="none" />
                  <circle 
                    cx="64" cy="64" r="60" 
                    className="stroke-primary transition-all duration-1000 ease-out" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - overallMastery / 100)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-dark">{overallMastery}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-6">Topic Progress</h3>
              <div className="space-y-6">
                {displayTopics.map((topic, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-dark">{topic.name}</span>
                      <span className="text-sm text-muted font-medium">{topic.mastery}%</span>
                    </div>
                    <ProgressBar 
                      value={topic.mastery} 
                      colorClass={topic.mastery < 50 ? 'bg-danger' : topic.mastery < 80 ? 'bg-warning' : 'bg-success'}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Col - Focus & Chart */}
          <div className="lg:col-span-2 space-y-8">
            {weakest && (
              <Card className="p-6 border-red-200 bg-red-50/30">
                <div className="flex items-center gap-2 text-danger font-semibold mb-4">
                  <AlertTriangle className="h-5 w-5" /> Biggest Opportunity
                </div>
                <h3 className="text-2xl font-bold text-dark mb-2">{weakest.name}</h3>
                <p className="text-muted mb-6">
                  Your mastery here is critical at {weakest.mastery}%. We've prepared a gentle recovery path starting with core concepts.
                </p>
                <ProgressBar value={weakest.mastery} colorClass="bg-danger" className="mb-6" />
                <Button variant="danger" className="w-full" onClick={() => navigate('/practice/quiz')}>
                  Start Recovery Path
                </Button>
              </Card>
            )}

            <ChartCard title="Learning Time (Last 7 Days)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8f7ff' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="minutes" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        <InsightCard 
          type="behavior"
          title="Optimal Learning Schedule"
          description="You learn most efficiently during 30–45 minute sessions. Your accuracy drops by 23% after 45+ minutes. Try shorter, focused sessions."
          className="w-full"
        />
      </div>
    </AppShell>
  );
}
