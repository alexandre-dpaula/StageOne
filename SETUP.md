# Guia de Setup - StageOne

## Passo a Passo Completo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma nova organização (se não tiver)
3. Crie um novo projeto
   - Nome: `stageone` (ou qualquer nome)
   - Database Password: Escolha uma senha forte
   - Região: Escolha a mais próxima

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

2. No painel do Supabase, vá em **Project Settings > API**

3. Copie as credenciais para `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Criar Schema do Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em **Run**

Aguarde a execução. O script irá:
- Criar todas as tabelas
- Configurar triggers automáticos
- Aplicar policies de segurança (RLS)
- Criar índices para performance

### 5. Criar Usuário Admin

1. Inicie o projeto:
```bash
npm run dev
```

2. Acesse [http://localhost:3000/cadastro](http://localhost:3000/cadastro)

3. Crie sua conta com:
   - Nome: Seu nome
   - E-mail: seu@email.com
   - Senha: (mínimo 6 caracteres)

4. No Supabase, vá em **SQL Editor** e execute:

```sql
UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'seu@email.com';
```

5. Faça logout e login novamente para as permissões serem aplicadas

### 6. Testar o Sistema

#### Teste 1: Criar um Evento

1. Como ADMIN, acesse: [http://localhost:3000/painel/admin](http://localhost:3000/painel/admin)
2. Clique em "Criar Novo Evento"
3. Preencha os dados do evento
4. Adicione módulos de conteúdo
5. Configure tipos de ingressos
6. Publique o evento

**NOTA:** A funcionalidade de criar evento via interface ainda precisa ser implementada. Por enquanto, crie eventos diretamente no banco via SQL:

```sql
-- Exemplo de inserção manual de evento
INSERT INTO public.events (
  slug, title, subtitle, description, category, target_audience,
  location_name, address, capacity, start_datetime, end_datetime,
  mode, banner_url, created_by, is_published
) VALUES (
  'workshop-lideranca-2025',
  'Workshop de Liderança',
  'Transforme sua forma de liderar',
  'Um workshop completo sobre liderança moderna e gestão de equipes.',
  'LIDERANÇA',
  'Líderes, gestores e empreendedores',
  'Sala M2 Studio',
  'Rua Exemplo, 123 - São Paulo, SP',
  50,
  '2025-03-15 09:00:00+00',
  '2025-03-15 18:00:00+00',
  'PRESENCIAL',
  NULL,
  'seu-user-id-aqui', -- Substitua pelo seu ID de usuário
  true
);

-- Adicionar módulos
INSERT INTO public.event_modules (event_id, title, description, hours, order_index)
SELECT
  id,
  'Fundamentos de Liderança',
  'Princípios básicos e conceitos essenciais',
  2,
  0
FROM public.events WHERE slug = 'workshop-lideranca-2025';

INSERT INTO public.event_modules (event_id, title, description, hours, order_index)
SELECT
  id,
  'Gestão de Equipes',
  'Como motivar e desenvolver seu time',
  3,
  1
FROM public.events WHERE slug = 'workshop-lideranca-2025';

-- Adicionar tipos de ingresso
INSERT INTO public.tickets_types (event_id, name, description, price, total_quantity, is_active)
SELECT
  id,
  'Lote 1 - Promocional',
  'Primeiras 20 vagas',
  297.00,
  20,
  true
FROM public.events WHERE slug = 'workshop-lideranca-2025';

INSERT INTO public.tickets_types (event_id, name, description, price, total_quantity, is_active)
SELECT
  id,
  'Lote 2',
  'Preço regular',
  397.00,
  30,
  true
FROM public.events WHERE slug = 'workshop-lideranca-2025';
```

#### Teste 2: Comprar Ingresso

1. Faça logout
2. Crie uma nova conta como PARTICIPANTE
3. Navegue pela home e clique no evento
4. Escolha um tipo de ingresso
5. Preencha os dados e confirme
6. Vá em "Meus Ingressos" e veja o QR Code

#### Teste 3: Check-in

1. Faça login como ADMIN
2. Acesse `/checkin/[id-do-evento]`
3. Inicie o scanner
4. Escaneie o QR Code do ingresso
5. Veja a confirmação de check-in

## Estrutura de Arquivos Criados

```
/app
  /api
    /auth/logout        # Logout
    /checkin            # API de check-in
    /tickets/create     # Criação de tickets
  /cadastro             # Página de cadastro
  /checkin/[eventId]    # Sistema de check-in
  /checkout/[eventId]/[ticketTypeId]  # Checkout
  /evento/[slug]        # Landing page do evento
  /login                # Login
  /meus-ingressos       # Área do participante
  /painel
    /admin              # Dashboard admin
      /eventos          # Lista de eventos
    /palestrante        # Dashboard palestrante
  /scan                 # Redirecionamento QR Code
  globals.css           # Estilos globais
  layout.tsx            # Layout raiz
  page.tsx              # Home Netflix-style

