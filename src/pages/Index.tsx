import { GameProvider } from '@/contexts/GameContext';
import { PingPongGame } from '@/components/PingPongGame';

const Index = () => {
  return (
    <GameProvider>
      <PingPongGame />
    </GameProvider>
  );
};

export default Index;
