import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  profiles: {
    id: string; name: string; email: string; goal: string | null;
    learning_style: string; preferred_session: string;
    streak: number; overall_mastery: number; learning_efficiency: number;
    created_at: string; updated_at: string;
  };
};
