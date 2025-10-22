import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Configuração Supabase:', {
  url: supabaseUrl,
  keyConfigured: !!supabaseAnonKey,
  env: import.meta.env
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente Supabase não encontradas!');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          is_default: boolean;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          is_default?: boolean;
          type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          is_default?: boolean;
          type?: string;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          amount: number;
          description: string | null;
          category_name: string | null;
          date: string;
          type: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          description?: string | null;
          category_name?: string | null;
          date?: string;
          type: string;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          description?: string | null;
          category_name?: string | null;
          date?: string;
          type?: string;
          tags?: string[];
          created_at?: string;
        };
      };
      savings_goals: {
        Row: {
          id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      goal_contributions: {
        Row: {
          id: string;
          goal_id: string;
          amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          amount: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          amount?: number;
          description?: string | null;
          created_at?: string;
        };
      };
    };
  };
};