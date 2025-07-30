import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useGame } from '@/contexts/GameContext';

export function CenaInicio() {
  const { dispatch } = useGame();
  const [nomeJogador, setNomeJogador] = useState('');
  const [codigoSala, setCodigoSala] = useState('');
  const [showCriarSala, setShowCriarSala] = useState(false);
  const [showEntrarSala, setShowEntrarSala] = useState(false);

  const gerarCodigoSala = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCriarSala = () => {
    if (nomeJogador.trim()) {
      const codigo = gerarCodigoSala();
      dispatch({ type: 'CRIAR_SALA', codigo, nome_jogador: nomeJogador.trim() });
      setShowCriarSala(false);
      setNomeJogador('');
    }
  };

  const handleEntrarSala = () => {
    if (nomeJogador.trim() && codigoSala.trim()) {
      console.log('Tentando entrar na sala:', codigoSala.trim(), 'com jogador:', nomeJogador.trim());
      dispatch({ type: 'ENTRAR_SALA', codigo: codigoSala.trim(), nome_jogador: nomeJogador.trim() });
      setShowEntrarSala(false);
      setNomeJogador('');
      setCodigoSala('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
              <div className="w-8 h-8 bg-ball rounded-full animate-ball-bounce"></div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            🏓 Ping Pong
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Jogue ping pong online com seus amigos!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Dialog open={showCriarSala} onOpenChange={setShowCriarSala}>
            <DialogTrigger asChild>
              <Button 
                className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-200 transform hover:scale-105"
                onClick={() => setShowCriarSala(true)}
              >
                🎮 Criar Sala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Sala</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome-criar">Seu Nome</Label>
                  <Input
                    id="nome-criar"
                    value={nomeJogador}
                    onChange={(e) => setNomeJogador(e.target.value)}
                    placeholder="Digite seu nome"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={handleCriarSala}
                  disabled={!nomeJogador.trim()}
                  className="w-full bg-gradient-primary"
                >
                  Criar Sala
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showEntrarSala} onOpenChange={setShowEntrarSala}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full h-14 text-lg font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                onClick={() => setShowEntrarSala(true)}
              >
                🔗 Entrar com Código
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Entrar na Sala</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="codigo">Código da Sala</Label>
                  <Input
                    id="codigo"
                    value={codigoSala}
                    onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    className="mt-1 uppercase tracking-wider text-center font-mono"
                    maxLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="nome-entrar">Seu Nome</Label>
                  <Input
                    id="nome-entrar"
                    value={nomeJogador}
                    onChange={(e) => setNomeJogador(e.target.value)}
                    placeholder="Digite seu nome"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={handleEntrarSala}
                  disabled={!nomeJogador.trim() || !codigoSala.trim()}
                  className="w-full bg-gradient-primary"
                >
                  Entrar na Sala
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}