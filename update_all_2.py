import os
import json

base_dir = r"C:\Users\DELL\.gemini\antigravity\scratch\mindmate\src"

files = {}

files["pages/Quiz.tsx"] = """import React, { useState, useEffect } from 'react';
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
        const id = await apiStartQuizSession('Python Functions');
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
          question: currentQuestion.text,
          selectedOption: index,
          correctOption: currentQuestion.correct,
          isCorrect,
          topic: currentQuestion.topic
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
"""

files["pages/Planner.tsx"] = """import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PlannerDay } from '../components/shared/PlannerDay';
import { plannerDays as mockPlannerDays, learner } from '../data/mockData';
import { Target, Sparkles, RefreshCw, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiGetPlanner, apiRegeneratePlan } from '../services/api';

export default function Planner() {
  const { showToast } = useAppContext();
  const [plannerDays, setPlannerDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = days[new Date().getDay()];

  const fetchPlanner = async () => {
    setLoading(true);
    try {
      const data = await apiGetPlanner();
      setPlannerDays(data);
    } catch (e) {
      setPlannerDays(mockPlannerDays);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner();
  }, []);

  const handleRegenerate = async () => {
    showToast('AI is regenerating your learning plan...', 'info');
    try {
      await apiRegeneratePlan();
      await fetchPlanner();
      showToast('Plan regenerated successfully', 'success');
    } catch (e) {
      showToast('Failed to regenerate plan', 'error');
    }
  };

  if (loading && plannerDays.length === 0) {
    return (
      <AppShell pageTitle="Weekly Planner" pageSubtitle="Your personalized path to success">
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Weekly Planner" pageSubtitle="Your personalized path to success">
      <div className="max-w-6xl space-y-8">
        
        {/* Goal Card */}
        <Card className="p-6 bg-gradient-to-r from-surface to-indigo-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-primary font-semibold mb-2 text-sm uppercase tracking-wider">
                <Target className="h-4 w-4" /> Current Goal
              </div>
              <h2 className="text-2xl font-bold text-dark mb-2">{learner.goal}</h2>
              <p className="text-muted text-sm">Exam in 3 weeks. You are on track.</p>
            </div>
            
            <div className="w-full md:w-1/3">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-dark">Preparation Progress</span>
                <span className="text-primary">68%</span>
              </div>
              <ProgressBar value={68} className="h-2" />
            </div>
          </div>
        </Card>

        {/* AI Notification */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="text-orange-500 mt-0.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-orange-900 mb-1">Plan Updated by MindMate</h4>
              <p className="text-sm text-orange-800/80">You struggled with OOP yesterday, so MindMate added a recovery session on Tuesday to strengthen your foundation before moving on.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={handleRegenerate} className="bg-white hover:bg-orange-100 text-orange-700 border-orange-200">
              <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
            </Button>
            <Button variant="ghost" size="sm" className="text-orange-700 hover:bg-orange-100">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Planner Grid */}
        <Card className="p-6 overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <div className="flex min-w-[800px] gap-6">
            {plannerDays.map((dayData, i) => (
              <PlannerDay 
                key={i} 
                data={dayData} 
                isToday={dayData.day === currentDay}
              />
            ))}
          </div>
        </Card>

      </div>
    </AppShell>
  );
}
"""

