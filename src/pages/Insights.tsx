import React from 'react';
import { AppShell } from '../components/layout/AppShell';
import { InsightCard } from '../components/shared/InsightCard';
import { insights } from '../data/mockData';
import { useAppContext } from '../context/AppContext';

export default function Insights() {
  const { showToast } = useAppContext();

  const handleAction = (action: string) => {
    showToast(`Action started: ${action}`, 'success');
  };

  return (
    <AppShell pageTitle="Insights" pageSubtitle="AI-driven observations about your learning journey">
      <div className="max-w-4xl">
        <div className="grid gap-6">
          {insights.map((insight) => (
            <InsightCard 
              key={insight.id}
              type={insight.type}
              title={insight.title}
              description={insight.description}
              action={insight.action}
              onAction={() => handleAction(insight.action)}
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