/components
  /ui
    Button.tsx          # Botão reutilizável
    Input.tsx           # Input reutilizável
  EventCard.tsx         # Card de evento
  EventCarousel.tsx     # Carrossel horizontal
  Navbar.tsx            # Barra de navegação

/lib
  /supabase
    client.ts           # Client-side Supabase
    middleware.ts       # Middleware de autenticação
    server.ts           # Server-side Supabase
  utils.ts              # Funções auxiliares

/types
  database.types.ts     # Tipos TypeScript

supabase-schema.sql     # Schema completo do banco
middleware.ts           # Middleware Next.js
```

## Funcionalidades Implementadas

✅ Autenticação completa (login, cadastro, logout)
✅ Sistema de roles (Admin, Palestrante, Participante)
✅ Home page estilo Netflix com carrosséis
✅ Landing page completa do evento
✅ Checkout de ingressos (pagamento simulado)
✅ Geração de QR Code único por ingresso
✅ Visualização de ingressos do participante
✅ Sistema de check-in com scanner de QR Code
✅ Dashboard admin básico
✅ Listagem de eventos admin
✅ Proteção de rotas por role
✅ RLS policies configuradas
✅ Triggers automáticos (sold_quantity, total_hours)

## Funcionalidades a Implementar

### Prioridade Alta
- [ ] Formulário de criação de eventos (UI completa)
- [ ] Página de listagem de alunos por evento
- [ ] Upload de banner/imagens
- [ ] Dashboard do palestrante

### Prioridade Média
- [ ] Integração de pagamento real (Stripe/PagSeguro)
- [ ] Geração de certificados
- [ ] Upload de materiais pós-evento
- [ ] Envio de e-mails transacionais
- [ ] Exportação CSV de participantes

### Prioridade Baixa
- [ ] Sistema de cupons
- [ ] Programa de afiliados
- [ ] Dashboard com gráficos
- [ ] Notificações push
- [ ] App mobile

## Dicas de Desenvolvimento

### Adicionar Banner a um Evento

Por enquanto, use URLs externas ou Supabase Storage:

```sql
UPDATE public.events
SET banner_url = 'https://exemplo.com/banner.jpg'
WHERE slug = 'seu-evento';
```

### Testar Check-in sem Scanner

1. Acesse `/checkin/[event-id]`
2. Use o campo "Entrada Manual"
3. Cole o `qr_code_token` do ingresso
4. Clique em "Confirmar"

### Encontrar o QR Token de um Ticket

```sql
SELECT qr_code_token, buyer_name, status
FROM public.tickets
WHERE event_id = 'seu-event-id';
```

## Troubleshooting

### Erro: "relation public.users does not exist"
- Execute novamente o schema SQL no Supabase

### Erro: "new row violates row-level security policy"
- Verifique se as RLS policies foram criadas
- Confirme que está autenticado corretamente

### QR Code não é gerado
- Verifique se a biblioteca `qrcode` está instalada
- Cheque o console do navegador

### Scanner não funciona
- Permita acesso à câmera no navegador
- Use HTTPS em produção (localhost funciona em HTTP)

### Logout não funciona
- Verifique se a rota `/api/auth/logout` está correta
- Limpe os cookies do navegador

## Deploy em Produção

### Vercel (Recomendado)

1. Push para GitHub
2. Importe projeto no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático

### Configurações Importantes

- Configure `NEXT_PUBLIC_APP_URL` com sua URL de produção
- Use HTTPS (obrigatório para câmera e geolocalização)
- Configure CORS no Supabase se necessário

## Suporte

Para dúvidas, consulte:
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Tailwind](https://tailwindcss.com/docs)

## Licença

MIT
