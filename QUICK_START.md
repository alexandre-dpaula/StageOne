# Quick Start - StageOne

## Setup Rápido (5 minutos)

### 1. Instalar
```bash
npm install
```

### 2. Configurar Supabase
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase.

### 3. Criar Banco
No SQL Editor do Supabase, execute: `supabase-schema.sql`

### 4. Rodar
```bash
npm run dev
```

### 5. Criar Admin
1. Cadastre-se em: http://localhost:3000/cadastro
2. No Supabase SQL Editor:
```sql
UPDATE public.users SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

## Rotas Principais

- `/` - Home pública (estilo Netflix)
- `/evento/[slug]` - Página do evento
- `/login` - Login
- `/cadastro` - Cadastro
- `/meus-ingressos` - Ingressos do participante
- `/checkout/[eventId]/[ticketTypeId]` - Checkout
- `/painel/admin` - Dashboard admin
- `/painel/admin/eventos` - Lista de eventos
- `/painel/admin/eventos/[id]/alunos` - Lista de participantes
- `/checkin/[eventId]` - Check-in com QR Code

## Fluxo de Teste Completo

### 1. Criar Evento (via SQL)
```sql
-- Copie e adapte o exemplo do SETUP.md
INSERT INTO public.events (...) VALUES (...);
INSERT INTO public.event_modules (...) VALUES (...);
INSERT INTO public.tickets_types (...) VALUES (...);
```

### 2. Comprar Ingresso
- Navegue na home
- Clique no evento
- Escolha o ingresso
- Preencha os dados
- Confirme (pagamento simulado)

### 3. Ver QR Code
- Vá em "Meus Ingressos"
- Clique em "Ver QR Code"

### 4. Fazer Check-in
- Como admin, acesse `/checkin/[event-id]`
- Escaneie o QR Code OU
- Use "Entrada Manual" com o token

## Funcionalidades Disponíveis

✅ Home estilo Netflix
✅ Landing page de eventos
✅ Checkout de ingressos
✅ QR Code único
✅ Check-in com scanner
✅ Dashboard admin
✅ Lista de participantes
✅ Autenticação completa
✅ Sistema de roles

## Próximos Passos

Veja `README.md` e `SETUP.md` para detalhes completos.
