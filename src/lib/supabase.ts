import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Sala {
  id: string;
  codigo: string;
  jogador1_nome: string | null;
  jogador2_nome: string | null;
  jogo_ativo: boolean;
  jogador1_pontos: number;
  jogador2_pontos: number;
  bola_direcao: 'indo_j1' | 'indo_j2';
  bola_movendo: boolean;
  timer_ativo: boolean;
  pode_rebater: boolean;
  vencedor: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameAction {
  sala_id: string;
  action_type: 'REBATER' | 'TIMEOUT_REBATER' | 'INICIAR_JOGO' | 'RESETAR_JOGO';
  player_name: string;
  timestamp: string;
} 