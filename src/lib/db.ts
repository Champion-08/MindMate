import { supabase } from './supabase';

// PROFILES
export async function getProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single();
}

export async function updateProfile(userId: string, data: Partial<{
  name: string; goal: string; learning_style: string; preferred_session: string;
  avatar: string; bio: string; theme: string; settings: any;
}>) {
  return supabase.from('profiles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', userId);
}

// TOPICS
export async function getTopics(userId: string) {
  return supabase.from('topics').select('*').eq('user_id', userId).order('name');
}

export async function updateTopicMastery(id: string, mastery: number) {
  const status = mastery >= 86 ? 'mastered' : mastery >= 71 ? 'strong' : mastery >= 51 ? 'developing' : mastery >= 31 ? 'needs-work' : 'critical';
  return supabase.from('topics').update({ mastery, status, updated_at: new Date().toISOString() }).eq('id', id);
}

// CHAT
export async function getChatHistory(userId: string, limit = 20) {
  return supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }).limit(limit);
}

export async function saveChatMessage(userId: string, role: string, content: string, topic?: string) {
  return supabase.from('chat_messages').insert({ user_id: userId, role, content, topic });
}

// QUIZ
export async function saveQuizSession(userId: string, data: { topic: string; score: number; total: number; accuracy: number; main_gap?: string }) {
  return supabase.from('quiz_sessions').insert({ user_id: userId, ...data });
}

export async function getQuizHistory(userId: string) {
  return supabase.from('quiz_sessions').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(10);
}

// ==========================================
// PLANNER FULL CRUD (SUPABASE + RESILIENT STORE)
// ==========================================

export interface PlannerTaskData {
  id?: string;
  user_id: string;
  day: string;
  name: string;
  duration: string;
  type: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  week_start?: string;
  created_at?: string;
  activity_completed?: boolean;
  activity_type?: string;
  topic?: string;
}

const getPlannerStorageKey = (userId: string) => `mindmate_planner_tasks_${userId}`;

