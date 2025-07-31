import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';
import { Zap, Trophy } from 'lucide-react';

interface BallPosition {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}

interface PaddlePosition {
  y: number;
  height: number;
}

export function CenaJogo() {
  const { state, dispatch, multiplayerActions } = useGame();
  const [timer, setTimer] = useState(3);
  const [ballPosition, setBallPosition] = useState<BallPosition>({ x: 50, y: 50, velocityX: 0, velocityY: 0 });
  const [paddle1Position, setPaddle1Position] = useState<PaddlePosition>({ y: 40, height: 20 });
  const [paddle2Position, setPaddle2Position] = useState<PaddlePosition>({ y: 40, height: 20 });
  const [gameStarted, setGameStarted] = useState(false);
  const [ballSpeed, setBallSpeed] = useState(3); // Velocidade inicial aumentada
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(0);

  // Iniciar jogo
  const startGame = useCallback(() => {
    setGameStarted(true);
    setBallPosition({ x: 50, y: 50, velocityX: ballSpeed, velocityY: 0 });
    dispatch({ type: 'INICIAR_JOGO' });
    
    // Sincronizar com multiplayer se ativo
    if (state.isMultiplayer && multiplayerActions) {
      multiplayerActions.executarAcaoMultiplayer('INICIAR_JOGO');
    }
  }, [ballSpeed, dispatch, state.isMultiplayer, multiplayerActions]);

  // Mover raquete
  const movePaddle = useCallback((player: 1 | 2, direction: 'up' | 'down') => {
    const step = 3; // Movimento mais suave
    
    if (player === 1) {
      setPaddle1Position(prev => ({
        ...prev,
        y: Math.max(10, Math.min(70, prev.y + (direction === 'up' ? -step : step)))
      }));
    } else {
      setPaddle2Position(prev => ({
        ...prev,
        y: Math.max(10, Math.min(70, prev.y + (direction === 'up' ? -step : step)))
      }));
    }
  }, []);

  // Rebater bola
  const rebater = useCallback(() => {
    if (state.pode_rebater) {
      // Calcular ângulo de rebatida baseado na posição da raquete
      const currentPaddle = state.bola_direcao === 'indo_j1' ? paddle1Position : paddle2Position;
      const ballY = ballPosition.y;
      const paddleCenter = currentPaddle.y + currentPaddle.height / 2;
      const distanceFromCenter = ballY - paddleCenter;
      const maxAngle = 45; // ângulo máximo em graus
      const angle = (distanceFromCenter / (currentPaddle.height / 2)) * maxAngle;
      
      // Calcular nova velocidade
      const speed = ballSpeed + 0.3; // Aumento mais suave
      const radians = (angle * Math.PI) / 180;
      const newVelocityX = state.bola_direcao === 'indo_j1' ? -speed : speed;
      const newVelocityY = Math.sin(radians) * speed;
      
      setBallSpeed(speed);
      setBallPosition(prev => ({
        ...prev,
        velocityX: newVelocityX,
        velocityY: newVelocityY
      }));
      
      dispatch({ type: 'REBATER' });
      setTimer(3);
      
      // Sincronizar com multiplayer se ativo
      if (state.isMultiplayer && multiplayerActions) {
        multiplayerActions.executarAcaoMultiplayer('REBATER');
      }
    }
  }, [state.pode_rebater, state.bola_direcao, paddle1Position, paddle2Position, ballPosition.y, ballSpeed, dispatch, state.isMultiplayer, multiplayerActions]);

  // Game loop otimizado
  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // Limitar deltaTime para evitar saltos grandes
      const clampedDeltaTime = Math.min(deltaTime, 50);
      
      setBallPosition(prev => {
        let newX = prev.x + (prev.velocityX * clampedDeltaTime / 16.67); // Normalizar para 60 FPS
        let newY = prev.y + (prev.velocityY * clampedDeltaTime / 16.67);
        let newVelocityX = prev.velocityX;
        let newVelocityY = prev.velocityY;

        // Colisão com bordas superior e inferior
        if (newY <= 5 || newY >= 95) {
          newVelocityY = -newVelocityY;
          newY = newY <= 5 ? 5 : 95;
        }

        // Colisão com raquete 1 (lado esquerdo)
        if (newX <= 15 && newY >= paddle1Position.y && newY <= paddle1Position.y + paddle1Position.height) {
          newVelocityX = Math.abs(newVelocityX);
          newX = 15;
        }

        // Colisão com raquete 2 (lado direito)
        if (newX >= 85 && newY >= paddle2Position.y && newY <= paddle2Position.y + paddle2Position.height) {
          newVelocityX = -Math.abs(newVelocityX);
          newX = 85;
        }

        // Ponto para jogador 1 (bola passa pela direita)
        if (newX > 100) {
          dispatch({ type: 'TIMEOUT_REBATER' });
          if (state.isMultiplayer && multiplayerActions) {
            multiplayerActions.executarAcaoMultiplayer('TIMEOUT_REBATER');
          }
          return { x: 50, y: 50, velocityX: 0, velocityY: 0 };
        }

        // Ponto para jogador 2 (bola passa pela esquerda)
        if (newX < 0) {
          dispatch({ type: 'TIMEOUT_REBATER' });
          if (state.isMultiplayer && multiplayerActions) {
            multiplayerActions.executarAcaoMultiplayer('TIMEOUT_REBATER');
          }
          return { x: 50, y: 50, velocityX: 0, velocityY: 0 };
        }

        return { x: newX, y: newY, velocityX: newVelocityX, velocityY: newVelocityY };
      });
    };

    // Usar requestAnimationFrame para melhor performance
    const animate = (currentTime: number) => {
      gameLoop(currentTime);
      gameLoopRef.current = requestAnimationFrame(animate);
    };
    
    gameLoopRef.current = requestAnimationFrame(animate);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, paddle1Position, paddle2Position, dispatch, state.isMultiplayer, multiplayerActions]);

  // Timer para rebatida
  useEffect(() => {
    if (state.pode_rebater && state.timer_ativo) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0.1) {
            dispatch({ type: 'TIMEOUT_REBATER' });
            if (state.isMultiplayer && multiplayerActions) {
              multiplayerActions.executarAcaoMultiplayer('TIMEOUT_REBATER');
            }
            return 3;
          }
          return prev - 0.1;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [state.pode_rebater, state.timer_ativo, dispatch, state.isMultiplayer, multiplayerActions]);

  // Controles de teclado otimizados
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted) return;

      switch (e.key) {
        case 'w':
        case 'W':
          movePaddle(1, 'up');
          break;
        case 's':
        case 'S':
          movePaddle(1, 'down');
          break;
        case 'ArrowUp':
          movePaddle(2, 'up');
          break;
        case 'ArrowDown':
          movePaddle(2, 'down');
          break;
        case ' ':
          e.preventDefault();
          rebater();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, movePaddle, rebater]);

  // Controles contínuos para movimento mais fluido
  useEffect(() => {
    const keys = new Set<string>();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key.toLowerCase());
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
    };
    
    const moveLoop = () => {
      if (!gameStarted) return;
      
      if (keys.has('w')) movePaddle(1, 'up');
      if (keys.has('s')) movePaddle(1, 'down');
      if (keys.has('arrowup')) movePaddle(2, 'up');
      if (keys.has('arrowdown')) movePaddle(2, 'down');
    };
    
    const moveInterval = setInterval(moveLoop, 16); // 60 FPS para movimento
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      clearInterval(moveInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, movePaddle]);

  const progressValue = Math.max(0, Math.min(100, ((3 - timer) / 3) * 100));
  const isJogador1Turn = state.bola_direcao === 'indo_j1';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 flex flex-col">
      {/* Header com placar */}
      <div className="bg-black/50 backdrop-blur border-b-2 border-white/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-blue-300">
              {state.jogador1_nome}: {state.jogador1_pontos}
            </div>
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div className="text-2xl font-bold text-green-300">
              {state.jogador2_nome}: {state.jogador2_pontos}
            </div>
          </div>
          
          {state.pode_rebater && (
            <div className="text-center">
              <div className="text-sm text-white/70 mb-1">Tempo para rebater</div>
              <Progress value={progressValue} className="w-32 h-2" />
            </div>
          )}
          
          {state.isMultiplayer && (
            <div className="text-sm text-green-400">
              🌐 Multiplayer Ativo
            </div>
          )}
        </div>
      </div>

      {/* Campo de jogo */}
      <div className="flex-1 relative overflow-hidden" ref={canvasRef}>
        {/* Linha central */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/30 transform -translate-x-0.5"></div>
        
        {/* Linhas horizontais */}
        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white/20"></div>
        <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-white/20"></div>
        
        {/* Raquete Jogador 1 */}
        <div 
          className="absolute left-4 w-3 bg-blue-400 rounded-full shadow-lg transition-transform duration-75"
          style={{
            top: `${paddle1Position.y}%`,
            height: `${paddle1Position.height}%`
          }}
        />

        {/* Raquete Jogador 2 */}
        <div 
          className="absolute right-4 w-3 bg-green-400 rounded-full shadow-lg transition-transform duration-75"
          style={{
            top: `${paddle2Position.y}%`,
            height: `${paddle2Position.height}%`
          }}
        />

        {/* Bola */}
        <div 
          className="absolute w-4 h-4 bg-white rounded-full shadow-lg z-10 transition-transform duration-75"
          style={{
            left: `${ballPosition.x}%`,
            top: `${ballPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-white to-gray-300 rounded-full"></div>
        </div>
        
        {/* Controles */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/70 backdrop-blur rounded-lg p-4 text-center border border-white/20">
            <div className="text-white text-sm mb-2">
              <strong>Controles:</strong>
            </div>
            <div className="text-white/80 text-xs space-y-1">
              <div>Jogador 1: W/S para mover, ESPAÇO para rebater</div>
              <div>Jogador 2: ↑/↓ para mover, ESPAÇO para rebater</div>
            </div>
          </div>
        </div>

        {/* Botão iniciar */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="bg-black/80 backdrop-blur rounded-lg p-8 text-center border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🏓 Ping Pong Dinâmico</h2>
              <p className="text-white/80 mb-6">
                Use as teclas para mover as raquetes e ESPAÇO para rebater!
              </p>
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-3 px-8 text-lg"
              >
                🚀 Iniciar Jogo
              </Button>
            </div>
          </div>
        )}

        {/* Instruções durante o jogo */}
        {gameStarted && state.pode_rebater && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-yellow-500/90 backdrop-blur rounded-lg p-3 text-center border-2 border-yellow-400">
              <div className="text-black font-bold">
                ⚡ {isJogador1Turn ? state.jogador1_nome : state.jogador2_nome}, pressione ESPAÇO para rebater!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}