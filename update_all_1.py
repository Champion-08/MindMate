import os
import json

base_dir = r"C:\Users\DELL\.gemini\antigravity\scratch\mindmate\src"

files = {}

files["pages/Home.tsx"] = """import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/shared/StatCard';
import { TaskCard } from '../components/shared/TaskCard';
import { InsightCard } from '../components/shared/InsightCard';
import { learner as mockLearner, topics as mockTopics, plannerDays as mockPlannerDays } from '../data/mockData';
import { Flame, Target, Zap, ArrowRight, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGetTopics, apiGetLearningTwin, apiGetPlanner } from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  const [loading, setLoading] = useState(true);
  const [learner, setLearner] = useState<any>(mockLearner);
  const [weakestTopic, setWeakestTopic] = useState<any>({ name: 'Loading...', mastery: 0 });
  const [strongestTopic, setStrongestTopic] = useState<any>({ name: 'Loading...', mastery: 100 });
  const [todayTasks, setTodayTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, twinData, plannerData] = await Promise.all([
          apiGetTopics().catch(() => mockTopics),
          apiGetLearningTwin().catch(() => mockLearner),
          apiGetPlanner().catch(() => mockPlannerDays)
        ]);

        if (topicsData && topicsData.length > 0) {
          const sorted = [...topicsData].sort((a: any, b: any) => a.mastery - b.mastery);
          setWeakestTopic(sorted[0]);
          setStrongestTopic(sorted[sorted.length - 1]);
        }

        if (twinData) {
          setLearner(twinData);
        }

        if (plannerData) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const currentDay = days[new Date().getDay()];
          const todayPlan = plannerData.find((d: any) => d.day === currentDay) || plannerData[0];
          setTodayTasks(todayPlan ? todayPlan.tasks : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <AppShell pageTitle={`Good morning, ${user?.name || 'Alex'}!`} pageSubtitle="Ready to continue mastering Computer Science?">
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle={`Good morning, ${user?.name || 'Alex'}!`} pageSubtitle="Ready to continue mastering Computer Science?">
      <div className="space-y-8 max-w-5xl">
        {/* Next Best Action Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 shadow-lg">
          <div className="relative z-10 md:w-2/3">
            <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm mb-4">
              <Zap className="mr-2 h-4 w-4 text-yellow-300" /> Next Best Action
            </div>
            <h2 className="text-3xl font-bold mb-2">Practice {weakestTopic?.name || 'Python Functions'}</h2>
            <p className="text-indigo-100 mb-6 text-lg">
              Your mastery is currently at {weakestTopic?.mastery || 0}%. We've prepared a custom practice session based on your recent mistakes.
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
                {todayTasks.map((task: any, i: number) => (
                  <TaskCard key={i} name={task.title} duration={task.duration} type={task.type} />
                ))}
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
                  <p className="font-medium text-dark">{strongestTopic?.name || learner.strongest}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Needs Focus</p>
                  <p className="font-medium text-danger">{weakestTopic?.name || learner.weakest}</p>
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
"""

