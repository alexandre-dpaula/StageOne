import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Check if user is admin or palestrante
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()

    if (!userData || !['ADMIN', 'PALESTRANTE'].includes(userData.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { event_id, qr_code_token } = body

    if (!event_id || !qr_code_token) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Find ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        event:events(*),
        ticket_type:tickets_types(*),
        user:users(*)
      `)
      .eq('event_id', event_id)
      .eq('qr_code_token', qr_code_token)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ingresso inválido ou não encontrado'
        },
        { status: 404 }
      )
    }

    // Check if ticket is paid
    if (ticket.status !== 'PAID' && ticket.status !== 'USED') {
      return NextResponse.json(
        {
          success: false,
          message: 'Ingresso não está pago',
        },
        { status: 400 }
      )
    }

    // Check if already checked in
    if (ticket.checked_in_at) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ingresso já foi utilizado no check-in',
          ticket,
          already_checked_in: true,
        },
        { status: 400 }
      )
    }

    // Perform check-in
    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        checked_in_at: new Date().toISOString(),
        status: 'USED',
      })
      .eq('id', ticket.id)

    if (updateError) {
      throw updateError
    }

    // Fetch updated ticket with relations
    const { data: updatedTicket } = await supabase
      .from('tickets')
      .select(`
        *,
        event:events(*),
        ticket_type:tickets_types(*),
        user:users(*)
      `)
      .eq('id', ticket.id)
      .single()

    return NextResponse.json(
      {
        success: true,
        message: 'Check-in realizado com sucesso!',
        ticket: updatedTicket,
        already_checked_in: false,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in checkin:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao processar check-in'
      },
      { status: 500 }
    )
  }
}
