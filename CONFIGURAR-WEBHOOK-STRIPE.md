# Configurar Webhook do Stripe

## Passo 1: Acessar o Dashboard do Stripe

1. Acesse https://dashboard.stripe.com/test/webhooks
2. Clique em "Add endpoint" ou "Adicionar endpoint"

## Passo 2: Configurar o Endpoint

### URL do Webhook
```
http://localhost:3000/api/payments/stripe/webhook
```

### Eventos para Escutar
Selecione os seguintes eventos:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

## Passo 3: Copiar o Signing Secret

Após criar o webhook, o Stripe vai mostrar o **Signing Secret** (começa com `whsec_`).

Copie esse valor e adicione no arquivo `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

## Passo 4: Reiniciar o Servidor

```bash
npm run dev
```

## Passo 5: Testar o Webhook Localmente (Opcional)

Para testar webhooks em localhost, você pode usar o Stripe CLI:

### Instalar Stripe CLI
```bash
brew install stripe/stripe-cli/stripe
```

### Login
```bash
stripe login
```

### Encaminhar Webhooks para Localhost
```bash
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

Isso vai gerar um webhook secret temporário. Use esse secret no `.env.local` enquanto estiver testando localmente.

## Para Produção (Vercel)

Quando fizer deploy na Vercel:

1. Crie um novo webhook no dashboard do Stripe com a URL de produção:
   ```
   https://seu-dominio.vercel.app/api/payments/stripe/webhook
   ```

2. Adicione o `STRIPE_WEBHOOK_SECRET` nas variáveis de ambiente da Vercel:
   - Acesse seu projeto na Vercel
   - Settings > Environment Variables
   - Adicione `STRIPE_WEBHOOK_SECRET` com o valor do signing secret

3. Também adicione as outras chaves do Stripe em produção:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key: `pk_live_...`)
   - `STRIPE_SECRET_KEY` (live key: `sk_live_...`)

## Executar SQL da Tabela de Eventos

Execute o arquivo SQL no Supabase para criar a tabela de eventos do webhook:

```sql
-- Já está no arquivo: create-webhook-events-table.sql
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

CREATE POLICY "Service role can manage webhook events"
  ON public.stripe_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

## Verificar se Está Funcionando

Após configurar:

1. Faça uma compra de teste
2. No dashboard do Stripe, vá em "Webhooks" e clique no seu endpoint
3. Você verá os eventos sendo enviados e as respostas
4. O status da reserva no banco deve atualizar automaticamente para `PAID`

## Solução Temporária

Enquanto o webhook não está configurado, você pode clicar no botão "Verificar Status" na página de aguardo de pagamento. Ele vai sincronizar manualmente o status do Stripe com o banco de dados.
