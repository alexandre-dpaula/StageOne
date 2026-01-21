# 📋 Instruções de Configuração do CRM Admin

## Passo 1: Criar as Tabelas no Banco de Dados

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e execute o conteúdo do arquivo: `create-admin-tables.sql`

Este script criará:
- ✅ Tabela `admins`
- ✅ Tabela `admin_activity_logs`
- ✅ Views de relatórios
- ✅ Funções SQL
- ✅ Políticas RLS

## Passo 2: Criar o Usuário Admin

### Opção A: Criar pelo Dashboard (Recomendado)

1. No **Supabase Dashboard**, vá em **Authentication → Users**
2. Clique em **Add User**
3. Preencha:
   - **Email**: `alexandresiqueiradepaula@hotmail.com`
   - **Password**: `Mma891372!`
   - Marque: ✅ **Auto Confirm User**
4. Clique em **Create User**

### Opção B: Executar SQL Automático

1. No **SQL Editor**, execute o arquivo: `create-admin-user.sql`
2. Este script irá:
   - Buscar o usuário pelo email
   - Criar o registro de admin automaticamente

## Passo 3: Verificar a Instalação

Execute este SQL para verificar se tudo foi criado corretamente:

```sql
-- Verificar se as tabelas existem
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('admins', 'admin_activity_logs');

-- Verificar se o admin foi criado
SELECT
  a.id,
  a.user_id,
  a.full_name,
  a.role,
  a.is_active,
  u.email
FROM admins a
JOIN auth.users u ON a.user_id = u.id
WHERE u.email = 'alexandresiqueiradepaula@hotmail.com';

-- Verificar se as views existem
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'admin_%';
```

## Passo 4: Acessar o Dashboard

1. Faça login na aplicação com:
   - **Email**: `alexandresiqueiradepaula@hotmail.com`
   - **Senha**: `Mma891372!`

2. Acesse o dashboard CRM em:
   ```
   http://localhost:3000/painel/crm
   ```

## 🎯 Funcionalidades Disponíveis

### Dashboard Principal
- ✅ Receita Total com crescimento
- ✅ Total de Eventos
- ✅ Total de Reservas
- ✅ Usuários Únicos

### Gráficos e Relatórios
- ✅ Gráfico de Receita Mensal (6 meses)
- ✅ Comparação Receita Bruta vs Líquida
- ✅ Top 5 Eventos por Receita
- ✅ Eventos Recentes

### Ações Rápidas
- ✅ Gerenciar Eventos
- ✅ Gerenciar Cupons
- ✅ Ver Reservas
- ✅ Atualizar Dashboard

## 🔧 Solução de Problemas

### Erro: "relation admins does not exist"
- Execute novamente o `create-admin-tables.sql`

### Erro: "Acesso negado - Admin apenas"
- Verifique se o usuário foi criado corretamente
- Execute o script de verificação do Passo 3

### Erro: Column "status" does not exist
- As correções já foram aplicadas nos arquivos SQL
- Certifique-se de executar a versão mais recente do `create-admin-tables.sql`

## 📊 Estrutura das Permissões

O sistema de admin possui duas roles:

### `admin` (Admin Regular)
```json
{
  "dashboard": true,
  "events": true,
  "users": true,
  "bookings": true,
  "coupons": true,
  "reports": true
}
```

### `super_admin` (Super Admin)
```json
{
  "dashboard": true,
  "events": true,
  "users": true,
  "bookings": true,
  "coupons": true,
  "reports": true,
  "settings": true,
  "admins": true
}
```

**Seu usuário foi criado como `super_admin`** ✅

## 🎨 Componentes Criados

### Frontend
- `app/painel/crm/page.tsx` - Dashboard principal
- `components/admin/StatsCard.tsx` - Cards de estatísticas
- `components/admin/RevenueChart.tsx` - Gráfico de receita

### Backend
- `app/api/admin/dashboard/route.ts` - API endpoint

### Database
- `create-admin-tables.sql` - Tabelas e funções
- `create-admin-user.sql` - Script do usuário admin

## 🚀 Próximos Passos

Após configurar o CRM, você pode:

1. ✅ Adicionar mais administradores
2. ✅ Personalizar permissões
3. ✅ Criar relatórios personalizados
4. ✅ Integrar com outras ferramentas

---

**Suporte**: Se encontrar algum problema, verifique os logs do console do navegador e do terminal Next.js.
