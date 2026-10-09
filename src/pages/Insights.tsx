import React, { useEffect, useState } from 'react';
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
        const res = await apiGetInsights();
        const data = res.data.insights || (res as any);
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
