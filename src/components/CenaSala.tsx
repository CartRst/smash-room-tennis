import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { Copy, Users, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function CenaSala() {
  const { state, dispatch } = useGame();

  const copiarCodigo = () => {
    if (state.sala_codigo) {
      navigator.clipboard.writeText(state.sala_codigo);
      toast({
        title: "Código copiado!",
        description: "Compartilhe com seu amigo para ele entrar na sala.",
      });
    }
  };

  const iniciarJogo = () => {
    dispatch({ type: 'INICIAR_JOGO' });
  };

  const jogadoresConectados = [state.jogador1_nome, state.jogador2_nome].filter(Boolean).length;
  const podeIniciar = jogadoresConectados === 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 border-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            🏟️ Sala de Jogo
          </CardTitle>
          
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-lg p-3 border-primary/30">
              <Copy className="w-4 h-4 mr-2" />
              Código: <span className="font-mono ml-1">{state.sala_codigo}</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={copiarCodigo}
              className="border-primary/30 hover:border-primary"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lg">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-semibold">Jogadores ({jogadoresConectados}/2)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`border-2 transition-all duration-300 ${
                state.jogador1_nome 
                  ? 'border-player1 bg-player1/5' 
                  : 'border-dashed border-muted-foreground/30'
              }`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-player1/20 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Jogador 1</h3>
                  <p className={`${state.jogador1_nome ? 'text-player1 font-medium' : 'text-muted-foreground'}`}>
                    {state.jogador1_nome || 'Aguardando...'}
                  </p>
                </CardContent>
              </Card>

              <Card className={`border-2 transition-all duration-300 ${
                state.jogador2_nome 
                  ? 'border-player2 bg-player2/5' 
                  : 'border-dashed border-muted-foreground/30'
              }`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-player2/20 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Jogador 2</h3>
                  <p className={`${state.jogador2_nome ? 'text-player2 font-medium' : 'text-muted-foreground'}`}>
                    {state.jogador2_nome || 'Aguardando...'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center">
            {!podeIniciar && (
              <p className="text-muted-foreground mb-4">
                Aguardando o segundo jogador se conectar...
              </p>
            )}
            
            <Button
              onClick={iniciarJogo}
              disabled={!podeIniciar}
              className={`h-14 px-8 text-lg font-semibold transition-all duration-300 ${
                podeIniciar 
                  ? 'bg-gradient-primary hover:bg-gradient-primary/90 transform hover:scale-105 animate-pulse-glow' 
                  : ''
              }`}
            >
              <Play className="w-5 h-5 mr-2" />
              {podeIniciar ? 'Iniciar Jogo!' : 'Iniciar Jogo'}
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-border">
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