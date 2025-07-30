import { useGame } from '@/contexts/GameContext';
import { CenaInicio } from './CenaInicio';
import { CenaSala } from './CenaSala';
import { CenaJogo } from './CenaJogo';
import { CenaResultado } from './CenaResultado';

export function PingPongGame() {
  const { state } = useGame();

  switch (state.cena_atual) {
    case 'inicio':
      return <CenaInicio />;
    case 'sala':
      return <CenaSala />;
    case 'jogo':
      return <CenaJogo />;
    case 'resultado':
      return <CenaResultado />;
    default:
      return <CenaInicio />;
  }
}