files["pages/Materials.tsx"] = """import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { MaterialCard } from '../components/shared/MaterialCard';
import { EmptyState } from '../components/ui/EmptyState';
import { materials as mockMaterials } from '../data/mockData';
import { Material } from '../types';
import { Upload, FileText, Search as SearchIcon, Filter, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiGetMaterials, apiUploadMaterial, apiGetMaterial, apiDeleteMaterial } from '../services/api';

export default function Materials() {
  const { showToast } = useAppContext();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [materialDetails, setMaterialDetails] = useState<any>(null);

  const fetchMaterials = async () => {
    try {
      const data = await apiGetMaterials();
      setMaterials(data);
    } catch (e) {
      setMaterials(mockMaterials);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      await apiUploadMaterial({ name: 'New Uploaded Document', type: 'Text', content: 'Sample text' });
      showToast('Material uploaded successfully.', 'success');
      fetchMaterials();
    } catch (e) {
      showToast('Failed to upload material.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectMaterial = async (material: Material) => {
    setSelectedMaterial(material);
    try {
      const details = await apiGetMaterial(material.id);
      setMaterialDetails(details);
    } catch (e) {
      setMaterialDetails(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteMaterial(id);
      showToast('Material deleted.', 'success');
      setSelectedMaterial(null);
      fetchMaterials();
    } catch (e) {
      showToast('Failed to delete.', 'error');
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Materials" pageSubtitle="Upload notes and let MindMate extract knowledge">
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Materials" pageSubtitle="Upload notes and let MindMate extract knowledge">
      <div className="max-w-5xl space-y-8">
        
        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-card p-10 text-center transition-colors ${
            isUploading ? 'border-primary bg-indigo-50' : 'border-border bg-surface hover:border-primary/50'
          }`}
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-dark">
            {isUploading ? 'Uploading...' : 'Upload PDF / Notes / Text'}
          </h3>
          <p className="text-muted mb-6 max-w-md mx-auto">
            MindMate will process your materials, extract key concepts, build knowledge graphs, and generate practice questions automatically.
          </p>
          <Button onClick={handleUpload} disabled={isUploading} size="lg">
            {isUploading ? 'Processing...' : 'Select File to Upload'}
          </Button>
        </div>

        {/* List Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold">Your Materials</h3>
          <div className="flex gap-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input type="text" placeholder="Search materials..." className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <Button variant="secondary" className="px-3">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Materials List */}
        <div className="grid grid-cols-1 gap-4">
          {materials.length > 0 ? (
            materials.map(material => (
              <MaterialCard 
                key={material.id} 
                material={material} 
                onClick={() => handleSelectMaterial(material)}
              />
            ))
          ) : (
            <EmptyState 
              icon={FileText} 
              title="No materials yet" 
              description="Upload your first document to start extracting knowledge." 
            />
          )}
        </div>

      </div>

      {/* Material Detail Modal */}
      <Modal 
        isOpen={!!selectedMaterial} 
        onClose={() => setSelectedMaterial(null)} 
        title={selectedMaterial?.name || 'Material Details'}
        className="max-w-2xl"
      >
        <div className="mb-6 flex justify-between items-center">
          <Tabs 
            tabs={[
              { id: 'summary', label: 'AI Summary' },
              { id: 'concepts', label: 'Key Concepts' },
              { id: 'flashcards', label: 'Flashcards' },
              { id: 'quiz', label: 'Generate Quiz' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
          <Button variant="danger" size="sm" onClick={() => selectedMaterial && handleDelete(selectedMaterial.id)}>
             <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-[300px]">
          {!materialDetails ? (
            <div className="flex justify-center items-center h-full mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : (
            <>
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <p className="text-dark/80 leading-relaxed">
                    {materialDetails.summary || "Summary not available."}
                  </p>
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <h5 className="font-semibold text-primary mb-2">MindMate Integration</h5>
                    <p className="text-sm text-dark/80">These notes have been integrated into your Knowledge Graph.</p>
                  </div>
                </div>
              )}
              {activeTab === 'concepts' && (
                <ul className="space-y-3 list-disc pl-5 text-dark/80">
                  {materialDetails.keyConcepts?.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  )) || <li>No key concepts extracted.</li>}
                </ul>
              )}
              {activeTab === 'flashcards' && (
                <div className="text-center py-12">
                  <p className="text-muted mb-4">MindMate generated {materialDetails.flashcards?.length || 0} flashcards from this material.</p>
                  <Button disabled={!materialDetails.flashcards?.length}>Review Flashcards</Button>
                </div>
              )}
              {activeTab === 'quiz' && (
                <div className="text-center py-12">
                  <p className="text-muted mb-4">Test your knowledge specifically on this material.</p>
                  <Button>Start Custom Quiz</Button>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
"""

