import React, { useState, useRef, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Avatar } from '../components/ui/Avatar';
import { Send, Sparkles, Code2, BookOpen, Brain, GitPullRequest } from 'lucide-react';
import { chatMessages as initialMessages, learner } from '../data/mockData';
import { cn } from '../utils';
import { apiGetChatHistory, apiSendMessage, ChatMessage } from '../services/api';
import { useAppContext } from '../context/AppContext';

const CHIPS = ['Explain differently', 'Simplify', 'Give example', 'Quiz me', 'Show visually'];

export default function Learn() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyRes = await apiGetChatHistory();
        const msgs = historyRes.data?.messages || (historyRes as any);
        if (Array.isArray(msgs)) {
          setMessages(msgs.slice(-10));
        } else {
          setMessages(initialMessages.slice(-10) as any);
        }
      } catch (e) {
        setMessages(initialMessages.slice(-10) as any);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setThinking(true);

    try {
      const response = await apiSendMessage({ content: text, topic: 'Python Functions' });
      const botMsg = response.data?.botMessage || (response as any);
      if (botMsg && botMsg.content) {
        setMessages((prev) => [...prev, botMsg as any]);
      }
    } catch (e) {
      const newAIMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Here's more on that. Since you're an ${learner.learningStyle} learner, I've adjusted this explanation for you.`,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, newAIMsg]);
    } finally {
      setThinking(false);
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Learn" pageSubtitle="Chat with your adaptive AI tutor">
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Learn" pageSubtitle="Chat with your adaptive AI tutor">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
        
        {/* Left side: Chat */}
        <div className="flex-1 flex flex-col bg-surface rounded-card border border-border shadow-sm overflow-hidden h-full">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-4 max-w-3xl", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                <div className="shrink-0 mt-1">
                  {msg.role === 'assistant' ? (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  ) : (
                    <Avatar fallback={user?.name ? user.name.substring(0, 2).toUpperCase() : 'AL'} size="sm" />
                  )}
                </div>
                <div className={cn("space-y-3", msg.role === 'user' ? "text-right" : "")}>
                  <div className={cn(
                    "inline-block rounded-2xl px-5 py-3 text-sm",
                    msg.role === 'user' ? "bg-primary text-white" : "bg-gray-100 text-dark"
                  )}>
                    {msg.content}
                  </div>
                  
                  {(msg as any).code && (
                    <div className="rounded-xl bg-slate-900 text-slate-50 p-4 font-mono text-sm overflow-x-auto w-full max-w-2xl text-left border border-slate-800">
                      <pre><code>{(msg as any).code}</code></pre>
                    </div>
                  )}
                  
                  {(msg as any).explanation && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-dark/80 text-left w-full max-w-2xl">
                      {(msg as any).explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
               <div className="flex gap-4 max-w-3xl">
                 <div className="shrink-0 mt-1">
                   <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                     <Sparkles className="h-4 w-4" />
                   </div>
                 </div>
                 <div className="space-y-3">
                   <div className="inline-block rounded-2xl px-5 py-3 text-sm bg-gray-100 text-dark flex items-center gap-2">
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                   </div>
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
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium hover:border-primary hover:text-primary transition-colors text-muted shadow-sm"
                  disabled={thinking}
                >
                  {chip}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputValue);
                  }
                }}
                placeholder="Ask MindMate to explain, quiz you, or solve a problem..."
                className="w-full resize-none rounded-xl border border-border bg-white pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[56px] max-h-[120px] shadow-sm"
                rows={1}
                disabled={thinking}
              />
              <Button
                size="sm"
                className="absolute right-2 bottom-2 rounded-lg h-10 w-10 p-0"
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || thinking}
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
                <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Current Topic</p>
                <p className="font-medium text-dark flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" /> Python Functions
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-medium">
                  <span className="text-muted uppercase tracking-wider font-semibold">Mastery</span>
                  <span className="text-primary">48%</span>
                </div>
                <ProgressBar value={48} className="h-1.5" />
              </div>

              <div>
                <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Level</p>
                <div className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  Intermediate
                </div>
              </div>

              <div>
                <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Preferred Style</p>
                <p className="text-sm flex items-center gap-2 text-dark/80">
                  <BookOpen className="h-4 w-4 text-muted" /> Examples first
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-indigo-50 border-indigo-100">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2 text-primary">
              <GitPullRequest className="h-4 w-4" /> Adaptive Action
            </h3>
            <p className="text-xs text-dark/80 leading-relaxed">
              MindMate noticed you're struggling with default arguments. The examples provided are tailored to clarify this specific gap.
            </p>
          </Card>
        </div>

      </div>
    </AppShell>
  );
}
