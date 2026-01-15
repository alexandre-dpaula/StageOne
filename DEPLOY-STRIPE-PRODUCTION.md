# Deploy do Sistema Stripe para Produção (Vercel)

## ✅ O que já está funcionando em desenvolvimento:

- Checkout v2 com 3 etapas (Dados → Pagamento → Confirmação)
- Stripe Payment Element com automatic_payment_methods
- Webhooks com idempotência
- Polling rápido (1s nos primeiros 30s, depois 3s)
- Sincronização manual via botão "Verificar Status"
- Email de confirmação automático
- Redirecionamento automático para "Meus Ingressos"

## 📋 Checklist para Deploy em Produção

### 1. Executar SQL no Supabase (OBRIGATÓRIO)

Acesse o SQL Editor do Supabase em produção:
https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/sql/new

Execute este SQL:

```sql
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id ON public.stripe_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type ON public.stripe_webhook_events(event_type);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.stripe_webhook_events;

CREATE POLICY "Service role can manage webhook events"
  ON public.stripe_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 2. Configurar Variáveis de Ambiente na Vercel

Acesse: https://vercel.com/alexandre-dpaulas-projects/stage-one/settings/environment-variables

Adicione as seguintes variáveis:

#### Stripe em Produção (Chaves LIVE):

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Você receberá isso depois de configurar o webhook
```

**IMPORTANTE**: Não use as chaves de teste (pk_test/sk_test) em produção!

#### Outras variáveis que já devem estar configuradas:

```bash
NEXT_PUBLIC_APP_URL=https://stage-one-1.vercel.app
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_SUPABASE_URL=https://tzdraygdkeudxgtpoetp.supabase.co
SMTP_HOST=smtp.gmail.com
SMTP_PASS=hkgx nvmo mrzl vtwx
SMTP_PORT=587
SMTP_USER=stageone2026@gmail.com
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3. Obter Chaves Stripe de Produção

1. Acesse: https://dashboard.stripe.com/
2. **IMPORTANTE**: Alterne do modo "Test" para "Live" (toggle no canto superior direito)
3. Vá em "Developers" > "API keys"
4. Copie:
   - **Publishable key** (começa com `pk_live_`)
   - **Secret key** (começa com `sk_live_`) - clique em "Reveal live key token"

### 4. Fazer Deploy na Vercel

```bash
git add .
git commit -m "feat: integração completa com Stripe - checkout v2, webhooks e polling rápido"
git push origin main
```

A Vercel vai fazer o deploy automaticamente.

### 5. Configurar Webhook no Stripe (APÓS o deploy)

Aguarde o deploy finalizar e então:

1. Acesse: https://dashboard.stripe.com/webhooks
2. **CERTIFIQUE-SE que está no modo LIVE** (não Test)
3. Clique em "+ Add endpoint"
4. Configure:
   - **URL do endpoint**: `https://stage-one-1.vercel.app/api/payments/stripe/webhook`
   - **Descrição**: `Produção - StageOne Webhooks`
   - **Eventos para escutar**:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
5. Clique em "Add endpoint"
6. **COPIE o Signing Secret** (começa com `whsec_`)
7. Adicione na Vercel:
   - Vá em Settings > Environment Variables
   - Adicione `STRIPE_WEBHOOK_SECRET` com o valor copiado
   - Clique em "Save"
8. **Faça um novo deploy** para aplicar a variável:
   - Vá em Deployments
   - Clique nos 3 pontos no último deployment
   - Clique em "Redeploy"

### 6. Testar em Produção

1. Acesse: https://stage-one-1.vercel.app
2. Faça login
3. Vá em um evento
4. Clique em "Comprar"
5. Use um **cartão de teste real do Stripe**:
   - **Sucesso**: `4242 4242 4242 4242`
   - **Falha**: `4000 0000 0000 0002`
   - Data: Qualquer data futura
   - CVV: Qualquer 3 dígitos
   - CEP: Qualquer CEP

6. Verifique se:
   - O pagamento foi processado
   - Você foi redirecionado para "Meus Ingressos" em 1-2 segundos
   - Recebeu email de confirmação
   - O ingresso aparece em "Meus Ingressos"

### 7. Verificar Webhooks Funcionando

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique no webhook que você criou
3. Vá na aba "Events"
4. Você deve ver os eventos sendo enviados com status 200 OK

## 🚨 Troubleshooting

### Webhook não está funcionando

1. Verifique se o `STRIPE_WEBHOOK_SECRET` está configurado na Vercel
2. Verifique se fez redeploy depois de adicionar a variável
3. Verifique se a URL do webhook está correta (https, não http)
4. Veja os logs do webhook no Stripe Dashboard para erros

### Pagamento fica em "Aguardando"

1. Verifique se o webhook está configurado corretamente
2. Clique em "Verificar Status" - isso sincroniza manualmente
3. Verifique os logs da Vercel para erros

### Emails não chegam

1. Verifique se as variáveis SMTP estão configuradas na Vercel
2. Verifique a pasta de spam
3. Veja os logs da Vercel para erros de email

## 📊 Monitoramento

### Logs da Vercel
- Acesse: https://vercel.com/alexandre-dpaulas-projects/stage-one/logs
- Filtre por "stripe" ou "webhook" para ver eventos

### Dashboard do Stripe
- Pagamentos: https://dashboard.stripe.com/payments
- Webhooks: https://dashboard.stripe.com/webhooks
- Logs: https://dashboard.stripe.com/logs

## 🔒 Segurança

- ✅ Webhook signature verification habilitada
- ✅ Idempotência de eventos implementada
- ✅ Chaves secretas nunca expostas no frontend
- ✅ RLS policies no Supabase
- ✅ Retry logic para operações críticas

## 💰 Taxas do Stripe no Brasil

- **Cartão de crédito**: 3,99% + R$ 0,39 por transação
- **Boleto bancário**: 2,99% + R$ 2,00 por transação
- **PIX**: 0,99% por transação (sem taxa fixa)

## ✅ Checklist Final

- [ ] SQL executado no Supabase
- [ ] Chaves Stripe LIVE configuradas na Vercel
- [ ] Deploy feito com sucesso
- [ ] Webhook configurado no Stripe (modo LIVE)
- [ ] STRIPE_WEBHOOK_SECRET adicionado na Vercel
- [ ] Redeploy feito após adicionar webhook secret
- [ ] Teste de compra realizado com sucesso
- [ ] Email de confirmação recebido
- [ ] Webhook mostrando status 200 OK no dashboard

---

**Pronto!** 🚀 O sistema de pagamentos Stripe está em produção!