files["pages/Insights.tsx"] = """import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { InsightCard } from '../components/shared/InsightCard';
import { insights as mockInsights } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { apiGetInsights, apiMarkInsightRead } from '../services/api';

export default function Insights() {
  const { showToast } = useAppContext();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await apiGetInsights();
        setInsights(data.length > 0 ? data : mockInsights);
      } catch (e) {
        setInsights(mockInsights);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const handleAction = async (insight: any) => {
    try {
      await apiMarkInsightRead(insight.id);
      showToast(`Action executed: ${insight.action}`, 'success');
      setInsights(insights.filter(i => i.id !== insight.id));
    } catch (e) {
      showToast('Failed to execute action', 'error');
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Insights" pageSubtitle="AI-driven observations about your learning journey">
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Insights" pageSubtitle="AI-driven observations about your learning journey">
      <div className="max-w-4xl">
        <div className="grid gap-6">
          {insights.length === 0 ? (
            <div className="mt-8 p-6 bg-surface border border-dashed border-border rounded-xl text-center">
               <h3 className="text-lg font-semibold mb-2">No insights right now</h3>
               <p className="text-muted mb-4 max-w-md mx-auto">
                 Check back later for AI-driven observations.
               </p>
             </div>
          ) : (
            insights.map((insight) => (
              <InsightCard 
                key={insight.id}
                type={insight.type}
                title={insight.title}
                description={insight.description}
                action={insight.action}
                onAction={() => handleAction(insight)}
              />
            ))
          )}
          
          <div className="mt-8 p-6 bg-surface border border-dashed border-border rounded-xl text-center">
            <h3 className="text-lg font-semibold mb-2">Want deeper insights?</h3>
            <p className="text-muted mb-4 max-w-md mx-auto">
              MindMate needs more data to generate behavioral insights. Complete 3 more practice sessions this week to unlock them.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
"""

files["pages/Practice.tsx"] = """import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PracticeCard } from '../components/shared/PracticeCard';
import { Brain, Zap, CopyX, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGetQuizHistory } from '../services/api';

export default function Practice() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiGetQuizHistory();
        if (data && data.length > 0) {
          setHistory(data.slice(-3).reverse().map((h: any) => ({
            name: h.topic,
            score: h.score ? Math.round((h.score / h.total) * 100) : 0,
            date: new Date(h.timestamp).toLocaleDateString()
          })));
        } else {
          setHistory([
            { name: 'Python Functions', score: 80, date: 'Today' },
            { name: 'Loops', score: 72, date: 'Yesterday' },
            { name: 'OOP', score: 58, date: '3 days ago' },
          ]);
        }
      } catch (e) {
        setHistory([
          { name: 'Python Functions', score: 80, date: 'Today' },
          { name: 'Loops', score: 72, date: 'Yesterday' },
          { name: 'OOP', score: 58, date: '3 days ago' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <AppShell pageTitle="Practice" pageSubtitle="Strengthen your knowledge through targeted exercises">
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </AppShell>
    );
  }

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
              {history.map((topic, i) => (
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
"""

