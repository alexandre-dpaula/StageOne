# Guia: Deletar Usuário e Seus Dados

## ⚠️ ATENÇÃO - AÇÃO IRREVERSÍVEL

Este processo vai deletar **PERMANENTEMENTE**:
- O usuário: `alexandresiqueiradepaula@hotmail.com`
- Todos os eventos criados por este usuário
- Todos os ingressos comprados por este usuário
- Todas as reservas de espaço deste usuário
- Módulos dos eventos (via CASCADE)
- Tipos de tickets dos eventos (via CASCADE)
- **IMPORTANTE**: Ingressos de outros participantes nos eventos criados por este usuário também serão deletados

---

## 📋 O Que Será Deletado

### 1. Perfil do Usuário
- Dados pessoais (nome, email, telefone, avatar)
- Role e permissões

### 2. Conta de Autenticação
- Credenciais de login no Supabase Auth
- Sessões ativas
- Histórico de autenticação

### 3. Eventos Criados
- Todos os eventos onde `created_by = user_id`
- Módulos desses eventos (CASCADE)
- Tipos de tickets desses eventos (CASCADE)
- **Tickets de TODOS os participantes** desses eventos

### 4. Participações
- Todos os ingressos comprados pelo usuário
- Histórico de participação em eventos

### 5. Reservas
- Reservas de espaço feitas pelo usuário
- Dados de pagamento relacionados

---

## 🚀 Como Executar

### Passo 1: Acessar Supabase SQL Editor

1. Ir para: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/sql/new
2. Ou acessar: Dashboard → SQL Editor → New Query

### Passo 2: Copiar o Script

Abrir o arquivo: `delete-user-alexandresiqueiradepaula.sql`

### Passo 3: Executar o Script

1. Colar todo o conteúdo do arquivo no SQL Editor
2. Clicar em **Run** (ou pressionar Ctrl+Enter)
3. Aguardar a execução completa

### Passo 4: Verificar Resultado

O script mostra mensagens de progresso:

```
✅ Usuário encontrado: [UUID]

📊 DADOS A SEREM DELETADOS:
   - Eventos criados: X
   - Ingressos comprados: Y
   - Reservas de espaço: Z

🗑️ Deletando tickets do usuário...
   ✅ Tickets deletados

🗑️ Deletando reservas de espaço...
   ✅ Reservas deletadas

🗑️ Deletando eventos criados pelo usuário...
   ✅ Eventos deletados

🗑️ Deletando perfil do usuário...
   ✅ Perfil deletado

🗑️ Deletando conta de autenticação...
   ✅ Conta de autenticação deletada

✅ USUÁRIO DELETADO COM SUCESSO!
```

### Passo 5: Verificação Final

O script também executa verificações automáticas:

```sql
✅ Usuário deletado com sucesso da tabela public.users
✅ Conta deletada com sucesso do auth.users
✅✅✅ PROCESSO COMPLETO!
```

---

## 🔍 Verificação Manual (Opcional)

Se quiser verificar manualmente antes ou depois:

```sql
-- Verificar se o usuário existe
SELECT * FROM public.users
WHERE email = 'alexandresiqueiradepaula@hotmail.com';

-- Verificar eventos criados pelo usuário
SELECT id, title, created_at
FROM public.events
WHERE created_by = (
  SELECT id FROM public.users
  WHERE email = 'alexandresiqueiradepaula@hotmail.com'
);

-- Verificar tickets do usuário
SELECT * FROM public.tickets
WHERE user_id = (
  SELECT id FROM public.users
  WHERE email = 'alexandresiqueiradepaula@hotmail.com'
);

-- Verificar reservas do usuário
SELECT * FROM public.space_bookings
WHERE user_id = (
  SELECT id FROM public.users
  WHERE email = 'alexandresiqueiradepaula@hotmail.com'
);
```

---

## ⚠️ Avisos Importantes

### 1. Impacto em Outros Usuários
Se este usuário criou eventos com participantes, **todos os ingressos desses participantes também serão deletados**. Considere:
- Avisar os participantes antes
- Fazer backup dos dados
- Considerar desativar o usuário ao invés de deletar

### 2. Dados de Pagamento
Transações no Stripe **NÃO** serão deletadas. Apenas os registros no banco de dados local serão removidos. Para deletar dados do Stripe:
- Acessar: https://dashboard.stripe.com/customers
- Buscar pelo email do usuário
- Deletar manualmente

### 3. Backup
**NÃO HÁ BACKUP AUTOMÁTICO**. Se quiser fazer backup antes:

```sql
-- Backup do usuário
COPY (SELECT * FROM public.users WHERE email = 'alexandresiqueiradepaula@hotmail.com')
TO '/tmp/backup_user.csv' CSV HEADER;

-- Backup dos eventos
COPY (SELECT * FROM public.events WHERE created_by IN (
  SELECT id FROM public.users WHERE email = 'alexandresiqueiradepaula@hotmail.com'
)) TO '/tmp/backup_events.csv' CSV HEADER;
```

### 4. Reversibilidade
⚠️ **ESTA AÇÃO É IRREVERSÍVEL**

Uma vez executado o script:
- Não é possível recuperar os dados
- O usuário precisará criar uma nova conta
- Todo o histórico será perdido

---

## 🔄 Alternativa: Desativar ao Invés de Deletar

Se você quer apenas **desativar** o usuário sem deletar os dados:

```sql
-- Opção 1: Marcar como inativo (adicionar coluna is_active se não existir)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

UPDATE public.users
SET is_active = FALSE
WHERE email = 'alexandresiqueiradepaula@hotmail.com';

-- Opção 2: Remover role de admin/palestrante
UPDATE public.users
SET role = 'PARTICIPANTE'
WHERE email = 'alexandresiqueiradepaula@hotmail.com';

-- Opção 3: Desativar login no Supabase Auth
-- Isso precisa ser feito pelo Dashboard do Supabase:
-- Authentication → Users → [selecionar usuário] → Disable User
```

---

## 📞 Suporte

Se houver erros durante a execução:

1. **Erro de permissão**: Certifique-se de estar usando uma conta com permissões de admin
2. **Erro de foreign key**: O script já trata as dependências na ordem correta
3. **Usuário não encontrado**: Verifique se o email está correto

Em caso de problemas, consulte os logs do Supabase:
- Dashboard → Logs → Postgres Logs

---

## ✅ Checklist Pré-Execução

Antes de executar o script, confirme:

- [ ] Tenho certeza de que quero deletar este usuário
- [ ] Avisei os participantes dos eventos criados por este usuário (se houver)
- [ ] Fiz backup dos dados importantes (se necessário)
- [ ] Entendo que esta ação é irreversível
- [ ] Estou logado com uma conta de admin no Supabase
- [ ] Verifiquei o email está correto: `alexandresiqueiradepaula@hotmail.com`

---

## 🎯 Executar Agora

Se você confirmou todos os itens acima:

1. Abrir: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/sql/new
2. Copiar todo o conteúdo de: `delete-user-alexandresiqueiradepaula.sql`
3. Colar no SQL Editor
4. Clicar em **Run**
5. Aguardar confirmação de sucesso

---

**Última atualização**: 21 de Janeiro de 2026
**Arquivo SQL**: `delete-user-alexandresiqueiradepaula.sql`
