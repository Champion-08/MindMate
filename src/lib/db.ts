import { supabase } from './supabase';

// PROFILES
export async function getProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single();
}

export async function updateProfile(userId: string, data: Partial<{
  name: string; goal: string; learning_style: string; preferred_session: string;
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

// PLANNER
export async function getPlannerTasks(userId: string) {
  return supabase.from('planner_tasks').select('*').eq('user_id', userId).order('created_at');
}

export async function updatePlannerTask(id: string, completed: boolean) {
  return supabase.from('planner_tasks').update({ completed }).eq('id', id);
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
