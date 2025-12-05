# 🚀 Referência Rápida - StageOne

## ⚡ Comandos Essenciais

```bash
# Rodar projeto
npm run dev

# Build para produção
npm run build

# Rodar em produção
npm start
```

## 🔗 URLs Principais

### Desenvolvimento
- **App:** http://localhost:3000
- **Supabase Dashboard:** https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp
- **SQL Editor:** https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/sql/new

### Rotas Importantes
- `/` - Home
- `/painel/admin` - Dashboard Admin
- `/painel/palestrante` - Dashboard Palestrante
- `/meus-ingressos` - Área do Participante
- `/checkin/[eventId]` - Check-in

## 🔑 Credenciais (Configurar em .env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tzdraygdkeudxgtpoetp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 💾 SQL Úteis

### Criar Admin
```sql
UPDATE public.users SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

### Criar Palestrante
```sql
UPDATE public.users SET role = 'PALESTRANTE' WHERE email = 'email@exemplo.com';
```

### Ver Todos os Usuários
```sql
SELECT id, name, email, role FROM public.users;
```

### Ver Eventos
```sql
SELECT id, slug, title, is_published FROM public.events ORDER BY created_at DESC;
```

### Ver Participantes de um Evento
```sql
SELECT buyer_name, buyer_email, status, checked_in_at
FROM public.tickets
WHERE event_id = 'event-id-aqui';
```

## 📁 Estrutura de Arquivos Importante

```
/app
  /api              # APIs REST
  /painel/admin     # Admin
  /painel/palestrante # Palestrante
  /meus-ingressos   # Participante
  /checkin          # Check-in

/components         # Componentes React
/lib               # Utilitários
/types             # Tipos TypeScript

supabase-schema.sql # Schema do banco
exemplos-sql.sql    # Queries prontas
```

## 🎯 Roles e Permissões

| Role | Permissões |
|------|-----------|
| ADMIN | Tudo |
| PALESTRANTE | Criar e gerenciar próprios eventos |
| PARTICIPANTE | Comprar ingressos e ver QR Code |

## 🔧 Criar Evento (Via SQL)

```sql
-- 1. Copiar exemplo de exemplos-sql.sql
-- 2. Substituir:
--    - created_by: seu user ID
--    - Datas e informações
-- 3. Executar no SQL Editor
```

## 📊 Fluxo Completo de Teste

1. **Cadastrar** → `/cadastro`
2. **Tornar Admin** → SQL: `UPDATE users SET role = 'ADMIN'...`
3. **Criar Evento** → Via SQL (exemplos-sql.sql)
4. **Ver Home** → `/` (deve aparecer o evento)
5. **Comprar** → Clicar no evento → Comprar ingresso
6. **Ver QR** → `/meus-ingressos`
7. **Check-in** → `/checkin/[eventId]` → Escanear QR

## 🐛 Problemas Comuns

### API Key Inválida
- Verificar `.env.local`
- Reiniciar servidor

### Tabela Não Existe
- Executar `supabase-schema.sql`

### Scanner Não Funciona
- Permitir câmera no navegador
- Usar HTTPS em produção

## 📚 Documentação

- `README.md` - Visão geral
- `SETUP.md` - Setup completo
- `GUIA_COMPLETO.md` - Guia detalhado
- `QUICK_START.md` - Início rápido

## 🎨 Cores do Tema

```css
Primary: #dc2626 (red-600)
Background: #0a0a0a (black)
Foreground: #ededed (gray)
Cards: #1a1a1a (gray-900)
```

## 🔗 Links Externos Úteis

- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Tailwind Docs: https://tailwindcss.com/docs

---

**Dica:** Mantenha este arquivo aberto enquanto desenvolve!
