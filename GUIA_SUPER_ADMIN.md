# Criar Super Admin - Guia Completo

## 🔐 Credenciais do Super Admin

```
📧 Email:    alexandresiqueiradepaula@hotmail.com
👤 Nome:     Alexandre Dpaula
🔑 Senha:    Mma891372!
⭐ Role:     ADMIN (Super Admin)
```

---

## 🚀 Como Criar

### Passo 1: Acessar Supabase SQL Editor

**URL**: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/sql/new

### Passo 2: Executar o Script

O script já está na área de transferência!

1. **Cole** o script (Cmd+V)
2. **Execute** (Run)
3. **Aguarde** a confirmação

---

## 📊 O Que o Script Faz

### 1. Verificação ✅
- Verifica se o email já existe
- Se existir, mostra mensagem e não cria duplicado

### 2. Criação de Conta 🔐
- Cria usuário em `auth.users` (sistema de autenticação)
- Senha criptografada com bcrypt
- Email já confirmado (não precisa verificar)

### 3. Criação de Perfil 👤
- Cria perfil em `public.users`
- Define `role = 'ADMIN'` (Super Admin)
- Nome: Alexandre Dpaula

### 4. Criação de Identidade 🆔
- Configura identidade de autenticação
- Permite login com email/senha

---

## ✅ Resultado Esperado

Após executar, você verá:

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         ✅ SUPER ADMIN CRIADO COM SUCESSO! ✅             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

👤 DADOS DO SUPER ADMIN:
   📧 Email: alexandresiqueiradepaula@hotmail.com
   👤 Nome: Alexandre Dpaula
   🆔 UUID: [gerado automaticamente]
   🔑 Role: ADMIN
   🔐 Senha: [CONFIGURADA]

🔐 CREDENCIAIS DE LOGIN:
   Email: alexandresiqueiradepaula@hotmail.com
   Senha: Mma891372!

✅ Usuário criado em auth.users
✅ Perfil criado em public.users com role ADMIN
```

---

## 🎯 Como Fazer Login

### Opção 1: Produção (Vercel)
```
https://stage-one-1.vercel.app/login
```

### Opção 2: Desenvolvimento Local
```
http://localhost:3002/login
```

### Credenciais:
- **Email**: alexandresiqueiradepaula@hotmail.com
- **Senha**: Mma891372!

---

## 🔑 Permissões do Super Admin

Como **ADMIN**, você tem acesso a:

### ✅ Criar Eventos
- Criar novos eventos e treinamentos
- Editar eventos existentes
- Excluir eventos

### ✅ Gerenciar Ingressos
- Ver todos os ingressos vendidos
- Gerenciar tipos de ingressos
- Ver estatísticas de vendas

### ✅ Acessar Painel Admin
- Dashboard com métricas
- Relatórios de vendas
- Gerenciamento de usuários

### ✅ Reservar Espaços
- Fazer reservas de espaço
- Ver todas as reservas
- Gerenciar bookings

---

## 🛡️ Segurança

### Senha Forte ✅
A senha escolhida (`Mma891372!`) atende os requisitos:
- ✅ Mínimo 8 caracteres
- ✅ Letras maiúsculas (M)
- ✅ Letras minúsculas (m, a)
- ✅ Números (891372)
- ✅ Caracteres especiais (!)

### Recomendações:

1. **Trocar senha após primeiro login** (opcional)
2. **Não compartilhar** estas credenciais
3. **Usar autenticação de 2 fatores** (se disponível)
4. **Fazer logout** após uso em computadores públicos

---

## 🔄 Trocar Senha (Opcional)

Se quiser trocar a senha após criar:

### Opção 1: Pela Interface
1. Fazer login
2. Ir em Perfil/Configurações
3. Trocar senha

### Opção 2: Pelo SQL
```sql
-- Atualizar senha no Supabase
UPDATE auth.users
SET encrypted_password = crypt('NOVA_SENHA_AQUI', gen_salt('bf'))
WHERE email = 'alexandresiqueiradepaula@hotmail.com';
```

---

## ❌ Se Já Existir

Se o script mostrar: **"⚠️ Usuário já existe com este email!"**

### Opção 1: Deletar o Existente
```sql
-- Executar script de deleção
-- Usar: delete-user-FINAL.sql (modificando o email)
```

### Opção 2: Apenas Atualizar Role
```sql
-- Atualizar para ADMIN
UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'alexandresiqueiradepaula@hotmail.com';
```

### Opção 3: Resetar Senha
```sql
-- Apenas resetar a senha
UPDATE auth.users
SET encrypted_password = crypt('Mma891372!', gen_salt('bf'))
WHERE email = 'alexandresiqueiradepaula@hotmail.com';
```

---

## 🧪 Testar Login

### Passo 1: Acessar página de login
```
https://stage-one-1.vercel.app/login
```

### Passo 2: Inserir credenciais
- Email: alexandresiqueiradepaula@hotmail.com
- Senha: Mma891372!

### Passo 3: Verificar acesso
- ✅ Deve fazer login com sucesso
- ✅ Deve mostrar nome "Alexandre Dpaula"
- ✅ Deve ter acesso ao painel admin

---

## 📋 Verificação Manual

Para verificar se foi criado corretamente:

```sql
-- Ver dados do usuário
SELECT
  u.id,
  u.name,
  u.email,
  u.role,
  u.created_at,
  a.email_confirmed_at,
  a.last_sign_in_at
FROM public.users u
JOIN auth.users a ON u.id = a.id
WHERE u.email = 'alexandresiqueiradepaula@hotmail.com';
```

**Deve retornar**:
- ✅ 1 linha com os dados
- ✅ role = 'ADMIN'
- ✅ email_confirmed_at preenchido
- ✅ Todos os campos corretos

---

## 🎉 Pronto!

Após executar o script:

1. ✅ Super Admin criado
2. ✅ Senha configurada
3. ✅ Email confirmado
4. ✅ Pronto para fazer login
5. ✅ Acesso total ao sistema

---

## 📞 Problemas Comuns

### Erro: "Usuário já existe"
**Solução**: Use uma das opções da seção "Se Já Existir"

### Erro: "Email já cadastrado"
**Solução**: Delete o usuário existente primeiro

### Login não funciona
**Solução**:
1. Verificar se a senha está correta
2. Tentar resetar senha pelo SQL
3. Verificar se email está confirmado

### Não aparece como ADMIN
**Solução**:
```sql
UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'alexandresiqueiradepaula@hotmail.com';
```

---

**Arquivo**: `create-super-admin.sql`
**Última atualização**: 21 de Janeiro de 2026
