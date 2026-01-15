import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SalesAnalytics } from '@/types/database.types'

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

    // Verificar permissão (admin ou criador do evento)
    const { data: event } = await supabase
      .from('events')
      .select('created_by')
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

    // Buscar todos os ingressos PAGOS do evento com ticket_type
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:tickets_types(name, price)
      `)
      .eq('event_id', eventId)
      .eq('status', 'PAID')

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      return NextResponse.json({ error: 'Erro ao buscar ingressos' }, { status: 500 })
    }

    // Buscar ingressos com check-in
    const { count: checkedInCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'USED')

    // Calcular métricas gerais
    const totalTicketsSold = tickets?.length || 0
    const totalTicketsCheckedIn = checkedInCount || 0
    const checkinRate = totalTicketsSold > 0
      ? (totalTicketsCheckedIn / totalTicketsSold) * 100
      : 0

    // Calcular receita total (considerando descontos)
    const totalRevenue = tickets?.reduce((sum, ticket) => {
      const price = ticket.final_price ?? ticket.ticket_type?.price ?? 0
      return sum + price
    }, 0) || 0

    // Vendas por dia
    const salesByDay: { [key: string]: { tickets: number; revenue: number } } = {}
    tickets?.forEach(ticket => {
      const date = new Date(ticket.purchased_at).toISOString().split('T')[0]
      if (!salesByDay[date]) {
        salesByDay[date] = { tickets: 0, revenue: 0 }
      }
      salesByDay[date].tickets++
      salesByDay[date].revenue += ticket.final_price ?? ticket.ticket_type?.price ?? 0
    })

    const salesByDayArray = Object.entries(salesByDay).map(([date, data]) => ({
      date,
      tickets: data.tickets,
      revenue: data.revenue
    })).sort((a, b) => a.date.localeCompare(b.date))

    // Vendas por tipo de ingresso
    const salesByTicketType: { [key: string]: { tickets: number; revenue: number } } = {}
    tickets?.forEach(ticket => {
      const typeName = ticket.ticket_type?.name || 'Sem tipo'
      if (!salesByTicketType[typeName]) {
        salesByTicketType[typeName] = { tickets: 0, revenue: 0 }
      }
      salesByTicketType[typeName].tickets++
      salesByTicketType[typeName].revenue += ticket.final_price ?? ticket.ticket_type?.price ?? 0
    })

    const salesByTicketTypeArray = Object.entries(salesByTicketType).map(([name, data]) => ({
      ticket_type_name: name,
      tickets_sold: data.tickets,
      revenue: data.revenue,
      percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
    }))

    // Vendas por hora do dia
    const salesByHour: { [key: number]: number } = {}
    tickets?.forEach(ticket => {
      const hour = new Date(ticket.purchased_at).getHours()
      salesByHour[hour] = (salesByHour[hour] || 0) + 1
    })

    const salesByHourArray = Object.entries(salesByHour).map(([hour, tickets]) => ({
      hour: parseInt(hour),
      tickets
    })).sort((a, b) => a.hour - b.hour)

    // Uso de cupons
    const couponUsageMap: { [key: string]: { count: number; discount: number } } = {}
    tickets?.forEach(ticket => {
      if (ticket.coupon_id && ticket.discount_amount) {
        // Buscar código do cupom (fazer query separada)
        if (!couponUsageMap[ticket.coupon_id]) {
          couponUsageMap[ticket.coupon_id] = { count: 0, discount: 0 }
        }
        couponUsageMap[ticket.coupon_id].count++
        couponUsageMap[ticket.coupon_id].discount += ticket.discount_amount
      }
    })

    // Buscar códigos dos cupons
    const couponIds = Object.keys(couponUsageMap)
    let couponUsageArray: Array<{ coupon_code: string; usage_count: number; total_discount: number }> = []

    if (couponIds.length > 0) {
      const { data: coupons } = await supabase
        .from('coupons')
        .select('id, code')
        .in('id', couponIds)

      couponUsageArray = coupons?.map(coupon => ({
        coupon_code: coupon.code,
        usage_count: couponUsageMap[coupon.id].count,
        total_discount: couponUsageMap[coupon.id].discount
      })) || []
    }

    const analytics: SalesAnalytics = {
      total_revenue: totalRevenue,
      total_tickets_sold: totalTicketsSold,
      total_tickets_checked_in: totalTicketsCheckedIn,
      checkin_rate: checkinRate,
      sales_by_day: salesByDayArray,
      sales_by_ticket_type: salesByTicketTypeArray,
      sales_by_hour: salesByHourArray,
      coupon_usage: couponUsageArray
    }

    return NextResponse.json({ analytics })
  } catch (error: any) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
