import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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
  
  // Estado da cena
  cena_atual: 'inicio' | 'sala' | 'jogo' | 'resultado';
  
  // Estado da bola e timer
  bola_movendo: boolean;
  timer_ativo: boolean;
  pode_rebater: boolean;
}

type GameAction =
  | { type: 'CRIAR_SALA'; codigo: string; nome_jogador: string }
  | { type: 'ENTRAR_SALA'; codigo: string; nome_jogador: string }
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
  cena_atual: 'inicio',
  bola_movendo: false,
  timer_ativo: false,
  pode_rebater: false,
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
      // Se não há jogador1, este jogador vira jogador1, senão vira jogador2
      const temJogador1 = Boolean(state.jogador1_nome);
      return {
        ...state,
        sala_codigo: action.codigo,
        jogador1_nome: temJogador1 ? state.jogador1_nome : action.nome_jogador,
        jogador2_nome: temJogador1 ? action.nome_jogador : state.jogador2_nome,
        cena_atual: 'sala',
      };
      
    case 'INICIAR_JOGO':
      return {
        ...state,
        jogador1_pontos: 0,
        jogador2_pontos: 0,
        bola_direcao: Math.random() > 0.5 ? 'indo_j1' : 'indo_j2',
        jogo_ativo: true,
        vencedor: null,
        cena_atual: 'jogo',
        bola_movendo: true,
        timer_ativo: true,
        pode_rebater: false,
      };
      
    case 'MOVER_BOLA':
      return {
        ...state,
        bola_movendo: false,
        pode_rebater: true,
        timer_ativo: true,
      };
      
    case 'REBATER':
      const nova_direcao = state.bola_direcao === 'indo_j1' ? 'indo_j2' : 'indo_j1';
      return {
        ...state,
        bola_direcao: nova_direcao,
        bola_movendo: true,
        pode_rebater: false,
        timer_ativo: false,
      };
      
    case 'TIMEOUT_REBATER':
      const pontos_j1 = state.bola_direcao === 'indo_j1' ? state.jogador1_pontos : state.jogador1_pontos + 1;
      const pontos_j2 = state.bola_direcao === 'indo_j2' ? state.jogador2_pontos : state.jogador2_pontos + 1;
      
      const vencedor = pontos_j1 >= 13 ? state.jogador1_nome : 
                      pontos_j2 >= 13 ? state.jogador2_nome : null;
      
      if (vencedor) {
        return {
          ...state,
          jogador1_pontos: pontos_j1,
          jogador2_pontos: pontos_j2,
          vencedor,
          jogo_ativo: false,
          cena_atual: 'resultado',
          bola_movendo: false,
          pode_rebater: false,
          timer_ativo: false,
        };
      }
      
      return {
        ...state,
        jogador1_pontos: pontos_j1,
        jogador2_pontos: pontos_j2,
        bola_direcao: Math.random() > 0.5 ? 'indo_j1' : 'indo_j2',
        bola_movendo: true,
        pode_rebater: false,
        timer_ativo: false,
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
      
    case 'VOLTAR_INICIO':
      return {
        ...initialState,
        cena_atual: 'inicio',
      };
      
    case 'RESETAR_JOGO':
      return {
        ...state,
        jogador1_pontos: 0,
        jogador2_pontos: 0,
        bola_direcao: Math.random() > 0.5 ? 'indo_j1' : 'indo_j2',
        jogo_ativo: true,
        vencedor: null,
        cena_atual: 'jogo',
        bola_movendo: true,
        timer_ativo: true,
        pode_rebater: false,
      };
      
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}