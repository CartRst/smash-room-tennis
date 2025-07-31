import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function CenaInicio() {
  const { state, dispatch, multiplayerActions } = useGame();
  const [nomeJogador, setNomeJogador] = useState('');
  const [codigoSala, setCodigoSala] = useState('');
  const [showCriarSala, setShowCriarSala] = useState(false);
  const [showEntrarSala, setShowEntrarSala] = useState(false);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [loading, setLoading] = useState(false);

  const gerarCodigoSala = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCriarSala = async () => {
    if (!nomeJogador.trim()) {
      alert('Por favor, digite seu nome!');
      return;
    }

    setLoading(true);
    try {
      const codigo = gerarCodigoSala();
      console.log('Criando sala:', codigo, 'com jogador:', nomeJogador.trim());
      
      if (isMultiplayer && multiplayerActions) {
        await multiplayerActions.criarSalaMultiplayer(codigo, nomeJogador.trim());
      } else {
        dispatch({ type: 'CRIAR_SALA', codigo, nome_jogador: nomeJogador.trim() });
      }
      
      setShowCriarSala(false);
      setNomeJogador('');
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      alert('Erro ao criar sala. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEntrarSala = async () => {
    if (!nomeJogador.trim() || !codigoSala.trim()) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    setLoading(true);
    try {
      console.log('Entrando na sala:', codigoSala.trim(), 'com jogador:', nomeJogador.trim());
      
      if (isMultiplayer && multiplayerActions) {
        await multiplayerActions.entrarSalaMultiplayer(codigoSala.trim(), nomeJogador.trim());
      } else {
        dispatch({ type: 'ENTRAR_SALA', codigo: codigoSala.trim(), nome_jogador: nomeJogador.trim() });
      }
      
      setShowEntrarSala(false);
      setNomeJogador('');
      setCodigoSala('');
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      alert('Erro ao entrar na sala. Verifique o código e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <span className="text-3xl">🏓</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Smash Room Tennis
          </CardTitle>
          <CardDescription className="text-lg">
            Jogue ping pong online com seus amigos!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Toggle Multiplayer */}
          <div className="flex items-center justify-center gap-3 p-4 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">🌐 Multiplayer Real</span>
            <button
              onClick={() => setIsMultiplayer(!isMultiplayer)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isMultiplayer ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isMultiplayer ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs text-muted-foreground">
              {isMultiplayer ? 'Ativado' : 'Desativado'}
            </span>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <Dialog open={showCriarSala} onOpenChange={setShowCriarSala}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  disabled={loading}
                >
                  🎮 Criar Nova Sala
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Sala</DialogTitle>
                  <DialogDescription>
                    Digite seu nome para criar uma nova sala de jogo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome-criar">Seu Nome</Label>
                    <Input
                      id="nome-criar"
                      value={nomeJogador}
                      onChange={(e) => setNomeJogador(e.target.value)}
                      placeholder="Digite seu nome"
                      onKeyPress={(e) => e.key === 'Enter' && handleCriarSala()}
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    onClick={handleCriarSala} 
                    className="w-full"
                    disabled={loading || !nomeJogador.trim()}
                  >
                    {loading ? 'Criando...' : 'Criar Sala'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showEntrarSala} onOpenChange={setShowEntrarSala}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-lg font-semibold border-2 border-green-500/30 hover:border-green-500 hover:bg-green-50"
                  disabled={loading}
                >
                  🔗 Entrar em Sala Existente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Entrar em Sala</DialogTitle>
                  <DialogDescription>
                    Digite o código da sala e seu nome para entrar
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="codigo">Código da Sala</Label>
                    <Input
                      id="codigo"
                      value={codigoSala}
                      onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
                      placeholder="Digite o código (ex: ABC123)"
                      onKeyPress={(e) => e.key === 'Enter' && handleEntrarSala()}
                      disabled={loading}
                      maxLength={6}
                      className="uppercase tracking-wider"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nome-entrar">Seu Nome</Label>
                    <Input
                      id="nome-entrar"
                      value={nomeJogador}
                      onChange={(e) => setNomeJogador(e.target.value)}
                      placeholder="Digite seu nome"
                      onKeyPress={(e) => e.key === 'Enter' && handleEntrarSala()}
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    onClick={handleEntrarSala} 
                    className="w-full"
                    disabled={loading || !nomeJogador.trim() || !codigoSala.trim()}
                  >
                    {loading ? 'Entrando...' : 'Entrar na Sala'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Informações */}
          <div className="text-center text-sm text-muted-foreground">
            <p>🎯 Primeiro a 13 pontos vence!</p>
            <p>⏱️ Você tem 3 segundos para rebater</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}