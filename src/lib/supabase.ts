import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Types
export interface Participant {
  id: string;
  nickname: string;
  gender: 'male' | 'female';
  answers: Record<number, string>;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  male_id: string;
  female_id: string;
  similarity_score: number;
  category: string;
  revealed: boolean;
  created_at: string;
  // Joined data
  male?: Participant;
  female?: Participant;
}

export interface EventState {
  id: number;
  status: 'active' | 'matching' | 'revealing' | 'ended';
  matches_generated: boolean;
  updated_at: string;
}
