import React, { createContext, useContext, useReducer, ReactNode, useState, useEffect } from 'react';
import { useMultiplayer } from '@/hooks/useMultiplayer';

export interface GameState {
  // Jogadores
  jogador1_nome: string;
  jogador2_nome: string;
  jogador1_pontos: number;
  jogador2_pontos: number;
  
  // Estado do jogo
  bola_direcao: 'indo_j1' | 'indo_j2';
  jogo_ativo: boolean;
  vencedor: string | null;
  sala_codigo: string | null;
  sala_id: string | null;
  
  // Estado da cena
  cena_atual: 'inicio' | 'sala' | 'jogo' | 'resultado';
  
  // Estado da bola e timer
  bola_movendo: boolean;
  timer_ativo: boolean;
  pode_rebater: boolean;
  
  // Estado do multiplayer
  isMultiplayer: boolean;
  currentPlayer: string | null;
}

type GameAction =
  | { type: 'CRIAR_SALA'; codigo: string; nome_jogador: string }
  | { type: 'ENTRAR_SALA'; codigo: string; nome_jogador: string }
  | { type: 'CRIAR_SALA_MULTIPLAYER'; codigo: string; nome_jogador: string; sala_id: string }
  | { type: 'ENTRAR_SALA_MULTIPLAYER'; codigo: string; nome_jogador: string; sala_id: string }
  | { type: 'SYNC_MULTIPLAYER_STATE'; sala: Partial<GameState> }
  | { type: 'INICIAR_JOGO' }
  | { type: 'REBATER' }
  | { type: 'TIMEOUT_REBATER' }
  | { type: 'MOVER_BOLA' }
  | { type: 'RESETAR_JOGO' }
  | { type: 'VOLTAR_INICIO' }
  | { type: 'SET_TIMER_ATIVO'; ativo: boolean }
  | { type: 'SET_PODE_REBATER'; pode: boolean };

