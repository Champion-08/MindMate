import React from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PracticeCard } from '../components/shared/PracticeCard';
import { Brain, Zap, CopyX, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Practice() {
  const navigate = useNavigate();

  return (
    <AppShell pageTitle="Practice" pageSubtitle="Strengthen your knowledge through targeted exercises">
      <div className="max-w-5xl space-y-8">
        
        {/* Recommended Card */}
        <Card className="p-8 border-primary/20 bg-indigo-50/30 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-100/50 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 text-primary font-semibold mb-2">
            <Sparkles className="h-5 w-5" /> Highly Recommended for You
          </div>
          <h2 className="text-2xl font-bold text-dark mb-2">Python Functions</h2>
          <p className="text-muted max-w-xl mb-6">
            Based on your recent learning sessions, you need more practice with default arguments and lambda functions to reach mastery.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/practice/quiz')}>
              Start Session <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex flex-col justify-center text-sm text-muted">
              <span>Estimated: 15 mins</span>
              <span>+3% Mastery</span>
            </div>
          </div>
        </Card>

        {/* Practice Types Grid */}
        <div>
          <h3 className="text-xl font-bold mb-4">Practice Modes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PracticeCard 
              title="Adaptive Quiz"
              description="A dynamic quiz that adjusts difficulty based on your answers in real-time."
              timeEstimate="10-15 min"
              icon={Brain}
              colorClass="text-purple-600"
            />
            <PracticeCard 
              title="Quick Recall"
              description="Rapid-fire questions to build automaticity and improve retention."
              timeEstimate="5 min"
              icon={Zap}
              colorClass="text-yellow-600"
            />
            <PracticeCard 
              title="Flashcards"
              description="Review key concepts and definitions with spaced repetition."
              timeEstimate="10 min"
              icon={CopyX}
              colorClass="text-blue-600"
            />
            <PracticeCard 
              title="Mistake Review"
              description="Focus only on questions you've previously answered incorrectly."
              timeEstimate="Varies"
              icon={CheckCircle}
              colorClass="text-red-500"
            />
          </div>
        </div>

        {/* Recent Practice Table */}
        <div>
          <h3 className="text-xl font-bold mb-4">Recent Topics</h3>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {[
                { name: 'Python Functions', score: 80, date: 'Today' },
                { name: 'Loops', score: 72, date: 'Yesterday' },
                { name: 'OOP', score: 58, date: '3 days ago' },
              ].map((topic, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-dark">{topic.name}</h4>
                    <p className="text-xs text-muted">Last practiced: {topic.date}</p>
                  </div>
                  <div className="w-32 flex-shrink-0 mr-6">
                    <ProgressBar value={topic.score} showValue className="h-1.5" />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/practice/quiz')}>
                    Retry
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </AppShell>
  );
}
