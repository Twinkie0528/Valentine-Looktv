import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, Participant } from './supabase';
import { QUESTIONS } from './questions';

interface AppState {
  // Participant state
  participantId: string | null;
  nickname: string;
  gender: 'male' | 'female' | null;
  answers: Record<number, string>;
  currentQuestion: number;
  completed: boolean;
  
  // Actions
  setNickname: (name: string) => void;
  setGender: (gender: 'male' | 'female') => void;
  setAnswer: (questionId: number, answer: string) => void;
  nextQuestion: () => void;
  setCompleted: () => void;
  reset: () => void;
  
  // Database sync
  createParticipant: () => Promise<string | null>;
  syncAnswers: () => Promise<void>;
  markCompleted: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      participantId: null,
      nickname: '',
      gender: null,
      answers: {},
      currentQuestion: 0,
      completed: false,
      
      setNickname: (name) => set({ nickname: name }),
      setGender: (gender) => set({ gender }),
      
      setAnswer: (questionId, answer) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer }
        }));
        // Auto-sync to database
        get().syncAnswers();
      },
      
      nextQuestion: () => {
        const state = get();
        if (state.currentQuestion < QUESTIONS.length - 1) {
          set({ currentQuestion: state.currentQuestion + 1 });
        }
      },
      
      setCompleted: () => set({ completed: true }),
      
      reset: () => set({
        participantId: null,
        nickname: '',
        gender: null,
        answers: {},
        currentQuestion: 0,
        completed: false,
      }),
      
      createParticipant: async () => {
        const { nickname, gender } = get();
        if (!nickname || !gender) return null;
        
        try {
          const { data, error } = await supabase
            .from('participants')
            .insert({
              nickname,
              gender,
              answers: {},
              completed: false,
            })
            .select()
            .single();
          
          if (error) throw error;
          
          set({ participantId: data.id });
          return data.id;
        } catch (error) {
          console.error('Error creating participant:', error);
          return null;
        }
      },
      
      syncAnswers: async () => {
        const { participantId, answers } = get();
        if (!participantId) return;
        
        try {
          await supabase
            .from('participants')
            .update({ answers })
            .eq('id', participantId);
        } catch (error) {
          console.error('Error syncing answers:', error);
        }
      },
      
      markCompleted: async () => {
        const { participantId, answers } = get();
        if (!participantId) return;
        
        try {
          await supabase
            .from('participants')
            .update({ 
              answers,
              completed: true 
            })
            .eq('id', participantId);
          
          set({ completed: true });
        } catch (error) {
          console.error('Error marking completed:', error);
        }
      },
    }),
    {
      name: 'matchnight-storage',
      partialize: (state) => ({
        participantId: state.participantId,
        nickname: state.nickname,
        gender: state.gender,
        answers: state.answers,
        currentQuestion: state.currentQuestion,
        completed: state.completed,
      }),
    }
  )
);