const initialState: GameState = {
  jogador1_nome: '',
  jogador2_nome: '',
  jogador1_pontos: 0,
  jogador2_pontos: 0,
  bola_direcao: 'indo_j1',
  jogo_ativo: false,
  vencedor: null,
  sala_codigo: null,
  sala_id: null,
  cena_atual: 'inicio',
  bola_movendo: false,
  timer_ativo: false,
  pode_rebater: false,
  isMultiplayer: false,
  currentPlayer: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CRIAR_SALA':
      return {
        ...state,
        sala_codigo: action.codigo,
        jogador1_nome: action.nome_jogador,
        cena_atual: 'sala',
      };
      
    case 'ENTRAR_SALA':
      // Para demo local - simula entrada na sala
      // Se não há jogador 1, este se torna o jogador 1
      // Se já há jogador 1, este se torna o jogador 2
      if (!state.jogador1_nome) {
        return {
          ...state,
          sala_codigo: action.codigo,
          jogador1_nome: action.nome_jogador,
          cena_atual: 'sala',
        };
      } else {
        return {
          ...state,
          sala_codigo: action.codigo,
          jogador2_nome: action.nome_jogador,
          cena_atual: 'sala',
        };
      }
      
    case 'CRIAR_SALA_MULTIPLAYER':
      return {
        ...state,
        sala_codigo: action.codigo,
        sala_id: action.sala_id,
        jogador1_nome: action.nome_jogador,
        currentPlayer: action.nome_jogador,
        isMultiplayer: true,
        cena_atual: 'sala',
      };
      
    case 'ENTRAR_SALA_MULTIPLAYER':
      return {
        ...state,
        sala_codigo: action.codigo,
        sala_id: action.sala_id,
        jogador2_nome: action.nome_jogador,
        currentPlayer: action.nome_jogador,
        isMultiplayer: true,
        cena_atual: 'sala',
      };
      
    case 'SYNC_MULTIPLAYER_STATE':
      return {
        ...state,
        ...action.sala,
      };
      
    case 'INICIAR_JOGO':
      return {
        ...state,
        jogo_ativo: true,
        bola_movendo: true,
        timer_ativo: true,
        pode_rebater: true,
        cena_atual: 'jogo',
      };
      
    case 'REBATER':
      return {
        ...state,
        bola_direcao: state.bola_direcao === 'indo_j1' ? 'indo_j2' : 'indo_j1',
        timer_ativo: true,
        pode_rebater: false,
      };
      
    case 'TIMEOUT_REBATER':
      // Calcular pontos baseado na direção da bola
      if (state.bola_direcao === 'indo_j1') {
        // Bola estava indo para jogador 1, então jogador 2 marca ponto
        return {
          ...state,
          jogador2_pontos: state.jogador2_pontos + 1,
          bola_direcao: 'indo_j1',
          timer_ativo: false,
          pode_rebater: false,
          bola_movendo: false,
        };
      } else {
        // Bola estava indo para jogador 2, então jogador 1 marca ponto
        return {
          ...state,
          jogador1_pontos: state.jogador1_pontos + 1,
          bola_direcao: 'indo_j2',
          timer_ativo: false,
          pode_rebater: false,
          bola_movendo: false,
        };
      }
      
    case 'MOVER_BOLA':
      return {
        ...state,
        bola_movendo: true,
        timer_ativo: true,
        pode_rebater: true,
      };
      
    case 'RESETAR_JOGO':
      return {
        ...state,
        jogador1_pontos: 0,
        jogador2_pontos: 0,
        bola_direcao: 'indo_j1',
        jogo_ativo: false,
        vencedor: null,
        bola_movendo: false,
        timer_ativo: false,
        pode_rebater: false,
      };
      
    case 'VOLTAR_INICIO':
      return {
        ...initialState,
      };
      
    case 'SET_TIMER_ATIVO':
      return {
        ...state,
        timer_ativo: action.ativo,
      };
      
    case 'SET_PODE_REBATER':
      return {
        ...state,
        pode_rebater: action.pode,
      };
      
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  multiplayerActions: {
    criarSalaMultiplayer: (codigo: string, nomeJogador: string) => Promise<void>;
    entrarSalaMultiplayer: (codigo: string, nomeJogador: string) => Promise<void>;
    executarAcaoMultiplayer: (actionType: 'REBATER' | 'TIMEOUT_REBATER' | 'INICIAR_JOGO' | 'RESETAR_JOGO') => Promise<void>;
  };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Verificar se Supabase está configurado
  const hasSupabaseConfig = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Hook multiplayer (condicional)
  const multiplayerHook = hasSupabaseConfig ? useMultiplayer(state.sala_id) : null;
  
  // Funções do multiplayer
  const multiplayerActions = {
    criarSalaMultiplayer: async (codigo: string, nomeJogador: string) => {
      if (hasSupabaseConfig && multiplayerHook) {
        try {
          const salaId = await multiplayerHook.criarSala(codigo, nomeJogador);
          if (salaId) {
            dispatch({ type: 'CRIAR_SALA_MULTIPLAYER', codigo, nome_jogador: nomeJogador, sala_id: salaId });
          }
        } catch (error) {
          console.error('Erro ao criar sala multiplayer:', error);
          // Fallback para modo local
          dispatch({ type: 'CRIAR_SALA', codigo, nome_jogador: nomeJogador });
        }
      } else {
        // Modo local
        dispatch({ type: 'CRIAR_SALA', codigo, nome_jogador: nomeJogador });
      }
    },
    
    entrarSalaMultiplayer: async (codigo: string, nomeJogador: string) => {
      if (hasSupabaseConfig && multiplayerHook) {
        try {
          const salaId = await multiplayerHook.entrarSala(codigo, nomeJogador);
          if (salaId) {
            dispatch({ type: 'ENTRAR_SALA_MULTIPLAYER', codigo, nome_jogador: nomeJogador, sala_id: salaId });
          }
        } catch (error) {
          console.error('Erro ao entrar na sala multiplayer:', error);
          // Fallback para modo local
          dispatch({ type: 'ENTRAR_SALA', codigo, nome_jogador: nomeJogador });
        }
      } else {
        // Modo local
        dispatch({ type: 'ENTRAR_SALA', codigo, nome_jogador: nomeJogador });
      }
    },
    
          executarAcaoMultiplayer: async (actionType: 'REBATER' | 'TIMEOUT_REBATER' | 'INICIAR_JOGO' | 'RESETAR_JOGO') => {
        if (hasSupabaseConfig && multiplayerHook && state.sala_id) {
          try {
            await multiplayerHook.executarAcao(actionType, state.currentPlayer || '');
          } catch (error) {
            console.error('Erro ao executar ação multiplayer:', error);
          }
        }
        // Sempre executar localmente também
        dispatch({ type: actionType });
      }
  };
  
  // Sincronizar estado com multiplayer
  useEffect(() => {
    if (hasSupabaseConfig && multiplayerHook && multiplayerHook.sala) {
      const salaData = multiplayerHook.sala;
      dispatch({
        type: 'SYNC_MULTIPLAYER_STATE',
        sala: {
          jogador1_nome: salaData.jogador1_nome || state.jogador1_nome,
          jogador2_nome: salaData.jogador2_nome || state.jogador2_nome,
          jogador1_pontos: salaData.jogador1_pontos || state.jogador1_pontos,
          jogador2_pontos: salaData.jogador2_pontos || state.jogador2_pontos,
          bola_direcao: salaData.bola_direcao || state.bola_direcao,
          jogo_ativo: salaData.jogo_ativo || state.jogo_ativo,
          bola_movendo: salaData.bola_movendo || state.bola_movendo,
          timer_ativo: salaData.timer_ativo || state.timer_ativo,
          pode_rebater: salaData.pode_rebater || state.pode_rebater,
        }
      });
    }
  }, [hasSupabaseConfig, multiplayerHook?.sala, state.sala_id]);
  
  return (
    <GameContext.Provider value={{ state, dispatch, multiplayerActions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}