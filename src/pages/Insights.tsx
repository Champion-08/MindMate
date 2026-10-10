import React from 'react';
import { AppShell } from '../components/layout/AppShell';
import { InsightCard } from '../components/shared/InsightCard';
import { insights as mockInsights } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { getInsights, markInsightRead } from '../lib/db';

export default function Insights() {
  const { user, showToast } = useAppContext();
  const [insights, setInsights] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await getInsights(user!.id);
        if (res.data) setInsights(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleAction = async (id: string, action: string) => {
    showToast(`Action started: ${action}`, 'success');
    if (user) {
      await markInsightRead(id);
      setInsights(prev => prev.map(i => i.id === id ? { ...i, is_read: true } : i));
    }
  };

  const displayInsights = insights.length > 0 ? insights.filter(i => !i.is_read) : mockInsights;

  return (
    <AppShell pageTitle="Insights" pageSubtitle="AI-driven observations about your learning journey">
      <div className="max-w-4xl">
        <div className="grid gap-6">
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
