# 🏪 Sistema de Marketplace - Guia de Implementação

## ✅ O que JÁ foi criado:

### 1. **SQL Completo** (`add-marketplace-system.sql`)
- ✅ Campos Stripe Connect em `users`
- ✅ Campos de marketplace em `events` (status, custos, adicionais)
- ✅ Tabela `event_financials` (controle financeiro automático)
- ✅ Tabela `withdrawals` (saques via Stripe Connect)
- ✅ Função `calculate_event_costs()` (cálculo automático R$ 100/h)
- ✅ Triggers automáticos para:
  - Calcular custos ao criar/editar evento
  - Atualizar financeiro a cada venda
  - Habilitar saque 48h após evento
  - Processar saques e atualizar saldos
- ✅ Views úteis:
  - `creator_financial_summary` (resumo por criador)
  - `pending_approval_events` (eventos para admin aprovar)

### 2. **TypeScript Types** (`types/database.types.ts`)
- ✅ `EventStatus`, `StripeAccountStatus`, `WithdrawalStatus`
- ✅ Campos Stripe Connect em `User`
- ✅ Campos marketplace em `Event`
- ✅ `EventFinancials` interface
- ✅ `Withdrawal` interface
- ✅ `EventCostCalculation` interface
- ✅ `CreatorFinancialSummary` interface

---

## 📋 Próximos Passos para Completar a Implementação

### **PASSO 1: Executar SQL no Supabase**

Acesse: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/sql/new

Execute o arquivo: `add-marketplace-system.sql`

---

### **PASSO 2: Criar APIs**

#### A. API de Cálculo de Custos
**Arquivo:** `/app/api/events/calculate-cost/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase.rpc('calculate_event_costs', {
    p_duration_hours: body.duration_hours,
    p_has_audiovisual: body.has_audiovisual || false,
    p_has_coffee_break: body.has_coffee_break || false,
    p_has_coverage: body.has_coverage || false,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ costs: data[0] })
}
```

#### B. API Stripe Connect Onboarding
**Arquivo:** `/app/api/stripe/connect/onboard/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Buscar ou criar conta Stripe Connect
  let { data: userData } = await supabase
    .from('users')
    .select('stripe_account_id, stripe_account_status')
    .eq('id', user.id)
    .single()

  let accountId = userData?.stripe_account_id

  // Se não tem conta, criar
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'BR',
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
    })

    accountId = account.id

    await supabase
      .from('users')
      .update({
        stripe_account_id: accountId,
        stripe_account_status: 'PENDING',
      })
      .eq('id', user.id)
  }

  // Criar link de onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/painel/palestrante/financeiro?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/painel/palestrante/financeiro?success=true`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
```

#### C. API de Solicitação de Saque
**Arquivo:** `/app/api/withdrawals/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { eventId, amount } = await request.json()

  // Validar saldo disponível
  const { data: financials } = await supabase
    .from('event_financials')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single()

  if (!financials || !financials.can_withdraw) {
    return NextResponse.json(
      { error: 'Saque não disponível. Aguarde 48h após o evento.' },
      { status: 400 }
    )
  }

  if (amount > financials.available_balance) {
    return NextResponse.json(
      { error: 'Saldo insuficiente' },
      { status: 400 }
    )
  }

  // Buscar conta Stripe do usuário
  const { data: userData } = await supabase
    .from('users')
    .select('stripe_account_id, stripe_account_status')
    .eq('id', user.id)
    .single()

  if (!userData?.stripe_account_id || userData.stripe_account_status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Complete o cadastro do Stripe Connect primeiro' },
      { status: 400 }
    )
  }

  // Criar transferência no Stripe
  const transfer = await stripe.transfers.create({
    amount: Math.round(amount * 100), // Converter para centavos
    currency: 'brl',
    destination: userData.stripe_account_id,
    metadata: {
      event_id: eventId,
      user_id: user.id,
    },
  })

  // Criar registro de saque
  const { data: withdrawal, error } = await supabase
    .from('withdrawals')
    .insert({
      event_id: eventId,
      user_id: user.id,
      amount,
      stripe_transfer_id: transfer.id,
      stripe_account_id: userData.stripe_account_id,
      status: 'PROCESSING',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ withdrawal })
}
```

---

### **PASSO 3: Atualizar Formulário de Criação de Evento**

**Arquivo:** `/app/painel/palestrante/eventos/novo/page.tsx`

Adicionar na UI:

```tsx
// Adicionar seleção de duração
<div className="space-y-2">
  <label className="block text-sm font-medium">Duração do Evento</label>
  <select
    value={eventDurationHours}
    onChange={(e) => {
      setEventDurationHours(Number(e.target.value))
      calculateCosts() // Recalcular custos
    }}
  >
    <option value="4">4 horas - R$ 400,00</option>
    <option value="6">6 horas - R$ 600,00</option>
    <option value="8">8 horas - R$ 800,00</option>
    <option value="10">10 horas - R$ 1.000,00</option>
    <option value="12">12 horas - R$ 1.200,00</option>
  </select>
