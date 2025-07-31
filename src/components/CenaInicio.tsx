import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGame } from '@/contexts/GameContext';
import { Gamepad2, Users, Zap, Globe } from 'lucide-react';

export function CenaInicio() {
  const { state, multiplayerActions } = useGame();
  const [codigoSala, setCodigoSala] = useState('');
  const [nomeJogador, setNomeJogador] = useState('');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCriarSala = async () => {
    if (!nomeJogador.trim()) {
      setError('Digite seu nome!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      if (isMultiplayer && multiplayerActions) {
        await multiplayerActions.criarSalaMultiplayer(codigo, nomeJogador);
      } else {
        // Modo local
        const { dispatch } = useGame();
        dispatch({ type: 'CRIAR_SALA', codigo, nome_jogador: nomeJogador });
      }
    } catch (err) {
      setError('Erro ao criar sala. Tente novamente.');
      console.error('Erro ao criar sala:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEntrarSala = async () => {
    if (!codigoSala.trim() || !nomeJogador.trim()) {
      setError('Digite o código da sala e seu nome!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isMultiplayer && multiplayerActions) {
        await multiplayerActions.entrarSalaMultiplayer(codigoSala, nomeJogador);
      } else {
        // Modo local
        const { dispatch } = useGame();
        dispatch({ type: 'ENTRAR_SALA', codigo: codigoSala, nome_jogador: nomeJogador });
      }
    } catch (err) {
      setError('Erro ao entrar na sala. Verifique o código.');
      console.error('Erro ao entrar na sala:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasSupabaseConfig = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/50 backdrop-blur border-white/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="w-12 h-12 text-blue-400 mr-3" />
            <CardTitle className="text-3xl font-bold text-white">
              Smash Room Tennis
            </CardTitle>
          </div>
          <p className="text-white/70">
            O melhor jogo de ping pong multiplayer!
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Modo de Jogo */}
          <div className="space-y-3">
            <Label className="text-white font-semibold">Modo de Jogo:</Label>
            <div className="flex gap-2">
              <Button
                variant={!isMultiplayer ? "default" : "outline"}
                onClick={() => setIsMultiplayer(false)}
                className="flex-1"
                disabled={loading}
              >
                <Users className="w-4 h-4 mr-2" />
                Local
              </Button>
              <Button
                variant={isMultiplayer ? "default" : "outline"}
                onClick={() => setIsMultiplayer(true)}
                className="flex-1"
                disabled={loading || !hasSupabaseConfig}
              >
                <Globe className="w-4 h-4 mr-2" />
                Multiplayer
              </Button>
            </div>
            
            {isMultiplayer && !hasSupabaseConfig && (
              <div className="text-yellow-400 text-sm bg-yellow-900/20 p-2 rounded">
                ⚠️ Multiplayer requer configuração do Supabase
              </div>
            )}
            
            {!isMultiplayer && (
              <div className="text-blue-400 text-sm bg-blue-900/20 p-2 rounded">
                💡 Modo local: Jogue no mesmo computador
              </div>
            )}
          </div>

          {/* Nome do Jogador */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-white">
              Seu Nome:
            </Label>
            <Input
              id="nome"
              type="text"
              placeholder="Digite seu nome"
              value={nomeJogador}
              onChange={(e) => setNomeJogador(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              disabled={loading}
            />
          </div>

          {/* Código da Sala */}
          <div className="space-y-2">
            <Label htmlFor="codigo" className="text-white">
              Código da Sala:
            </Label>
            <Input
              id="codigo"
              type="text"
              placeholder="Digite o código da sala"
              value={codigoSala}
              onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 uppercase"
              disabled={loading}
            />
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="space-y-3">
            <Button
              onClick={handleCriarSala}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold"
              disabled={loading || !nomeJogador.trim()}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </div>
              ) : (
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Criar Nova Sala
                </div>
              )}
            </Button>

            <Button
              onClick={handleEntrarSala}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
              disabled={loading || !codigoSala.trim() || !nomeJogador.trim()}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Entrar na Sala
                </div>
              )}
            </Button>
          </div>

          {/* Instruções */}
          <div className="text-white/60 text-sm space-y-2">
            <div className="flex items-center">
              <Gamepad2 className="w-4 h-4 mr-2" />
              <span>Controles: W/S (J1) e ↑/↓ (J2)</span>
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              <span>Pressione ESPAÇO para rebater</span>
            </div>
            {isMultiplayer && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                <span>Compartilhe o código para jogar online</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}