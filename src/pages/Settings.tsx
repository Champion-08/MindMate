import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { apiUpdatePreferences } from '../services/api';

export default function Settings() {
  const { showToast, user } = useAppContext();
  const [settings, setSettings] = useState({
    adaptiveDifficulty: true,
    personalizedRecs: true,
    proactiveAI: true,
    learningInsights: true,
    cloudAI: false,
  });

  const [learningStyle, setLearningStyle] = useState(user?.learningTwin?.learningStyle || 'Examples first');
  const [preferredSession, setPreferredSession] = useState(user?.learningTwin?.preferredSession || '30-45 min (Focused)');

  useEffect(() => {
    const saved = localStorage.getItem('mindmate_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('mindmate_settings', JSON.stringify(newSettings));
  };

  const handleUpdatePreferences = async (style: string, session: string) => {
    setLearningStyle(style);
    setPreferredSession(session);
    try {
      await apiUpdatePreferences({ learningStyle: style, preferredSession: session });
      showToast('Learning preferences updated successfully', 'success');
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
            <h3 className="font-semibold text-lg">Learning Preferences</h3>
            <p className="text-sm text-muted">Update your twin model directly.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark">Primary Learning Style</label>
              <select 
                className="w-full rounded-btn border border-border p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                value={learningStyle}
                onChange={(e) => handleUpdatePreferences(e.target.value, preferredSession)}
              >
                <option value="Visual/Diagrams">Visual/Diagrams</option>
                <option value="Theory first">Theory first</option>
                <option value="Examples first">Examples first</option>
                <option value="Interactive/Doing">Interactive/Doing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-dark">Preferred Session Length</label>
              <select 
                className="w-full rounded-btn border border-border p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                value={preferredSession}
                onChange={(e) => handleUpdatePreferences(learningStyle, e.target.value)}
              >
                <option value="15–30 min (Pomodoro)">15–30 min (Pomodoro)</option>
                <option value="30–45 min (Focused)">30–45 min (Focused)</option>
                <option value="60+ min (Deep Work)">60+ min (Deep Work)</option>
              </select>
            </div>
          </div>
        </Card>
        
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
