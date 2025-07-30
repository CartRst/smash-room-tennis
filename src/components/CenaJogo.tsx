import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';
import { Zap, Trophy } from 'lucide-react';

export function CenaJogo() {
  const { state, dispatch } = useGame();
  const [timer, setTimer] = useState(2);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    if (state.bola_movendo) {
      setShowCountdown(true);
      const moveTimer = setTimeout(() => {
        dispatch({ type: 'MOVER_BOLA' });
        setTimer(2);
        setShowCountdown(false);
      }, 2000);

      return () => clearTimeout(moveTimer);
    }
  }, [state.bola_movendo, dispatch]);

  useEffect(() => {
    if (state.pode_rebater && state.timer_ativo) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0.1) {
            dispatch({ type: 'TIMEOUT_REBATER' });
            return 2;
          }
          return prev - 0.1;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [state.pode_rebater, state.timer_ativo, dispatch]);

  const rebater = () => {
    if (state.pode_rebater) {
      dispatch({ type: 'REBATER' });
      setTimer(2);
    }
  };

  const progressValue = ((2 - timer) / 2) * 100;
  const isJogador1Turn = state.bola_direcao === 'indo_j1';

  return (
    <div className="min-h-screen bg-gradient-court flex flex-col">
      {/* Header com placar */}
      <div className="bg-card/90 backdrop-blur border-b-2 border-court-line p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-player1">
              {state.jogador1_nome}: {state.jogador1_pontos}
            </div>
            <Trophy className="w-6 h-6 text-accent" />
            <div className="text-2xl font-bold text-player2">
              {state.jogador2_nome}: {state.jogador2_pontos}
            </div>
          </div>
          
          {state.pode_rebater && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Tempo para rebater</div>
              <Progress value={progressValue} className="w-32 h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Campo de jogo */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-court opacity-50"></div>
        
        {/* Linha central */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-court-line transform -translate-x-0.5 opacity-80"></div>
        
        {/* Áreas dos jogadores */}
        <div className="relative h-full flex">
          {/* Área Jogador 1 */}
          <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-300 ${
            isJogador1Turn && state.pode_rebater ? 'bg-player1/10 animate-pulse' : ''
          }`}>
            <Card className={`border-2 transition-all duration-300 ${
              isJogador1Turn ? 'border-player1 shadow-lg shadow-player1/20' : 'border-border'
            }`}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-player1/20 flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-player1 mb-2">{state.jogador1_nome}</h3>
                <div className="text-3xl font-bold mb-4">{state.jogador1_pontos} pontos</div>
                
                {isJogador1Turn && state.pode_rebater && (
                  <Button
                    onClick={rebater}
                    className="bg-player1 hover:bg-player1/90 text-white font-bold py-3 px-6 text-lg animate-pulse-glow"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    REBATER!
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bola */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className={`w-12 h-12 bg-ball rounded-full shadow-lg transition-all duration-300 ${
              state.bola_movendo ? 'animate-ball-travel' : 'animate-ball-bounce'
            } ${
              showCountdown ? (isJogador1Turn ? 'translate-x-[-200px]' : 'translate-x-[200px]') : ''
            }`}>
              <div className="w-full h-full bg-gradient-accent rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Área Jogador 2 */}
          <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-300 ${
            !isJogador1Turn && state.pode_rebater ? 'bg-player2/10 animate-pulse' : ''
          }`}>
            <Card className={`border-2 transition-all duration-300 ${
              !isJogador1Turn ? 'border-player2 shadow-lg shadow-player2/20' : 'border-border'
            }`}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-player2/20 flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-player2 mb-2">{state.jogador2_nome}</h3>
                <div className="text-3xl font-bold mb-4">{state.jogador2_pontos} pontos</div>
                
                {!isJogador1Turn && state.pode_rebater && (
                  <Button
                    onClick={rebater}
                    className="bg-player2 hover:bg-player2/90 text-white font-bold py-3 px-6 text-lg animate-pulse-glow"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    REBATER!
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contador visual para movimento da bola */}
        {showCountdown && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-card/90 backdrop-blur rounded-lg p-4 text-center border-2 border-accent">
              <div className="text-sm text-muted-foreground mb-2">Bola indo para</div>
              <div className={`text-lg font-bold ${isJogador1Turn ? 'text-player1' : 'text-player2'}`}>
                {isJogador1Turn ? state.jogador1_nome : state.jogador2_nome}
              </div>
            </div>
          </div>
        )}

        {/* Instruções */}
        {state.pode_rebater && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-accent/90 backdrop-blur rounded-lg p-3 text-center border-2 border-accent">
              <div className="text-accent-foreground font-bold">
                ⚡ {isJogador1Turn ? state.jogador1_nome : state.jogador2_nome}, rebata a bola!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}