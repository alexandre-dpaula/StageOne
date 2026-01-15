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
    const format = searchParams.get('format') || 'csv'

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

    // Buscar vendas
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:tickets_types(name, price),
        coupon:coupons(code, discount_type, discount_value)
      `)
      .eq('event_id', eventId)
      .eq('status', 'PAID')
      .order('purchased_at', { ascending: true })

    if (error) {
      console.error('Error fetching sales:', error)
      return NextResponse.json({ error: 'Erro ao buscar vendas' }, { status: 500 })
    }

    const sales = tickets?.map(ticket => {
      const ticketPrice = ticket.ticket_type?.price ?? 0
      const originalPrice = ticket.original_price ?? ticketPrice
      const discount = ticket.discount_amount || 0
      const finalPrice = ticket.final_price ?? ticketPrice

      return {
        data_venda: new Date(ticket.purchased_at).toLocaleString('pt-BR'),
        comprador: ticket.buyer_name,
        email: ticket.buyer_email,
        tipo_ingresso: ticket.ticket_type?.name || 'N/A',
        preco_original: originalPrice,
        cupom: ticket.coupon?.code || '-',
        desconto: discount,
        preco_final: finalPrice,
        status_check_in: ticket.checked_in_at ? 'Realizado' : 'Pendente'
      }
    }) || []

    if (format === 'json') {
      return NextResponse.json({ sales })
    }

    // Gerar CSV
    const headers = [
      'Data da Venda',
      'Comprador',
      'Email',
      'Tipo de Ingresso',
      'Preço Original (R$)',
      'Cupom',
      'Desconto (R$)',
      'Preço Final (R$)',
      'Status Check-in'
    ]

    const csvRows = [
      headers.join(','),
      ...sales.map(s =>
        [
          `"${s.data_venda}"`,
          `"${s.comprador}"`,
          `"${s.email}"`,
          `"${s.tipo_ingresso}"`,
          `"${s.preco_original.toFixed(2)}"`,
          `"${s.cupom}"`,
          `"${s.desconto.toFixed(2)}"`,
          `"${s.preco_final.toFixed(2)}"`,
          `"${s.status_check_in}"`
        ].join(',')
      )
    ]

    // Adicionar linha de total
    const totalOriginal = sales.reduce((sum, s) => sum + s.preco_original, 0)
    const totalDesconto = sales.reduce((sum, s) => sum + s.desconto, 0)
    const totalFinal = sales.reduce((sum, s) => sum + s.preco_final, 0)

    csvRows.push('')
    csvRows.push([
      '"TOTAL"',
      '',
      '',
      '',
      `"${totalOriginal.toFixed(2)}"`,
      '',
      `"${totalDesconto.toFixed(2)}"`,
      `"${totalFinal.toFixed(2)}"`,
      ''
    ].join(','))

    const csv = csvRows.join('\n')
    const filename = `vendas_${event?.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Error in export sales API:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
