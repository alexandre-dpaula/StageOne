import { createClient } from '@/lib/supabase/server'
import { generateQRToken } from '@/lib/utils'
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

    const body = await request.json()
    const { event_id, ticket_type_id, buyer_name, buyer_email, buyer_phone } = body

    // Validate required fields
    if (!event_id || !ticket_type_id || !buyer_name || !buyer_email) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Check if ticket type still has availability
    const { data: ticketType } = await supabase
      .from('tickets_types')
      .select('*')
      .eq('id', ticket_type_id)
      .single()

    if (!ticketType) {
      return NextResponse.json({ error: 'Tipo de ingresso não encontrado' }, { status: 404 })
    }

    if (ticketType.sold_quantity >= ticketType.total_quantity) {
      return NextResponse.json({ error: 'Ingressos esgotados' }, { status: 400 })
    }

    // Create ticket with PAID status (simulating payment approval)
    // TODO: Integrate real payment gateway
    const qrToken = generateQRToken()

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        event_id,
        ticket_type_id,
        user_id: user.id,
        buyer_name,
        buyer_email,
        buyer_phone,
        qr_code_token: qrToken,
        status: 'PAID',
        purchased_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, ticket }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar ingresso' },
      { status: 500 }
    )
  }
}
