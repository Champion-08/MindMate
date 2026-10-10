import React, { useState, useRef, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Avatar } from '../components/ui/Avatar';
import { Send, Sparkles, Code2, BookOpen, Brain, GitPullRequest } from 'lucide-react';
import { chatMessages as initialMessages, learner } from '../data/mockData';
import { ChatMessage } from '../types';
import { cn } from '../utils';
import { useAppContext } from '../context/AppContext';
import { getChatHistory, saveChatMessage, getProfile, getTopics } from '../lib/db';
import { useStudyStreak } from '../hooks/useStudyStreak';

const CHIPS = ['Explain differently', 'Simplify', 'Give example', 'Quiz me', 'Show visually'];

export default function Learn() {
  const { user } = useAppContext();
  const { recordStudyActivity } = useStudyStreak();

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);

  // Interactive Quiz state from ai-integration
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizQuestionCount, setQuizQuestionCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      try {
        const [chatRes, profRes, topicsRes] = await Promise.all([
          getChatHistory(user!.id),
          getProfile(user!.id),
          getTopics(user!.id),
        ]);

        if (chatRes.data && chatRes.data.length > 0) {
          setMessages(
            chatRes.data.map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }))
          );
        } else {
          setMessages(initialMessages);
        }

        if (profRes.data) setProfile(profRes.data);
        if (topicsRes.data) setTopics(topicsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const activeTopic = topics.length > 0 ? topics[0].name : 'Python Functions';
  const activeMastery = topics.length > 0 ? topics[0].mastery : 48;
  const activeLearningStyle = profile?.learning_style || learner.learningStyle;

  const handleSend = async (text: string, options?: { startQuiz?: boolean }) => {
    const question = text.trim();
    if (!question || !user || isSending) return;

    const startingQuiz = options?.startQuiz === true;
    const answeringQuiz = quizMode && !startingQuiz && quizQuestion !== '';

    const newUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      await saveChatMessage(user.id, 'user', question, activeTopic);
      recordStudyActivity();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          topic: activeTopic,
          learningStyle: activeLearningStyle,
          masteryLevel: activeMastery,
          history: messages.map((m) => ({ role: m.role, content: m.content })).slice(-6),
          learner: {
            name: user.name || learner.name,
            goal: profile?.goal || learner.goal,
            learningStyle: activeLearningStyle,
            overallMastery: activeMastery,
          },
          topics,
          quizMode: startingQuiz || quizMode,
          quizQuestion: startingQuiz ? '' : quizQuestion,
          quizTopic: activeTopic,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const botResponse = data.content || data.answer || 'Sorry, I could not generate a response.';

      if (startingQuiz && data.quizQuestion) {
        setQuizMode(true);
        setQuizQuestion(data.quizQuestion);
        setQuizQuestionCount(0);
      } else if (answeringQuiz && data.nextQuestion) {
        setQuizQuestion(data.nextQuestion);
        setQuizQuestionCount((c) => c + 1);
      }

      const newAIMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: botResponse,
      };

      setMessages((prev) => [...prev, newAIMsg]);
      await saveChatMessage(user.id, 'assistant', botResponse, activeTopic);
    } catch (err) {
      console.error(err);
      const errMsgs: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I had trouble connecting to the AI service. Please try again in a moment.',
      };
      setMessages((prev) => [...prev, errMsgs]);
    } finally {
      setIsSending(false);
    }
  };

  const handleChipClick = (chip: string) => {
    if (chip === 'Quiz me') {
      setQuizQuestion('');
      handleSend(`Start a short interactive quiz on ${activeTopic}.`, { startQuiz: true });
      return;
    }
    handleSend(chip);
  };

  return (
    <AppShell pageTitle="Learn" pageSubtitle="Chat with your adaptive AI tutor">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
        {/* Left side: Chat */}
        <div className="flex-1 flex flex-col bg-surface rounded-card border border-border shadow-sm overflow-hidden h-full">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-4 max-w-3xl',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                )}
              >
                <div className="shrink-0 mt-1">
                  {msg.role === 'assistant' ? (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  ) : (
                    <Avatar fallback={user?.name ? user.name.charAt(0) : 'A'} size="sm" />
                  )}
                </div>
                <div className={cn('space-y-3', msg.role === 'user' ? 'text-right' : '')}>
                  <div
                    className={cn(
                      'inline-block rounded-2xl px-5 py-3 text-sm whitespace-pre-wrap leading-relaxed',
                      msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-dark'
                    )}
                  >
                    {msg.content}
                  </div>

                  {msg.code && (
                    <div className="rounded-xl bg-slate-900 text-slate-50 p-4 font-mono text-sm overflow-x-auto w-full max-w-2xl text-left border border-slate-800">
                      <pre>
                        <code>{msg.code}</code>
                      </pre>
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

            {isSending && (
              <div className="flex gap-4 max-w-3xl">
                <div className="shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm animate-pulse">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <div className="bg-gray-100 rounded-2xl px-5 py-3 text-sm text-muted flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>MindMate is thinking...</span>
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
                  disabled={isSending}
                  onClick={() => handleChipClick(chip)}
                  className="px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium hover:border-primary hover:text-primary transition-colors text-muted shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={inputValue}
                disabled={isSending}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputValue);
                  }
                }}
                placeholder={
                  isSending
                    ? 'Waiting for MindMate...'
                    : quizMode
                    ? 'Type your answer to the quiz question...'
                    : 'Ask MindMate to explain, quiz you, or solve a problem...'
                }
                className="w-full resize-none rounded-xl border border-border bg-white pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[56px] max-h-[120px] shadow-sm disabled:bg-gray-50"
                rows={1}
              />
              <Button
                size="sm"
                className="absolute right-2 bottom-2 rounded-lg h-10 w-10 p-0"
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || isSending}
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
                <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">
                  Current Topic
                </p>
                <p className="font-medium text-dark flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" /> {activeTopic}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-medium">
                  <span className="text-muted uppercase tracking-wider font-semibold">Mastery</span>
                  <span className="text-primary">{activeMastery}%</span>
                </div>
                <ProgressBar value={activeMastery} className="h-1.5" />
              </div>

              <div>
                <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">
                  Level
                </p>
                <div className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  {activeMastery > 80 ? 'Advanced' : activeMastery > 50 ? 'Intermediate' : 'Beginner'}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">
                  Preferred Style
                </p>
                <p className="text-sm flex items-center gap-2 text-dark/80">
                  <BookOpen className="h-4 w-4 text-muted" /> {activeLearningStyle}
                </p>
              </div>

              {quizMode && (
                <div className="text-xs font-medium text-primary bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                  Quiz questions answered: {quizQuestionCount}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5 bg-indigo-50 border-indigo-100">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2 text-primary">
              <GitPullRequest className="h-4 w-4" /> Adaptive Action
            </h3>
            <p className="text-xs text-dark/80 leading-relaxed">
              MindMate noticed your learning style is {activeLearningStyle}. The explanations and practice are tailored to clarify your knowledge gaps.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
