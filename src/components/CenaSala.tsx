import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function CenaSala() {
  const { state, dispatch } = useGame();
  const [nomeJogador2, setNomeJogador2] = useState('');
  const [showEntradaJogador2, setShowEntradaJogador2] = useState(false);

  const handleEntradaJogador2 = () => {
    if (nomeJogador2.trim()) {
      dispatch({ 
        type: 'ENTRAR_SALA', 
        codigo: state.sala_codigo || '', 
        nome_jogador: nomeJogador2.trim() 
      });
      setNomeJogador2('');
      setShowEntradaJogador2(false);
    }
  };

  const handleIniciarJogo = () => {
    if (state.jogador1_nome && state.jogador2_nome) {
      dispatch({ type: 'INICIAR_JOGO' });
    } else {
      alert('É necessário ter dois jogadores para iniciar o jogo!');
    }
  };

  const copiarCodigo = () => {
    if (state.sala_codigo) {
      navigator.clipboard.writeText(state.sala_codigo);
      alert('Código copiado para a área de transferência!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🏓</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Sala de Jogo
          </CardTitle>
          <CardDescription>
            Aguardando jogadores para começar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Código da Sala */}
          <div className="text-center space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Código da Sala
            </Label>
            <div className="flex items-center justify-center gap-2">
              <Badge 
                variant="outline" 
                className="text-lg font-mono px-4 py-2 bg-white border-2 border-blue-500"
              >
                {state.sala_codigo}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copiarCodigo}
                className="h-8"
              >
                📋 Copiar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Compartilhe este código com o segundo jogador
            </p>
          </div>

          {/* Jogadores */}
          <div className="space-y-4">
            <h3 className="font-semibold text-center">Jogadores Conectados</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Jogador 1 */}
              <div className={`p-4 rounded-lg border-2 ${
                state.jogador1_nome ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <p className="font-medium text-sm">
                    {state.jogador1_nome || 'Aguardando...'}
                  </p>
                  {state.jogador1_nome && (
                    <Badge variant="secondary" className="mt-1">
                      Criador
                    </Badge>
                  )}
                </div>
              </div>

              {/* Jogador 2 */}
              <div className={`p-4 rounded-lg border-2 ${
                state.jogador2_nome ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <p className="font-medium text-sm">
                    {state.jogador2_nome || 'Aguardando...'}
                  </p>
                  {state.jogador2_nome && (
                    <Badge variant="secondary" className="mt-1">
                      Jogador
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Entrada do Segundo Jogador */}
          {!state.jogador2_nome && (
            <div className="space-y-3">
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowEntradaJogador2(true)}
                  className="w-full border-2 border-green-500/30 hover:border-green-500 hover:bg-green-50"
                >
                  🎮 Simular Entrada do Segundo Jogador
                </Button>
              </div>
              
              {showEntradaJogador2 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <Label htmlFor="nome-jogador2" className="text-sm font-medium">
                    Nome do Segundo Jogador
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="nome-jogador2"
                      value={nomeJogador2}
                      onChange={(e) => setNomeJogador2(e.target.value)}
                      placeholder="Digite o nome"
                      onKeyPress={(e) => e.key === 'Enter' && handleEntradaJogador2()}
                    />
                    <Button 
                      onClick={handleEntradaJogador2}
                      disabled={!nomeJogador2.trim()}
                      size="sm"
                    >
                      Entrar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botão Iniciar Jogo */}
          {state.jogador1_nome && state.jogador2_nome && (
            <Button 
              onClick={handleIniciarJogo}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              🚀 Iniciar Jogo
            </Button>
          )}

          {/* Botão Voltar */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: 'VOLTAR_INICIO' })}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}