import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const eventId = params.id

    // Buscar evento para verificar permissão
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('created_by, title')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    // Verificar se é o criador do evento ou admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (event.created_by !== user.id && userData?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Buscar financeiro do evento
    const { data: financials, error: financialsError } = await supabase
      .from('event_financials')
      .select('*')
      .eq('event_id', eventId)
      .single()

    if (financialsError && financialsError.code !== 'PGRST116') {
      // PGRST116 = not found, é ok se não existir ainda
      console.error('Error fetching financials:', financialsError)
      return NextResponse.json({ error: financialsError.message }, { status: 500 })
    }

    // Se não existe financeiro ainda, retornar valores zerados
    if (!financials) {
      return NextResponse.json({
        exists: false,
        financials: {
          event_id: eventId,
          total_ticket_sales: 0,
          tickets_sold_count: 0,
          room_cost: 0,
          audiovisual_cost: 0,
          coffee_break_cost: 0,
          coverage_cost: 0,
          platform_fee: 0,
          stripe_processing_fees: 0,
          total_costs: 0,
          gross_amount: 0,
          net_amount: 0,
          withdrawn_amount: 0,
          available_balance: 0,
          can_withdraw: false,
          withdrawal_available_at: null,
        },
      })
    }

    return NextResponse.json({
      exists: true,
      financials: {
        ...financials,
        // Converter Decimal para Number
        total_ticket_sales: Number(financials.total_ticket_sales),
        room_cost: Number(financials.room_cost),
        audiovisual_cost: Number(financials.audiovisual_cost),
        coffee_break_cost: Number(financials.coffee_break_cost),
        coverage_cost: Number(financials.coverage_cost),
        platform_fee: Number(financials.platform_fee),
        stripe_processing_fees: Number(financials.stripe_processing_fees),
        total_costs: Number(financials.total_costs),
        gross_amount: Number(financials.gross_amount),
        net_amount: Number(financials.net_amount),
        withdrawn_amount: Number(financials.withdrawn_amount),
        available_balance: Number(financials.available_balance),
      },
    })
  } catch (error: any) {
    console.error('Get financials error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
