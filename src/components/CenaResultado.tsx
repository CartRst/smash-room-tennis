import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { Trophy, RotateCcw, Home, Share } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function CenaResultado() {
  const { state, dispatch } = useGame();

  const jogarNovamente = () => {
    dispatch({ type: 'RESETAR_JOGO' });
  };

  const voltarInicio = () => {
    dispatch({ type: 'VOLTAR_INICIO' });
  };

  const compartilharResultado = () => {
    const texto = `🏓 Resultado do Ping Pong!\n🏆 Vencedor: ${state.vencedor}\n📊 Placar Final:\n${state.jogador1_nome}: ${state.jogador1_pontos} pontos\n${state.jogador2_nome}: ${state.jogador2_pontos} pontos\n\nJogue você também em: ${window.location.origin}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Resultado do Ping Pong',
        text: texto,
      });
    } else {
      navigator.clipboard.writeText(texto);
      toast({
        title: "Resultado copiado!",
        description: "O resultado foi copiado para a área de transferência.",
      });
    }
  };

  const isJogador1Vencedor = state.vencedor === state.jogador1_nome;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 border-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-accent rounded-full flex items-center justify-center animate-pulse-glow">
              <Trophy className="w-12 h-12 text-accent-foreground" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-lg">🎉</span>
              </div>
            </div>
          </div>
          
          <div>
            <CardTitle className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              🏆 Vitória!
            </CardTitle>
            <div className="text-2xl font-bold text-foreground">
              {state.vencedor} é o campeão!
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Placar Final */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">📊 Placar Final</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`border-2 transition-all duration-300 ${
                isJogador1Vencedor 
                  ? 'border-accent bg-accent/10 ring-2 ring-accent/20' 
                  : 'border-player1 bg-player1/5'
              }`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-player1/20 flex items-center justify-center">
                    {isJogador1Vencedor ? (
                      <Trophy className="w-6 h-6 text-accent" />
                    ) : (
                      <span className="text-2xl">🎯</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1 text-player1">
                    {state.jogador1_nome}
                  </h3>
                  <div className="text-3xl font-bold text-foreground">
                    {state.jogador1_pontos}
                  </div>
                  <Badge 
                    variant={isJogador1Vencedor ? "default" : "secondary"}
                    className={isJogador1Vencedor ? "bg-accent text-accent-foreground" : ""}
                  >
                    {isJogador1Vencedor ? "Vencedor" : "Jogador 1"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className={`border-2 transition-all duration-300 ${
                !isJogador1Vencedor 
                  ? 'border-accent bg-accent/10 ring-2 ring-accent/20' 
                  : 'border-player2 bg-player2/5'
              }`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-player2/20 flex items-center justify-center">
                    {!isJogador1Vencedor ? (
                      <Trophy className="w-6 h-6 text-accent" />
                    ) : (
                      <span className="text-2xl">🎯</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1 text-player2">
                    {state.jogador2_nome}
                  </h3>
                  <div className="text-3xl font-bold text-foreground">
                    {state.jogador2_pontos}
                  </div>
                  <Badge 
                    variant={!isJogador1Vencedor ? "default" : "secondary"}
                    className={!isJogador1Vencedor ? "bg-accent text-accent-foreground" : ""}
                  >
                    {!isJogador1Vencedor ? "Vencedor" : "Jogador 2"}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Estatísticas */}
          <Card className="border border-border bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {state.jogador1_pontos + state.jogador2_pontos}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de Pontos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.abs(state.jogador1_pontos - state.jogador2_pontos)}
                  </div>
                  <div className="text-sm text-muted-foreground">Diferença</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">13</div>
                  <div className="text-sm text-muted-foreground">Meta</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={jogarNovamente}
              className="h-12 bg-gradient-primary hover:bg-gradient-primary/90 font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Jogar Novamente
            </Button>
            
            <Button
              onClick={compartilharResultado}
              variant="outline"
              className="h-12 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 font-semibold"
            >
              <Share className="w-5 h-5 mr-2" />
              Compartilhar
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={voltarInicio}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}