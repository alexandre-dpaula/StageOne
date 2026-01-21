import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { eventId, amount } = await request.json()

    if (!eventId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'eventId e amount são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se é o criador do evento
    const { data: event } = await supabase
      .from('events')
      .select('created_by, title')
      .eq('id', eventId)
      .single()

    if (!event || event.created_by !== user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Buscar financeiro do evento
    const { data: financials, error: financialsError } = await supabase
      .from('event_financials')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (financialsError || !financials) {
      return NextResponse.json(
        { error: 'Dados financeiros não encontrados' },
        { status: 404 }
      )
    }

    // Validar se pode sacar
    if (!financials.can_withdraw) {
      const availableAt = financials.withdrawal_available_at
        ? new Date(financials.withdrawal_available_at).toLocaleDateString('pt-BR')
        : 'data não disponível'

      return NextResponse.json(
        {
          error: `Saque não disponível. Aguarde até ${availableAt} (48h após o evento).`,
        },
        { status: 400 }
      )
    }

    // Validar saldo disponível
    const availableBalance = Number(financials.available_balance)
    if (amount > availableBalance) {
      return NextResponse.json(
        {
          error: `Saldo insuficiente. Disponível: R$ ${availableBalance.toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    // Buscar conta Stripe Connect do usuário
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_account_id, stripe_account_status, stripe_payouts_enabled')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_account_id) {
      return NextResponse.json(
        {
          error: 'Conta Stripe não configurada. Complete o cadastro primeiro.',
          action_required: 'setup_stripe',
        },
        { status: 400 }
      )
    }

    if (userData.stripe_account_status !== 'ACTIVE' || !userData.stripe_payouts_enabled) {
      return NextResponse.json(
        {
          error: 'Conta Stripe pendente de verificação. Complete o cadastro.',
          action_required: 'complete_stripe',
        },
        { status: 400 }
      )
    }

    // Criar transferência no Stripe
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Converter para centavos
      currency: 'brl',
      destination: userData.stripe_account_id,
      description: `Saque do evento: ${event.title}`,
      metadata: {
        event_id: eventId,
        user_id: user.id,
        event_title: event.title,
      },
    })

    // Criar registro de saque
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .insert({
        event_id: eventId,
        user_id: user.id,
        amount,
        stripe_transfer_id: transfer.id,
        stripe_account_id: userData.stripe_account_id,
        status: 'PROCESSING',
        processing_started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (withdrawalError) {
      console.error('Error creating withdrawal:', withdrawalError)
      // Tentar cancelar a transferência no Stripe
      try {
        await stripe.transfers.createReversal(transfer.id)
      } catch (e) {
        console.error('Error reversing transfer:', e)
      }
      return NextResponse.json({ error: withdrawalError.message }, { status: 500 })
    }

    // Atualizar saldo imediatamente (o trigger fará isso também, mas fazemos aqui para feedback instantâneo)
    await supabase
      .from('event_financials')
      .update({
        withdrawn_amount: Number(financials.withdrawn_amount) + amount,
        available_balance: availableBalance - amount,
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', eventId)

    return NextResponse.json({
      success: true,
      message: `Saque de R$ ${amount.toFixed(2)} solicitado com sucesso!`,
      withdrawal: {
        id: withdrawal.id,
        amount,
        status: 'PROCESSING',
        stripe_transfer_id: transfer.id,
        requested_at: withdrawal.requested_at,
      },
    })
  } catch (error: any) {
    console.error('Create withdrawal error:', error)

    // Erro específico do Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        {
          error: 'Erro ao processar saque. Verifique sua conta Stripe.',
          stripe_error: error.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao solicitar saque' },
      { status: 500 }
    )
  }
}