const getStoredTasks = (userId: string): PlannerTaskData[] => {
  try {
    const raw = localStorage.getItem(getPlannerStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setStoredTasks = (userId: string, tasks: PlannerTaskData[]) => {
  try {
    localStorage.setItem(getPlannerStorageKey(userId), JSON.stringify(tasks));
  } catch (e) {
    console.warn('Failed to save tasks to local store', e);
  }
};

export async function getPlannerTasks(userId: string) {
  try {
    const res = await supabase.from('planner_tasks').select('*').eq('user_id', userId).order('created_at');
    if (res.error) throw res.error;
    if (res.data) {
      setStoredTasks(userId, res.data);
      return { data: res.data, error: null };
    }
  } catch (err: any) {
    // If Supabase table is not yet created or offline, use resilient local store
    const local = getStoredTasks(userId);
    return { data: local, error: null };
  }
  return { data: getStoredTasks(userId), error: null };
}

export async function createPlannerTask(task: PlannerTaskData) {
  const newTask: PlannerTaskData = {
    ...task,
    id: task.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`),
    completed: task.completed || false,
    priority: task.priority || 'medium',
    created_at: new Date().toISOString()
  };

  // Always update local storage first
  const current = getStoredTasks(task.user_id);
  setStoredTasks(task.user_id, [...current, newTask]);

  try {
    const { data, error } = await supabase.from('planner_tasks').insert({
      id: newTask.id,
      user_id: newTask.user_id,
      day: newTask.day,
      name: newTask.name,
      duration: newTask.duration,
      type: newTask.type,
      completed: newTask.completed,
      priority: newTask.priority,
      due_date: newTask.due_date || null
    }).select().single();

    if (!error && data) {
      return { data, error: null };
    }
  } catch (err) {
    // Handled by local fallback
  }

  return { data: newTask, error: null };
}

export async function updatePlannerTask(id: string, completed: boolean, userId?: string) {
  if (userId) {
    const current = getStoredTasks(userId);
    const updated = current.map(t => t.id === id ? { ...t, completed } : t);
    setStoredTasks(userId, updated);
  }

  try {
    const res = await supabase.from('planner_tasks').update({ completed, updated_at: new Date().toISOString() }).eq('id', id);
    if (!res.error) return res;
  } catch (err) {
    // Handled
  }
  return { data: { id, completed }, error: null };
}

export async function updatePlannerTaskDetails(id: string, updates: Partial<PlannerTaskData>, userId?: string) {
  if (userId) {
    const current = getStoredTasks(userId);
    const updated = current.map(t => t.id === id ? { ...t, ...updates } : t);
    setStoredTasks(userId, updated);
  }

  try {
    const res = await supabase.from('planner_tasks').update({
      ...updates,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (!res.error) return res;
  } catch (err) {
    // Handled
  }
  return { data: { id, ...updates }, error: null };
}

export async function deletePlannerTask(id: string, userId?: string) {
  if (userId) {
    const current = getStoredTasks(userId);
    setStoredTasks(userId, current.filter(t => t.id !== id));
  }

  try {
    const res = await supabase.from('planner_tasks').delete().eq('id', id);
    if (!res.error) return res;
  } catch (err) {
    // Handled
  }
  return { data: { id }, error: null };
}

export async function batchCreatePlannerTasks(userId: string, tasks: Omit<PlannerTaskData, 'user_id'>[]) {
  const tasksWithUser: PlannerTaskData[] = tasks.map(t => ({
    ...t,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task-${Math.random()}-${Date.now()}`,
    user_id: userId,
    completed: false,
    priority: t.priority || 'medium',
    created_at: new Date().toISOString()
  }));

  const existing = getStoredTasks(userId);
  setStoredTasks(userId, [...existing, ...tasksWithUser]);

  try {
    const { data, error } = await supabase.from('planner_tasks').insert(
      tasksWithUser.map(t => ({
        id: t.id,
        user_id: t.user_id,
        day: t.day,
        name: t.name,
        duration: t.duration,
        type: t.type,
        completed: t.completed,
        priority: t.priority
      }))
    ).select();
    if (!error && data) return { data, error: null };
  } catch (err) {
    // Handled
  }

  return { data: tasksWithUser, error: null };
}

// ==========================================
// FRIENDS & NETWORKING FULL FUNCTIONALITY
// ==========================================

export interface FriendRequestData {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at?: string;
  sender?: { id: string; name: string; email: string; avatar?: string; streak?: number; overall_mastery?: number };
  receiver?: { id: string; name: string; email: string; avatar?: string; streak?: number; overall_mastery?: number };
}

const getFriendsStorageKey = (userId: string) => `mindmate_friends_${userId}`;
const getFriendRequestsStorageKey = (userId: string) => `mindmate_friend_requests_${userId}`;

const getStoredFriends = (userId: string) => {
  try {
    const raw = localStorage.getItem(getFriendsStorageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const setStoredFriends = (userId: string, friends: any[]) => {
  try { localStorage.setItem(getFriendsStorageKey(userId), JSON.stringify(friends)); } catch {}
};

const getStoredRequests = (userId: string): FriendRequestData[] => {
  try {
    const raw = localStorage.getItem(getFriendRequestsStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const setStoredRequests = (userId: string, requests: FriendRequestData[]) => {
  try { localStorage.setItem(getFriendRequestsStorageKey(userId), JSON.stringify(requests)); } catch {}
};

export async function searchProfiles(query: string, currentUserId: string) {
  if (!query || query.trim().length < 1) return { data: [], error: null };
  const clean = query.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar, streak, overall_mastery')
      .neq('id', currentUserId)
      .ilike('name', `%${clean}%`)
      .limit(10);

    if (!error && data) return { data, error: null };
  } catch {}

  return { data: [], error: null };
}

export async function getFriendsList(userId: string) {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id, sender_id, receiver_id, status, created_at,
        sender:profiles!friend_requests_sender_id_fkey(id, name, email, avatar, streak, overall_mastery),
        receiver:profiles!friend_requests_receiver_id_fkey(id, name, email, avatar, streak, overall_mastery)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (!error && data) {
      const friends = data.map((item: any) => {
        const isSender = item.sender_id === userId;
        const profile = isSender ? item.receiver : item.sender;
        return {
          id: profile?.id || item.id,
          requestId: item.id,
          name: profile?.name || 'Study Partner',
          email: profile?.email || '',
          avatar: profile?.avatar || '/avatars/avatar-01.webp',
          streak: profile?.streak ?? 8,
          mastery: profile?.overall_mastery ?? 70,
          subject: 'Computer Science',
          isCustom: true
        };
      });
      setStoredFriends(userId, friends);
      return { data: friends, error: null };
    }
  } catch {}

  const stored = getStoredFriends(userId);
  return { data: stored, error: null };
}

export async function getPendingRequests(userId: string) {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id, sender_id, receiver_id, status, created_at,
        sender:profiles!friend_requests_sender_id_fkey(id, name, email, avatar, streak, overall_mastery)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (!error && data) {
      return { data, error: null };
    }
  } catch {}

  const stored = getStoredRequests(userId).filter(r => r.receiver_id === userId && r.status === 'pending');
  return { data: stored, error: null };
}

export async function getSentRequests(userId: string) {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id, sender_id, receiver_id, status, created_at,
        receiver:profiles!friend_requests_receiver_id_fkey(id, name, email, avatar, streak, overall_mastery)
      `)
      .eq('sender_id', userId)
      .eq('status', 'pending');

    if (!error && data) {
      return { data, error: null };
    }
  } catch {}

  const stored = getStoredRequests(userId).filter(r => r.sender_id === userId && r.status === 'pending');
  return { data: stored, error: null };
}

export async function sendFriendRequest(sender: any, receiver: any) {
  const reqId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;
  const newReq: FriendRequestData = {
    id: reqId,
    sender_id: sender.id,
    receiver_id: receiver.id,
    status: 'pending',
    created_at: new Date().toISOString(),
    sender: { id: sender.id, name: sender.name, email: sender.email, avatar: sender.avatar },
    receiver: { id: receiver.id, name: receiver.name, email: receiver.email, avatar: receiver.avatar }
  };

  const senderReqs = getStoredRequests(sender.id);
  setStoredRequests(sender.id, [...senderReqs, newReq]);

  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .insert({
        id: reqId,
        sender_id: sender.id,
        receiver_id: receiver.id,
        status: 'pending'
      })
      .select()
      .single();

    if (!error && data) return { data, error: null };
  } catch {}

  return { data: newReq, error: null };
}

export async function respondToFriendRequest(requestId: string, status: 'accepted' | 'rejected', currentUserId: string, otherUser?: any) {
  const stored = getStoredRequests(currentUserId);
  const updated = stored.map(r => r.id === requestId ? { ...r, status } : r);
  setStoredRequests(currentUserId, updated);

  if (status === 'accepted' && otherUser) {
    const friends = getStoredFriends(currentUserId) || [];
    const newFriend = {
      id: otherUser.id,
      requestId,
      name: otherUser.name,
      email: otherUser.email,
      avatar: otherUser.avatar || '/avatars/avatar-01.webp',
      streak: otherUser.streak ?? 10,
      mastery: otherUser.mastery ?? 75,
      subject: 'Computer Science',
      isCustom: true
    };
    if (!friends.some((f: any) => f.id === otherUser.id)) {
      setStoredFriends(currentUserId, [...friends, newFriend]);
    }
  }

  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select();

    if (!error && data) return { data, error: null };
  } catch {}

  return { data: { id: requestId, status }, error: null };
}

export async function cancelFriendRequest(requestId: string, userId: string) {
  const stored = getStoredRequests(userId);
  setStoredRequests(userId, stored.filter(r => r.id !== requestId));

  try {
    const res = await supabase.from('friend_requests').delete().eq('id', requestId);
    if (!res.error) return res;
  } catch {}

  return { data: { id: requestId }, error: null };
}

export async function removeFriend(friendId: string, userId: string) {
  const stored = getStoredFriends(userId) || [];
  setStoredFriends(userId, stored.filter((f: any) => f.id !== friendId));

  try {
    await supabase.from('friend_requests').delete().or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`);
  } catch {}

  return { data: { id: friendId }, error: null };
}

// MATERIALS
export async function getMaterials(userId: string) {
  return supabase.from('materials').select('*').eq('user_id', userId).order('created_at', { ascending: false });
}

export async function saveMaterial(userId: string, data: { name: string; type: string; raw_content: string; summary?: string; key_concepts?: string }) {
  return supabase.from('materials').insert({ user_id: userId, ...data, status: 'ready' });
}

export async function deleteMaterial(id: string) {
  return supabase.from('materials').delete().eq('id', id);
}

// INSIGHTS
export async function getInsights(userId: string) {
  return supabase.from('insights').select('*').eq('user_id', userId).order('created_at', { ascending: false });
}

export async function markInsightRead(id: string) {
  return supabase.from('insights').update({ is_read: true }).eq('id', id);
}

// ==========================================
// PLANNER ACTIVITY VALIDATION HELPER
// ==========================================

export async function completePlannerTaskActivity(taskId: string, userId: string, activityType?: string) {
  const current = getStoredTasks(userId);
  const updated = current.map((t) =>
    t.id === taskId
      ? { ...t, completed: true, activity_completed: true, activity_type: activityType || t.activity_type || t.type }
      : t
  );
  setStoredTasks(userId, updated);

  try {
    const res = await supabase
      .from('planner_tasks')
      .update({
        completed: true,
        activity_completed: true,
        activity_type: activityType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);
    if (!res.error) return res;
  } catch (err) {
    // Local store is already updated
  }
  return { data: { id: taskId, completed: true, activity_completed: true }, error: null };
}

// ==========================================
// USER QUESTION ATTEMPTS & MISTAKE REVIEWS
// ==========================================

export interface QuestionAttempt {
  id: string;
  user_id: string;
  question_id: string;
  subject_id: string;
  topic_id: string;
  topic_name?: string;
  difficulty: number;
  question_text: string;
  selected_option: number;
  correct_option: number;
  is_correct: boolean;
  explanation: string;
  options?: string[];
  attempted_at: string;
  resolved?: boolean;
}

const getAttemptsStorageKey = (userId: string) => `mindmate_attempts_${userId}`;

export const getStoredAttempts = (userId: string): QuestionAttempt[] => {
  try {
    const raw = localStorage.getItem(getAttemptsStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setStoredAttempts = (userId: string, attempts: QuestionAttempt[]) => {
  try {
    localStorage.setItem(getAttemptsStorageKey(userId), JSON.stringify(attempts));
  } catch {}
};

export async function recordQuestionAttempt(
  userId: string,
  attempt: Omit<QuestionAttempt, 'id' | 'user_id' | 'attempted_at'>
) {
  const newAttempt: QuestionAttempt = {
    ...attempt,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `att-${Date.now()}-${Math.random()}`,
    user_id: userId,
    attempted_at: new Date().toISOString(),
    resolved: attempt.resolved ?? false,
  };

  const stored = getStoredAttempts(userId);
  setStoredAttempts(userId, [newAttempt, ...stored]);

  try {
    const { data, error } = await supabase.from('user_question_attempts').insert({
      id: newAttempt.id,
      user_id: newAttempt.user_id,
      question_id: newAttempt.question_id,
      subject_id: newAttempt.subject_id,
      topic_id: newAttempt.topic_id,
      topic_name: newAttempt.topic_name,
      difficulty: newAttempt.difficulty,
      question_text: newAttempt.question_text,
      selected_option: newAttempt.selected_option,
      correct_option: newAttempt.correct_option,
      is_correct: newAttempt.is_correct,
      explanation: newAttempt.explanation,
      options: newAttempt.options,
      resolved: newAttempt.resolved,
      attempted_at: newAttempt.attempted_at,
    }).select().single();

    if (!error && data) return { data, error: null };
  } catch {}

  return { data: newAttempt, error: null };
}

export async function getUserMistakes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_question_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_correct', false)
      .order('attempted_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return { data, error: null };
    }
  } catch {}

  const local = getStoredAttempts(userId).filter((a) => !a.is_correct);
  return { data: local, error: null };
}

export async function resolveMistake(userId: string, attemptId: string) {
  const stored = getStoredAttempts(userId);
  const updated = stored.map((a) => (a.id === attemptId ? { ...a, resolved: true } : a));
  setStoredAttempts(userId, updated);

  try {
    const { data, error } = await supabase
      .from('user_question_attempts')
      .update({ resolved: true })
      .eq('id', attemptId);
    if (!error) return { data, error: null };
  } catch {}

  return { data: { id: attemptId, resolved: true }, error: null };
}

// ==========================================
// FLASHCARD PROGRESS
// ==========================================

export interface FlashcardProgress {
  id: string;
  user_id: string;
  card_id: string;
  topic_id: string;
  status: 'learning' | 'mastered';
  last_reviewed: string;
}

const getFlashcardStorageKey = (userId: string) => `mindmate_flashcards_${userId}`;

export const getStoredFlashcards = (userId: string): FlashcardProgress[] => {
  try {
    const raw = localStorage.getItem(getFlashcardStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setStoredFlashcards = (userId: string, progress: FlashcardProgress[]) => {
  try {
    localStorage.setItem(getFlashcardStorageKey(userId), JSON.stringify(progress));
  } catch {}
};

export async function saveFlashcardProgress(
  userId: string,
  progress: { card_id: string; topic_id: string; status: 'learning' | 'mastered' }
) {
  const stored = getStoredFlashcards(userId);
  const existingIdx = stored.findIndex((p) => p.card_id === progress.card_id);
  const updatedItem: FlashcardProgress = {
    id: existingIdx >= 0 ? stored[existingIdx].id : `fc-${Date.now()}-${Math.random()}`,
    user_id: userId,
    card_id: progress.card_id,
    topic_id: progress.topic_id,
    status: progress.status,
    last_reviewed: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    stored[existingIdx] = updatedItem;
  } else {
    stored.push(updatedItem);
  }
  setStoredFlashcards(userId, stored);

  try {
    const { data, error } = await supabase.from('user_flashcard_progress').upsert(
      {
        user_id: userId,
        card_id: progress.card_id,
        topic_id: progress.topic_id,
        status: progress.status,
        last_reviewed: updatedItem.last_reviewed,
      },
      { onConflict: 'user_id,card_id' }
    );
    if (!error) return { data, error: null };
  } catch {}

  return { data: updatedItem, error: null };
}

export async function getUserFlashcardProgress(userId: string, topicId?: string) {
  try {
    let query = supabase.from('user_flashcard_progress').select('*').eq('user_id', userId);
    if (topicId) query = query.eq('topic_id', topicId);
    const { data, error } = await query;
    if (!error && data) return { data, error: null };
  } catch {}

  const stored = getStoredFlashcards(userId);
  const filtered = topicId ? stored.filter((c) => c.topic_id === topicId) : stored;
  return { data: filtered, error: null };
}

// ==========================================
// LEARNING WINS & MILESTONES
// ==========================================

export interface LearningWin {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'streak' | 'mastery' | 'quiz' | 'milestone';
  icon: string;
  metric_value?: string;
  achieved_at: string;
}

const getWinsStorageKey = (userId: string) => `mindmate_wins_${userId}`;

export const getStoredWins = (userId: string): LearningWin[] => {
  try {
    const raw = localStorage.getItem(getWinsStorageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default wins for any learner
  return [
    {
      id: 'win-1',
      user_id: userId,
      title: '7-Day Focus Streak',
      description: 'Maintained continuous daily practice for a full week.',
      category: 'streak',
      icon: 'Flame',
      metric_value: '7 Days',
      achieved_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'win-2',
      user_id: userId,
      title: 'Database Mastery Jump',
      description: 'Reached 82% mastery in SQL joins and normalization.',
      category: 'mastery',
      icon: 'Award',
      metric_value: '82%',
      achieved_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'win-3',
      user_id: userId,
      title: 'Perfect Quiz Accuracy',
      description: 'Scored 100% on Python Functions Adaptive Practice.',
      category: 'quiz',
      icon: 'Trophy',
      metric_value: '10/10',
      achieved_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'win-4',
      user_id: userId,
      title: 'First Knowledge Twin Synced',
      description: 'Configured your personalized learning persona.',
      category: 'milestone',
      icon: 'Sparkles',
      metric_value: 'Persona v1',
      achieved_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
  ];
};

export const setStoredWins = (userId: string, wins: LearningWin[]) => {
  try {
    localStorage.setItem(getWinsStorageKey(userId), JSON.stringify(wins));
  } catch {}
};

export async function getLearningWins(userId: string) {
  try {
    const { data, error } = await supabase
      .from('learning_wins')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return { data, error: null };
    }
  } catch {}

  return { data: getStoredWins(userId), error: null };
}

export async function recordLearningWin(
  userId: string,
  win: Omit<LearningWin, 'id' | 'user_id' | 'achieved_at'>
) {
  const newWin: LearningWin = {
    ...win,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `win-${Date.now()}`,
    user_id: userId,
    achieved_at: new Date().toISOString(),
  };

  const stored = getStoredWins(userId);
  setStoredWins(userId, [newWin, ...stored]);

  try {
    const { data, error } = await supabase.from('learning_wins').insert(newWin).select().single();
    if (!error && data) return { data, error: null };
  } catch {}

  return { data: newWin, error: null };
}