files["pages/Learn.tsx"] = """import React, { useState, useRef, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Avatar } from '../components/ui/Avatar';
import { Send, Sparkles, Code2, BookOpen, Brain, GitPullRequest } from 'lucide-react';
import { chatMessages as initialMessages, learner } from '../data/mockData';
import { ChatMessage } from '../types';
import { cn } from '../utils';
import { apiGetChatHistory, apiSendMessage } from '../services/api';
import { useAppContext } from '../context/AppContext';

const CHIPS = ['Explain differently', 'Simplify', 'Give example', 'Quiz me', 'Show visually'];

export default function Learn() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await apiGetChatHistory();
        setMessages(history.slice(-10));
      } catch (e) {
        setMessages(initialMessages.slice(-10));
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setThinking(true);

    try {
      const response = await apiSendMessage({ content: text, topic: 'Python Functions' });
      setMessages((prev) => [...prev, response]);
    } catch (e) {
      const newAIMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Here's more on that. Since you're an ${learner.learningStyle} learner, I've adjusted this explanation for you.`,
        explanation: 'This is a mocked response based on your query. In the full version, MindMate would adapt this perfectly to your knowledge graph.',
      };
      setMessages((prev) => [...prev, newAIMsg]);
    } finally {
      setThinking(false);
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Learn" pageSubtitle="Chat with your adaptive AI tutor">
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Learn" pageSubtitle="Chat with your adaptive AI tutor">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
        
        {/* Left side: Chat */}
        <div className="flex-1 flex flex-col bg-surface rounded-card border border-border shadow-sm overflow-hidden h-full">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-4 max-w-3xl", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                <div className="shrink-0 mt-1">
                  {msg.role === 'assistant' ? (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  ) : (
                    <Avatar fallback={user?.name ? user.name.substring(0, 2).toUpperCase() : 'AL'} size="sm" />
                  )}
                </div>
                <div className={cn("space-y-3", msg.role === 'user' ? "text-right" : "")}>
                  <div className={cn(
                    "inline-block rounded-2xl px-5 py-3 text-sm",
                    msg.role === 'user' ? "bg-primary text-white" : "bg-gray-100 text-dark"
                  )}>
                    {msg.content}
                  </div>
                  
                  {msg.code && (
                    <div className="rounded-xl bg-slate-900 text-slate-50 p-4 font-mono text-sm overflow-x-auto w-full max-w-2xl text-left border border-slate-800">
                      <pre><code>{msg.code}</code></pre>
                    </div>
                  )}
                  
                  {msg.explanation && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-dark/80 text-left w-full max-w-2xl">
                      {msg.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
               <div className="flex gap-4 max-w-3xl">
                 <div className="shrink-0 mt-1">
                   <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                     <Sparkles className="h-4 w-4" />
                   </div>
                 </div>
                 <div className="space-y-3">
                   <div className="inline-block rounded-2xl px-5 py-3 text-sm bg-gray-100 text-dark flex items-center gap-2">
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                   </div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-gray-50 border-t border-border">
            <div className="flex flex-wrap gap-2 mb-4">
              {CHIPS.map((chip, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium hover:border-primary hover:text-primary transition-colors text-muted shadow-sm"
                  disabled={thinking}
                >
                  {chip}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputValue);
                  }
                }}
                placeholder="Ask MindMate to explain, quiz you, or solve a problem..."
                className="w-full resize-none rounded-xl border border-border bg-white pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[56px] max-h-[120px] shadow-sm"
                rows={1}
                disabled={thinking}
              />
              <Button
                size="sm"
                className="absolute right-2 bottom-2 rounded-lg h-10 w-10 p-0"
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || thinking}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right side: Context */}
        <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6 h-full overflow-y-auto">
          <Card className="p-5">
            <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-3 mb-4">
              <Brain className="h-5 w-5 text-primary" /> Learning Context
            </h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Current Topic</p>
                <p className="font-medium text-dark flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" /> Python Functions
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-medium">
                  <span className="text-muted uppercase tracking-wider font-semibold">Mastery</span>
                  <span className="text-primary">48%</span>
                </div>
                <ProgressBar value={48} className="h-1.5" />
              </div>

              <div>
                <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Level</p>
                <div className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  Intermediate
                </div>
              </div>

              <div>
                <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Preferred Style</p>
                <p className="text-sm flex items-center gap-2 text-dark/80">
                  <BookOpen className="h-4 w-4 text-muted" /> Examples first
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-indigo-50 border-indigo-100">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2 text-primary">
              <GitPullRequest className="h-4 w-4" /> Adaptive Action
            </h3>
            <p className="text-xs text-dark/80 leading-relaxed">
              MindMate noticed you're struggling with default arguments. The examples provided are tailored to clarify this specific gap.
            </p>
          </Card>
        </div>

      </div>
    </AppShell>
  );
}
"""

files["pages/Progress.tsx"] = """import React, { useEffect, useState } from 'react';
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
import { apiGetTopics } from '../services/api';

export default function Progress() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await apiGetTopics();
        setTopics(data);
      } catch (e) {
        setTopics(mockTopics);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (loading) {
    return (
      <AppShell pageTitle="Progress" pageSubtitle="Track your mastery over time">
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </AppShell>
    );
  }

  const overallMastery = topics.length > 0 
    ? Math.round(topics.reduce((acc, curr) => acc + curr.mastery, 0) / topics.length) 
    : 0;

  const lowestTopic = topics.length > 0
    ? [...topics].sort((a, b) => a.mastery - b.mastery)[0]
    : { name: 'Unknown', mastery: 0 };

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
                {topics.map((topic, i) => (
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
            <Card className="p-6 border-red-200 bg-red-50/30">
              <div className="flex items-center gap-2 text-danger font-semibold mb-4">
                <AlertTriangle className="h-5 w-5" /> Biggest Opportunity
              </div>
              <h3 className="text-2xl font-bold text-dark mb-2">{lowestTopic.name}</h3>
              <p className="text-muted mb-6">
                Your mastery here is critical at {lowestTopic.mastery}%. We've prepared a gentle recovery path starting with core concepts.
              </p>
              <ProgressBar value={lowestTopic.mastery} colorClass="bg-danger" className="mb-6" />
              <Button variant="danger" className="w-full" onClick={() => navigate('/practice/quiz')}>
                Start Recovery Path
              </Button>
            </Card>

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
"""

