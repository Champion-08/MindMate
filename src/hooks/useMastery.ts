import { useEffect, useState } from 'react';
import { topics as initialTopics } from '../data/mockData';
import type { Topic } from '../types';

type TopicPerformance = {
  attempts: number;
  correct: number;
};

type MasteryData = {
  topics: Topic[];
  performance: Record<string, TopicPerformance>;
};

const STORAGE_KEY = 'mindmate-mastery-v1';

function loadMastery(): MasteryData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as MasteryData;
      if (Array.isArray(parsed.topics) && parsed.performance) {
        return parsed;
      }
    }
  } catch {
    // Fall back to default topics
  }

  return {
    topics: initialTopics.map((topic) => ({ ...topic })),
    performance: {},
  };
}

function getStatus(mastery: number): Topic['status'] {
  if (mastery >= 90) return 'mastered';
  if (mastery >= 75) return 'strong';
  if (mastery >= 55) return 'developing';
  if (mastery >= 35) return 'needs-work';
  return 'critical';
}

export function useMastery() {
  const [data, setData] = useState<MasteryData>(loadMastery);

  useEffect(() => {
    const syncMastery = () => {
      setData(loadMastery());
    };

    window.addEventListener('focus', syncMastery);
    window.addEventListener('storage', syncMastery);
    window.addEventListener('mindmate-mastery-updated', syncMastery);

    return () => {
      window.removeEventListener('focus', syncMastery);
      window.removeEventListener('storage', syncMastery);
      window.removeEventListener('mindmate-mastery-updated', syncMastery);
    };
  }, []);

  const recordAnswer = (topicName: string, isCorrect: boolean) => {
    setData((previous) => {
      const existingTopic = previous.topics.find(
        (topic) => topic.name.toLowerCase() === topicName.toLowerCase()
      );

      const topic: Topic = existingTopic ?? {
        name: topicName,
        mastery: 50,
        status: 'needs-work',
      };

      const previousPerformance = previous.performance[topic.name] ?? {
        attempts: 0,
        correct: 0,
      };

      const performance: TopicPerformance = {
        attempts: previousPerformance.attempts + 1,
        correct: previousPerformance.correct + (isCorrect ? 1 : 0),
      };

      const accuracy = (performance.correct / performance.attempts) * 100;
      const updatedMastery = Math.round(topic.mastery * 0.7 + accuracy * 0.3);

      const updatedTopic: Topic = {
        ...topic,
        mastery: updatedMastery,
        status: getStatus(updatedMastery),
      };

      const updated: MasteryData = {
        topics: existingTopic
          ? previous.topics.map((item) =>
              item.name.toLowerCase() === topic.name.toLowerCase() ? updatedTopic : item
            )
          : [...previous.topics, updatedTopic],
        performance: {
          ...previous.performance,
          [topic.name]: performance,
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('mindmate-mastery-updated'));
      } catch {
        // Continue if localStorage is unavailable
      }

      return updated;
    });
  };

  const weakestTopic = [...data.topics].sort((a, b) => a.mastery - b.mastery)[0];
  const strongestTopic = [...data.topics].sort((a, b) => b.mastery - a.mastery)[0];
  const overallMastery = data.topics.length
    ? Math.round(data.topics.reduce((sum, topic) => sum + topic.mastery, 0) / data.topics.length)
    : 0;

  return {
    topics: data.topics,
    performance: data.performance,
    recordAnswer,
    weakestTopic,
    strongestTopic,
    overallMastery,
  };
}
