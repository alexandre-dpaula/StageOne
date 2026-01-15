# ✅ Webhook Stripe Configurado com Sucesso!

## O que JÁ está funcionando:

1. ✅ **Stripe CLI instalado e rodando**
   - Encaminhando webhooks de `stripe.com` para `localhost:3000/api/payments/stripe/webhook`
   - Processo rodando em background (PID: 80198)

2. ✅ **Webhook Secret configurado**
   - Secret adicionado ao `.env.local`: `whsec_c8abc0c5ee585c54e6cb087ea6771a674f0c374611a70bc05b9e195545106281`

3. ✅ **Endpoint de sincronização manual criado**
   - `/api/payments/stripe/sync-payment` - para sincronizar status manualmente

4. ✅ **Botão "Verificar Status" atualizado**
   - Agora chama o endpoint de sincronização ao invés de apenas fazer polling

## ⚠️ Falta apenas 1 coisa:

### Executar o SQL no Supabase

Acesse o SQL Editor do Supabase:
👉 https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/sql/new

Cole e execute este SQL:

```sql
-- Create table to track processed webhook events for idempotency
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id ON public.stripe_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type ON public.stripe_webhook_events(event_type);

-- Add RLS policies
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access (webhooks are backend-only)
CREATE POLICY "Service role can manage webhook events"
  ON public.stripe_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

## Como testar AGORA:

### 1. Resolver a compra travada

Na página que está em "Aguardando Pagamento", clique no botão **"Verificar Status"**.

Isso vai:
- Buscar o status do pagamento no Stripe
- Atualizar o banco de dados
- Redirecionar você para "Meus Ingressos" se o pagamento foi confirmado

### 2. Fazer uma nova compra de teste

1. Vá para a página do evento
2. Clique em "Comprar"
3. Preencha os dados
4. Use o cartão de teste: `4242 4242 4242 4242` (qualquer data futura e CVV)
5. Confirme o pagamento

**O que vai acontecer:**
- O pagamento será processado no Stripe
- O webhook vai notificar automaticamente o sistema
- O status no banco será atualizado para `PAID`
- Você será redirecionado para "Meus Ingressos"
- Um email de confirmação será enviado

### 3. Ver os webhooks em tempo real

Abra um novo terminal e rode:

```bash
tail -f /tmp/stripe-webhook.log
```

Você verá os eventos do Stripe chegando em tempo real.

## Comandos úteis:

### Ver se o Stripe CLI está rodando:
```bash
ps aux | grep stripe
```

### Parar o Stripe CLI:
```bash
kill 80198
```

### Reiniciar o Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook > /tmp/stripe-webhook.log 2>&1 &
```

## Para produção (Vercel):

Quando fizer deploy:

1. No Stripe Dashboard, crie um webhook endpoint:
   - URL: `https://seu-dominio.vercel.app/api/payments/stripe/webhook`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`

2. Copie o Signing Secret e adicione na Vercel:
   - Settings > Environment Variables
   - Nome: `STRIPE_WEBHOOK_SECRET`
   - Valor: `whsec_...`

3. Troque para chaves de produção:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...`
   - `STRIPE_SECRET_KEY`: `sk_live_...`

---

**Resumo:** Tudo está configurado! Execute o SQL no Supabase e clique em "Verificar Status" na página travada.