files["pages/Settings.tsx"] = """import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { apiUpdatePreferences } from '../services/api';

export default function Settings() {
  const { showToast } = useAppContext();
  const [settings, setSettings] = useState({
    adaptiveDifficulty: true,
    personalizedRecs: true,
    proactiveAI: true,
    learningInsights: true,
    cloudAI: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('mindmate_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('mindmate_settings', JSON.stringify(newSettings));
    try {
      await apiUpdatePreferences(newSettings);
      showToast('Preferences updated successfully', 'success');
    } catch (e) {
      showToast('Failed to sync preferences', 'error');
    }
  };

  const Toggle = ({ checked, onChange, label, desc }: any) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 pr-4">
        <p className="font-medium text-dark">{label}</p>
        <p className="text-sm text-muted">{desc}</p>
      </div>
      <button 
        type="button" 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-200'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <AppShell pageTitle="Settings" pageSubtitle="Manage your account and preferences">
      <div className="max-w-3xl space-y-8">
        
        <Card className="p-0 overflow-hidden divide-y divide-border">
          <div className="p-6 bg-gray-50/50">
            <h3 className="font-semibold text-lg">AI & Personalization</h3>
            <p className="text-sm text-muted">Control how MindMate adapts to your learning style.</p>
          </div>
          
          <div className="p-6 divide-y divide-border/50">
            <Toggle 
              label="Adaptive Difficulty" 
              desc="Automatically scale practice difficulty based on your performance."
              checked={settings.adaptiveDifficulty}
              onChange={() => handleToggle('adaptiveDifficulty')}
            />
            <Toggle 
              label="Personalized Recommendations" 
              desc="Suggest topics and materials based on your knowledge graph."
              checked={settings.personalizedRecs}
              onChange={() => handleToggle('personalizedRecs')}
            />
            <Toggle 
              label="Proactive AI" 
              desc="Allow MindMate to modify your schedule when it detects struggles."
              checked={settings.proactiveAI}
              onChange={() => handleToggle('proactiveAI')}
            />
            <Toggle 
              label="Learning Insights" 
              desc="Generate behavioral insights about your learning habits."
              checked={settings.learningInsights}
              onChange={() => handleToggle('learningInsights')}
            />
          </div>
        </Card>

        <Card className="p-0 overflow-hidden divide-y divide-border">
          <div className="p-6 bg-gray-50/50">
            <h3 className="font-semibold text-lg">Offline & Sync</h3>
            <p className="text-sm text-muted">Manage how MindMate handles data.</p>
          </div>
          <div className="p-6">
            <Toggle 
              label="Cloud AI Models" 
              desc="Use advanced cloud models when online (requires more data, provides better reasoning)."
              checked={settings.cloudAI}
              onChange={() => handleToggle('cloudAI')}
            />
          </div>
        </Card>

        <p className="text-xs text-center text-muted mt-8">
          Privacy Note: All your learning data is stored locally by default. Your cognitive model never leaves your device unless Cloud AI is explicitly enabled.
        </p>

      </div>
    </AppShell>
  );
}
"""

files["components/layout/Sidebar.tsx"] = """import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Dumbbell, 
  BrainCircuit, 
  BarChart2, 
  Calendar, 
  Files, 
  Lightbulb, 
  Users, 
  Settings,
  Brain
} from 'lucide-react';
import { cn } from '../../utils';
import { useAppContext } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { StatusIndicator } from '../ui/StatusIndicator';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/home' },
  { label: 'Learn', icon: BookOpen, path: '/learn' },
  { label: 'Practice', icon: Dumbbell, path: '/practice' },
  { label: 'Learning Twin', icon: BrainCircuit, path: '/learning-twin' },
  { label: 'Progress', icon: BarChart2, path: '/progress' },
  { label: 'Planner', icon: Calendar, path: '/planner' },
  { label: 'Materials', icon: Files, path: '/materials' },
  { label: 'Insights', icon: Lightbulb, path: '/insights' },
];

export function Sidebar() {
  const { isOnline, toggleOnline, user } = useAppContext();
  
  const initial = user?.name ? user.name.substring(0, 2).toUpperCase() : 'AL';

  return (
    <aside className="w-[240px] fixed inset-y-0 left-0 bg-surface border-r border-border flex flex-col z-40">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary text-white p-2 rounded-xl">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-xl leading-tight">MindMate</h1>
          <p className="text-[10px] font-bold text-primary tracking-wider uppercase">Adaptive Learning Twin</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
              isActive 
                ? "text-primary bg-indigo-50" 
                : "text-muted hover:text-dark hover:bg-gray-50"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />}
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        <div className="my-4 border-t border-border px-3 pt-4">
          <NavLink
            to="/friends"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
              isActive ? "text-primary bg-indigo-50" : "text-muted hover:text-dark hover:bg-gray-50"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />}
                <Users className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted")} />
                Friends
              </>
            )}
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-border mt-auto space-y-4">
        <div 
          className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={toggleOnline}
          title="Toggle online status (demo)"
        >
          <StatusIndicator isOnline={isOnline} />
        </div>

        <div className="flex items-center gap-3 px-3">
          <Avatar fallback={initial} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark truncate">{user?.name || 'Alex Learner'}</p>
            <p className="text-xs text-muted truncate">Pro Plan</p>
          </div>
          <NavLink to="/settings" className="text-muted hover:text-dark">
            <Settings className="h-5 w-5" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
"""

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
