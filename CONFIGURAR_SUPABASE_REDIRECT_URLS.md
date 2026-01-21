# Configuração do Supabase - Redirect URLs

## ⚠️ IMPORTANTE: Configure ANTES de Testar

Para que o reset de senha funcione corretamente, você PRECISA configurar as Redirect URLs no Supabase Dashboard.

## Passo a Passo

### 1. Acessar Supabase Dashboard

URL: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/auth/url-configuration

Ou:
1. Ir para https://supabase.com/dashboard
2. Selecionar projeto **StageOne™**
3. Menu lateral: **Authentication** → **URL Configuration**

### 2. Configurar Site URL

**Campo**: Site URL

**Valor para Produção**:
```
https://stage-one-1.vercel.app
```

**Valor para Desenvolvimento Local**:
```
http://localhost:3000
```

### 3. Adicionar Redirect URLs

**Campo**: Redirect URLs

**Adicionar as seguintes URLs** (uma por linha):

```
https://stage-one-1.vercel.app/redefinir-senha
https://stage-one-1.vercel.app/login
https://stage-one-1.vercel.app/cadastro
http://localhost:3000/redefinir-senha
http://localhost:3000/login
http://localhost:3000/cadastro
```

### 4. Salvar Configurações

Clicar em **Save** no canto superior direito.

## Testando a Configuração

### Passo 1: Limpar Cache
1. Fechar todas as abas do navegador
2. Limpar cache e cookies
3. Abrir em aba anônima (recomendado para teste)

### Passo 2: Solicitar Reset de Senha
1. Ir para: https://stage-one-1.vercel.app/esqueci-senha
2. Digite seu email
3. Clicar em "Enviar link"

### Passo 3: Verificar Email
1. Abrir caixa de entrada (verificar spam também)
2. Abrir email "Redefinição de Senha - StageOne™"
3. Clicar no botão "Redefinir Senha"

### Passo 4: Validar Redirect
O link deve:
- ✅ Redirecionar para: `https://stage-one-1.vercel.app/redefinir-senha`
- ✅ Mostrar formulário de nova senha
- ❌ NÃO deve ir para home (/)
- ❌ NÃO deve mostrar erro "OTP expired"

### Passo 5: Criar Nova Senha
1. Digite nova senha (mínimo 6 caracteres)
2. Confirme a senha
3. Clicar em "Redefinir senha"
4. Deve mostrar "Senha redefinida!"
5. Redirecionar para login

## Problemas Comuns

### ❌ Link ainda vai para home (/)

**Causa**: Cache do Supabase ou configuração não aplicada

**Solução**:
1. Aguardar 2-3 minutos após salvar configuração
2. Solicitar NOVO reset de senha (link antigo já expirou)
3. Limpar cache do navegador
4. Testar em aba anônima

### ❌ Erro: "Redirect URL not allowed"

**Causa**: URL não está na lista de Redirect URLs permitidas

**Solução**:
1. Verificar se a URL está EXATAMENTE como configurada
2. Verificar protocolo (http vs https)
3. Verificar domínio completo
4. Adicionar a URL na configuração do Supabase

### ❌ Link mostra "OTP expired" imediatamente

**Causa**: Token já foi usado ou realmente expirou

**Solução**:
1. Tokens expiram em 1 hora
2. Cada token só pode ser usado 1 vez
3. Solicitar novo reset de senha
4. Usar o link em até 1 hora

### ❌ Email não chega

**Solução**:
1. Verificar pasta de spam
2. Aguardar até 5 minutos
3. Verificar logs no Supabase: Authentication → Logs
4. Confirmar que o email está correto

## Configurações Adicionais (Opcional)

### SMTP Customizado

Para remover branding "Supabase Auth" e footer:

**Passos**:
1. Authentication → Settings → SMTP Settings
2. Enable custom SMTP server
3. Configurar com Gmail, SendGrid, ou outro provedor
4. Atualizar "Sender name" para: `StageOne™`
5. Salvar

**Providers Recomendados**:
- **SendGrid**: Gratuito até 100 emails/dia
- **Gmail SMTP**: Gratuito (limite 500/dia)
- **Resend**: Gratuito até 3000/mês (recomendado)

### Email Templates

Para atualizar os templates de email:

**Localização**: `TEMPLATES_EMAIL_MODO_CLARO.md`

**Aplicar no Supabase**:
1. Authentication → Email Templates
2. Selecionar template (Reset Password, Confirm Signup, etc.)
3. Copiar HTML do arquivo `.md`
4. Colar no editor do Supabase
5. Salvar

## Verificação Final

Após configurar tudo, o fluxo completo deve funcionar assim:

```
1. Usuário solicita reset → /esqueci-senha ✅
2. Email enviado com template personalizado ✅
3. Usuário clica no link do email ✅
4. Supabase valida token ✅
5. Redirect para /redefinir-senha ✅
6. Usuário cria nova senha ✅
7. Senha atualizada com sucesso ✅
8. Redirect para /login ✅
9. Login com nova senha funciona ✅
```

## URLs de Referência

- **Dashboard Supabase**: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp
- **URL Configuration**: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/auth/url-configuration
- **Email Templates**: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/auth/templates
- **Auth Logs**: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/auth/logs

## Suporte

Se ainda tiver problemas após seguir este guia:

1. Verificar arquivo: `SOLUCAO_REDIRECT_SENHA.md`
2. Verificar logs do Supabase
3. Testar em ambiente local primeiro
4. Abrir issue no GitHub do projeto
