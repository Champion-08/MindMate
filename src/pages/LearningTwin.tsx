import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { LearningTwinCard } from '../components/shared/LearningTwinCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Brain, BookOpen, Target, Sparkles, Settings, LineChart, Zap, Clock } from 'lucide-react';
import { learner as mockLearner } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { getProfile, getTopics, updateProfile } from '../lib/db';

export default function LearningTwin() {
  const { user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);

  const [formStyle, setFormStyle] = useState('');
  const [formSession, setFormSession] = useState('');

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      try {
        const [profRes, topicsRes] = await Promise.all([
          getProfile(user!.id),
          getTopics(user!.id)
        ]);
        if (profRes.data) {
          setProfile(profRes.data);
          setFormStyle(profRes.data.learning_style || 'Examples first');
          setFormSession(profRes.data.preferred_session || '30-45 min');
        }
        if (topicsRes.data) setTopics(topicsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateProfile(user.id, {
        learning_style: formStyle,
        preferred_session: formSession
      });
      setProfile({ ...profile, learning_style: formStyle, preferred_session: formSession });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const mastery = profile?.overall_mastery ?? mockLearner.overallMastery;
  const learningStyle = profile?.learning_style ?? mockLearner.learningStyle;
  const preferredSession = profile?.preferred_session ?? mockLearner.preferredSession;
  
  const sortedTopics = topics.length > 0 ? [...topics].sort((a,b) => b.mastery - a.mastery) : [];
  const strongTopic = sortedTopics.length > 0 ? sortedTopics[0].name : 'DBMS';
  const weakTopic = sortedTopics.length > 0 ? sortedTopics[sortedTopics.length - 1].name : 'OOP';

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
            <p className="text-muted text-sm">Updated recently</p>
          </div>

          {/* 2x2 Grid of Aspects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <LearningTwinCard 
              title="Knowledge Graph"
              icon={Target}
              items={[
                `Mastery: ${mastery}% overall`,
                `Strong foundations in ${strongTopic}`,
                "Developing concepts",
                `Critical gap in ${weakTopic}`
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
                `Style: ${learningStyle}`,
                `Session: ${preferredSession}`,
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
            <Card className="p-6 border border-primary/20 bg-indigo-50/50 dark:bg-indigo-950/20">
              <Zap className="h-6 w-6 text-primary mb-3" />
              <h4 className="font-semibold mb-2">Explanations</h4>
              <p className="text-sm text-dark/80">Tailors content delivery (e.g., more examples vs. theory) based on what resonates with you.</p>
            </Card>
            <Card className="p-6 border border-emerald-500/20 bg-green-50/50 dark:bg-emerald-950/20">
              <Target className="h-6 w-6 text-success mb-3" />
              <h4 className="font-semibold mb-2">Practice Generation</h4>
              <p className="text-sm text-dark/80">Creates custom quizzes targeting exactly the edge cases you've struggled with.</p>
            </Card>
            <Card className="p-6 border border-amber-500/20 bg-yellow-50/50 dark:bg-amber-950/20">
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
            <label className="block text-sm font-medium mb-2 text-dark">Primary Learning Style</label>
            <select 
              value={formStyle}
              onChange={e => setFormStyle(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface text-dark p-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            >
              <option value="Examples first" className="bg-surface text-dark">Examples first</option>
              <option value="Theory first" className="bg-surface text-dark">Theory first</option>
              <option value="Visual/Diagrams" className="bg-surface text-dark">Visual/Diagrams</option>
              <option value="Interactive/Doing" className="bg-surface text-dark">Interactive/Doing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark">Preferred Session Length</label>
            <select 
              value={formSession}
              onChange={e => setFormSession(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface text-dark p-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            >
              <option value="15-30 min" className="bg-surface text-dark">15–30 min (Pomodoro)</option>
              <option value="30-45 min" className="bg-surface text-dark">30–45 min (Focused)</option>
              <option value="60+ min" className="bg-surface text-dark">60+ min (Deep Work)</option>
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
