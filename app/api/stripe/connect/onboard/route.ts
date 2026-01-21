import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id, stripe_account_status, email, name')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    let accountId = userData.stripe_account_id

    // Se não tem conta Stripe Connect, criar uma
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BR',
        email: userData.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          user_id: user.id,
          user_name: userData.name || '',
        },
      })

      accountId = account.id

      // Salvar no banco
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
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/painel/palestrante/configuracoes?stripe_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/painel/palestrante/configuracoes?stripe_success=true`,
      type: 'account_onboarding',
    })

    // Salvar URL de onboarding
    await supabase
      .from('users')
      .update({
        stripe_onboarding_url: accountLink.url,
      })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      onboarding_url: accountLink.url,
      account_id: accountId,
    })
  } catch (error: any) {
    console.error('Stripe Connect onboarding error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar conta Stripe' },
      { status: 500 }
    )
  }
}

// GET - Verificar status da conta Stripe Connect
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('stripe_account_id, stripe_account_status')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        status: 'NOT_CONNECTED',
      })
    }

    // Buscar info da conta no Stripe
    const account = await stripe.accounts.retrieve(userData.stripe_account_id)

    const isActive = account.charges_enabled && account.payouts_enabled
    const newStatus = isActive ? 'ACTIVE' : account.details_submitted ? 'PENDING' : 'NOT_CONNECTED'

    // Atualizar status no banco se mudou
    if (newStatus !== userData.stripe_account_status) {
      await supabase
        .from('users')
        .update({
          stripe_account_status: newStatus,
          stripe_charges_enabled: account.charges_enabled,
          stripe_payouts_enabled: account.payouts_enabled,
          stripe_onboarding_completed: account.details_submitted,
          stripe_connected_at: isActive ? new Date().toISOString() : null,
        })
        .eq('id', user.id)
    }

    return NextResponse.json({
      connected: isActive,
      status: newStatus,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    })
  } catch (error: any) {
    console.error('Get Stripe Connect status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
