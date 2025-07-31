# 🏓 Smash Room Tennis

Um jogo de ping pong multiplayer dinâmico e interativo desenvolvido com React, TypeScript e Supabase.

## ✨ Funcionalidades

### 🎮 **Jogo Dinâmico**
- **Movimento Real da Bola**: Física realista com colisões
- **Raquetes Dinâmicas**: Movimento com teclado
- **Ângulos de Rebatida**: Baseados na posição da raquete
- **Velocidade Progressiva**: A bola fica mais rápida a cada rebatida
- **Game Loop**: 20 FPS para movimento suave

### 🌐 **Multiplayer**
- **Modo Local**: Simulação para teste
- **Modo Multiplayer Real**: Integração com Supabase
- **Salas**: Códigos únicos para conectar jogadores
- **Sincronização em Tempo Real**: Estado compartilhado

### 🎯 **Sistema de Pontuação**
- **Primeiro a 13 pontos vence**
- **Timer de 3 segundos** para rebatida
- **Detecção automática** de pontos
- **Placar em tempo real**

## 🚀 Como Jogar

### 1. **Criar/Entrar na Sala**
- Clique em "Criar Nova Sala" ou "Entrar em Sala Existente"
- Digite seu nome e código da sala (se aplicável)
- Compartilhe o código com o segundo jogador

### 2. **Controles**
- **Jogador 1**: 
  - `W/S` - Mover raquete para cima/baixo
  - `ESPAÇO` - Rebater bola
- **Jogador 2**: 
  - `↑/↓` - Mover raquete para cima/baixo
  - `ESPAÇO` - Rebater bola

### 3. **Objetivo**
- Rebata a bola antes que ela passe pela sua lateral
- Primeiro jogador a atingir 13 pontos vence
- A bola fica mais rápida a cada rebatida

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Supabase (PostgreSQL + Realtime)
- **State Management**: React Context + useReducer

## 📦 Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd smash-room-tennis

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais do Supabase

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔧 Configuração do Supabase

### 1. Criar Projeto
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Anote a URL e chave anônima

### 2. Configurar Banco de Dados
Execute os seguintes comandos SQL no editor SQL do Supabase:

```sql
-- Tabela de salas
CREATE TABLE salas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(6) UNIQUE NOT NULL,
  jogador1_nome VARCHAR(100),
  jogador2_nome VARCHAR(100),
  jogador1_pontos INTEGER DEFAULT 0,
  jogador2_pontos INTEGER DEFAULT 0,
  bola_direcao VARCHAR(10) DEFAULT 'indo_j1',
  jogo_ativo BOOLEAN DEFAULT false,
  vencedor VARCHAR(100),
  bola_movendo BOOLEAN DEFAULT false,
  timer_ativo BOOLEAN DEFAULT false,
  pode_rebater BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ações do jogo
CREATE TABLE game_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sala_id UUID REFERENCES salas(id) ON DELETE CASCADE,
  action_type VARCHAR(20) NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir leitura de salas" ON salas FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de salas" ON salas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de salas" ON salas FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura de ações" ON game_actions FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de ações" ON game_actions FOR INSERT WITH CHECK (true);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE salas;
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## 🎨 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/                 # Componentes Shadcn UI
│   ├── CenaInicio.tsx      # Tela inicial
│   ├── CenaSala.tsx        # Sala de espera
│   ├── CenaJogo.tsx        # Jogo dinâmico
│   ├── CenaResultado.tsx   # Tela de resultado
│   └── PingPongGame.tsx    # Componente principal
├── contexts/
│   └── GameContext.tsx     # Estado global do jogo
├── hooks/
│   └── useMultiplayer.ts   # Lógica multiplayer
├── lib/
│   └── supabase.ts         # Cliente Supabase
└── pages/
    └── Index.tsx           # Página principal
```

## 🎯 Funcionalidades Implementadas

### ✅ **Completas**
- [x] Interface responsiva e moderna
- [x] Sistema de salas com códigos únicos
- [x] Jogo dinâmico com física realista
- [x] Controles de teclado intuitivos
- [x] Sistema de pontuação
- [x] Timer de rebatida
- [x] Modo local para testes
- [x] Integração com Supabase
- [x] Sincronização em tempo real
- [x] Tratamento de erros
- [x] Loading states
- [x] Validações de entrada

### 🔄 **Em Desenvolvimento**
- [ ] Sons e efeitos visuais
- [ ] Modo torneio
- [ ] Estatísticas de jogador
- [ ] Chat em tempo real
- [ ] Modo espectador

## 🚀 Deploy

### Vercel
```bash
npm run build
# Fazer deploy da pasta dist/
```

### Netlify
```bash
npm run build
# Fazer deploy da pasta dist/
```

## 📝 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando React, TypeScript e Supabase**
