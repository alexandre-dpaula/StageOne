# Solução: Problema de Redirect do Reset de Senha

## Problema Identificado

O link de reset de senha está redirecionando para a home page com erro:
```
error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

## Causa Raiz

O middleware está causando conflito com o fluxo de autenticação do Supabase:

1. O link do email contém um token de recuperação
2. Quando o usuário clica, o Supabase autentica temporariamente
3. O middleware detecta autenticação e redireciona
4. O token expira antes de chegar na página de reset

## Soluções Necessárias

### 1. Atualizar Middleware para Permitir `/redefinir-senha`

**Arquivo**: `lib/supabase/middleware.ts`

**Problema Atual**: Linhas 54-58 redirecionam usuários autenticados de páginas de auth, mas `/redefinir-senha` PRECISA de autenticação temporária.

**Solução**: Adicionar exceção para `/redefinir-senha`:

```typescript
// Redirect authenticated users away from auth pages
// EXCETO /redefinir-senha que precisa de auth temporária
if (user && (pathname === '/login' || pathname === '/cadastro')) {
  const url = request.nextUrl.clone()
  url.pathname = '/'
  return NextResponse.redirect(url)
}

// NÃO redirecionar /redefinir-senha mesmo com usuário autenticado
// Esta página precisa do token de recuperação válido
```

### 2. Verificar Configuração do Supabase Dashboard

**Passo 1**: Acessar Supabase Dashboard → Authentication → URL Configuration

**Passo 2**: Adicionar URL de redirect em **Redirect URLs**:
```
https://stage-one-1.vercel.app/redefinir-senha
http://localhost:3000/redefinir-senha
```

**Passo 3**: Confirmar que **Site URL** está configurado:
```
https://stage-one-1.vercel.app
```

### 3. Melhorar Tratamento de Erros na Página

**Arquivo**: `app/redefinir-senha/page.tsx`

**Adicionar**: Verificação de token expirado na montagem do componente:

```typescript
useEffect(() => {
  const checkToken = async () => {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      // Token inválido ou expirado
      setError('Link expirado ou inválido. Solicite um novo link de recuperação.')
    }
  }

  checkToken()
}, [])
```

### 4. Atualizar Código do Reset Password Email

**Arquivo**: `app/esqueci-senha/page.tsx` - Linha 57-59

**Código Atual**: ✅ CORRETO
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/redefinir-senha`,
})
```

Este código já está correto! O problema não é aqui.

## Implementação da Solução

### Passo 1: Atualizar Middleware

Modificar `lib/supabase/middleware.ts` para permitir `/redefinir-senha`:

```typescript
// Redirect authenticated users away from auth pages
// EXCETO /redefinir-senha que precisa do token de recuperação
if (user && (pathname === '/login' || pathname === '/cadastro')) {
  const url = request.nextUrl.clone()
  url.pathname = '/'
  return NextResponse.redirect(url)
}

// Permitir acesso a /redefinir-senha mesmo autenticado
// Esta rota precisa validar o token de recuperação manualmente
```

### Passo 2: Configurar Supabase Dashboard

1. Ir para: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/auth/url-configuration
2. Em **Redirect URLs**, adicionar:
   - `https://stage-one-1.vercel.app/redefinir-senha`
   - `http://localhost:3000/redefinir-senha` (para testes locais)
3. Salvar

### Passo 3: Testar o Fluxo

1. Solicitar novo reset de senha em `/esqueci-senha`
2. Verificar email (checar spam se necessário)
3. Clicar no link "Redefinir Senha"
4. Deve ir direto para `/redefinir-senha` sem erros
5. Criar nova senha e confirmar

## Verificação Final

Após implementar, o fluxo correto será:

```
1. Usuário solicita reset → /esqueci-senha
2. Email enviado com link de recuperação
3. Usuário clica no link do email
4. Supabase valida token e autentica temporariamente
5. Redirect para /redefinir-senha (SEM interceptação do middleware)
6. Usuário cria nova senha
7. Redirect para /login
```

## Problemas Adicionais Identificados

### Email vindo como "Supabase Auth"

**Solução**: Configurar SMTP customizado no Supabase Dashboard

**Passos**:
1. Authentication → Email Templates → Settings
2. Configurar SMTP personalizado (Gmail, SendGrid, etc.)
3. Atualizar "From Name" para "StageOne™"
4. Isso também remove o footer "powered by Supabase"

### Link do Email com redirect_to errado

O link atual mostra:
```
redirect_to=https://stage-one-1.vercel.app/
```

Deveria mostrar:
```
redirect_to=https://stage-one-1.vercel.app/redefinir-senha
```

**Causa**: Pode ser cacheamento do Supabase ou configuração antiga

**Solução**:
1. Limpar cache do browser
2. Solicitar NOVO reset de senha (o link antigo já expirou)
3. Verificar se o novo link contém o redirect correto

## Conclusão

A causa principal é o middleware redirecionando usuários autenticados, mas `/redefinir-senha` precisa de autenticação temporária do Supabase para validar o token de recuperação.

A solução é **não redirecionar** usuários autenticados de `/redefinir-senha`, permitindo que o fluxo de recuperação funcione corretamente.
