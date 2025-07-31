# 🚀 Configuração do Supabase para Multiplayer

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login e crie um novo projeto
3. Anote a URL e a chave anônima

## 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=sua_url_do_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui
```

## 3. Criar Tabelas no Banco de Dados

Execute estes comandos SQL no Editor SQL do Supabase:

### Tabela `salas`:
```sql
CREATE TABLE salas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  jogador1_nome TEXT,
  jogador2_nome TEXT,
  jogo_ativo BOOLEAN DEFAULT false,
  jogador1_pontos INTEGER DEFAULT 0,
  jogador2_pontos INTEGER DEFAULT 0,
  bola_direcao TEXT DEFAULT 'indo_j1',
  bola_movendo BOOLEAN DEFAULT false,
  timer_ativo BOOLEAN DEFAULT false,
  pode_rebater BOOLEAN DEFAULT false,
  vencedor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_salas_updated_at BEFORE UPDATE ON salas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Tabela `game_actions`:
```sql
CREATE TABLE game_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sala_id UUID REFERENCES salas(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  player_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;

-- Políticas para salas (permitir leitura e escrita para todos)
CREATE POLICY "Permitir acesso público às salas" ON salas
  FOR ALL USING (true);

-- Políticas para game_actions (permitir inserção para todos)
CREATE POLICY "Permitir inserção de ações" ON game_actions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura de ações" ON game_actions
  FOR SELECT USING (true);
```

## 5. Habilitar Realtime

No painel do Supabase:
1. Vá para Database > Replication
2. Habilite "Realtime" para as tabelas `salas` e `game_actions`

## 6. Testar

Após configurar tudo:
1. Adicione as variáveis de ambiente
2. Execute `npm run dev`
3. Teste criar uma sala e entrar com outro navegador/aba

## 🎮 Como Funciona

- **Criar Sala**: Cria uma nova sala no banco de dados
- **Entrar Sala**: Busca sala pelo código e adiciona jogador
- **Tempo Real**: Mudanças são sincronizadas automaticamente
- **Ações**: Cada ação do jogo é registrada e sincronizada 