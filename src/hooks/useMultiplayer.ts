import { useEffect, useState, useCallback } from 'react';
import { supabase, Sala, GameAction } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Verificar se o Supabase está configurado
const isSupabaseConfigured = () => {
  try {
    return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  } catch {
    return false;
  }
};

export function useMultiplayer(salaId: string | null) {
  const [sala, setSala] = useState<Sala | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se o Supabase não estiver configurado, retornar valores padrão
  if (!isSupabaseConfigured()) {
    return {
      sala: null,
      loading: false,
      error: null,
      criarSala: async () => null,
      entrarSala: async () => null,
      executarAcao: async () => {},
      fetchSala: async () => {},
    };
  }

  // Buscar dados da sala
  const fetchSala = useCallback(async () => {
    if (!salaId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salas')
        .select('*')
        .eq('id', salaId)
        .single();

      if (error) throw error;
      setSala(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar sala');
      console.error('Erro ao buscar sala:', err);
    } finally {
      setLoading(false);
    }
  }, [salaId]);

  // Criar nova sala
  const criarSala = useCallback(async (codigo: string, nomeJogador: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salas')
        .insert({
          codigo,
          jogador1_nome: nomeJogador,
          jogo_ativo: false,
          jogador1_pontos: 0,
          jogador2_pontos: 0,
          bola_direcao: 'indo_j1',
          bola_movendo: false,
          timer_ativo: false,
          pode_rebater: false,
          vencedor: null,
        })
        .select()
        .single();

      if (error) throw error;
      setSala(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar sala');
      console.error('Erro ao criar sala:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Entrar em sala existente
  const entrarSala = useCallback(async (codigo: string, nomeJogador: string) => {
    try {
      setLoading(true);
      
      // Buscar sala pelo código
      const { data: salaExistente, error: fetchError } = await supabase
        .from('salas')
        .select('*')
        .eq('codigo', codigo)
        .single();

      if (fetchError) throw fetchError;

      // Verificar se há vaga
      if (salaExistente.jogador1_nome && salaExistente.jogador2_nome) {
        throw new Error('Sala cheia!');
      }

      // Atualizar sala com o novo jogador
      const updateData: Partial<Sala> = {};
      if (!salaExistente.jogador1_nome) {
        updateData.jogador1_nome = nomeJogador;
      } else if (!salaExistente.jogador2_nome) {
        updateData.jogador2_nome = nomeJogador;
      }

      const { data, error } = await supabase
        .from('salas')
        .update(updateData)
        .eq('id', salaExistente.id)
        .select()
        .single();

      if (error) throw error;
      setSala(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar na sala');
      console.error('Erro ao entrar na sala:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Executar ação do jogo
  const executarAcao = useCallback(async (actionType: GameAction['action_type'], playerName: string) => {
    if (!salaId) return;

    try {
      // Registrar ação
      await supabase
        .from('game_actions')
        .insert({
          sala_id: salaId,
          action_type: actionType,
          player_name: playerName,
          timestamp: new Date().toISOString(),
        });

      // Atualizar estado da sala baseado na ação
      let updateData: Partial<Sala> = {};

      switch (actionType) {
        case 'INICIAR_JOGO':
          updateData = {
            jogo_ativo: true,
            jogador1_pontos: 0,
            jogador2_pontos: 0,
            bola_direcao: Math.random() > 0.5 ? 'indo_j1' : 'indo_j2',
            bola_movendo: true,
            timer_ativo: true,
            pode_rebater: false,
            vencedor: null,
          };
          break;

        case 'REBATER':
          const novaDirecao = sala?.bola_direcao === 'indo_j1' ? 'indo_j2' : 'indo_j1';
          updateData = {
            bola_direcao: novaDirecao,
            bola_movendo: true,
            pode_rebater: false,
            timer_ativo: false,
          };
          break;

        case 'TIMEOUT_REBATER':
          const pontosJ1 = sala?.bola_direcao === 'indo_j1' ? (sala.jogador1_pontos || 0) : (sala.jogador1_pontos || 0) + 1;
          const pontosJ2 = sala?.bola_direcao === 'indo_j2' ? (sala.jogador2_pontos || 0) : (sala.jogador2_pontos || 0) + 1;
          
          const vencedor = pontosJ1 >= 13 ? sala?.jogador1_nome : 
                          pontosJ2 >= 13 ? sala?.jogador2_nome : null;

          updateData = {
            jogador1_pontos: pontosJ1,
            jogador2_pontos: pontosJ2,
            vencedor,
            jogo_ativo: !vencedor,
            bola_direcao: vencedor ? sala?.bola_direcao : (Math.random() > 0.5 ? 'indo_j1' : 'indo_j2'),
            bola_movendo: !vencedor,
            pode_rebater: false,
            timer_ativo: false,
          };
          break;

        case 'RESETAR_JOGO':
          updateData = {
            jogador1_pontos: 0,
            jogador2_pontos: 0,
            bola_direcao: Math.random() > 0.5 ? 'indo_j1' : 'indo_j2',
            jogo_ativo: true,
            vencedor: null,
            bola_movendo: true,
            timer_ativo: true,
            pode_rebater: false,
          };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        const { data, error } = await supabase
          .from('salas')
          .update(updateData)
          .eq('id', salaId)
          .select()
          .single();

        if (error) throw error;
        setSala(data);
      }
    } catch (err) {
      console.error('Erro ao executar ação:', err);
      toast({
        title: "Erro",
        description: "Falha ao executar ação do jogo",
        variant: "destructive",
      });
    }
  }, [salaId, sala]);

  // Escutar mudanças em tempo real
  useEffect(() => {
    if (!salaId) return;

    const channel = supabase
      .channel(`sala:${salaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'salas',
          filter: `id=eq.${salaId}`,
        },
        (payload) => {
          console.log('Mudança na sala:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setSala(payload.new as Sala);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_actions',
          filter: `sala_id=eq.${salaId}`,
        },
        (payload) => {
          console.log('Nova ação do jogo:', payload);
          // Atualizar sala quando houver nova ação
          fetchSala();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [salaId, fetchSala]);

  return {
    sala,
    loading,
    error,
    criarSala,
    entrarSala,
    executarAcao,
    fetchSala,
  };
} 