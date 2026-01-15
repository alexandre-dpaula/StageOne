import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { eventId } = params
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv' // csv ou json

    // Verificar permissão
    const { data: event } = await supabase
      .from('events')
      .select('created_by, title')
      .eq('id', eventId)
      .single()

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single()

    const isAdmin = user?.role === 'ADMIN'
    const isOwner = event?.created_by === authUser.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Buscar participantes
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:tickets_types(name, price)
      `)
      .eq('event_id', eventId)
      .eq('status', 'PAID')
      .order('purchased_at', { ascending: true })

    if (error) {
      console.error('Error fetching participants:', error)
      return NextResponse.json({ error: 'Erro ao buscar participantes' }, { status: 500 })
    }

    const participants = tickets?.map(ticket => ({
      nome: ticket.buyer_name,
      email: ticket.buyer_email,
      telefone: ticket.buyer_phone || '',
      tipo_ingresso: ticket.ticket_type?.name || 'N/A',
      preco_original: ticket.original_price ?? ticket.ticket_type?.price ?? 0,
      desconto: ticket.discount_amount || 0,
      preco_final: ticket.final_price ?? ticket.ticket_type?.price ?? 0,
      data_compra: new Date(ticket.purchased_at).toLocaleString('pt-BR'),
      check_in: ticket.checked_in_at ? 'Sim' : 'Não',
      data_check_in: ticket.checked_in_at
        ? new Date(ticket.checked_in_at).toLocaleString('pt-BR')
        : ''
    })) || []

    if (format === 'json') {
      return NextResponse.json({ participants })
    }

    // Gerar CSV
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Tipo de Ingresso',
      'Preço Original',
      'Desconto',
      'Preço Final',
      'Data da Compra',
      'Check-in',
      'Data do Check-in'
    ]

    const csvRows = [
      headers.join(','),
      ...participants.map(p =>
        [
          `"${p.nome}"`,
          `"${p.email}"`,
          `"${p.telefone}"`,
          `"${p.tipo_ingresso}"`,
          `"R$ ${p.preco_original.toFixed(2)}"`,
          `"R$ ${p.desconto.toFixed(2)}"`,
          `"R$ ${p.preco_final.toFixed(2)}"`,
          `"${p.data_compra}"`,
          `"${p.check_in}"`,
          `"${p.data_check_in}"`
        ].join(',')
      )
    ]

    const csv = csvRows.join('\n')
    const filename = `participantes_${event?.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Error in export participants API:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
