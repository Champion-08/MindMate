import React, { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { friends as sampleFriends } from '../data/mockData';
import { Flame, Swords, Plus, Mail, MessageCircle, Trophy, Users, Gift, Copy, CheckCircle2, Clock3, Star, BookOpen, Medal } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

type Tab = 'friends' | 'battle' | 'rewards' | 'invite';
type Question = { question: string; options: string[]; correct: number; explanation: string };
type BattleHistory = { id: string; friend: string; yours: number; theirs: number; xp: number; date: string; result: 'Won' | 'Tie' | 'Practice' };

const questions: Question[] = [
  { question: 'Which data structure follows FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correct: 1, explanation: 'A queue follows First In, First Out (FIFO).' },
  { question: 'Which language is commonly used with React?', options: ['TypeScript', 'SQL only', 'Bash only', 'Assembly only'], correct: 0, explanation: 'React commonly uses JavaScript or TypeScript.' },
  { question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Utility', 'Control Program User', 'Central Print Unit'], correct: 0, explanation: 'CPU means Central Processing Unit.' },
  { question: 'Which one is a Python collection type?', options: ['list', 'compile', 'kernel', 'pixel'], correct: 0, explanation: 'A list stores an ordered collection of items in Python.' },
  { question: 'What is the main purpose of a database?', options: ['Store and organize data', 'Cool the CPU', 'Style a webpage', 'Increase screen brightness'], correct: 0, explanation: 'Databases store, organize, and retrieve data.' },
  { question: 'Which protocol is used to load secure websites?', options: ['FTP', 'HTTPS', 'SMTP', 'ARP'], correct: 1, explanation: 'HTTPS secures web communication using TLS.' },
  { question: 'What does AI stand for?', options: ['Automated Internet', 'Artificial Intelligence', 'Advanced Input', 'Applied Interface'], correct: 1, explanation: 'AI means Artificial Intelligence.' },
  { question: 'Which CSS property changes text size?', options: ['font-size', 'text-style', 'font-weight-only', 'letter-case'], correct: 0, explanation: 'The CSS font-size property controls text size.' },
  { question: 'Which SQL command reads data?', options: ['SELECT', 'PAINT', 'MOVE', 'DISPLAY-PIXEL'], correct: 0, explanation: 'SELECT retrieves rows from a database.' },
  { question: 'Which practice usually helps learning most?', options: ['Never reviewing', 'Spaced practice', 'Only guessing', 'Studying without breaks forever'], correct: 1, explanation: 'Spaced practice helps strengthen long-term memory.' },
];

const STORAGE_KEY = 'mindmate_study_together_v1';
const readSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { xp: 0, history: [], referralCount: 0, joinedInvites: [] };
  } catch { return { xp: 0, history: [], referralCount: 0, joinedInvites: [] }; }
};

export default function Friends() {
  const { showToast } = useAppContext();
  const [tab, setTab] = useState<Tab>('friends');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(readSaved);
  const [battleFriend, setBattleFriend] = useState<string | null>(null);
  const [battleIndex, setBattleIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [battleFinished, setBattleFinished] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }, [saved]);

  const referralCode = useMemo(() => {
    let code = localStorage.getItem('mindmate_referral_code');
    if (!code) {
      code = 'LEARN' + Math.random().toString(36).slice(2, 7).toUpperCase();
      localStorage.setItem('mindmate_referral_code', code);
    }
    return code;
  }, []);

  const filteredFriends = sampleFriends.filter((f: any) =>
    `${f.name} ${f.subject}`.toLowerCase().includes(query.toLowerCase())
  );

  const currentQuestion = questions[battleIndex];
  const userScore = answers.reduce((sum, answer, index) => sum + (answer === questions[index]?.correct ? 1 : 0), 0);
  const opponent = sampleFriends.find((f: any) => f.name === battleFriend);
  const opponentScore = opponent ? Math.max(0, Math.min(questions.length, Math.round((opponent.mastery / 100) * questions.length))) : 0;
  const xpEarned = userScore * 10 + (userScore > opponentScore ? 50 : userScore === opponentScore ? 20 : 0);
  const result = userScore > opponentScore ? 'Won' : userScore === opponentScore ? 'Tie' : 'Practice';

  const startBattle = (name: string) => {
    setBattleFriend(name);
    setBattleIndex(0);
    setAnswers([]);
    setSelected(null);
    setBattleFinished(false);
    setTab('battle');
    showToast(`Started battle with ${name}!`, 'info');
  };

  const nameFor = (name: string | null) => name || 'Study Partner';

  const submitAnswer = () => {
    if (selected === null) {
      showToast('Choose an answer first.', 'error');
      return;
    }
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (battleIndex === questions.length - 1) {
      const finalScore = nextAnswers.reduce((sum, answer, index) => sum + (answer === questions[index].correct ? 1 : 0), 0);
      const rival = opponent ? Math.max(0, Math.min(questions.length, Math.round((opponent.mastery / 100) * questions.length))) : 0;
      const earned = finalScore * 10 + (finalScore > rival ? 50 : finalScore === rival ? 20 : 0);
      const finalResult = finalScore > rival ? 'Won' : finalScore === rival ? 'Tie' : 'Practice';
      setSaved((old: any) => ({
        ...old,
        xp: (old.xp || 0) + earned,
        history: [{ id: `${Date.now()}`, friend: nameFor(battleFriend), yours: finalScore, theirs: rival, xp: earned, date: new Date().toLocaleDateString(), result: finalResult }, ...(old.history || [])].slice(0, 20),
      }));
      setBattleFinished(true);
    } else {
      setBattleIndex((i) => i + 1);
    }
  };

  const sendEmailInvite = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast('Enter a valid email address.', 'error');
      return;
    }
    const inviteUrl = `${window.location.origin}/register?ref=${referralCode}`;
    const subject = encodeURIComponent('Join me on MindMate and let’s learn together!');
    const body = encodeURIComponent(`Hi${inviteName.trim() ? ` ${inviteName.trim()}` : ''},\n\nI’m inviting you to join me on MindMate — an AI-powered learning space where we can practise, challenge each other, and earn learning XP.\n\nJoin here: ${inviteUrl}\nMy referral code: ${referralCode}\n\nOnce you join, let’s start a study challenge!\n\nSee you there.`);
    window.location.href = `mailto:${encodeURIComponent(email.trim())}?subject=${subject}&body=${body}`;
    showToast('Your email app opened with the invitation ready.', 'success');
  };

  const sendWhatsAppInvite = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      showToast('Enter a valid phone number including country code.', 'error');
      return;
    }
    const inviteUrl = `${window.location.origin}/register?ref=${referralCode}`;
    const message = encodeURIComponent(`Join me on MindMate! We can learn together, challenge each other and earn XP. Sign up here: ${inviteUrl} | Referral code: ${referralCode}`);
    window.open(`https://wa.me/${digits}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const copyReferral = async () => {
    const text = `${window.location.origin}/register?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Referral link copied!', 'success');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast(`Your referral code is ${referralCode}`, 'success');
    }
  };

  return (
    <AppShell pageTitle="Learn Together" pageSubtitle="Study with friends, challenge each other, and grow together">
      <div className="max-w-5xl space-y-6">
        <Card className="overflow-hidden border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="inline-flex rounded-2xl bg-white p-4 shadow-sm">
              <Swords className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="mb-2 text-2xl font-bold text-dark">Learn together. Win together.</h2>
              <p className="max-w-2xl text-dark/80">
                Invite friends, practise quick quizzes, earn XP, and celebrate progress together.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-primary">
                  <Star className="mr-1 inline h-4 w-4" />{saved.xp} XP earned
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-indigo-700">
                  <Trophy className="mr-1 inline h-4 w-4" />{saved.history?.length || 0} battles played
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {([
            { id: 'friends', label: 'Friends', icon: Users },
            { id: 'battle', label: 'Battle', icon: Swords },
            { id: 'rewards', label: 'XP & Rewards', icon: Medal },
            { id: 'invite', label: 'Invite Friends', icon: Gift },
          ] as const).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  tab === item.id ? 'bg-primary text-white' : 'bg-white text-muted hover:bg-gray-50 border border-border'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === 'friends' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-dark">Study partners</h3>
                <p className="text-sm text-muted">Search learners and start an adaptive battle.</p>
              </div>
              <Button onClick={() => setTab('invite')}>
                <Plus className="mr-2 h-4 w-4" /> Invite a Friend
              </Button>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or subject..."
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary text-dark"
            />
            <div className="grid gap-4">
              {filteredFriends.map((friend: any) => (
                <Card key={friend.id} className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <Avatar fallback={friend.avatar} size="lg" />
                    <div>
                      <h4 className="font-bold text-dark">{friend.name}</h4>
                      <p className="text-sm text-muted">Studying {friend.subject}</p>
                      <p className="mt-1 text-xs text-muted">Learner · {friend.mastery}% mastery</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-center">
                      <p className="mb-1 text-xs font-semibold uppercase text-muted">Streak</p>
                      <p className="flex items-center justify-center gap-1 font-bold text-orange-500">
                        <Flame className="h-4 w-4" />{friend.streak}
                      </p>
                    </div>
                    <Button onClick={() => startBattle(friend.name)}>
                      <Swords className="mr-2 h-4 w-4" /> Challenge
                    </Button>
                  </div>
                </Card>
              ))}
              {filteredFriends.length === 0 && (
                <Card className="p-6 text-center text-muted">
                  No sample learners match your search. Invite a friend to join MindMate!
                </Card>
              )}
            </div>
          </div>
        )}

        {tab === 'battle' && (
          <div className="space-y-4">
            {!battleFriend && (
              <Card className="p-6">
                <h3 className="mb-2 text-lg font-bold text-dark">Choose a study partner</h3>
                <p className="mb-4 text-sm text-muted">Start a 10-question practice battle against a peer.</p>
                <div className="flex flex-wrap gap-2">
                  {sampleFriends.map((f: any) => (
                    <Button key={f.id} variant="secondary" onClick={() => startBattle(f.name)}>
                      {f.name}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
            {battleFriend && !battleFinished && currentQuestion && (
              <Card className="p-5 md:p-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">PRACTICE BATTLE</p>
                    <h3 className="text-xl font-bold text-dark">You vs {battleFriend}</h3>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-primary">
                    <Clock3 className="mr-1 inline h-4 w-4" />Question {battleIndex + 1} / {questions.length}
                  </span>
                </div>
                <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${((battleIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <h4 className="mb-4 text-lg font-bold text-dark">{currentQuestion.question}</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={option}
                      onClick={() => setSelected(index)}
                      className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                        selected === index
                          ? 'border-primary bg-indigo-50 text-primary font-semibold'
                          : 'border-border bg-white text-dark hover:border-indigo-300'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  <Button variant="secondary" onClick={() => { setBattleFriend(null); setBattleFinished(false); }}>
                    Exit practice
                  </Button>
                  <Button onClick={submitAnswer}>
                    {battleIndex === questions.length - 1 ? 'Finish battle' : 'Submit & Next'}
                  </Button>
                </div>
              </Card>
            )}
            {battleFriend && battleFinished && (
              <Card className="p-6 md:p-8">
                <div className="mb-5 text-center">
                  <div className="mx-auto mb-3 inline-flex rounded-2xl bg-amber-50 p-4 text-amber-600">
                    <Trophy className="h-9 w-9" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-dark">
                    {result === 'Won' ? '🎉 You won the battle!' : result === 'Tie' ? '🤝 It’s a tie!' : '💪 Good practice — keep improving!'}
                  </h3>
                  <p className="mt-1 text-sm text-muted">Your practice result against {battleFriend}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-indigo-50 p-5 text-center">
                    <p className="text-sm font-semibold text-muted">Your score</p>
                    <p className="my-1 text-4xl font-extrabold text-primary">{userScore}/{questions.length}</p>
                    <p className="font-bold text-primary">+{xpEarned} XP total</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-5 text-center">
                    <p className="text-sm font-semibold text-muted">{battleFriend}'s score</p>
                    <p className="my-1 text-4xl font-extrabold text-amber-700">{opponentScore}/{questions.length}</p>
                    <p className="text-xs text-muted">Adaptive peer calculation</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <h4 className="font-bold text-emerald-800">
                    <BookOpen className="mr-2 inline h-5 w-5" />Learn from your answers
                  </h4>
                  <div className="mt-3 space-y-3">
                    {questions.map((q, i) => (
                      <div key={q.question} className="text-sm">
                        <p className="font-semibold text-dark">
                          {i + 1}. {q.question} {answers[i] === q.correct ? '✓' : '✗'}
                        </p>
                        <p className="text-muted">{q.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={() => startBattle(battleFriend)}>Play again</Button>
                  <Button variant="secondary" onClick={() => { setBattleFriend(null); setBattleFinished(false); setTab('friends'); }}>
                    Choose another friend
                  </Button>
                  <Button variant="secondary" onClick={() => setTab('rewards')}>View rewards</Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === 'rewards' && (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-amber-50 p-4 text-amber-600">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted">YOUR LEARNING XP</p>
                  <h3 className="text-3xl font-extrabold text-dark">{saved.xp} XP</h3>
                  <p className="text-sm text-muted">
                    {saved.xp >= 500 ? 'Scholar level' : saved.xp >= 200 ? 'Explorer level' : 'Beginner level'} · Keep learning to level up
                  </p>
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (saved.xp % 200) / 2)}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted">{200 - (saved.xp % 200)} XP to next milestone</p>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: 'Quick Learner', desc: 'Complete a practice battle', icon: BookOpen, unlocked: (saved.history?.length || 0) >= 1 },
                { title: 'Quiz Champion', desc: 'Score higher than opponent', icon: Trophy, unlocked: (saved.history || []).some((h: BattleHistory) => h.result === 'Won') },
                { title: 'Consistent Student', desc: 'Play 5 practice battles', icon: Flame, unlocked: (saved.history?.length || 0) >= 5 },
              ].map((b) => (
                <Card key={b.title} className={`p-5 ${b.unlocked ? 'border-amber-200 bg-amber-50/60' : 'opacity-70'}`}>
                  <b.icon className={`mb-3 h-7 w-7 ${b.unlocked ? 'text-amber-600' : 'text-muted'}`} />
                  <h4 className="font-bold text-dark">{b.title}</h4>
                  <p className="mt-1 text-sm text-muted">{b.desc}</p>
                  <p className={`mt-3 text-xs font-bold ${b.unlocked ? 'text-emerald-700' : 'text-muted'}`}>
                    {b.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                  </p>
                </Card>
              ))}
            </div>

            <Card className="p-5">
              <h3 className="mb-4 font-bold text-dark">Recent battle history</h3>
              {!saved.history || saved.history.length === 0 ? (
                <p className="text-sm text-muted">No battles yet. Start a practice battle to earn XP.</p>
              ) : (
                <div className="space-y-3">
                  {saved.history.map((h: BattleHistory) => (
                    <div key={h.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
                      <div>
                        <p className="font-semibold text-dark">vs {h.friend} · {h.result}</p>
                        <p className="text-xs text-muted">{h.date} · You {h.yours}/{questions.length}, opponent {h.theirs}/{questions.length}</p>
                      </div>
                      <span className="font-bold text-primary">+{h.xp} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === 'invite' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-primary"><Mail className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-bold text-dark">Invite by email</h3>
                  <p className="text-sm text-muted">Send a personalized invite link.</p>
                </div>
              </div>
              <label className="mb-1 block text-sm font-semibold text-dark">Friend’s name (optional)</label>
              <input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Friend's name"
                className="mb-3 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary text-dark"
              />
              <label className="mb-1 block text-sm font-semibold text-dark">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                className="mb-4 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary text-dark"
              />
              <Button className="w-full" onClick={sendEmailInvite}>
                <Mail className="mr-2 h-4 w-4" /> Prepare email invite
              </Button>
            </Card>

            <Card className="p-5 md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-green-50 p-3 text-green-700"><MessageCircle className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-bold text-dark">Invite by WhatsApp</h3>
                  <p className="text-sm text-muted">Share a learning invite via chat.</p>
                </div>
              </div>
              <label className="mb-1 block text-sm font-semibold text-dark">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Country code + number (e.g. 919876543210)"
                className="mb-4 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary text-dark"
              />
              <Button className="w-full" onClick={sendWhatsAppInvite}>
                <MessageCircle className="mr-2 h-4 w-4" /> Open WhatsApp invite
              </Button>
            </Card>

            <Card className="p-5 md:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <h3 className="font-bold text-dark">
                    <Gift className="mr-2 inline h-5 w-5 text-primary" />Your referral link
                  </h3>
                  <p className="mt-1 text-sm text-muted">Share this link so friends can register with your referral code.</p>
                  <p className="mt-3 break-all rounded-lg bg-gray-50 p-3 font-mono text-sm text-dark">
                    {`${window.location.origin}/register?ref=${referralCode}`}
                  </p>
                  <p className="mt-2 text-sm text-muted">Referral code: <strong className="text-dark">{referralCode}</strong></p>
                </div>
                <Button onClick={copyReferral}>
                  {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy referral link'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
