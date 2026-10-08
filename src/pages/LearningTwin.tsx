import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { LearningTwinCard } from '../components/shared/LearningTwinCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Brain, BookOpen, Target, Sparkles, Settings, LineChart, Zap, Clock } from 'lucide-react';
import { learner } from '../data/mockData';

export default function LearningTwin() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <h2 className="text-xl font-bold mt-4">Alex's Cognitive Model</h2>
            <p className="text-muted text-sm">Updated 2 hours ago</p>
          </div>

          {/* 2x2 Grid of Aspects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <LearningTwinCard 
              title="Knowledge Graph"
              icon={Target}
              items={[
                "Mastery: 72% overall",
                "Strong foundations in DBMS",
                "Developing concept of Loops",
                "Critical gap in OOP"
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
            <select className="w-full rounded-btn border border-border p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
              <option>Examples first</option>
              <option>Theory first</option>
              <option>Visual/Diagrams</option>
              <option>Interactive/Doing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Session Length</label>
            <select className="w-full rounded-btn border border-border p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
              <option>15–30 min (Pomodoro)</option>
              <option selected>30–45 min (Focused)</option>
              <option>60+ min (Deep Work)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty Curve</label>
            <select className="w-full rounded-btn border border-border p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
              <option>Gentle</option>
              <option selected>Adaptive</option>
              <option>Challenging</option>
            </select>
          </div>
          <div className="pt-4 border-t flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