files["pages/LearningTwin.tsx"] = """import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { LearningTwinCard } from '../components/shared/LearningTwinCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Brain, BookOpen, Target, Sparkles, Settings, LineChart, Zap, Clock } from 'lucide-react';
import { learner as mockLearner } from '../data/mockData';
import { apiGetLearningTwin, apiUpdatePreferences } from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function LearningTwin() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [learner, setLearner] = useState<any>(mockLearner);
  const [learningStyle, setLearningStyle] = useState('');
  const [preferredSession, setPreferredSession] = useState('');
  const { user, showToast } = useAppContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiGetLearningTwin();
        setLearner(data);
        setLearningStyle(data.learningStyle);
        setPreferredSession(data.preferredSession);
      } catch (e) {
        setLearner(mockLearner);
        setLearningStyle(mockLearner.learningStyle);
        setPreferredSession(mockLearner.preferredSession);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await apiUpdatePreferences({ learningStyle, preferredSession });
      setLearner({ ...learner, learningStyle, preferredSession });
      showToast('Preferences updated', 'success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Learning Twin" pageSubtitle="Your personalized cognitive model">
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Learning Twin" pageSubtitle="Your personalized cognitive model">
      <div className="max-w-5xl space-y-12">
        
        {/* Core Layout */}
        <div className="relative">
          {/* Center Brain Icon */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="h-24 w-24 bg-surface border-4 border-primary text-primary rounded-full flex items-center justify-center relative z-10 shadow-lg">
                <Brain className="h-12 w-12" />
              </div>
            </div>
            <h2 className="text-xl font-bold mt-4">{user?.name || 'Alex'}'s Cognitive Model</h2>
            <p className="text-muted text-sm">Updated 2 hours ago</p>
          </div>

          {/* 2x2 Grid of Aspects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <LearningTwinCard 
              title="Knowledge Graph"
              icon={Target}
              items={[
                `Mastery: ${learner.overallMastery}% overall`,
                `Strong foundations in ${learner.strongestTopic || learner.strongest}`,
                "Developing concept of Loops",
                `Critical gap in ${learner.weakestTopic || learner.weakest}`
              ]}
              colorClass="text-blue-500"
            />
            <LearningTwinCard 
              title="Learning Strengths"
              icon={Sparkles}
              items={[
                "High retention (87%)",
                "Quick recall speed",
                "Visual memory",
                "Pattern recognition"
              ]}
              colorClass="text-green-500"
            />
            <LearningTwinCard 
              title="Struggle Areas"
              icon={LineChart}
              items={[
                "Abstract concepts",
                "Long reading sessions",
                "Attention drop after 45m",
                "Complex syntax rules"
              ]}
              colorClass="text-red-500"
            />
            <LearningTwinCard 
              title="Preferences"
              icon={BookOpen}
              items={[
                `Style: ${learner.learningStyle}`,
                `Session: ${learner.preferredSession}`,
                "Interactive practice",
                "Morning study"
              ]}
              colorClass="text-purple-500"
            />
          </div>
        </div>

        {/* How MindMate uses this */}
        <div className="pt-8 border-t border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">How MindMate Uses Your Twin</h3>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
              <Settings className="h-4 w-4 mr-2" /> Update Preferences
            </Button>
          </div>

          <p className="text-muted mb-8 max-w-3xl leading-relaxed">
            Your Adaptive Learning Twin is a real-time model of how you learn. MindMate constantly updates this model based on your interactions, performance, and behavior to personalize every aspect of your learning journey.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-transparent bg-indigo-50/50">
              <Zap className="h-6 w-6 text-primary mb-3" />
              <h4 className="font-semibold mb-2">Explanations</h4>
              <p className="text-sm text-dark/80">Tailors content delivery (e.g., more examples vs. theory) based on what resonates with you.</p>
            </Card>
            <Card className="p-6 border-transparent bg-green-50/50">
              <Target className="h-6 w-6 text-success mb-3" />
              <h4 className="font-semibold mb-2">Practice Generation</h4>
              <p className="text-sm text-dark/80">Creates custom quizzes targeting exactly the edge cases you've struggled with.</p>
            </Card>
            <Card className="p-6 border-transparent bg-yellow-50/50">
              <Clock className="h-6 w-6 text-warning mb-3" />
              <h4 className="font-semibold mb-2">Pacing & Scheduling</h4>
              <p className="text-sm text-dark/80">Recommends breaks and schedules reviews right before you're likely to forget.</p>
            </Card>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Preferences">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Learning Style</label>
            <select 
              className="w-full rounded-btn border border-border p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
            >
              <option value="Visual/Diagrams">Visual/Diagrams</option>
              <option value="Theory first">Theory first</option>
              <option value="Examples first">Examples first</option>
              <option value="Interactive/Doing">Interactive/Doing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Session Length</label>
            <select 
              className="w-full rounded-btn border border-border p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={preferredSession}
              onChange={(e) => setPreferredSession(e.target.value)}
            >
              <option value="15–30 min (Pomodoro)">15–30 min (Pomodoro)</option>
              <option value="30–45 min (Focused)">30–45 min (Focused)</option>
              <option value="60+ min (Deep Work)">60+ min (Deep Work)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty Curve</label>
            <select className="w-full rounded-btn border border-border p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
              <option>Gentle</option>
              <option>Adaptive</option>
              <option>Challenging</option>
            </select>
          </div>
          <div className="pt-4 border-t flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
"""

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