</div>

// Adicionar adicionais
<div className="space-y-3">
  <h3 className="font-medium">Serviços Adicionais</h3>

  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={hasAudiovisual}
      onChange={(e) => setHasAudiovisual(e.target.checked)}
    />
    <span>Material Audiovisual</span>
    <span className="ml-auto text-sm text-gray-500">+ R$ {audiovisualPrice}</span>
  </label>

  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={hasCoffeeBreak}
      onChange={(e) => setHasCoffeeBreak(e.target.checked)}
    />
    <span>Coffee Break</span>
    <span className="ml-auto text-sm text-gray-500">+ R$ {coffeeBreakPrice}</span>
  </label>

  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={hasCoverage}
      onChange={(e) => setHasCoverage(e.target.checked)}
    />
    <span>Cobertura Fotográfica</span>
    <span className="ml-auto text-sm text-gray-500">+ R$ {coveragePrice}</span>
  </label>
</div>

// Mostrar resumo de custos
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <h4 className="font-medium mb-2">💰 Custos do Evento</h4>
  <div className="space-y-1 text-sm">
    <div className="flex justify-between">
      <span>Sala ({eventDurationHours}h)</span>
      <span>R$ {roomPrice.toFixed(2)}</span>
    </div>
    {hasAudiovisual && (
      <div className="flex justify-between">
        <span>Audiovisual</span>
        <span>R$ {audiovisualPrice.toFixed(2)}</span>
      </div>
    )}
    {/* ... outros adicionais */}
    <div className="flex justify-between text-xs text-gray-500">
      <span>Taxa da Plataforma (3%)</span>
      <span>Calculada sobre vendas</span>
    </div>
    <div className="border-t pt-1 flex justify-between font-medium">
      <span>Total de Custos Base</span>
      <span>R$ {totalServiceCost.toFixed(2)}</span>
    </div>
  </div>
  <p className="text-xs text-gray-600 mt-2">
    ℹ️ Os custos serão descontados automaticamente do valor arrecadado
  </p>
</div>

// Mudar botão final
<button type="submit">
  Enviar para Aprovação
</button>
```

---

### **PASSO 4: Criar Página de Aprovação (Admin)**

**Arquivo:** `/app/painel/admin/eventos/pendentes/page.tsx`

Ver eventos aguardando aprovação e aprovar/rejeitar.

---

### **PASSO 5: Criar Página Financeira do Criador**

**Arquivo:** `/app/painel/palestrante/financeiro/[eventId]/page.tsx`

Mostrar:
- Receita bruta
- Custos (sala, adicionais, taxa)
- Saldo líquido
- Botão de saque (se disponível)

---

### **PASSO 6: Atualizar Webhook Stripe**

Já está implementado! Os triggers no SQL atualizam automaticamente o financeiro a cada venda confirmada.

---

## 🧪 Como Testar

1. Execute o SQL no Supabase
2. Crie um evento de teste com adicionais
3. Admin aprova o evento
4. Venda ingressos (sistema calcula financeiro automaticamente)
5. Marque evento como COMPLETED após 48h
6. Solicite saque via Stripe Connect

---

## 📊 Exemplo de Cálculo

**Evento:**
- Duração: 8 horas
- Sala: R$ 800,00
- Audiovisual: R$ 150,00
- Coffee Break: R$ 200,00
- **Total custos fixos: R$ 1.150,00**

**Vendas:**
- 20 ingressos × R$ 500 = **R$ 10.000,00**

**Taxas:**
- Plataforma (3%): R$ 300,00
- Stripe (~4%): R$ 407,80
- **Total taxas: R$ 707,80**

**Resultado:**
- Bruto: R$ 10.000,00
- Custos: R$ 1.857,80
- **Líquido para criador: R$ 8.142,20** ✅

---

## 🚀 Configuração do Stripe Connect

No Dashboard do Stripe:
1. Habilitar Stripe Connect
2. Escolher tipo: **Express**
3. Configurar país: **Brasil**
4. Configurar webhook para `transfer.created`, `transfer.updated`, `transfer.failed`

---

**Pronto para continuar implementando as APIs e UIs!** 🎯
