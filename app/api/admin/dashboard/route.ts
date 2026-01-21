import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário é admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Acesso negado - Admin apenas' }, { status: 403 })
    }

    // Buscar parâmetros de data (opcional)
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Buscar métricas usando a função SQL
    const { data: metrics, error: metricsError } = await supabase
      .rpc('get_admin_dashboard_metrics', {
        p_start_date: startDate,
        p_end_date: endDate
      })

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError)
      return NextResponse.json({ error: metricsError.message }, { status: 500 })
    }

    // Buscar dados adicionais em paralelo
    const [
      eventsResult,
      bookingsResult,
      monthlyRevenueResult,
      topEventsResult
    ] = await Promise.all([
      // Total de eventos por status
      supabase
        .from('events')
        .select('is_published', { count: 'exact', head: true }),

      // Bookings por status
      supabase
        .from('bookings')
        .select('payment_status', { count: 'exact' })
        .eq('payment_status', 'PAID'),

      // Receita mensal (últimos 6 meses)
      supabase
        .from('bookings')
        .select('created_at, total_price, quantity')
        .eq('payment_status', 'PAID')
        .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false }),

      // Top 5 eventos por receita
      supabase
        .from('events')
        .select(`
          id,
          title,
          category,
          start_datetime,
          tickets_types!inner(
            bookings!inner(total_price, payment_status, quantity)
          )
        `)
        .eq('is_published', true)
        .limit(100)
    ])

    // Processar receita mensal
    const monthlyRevenue = processMonthlyRevenue(bookingsResult.data || [])

    // Processar top eventos
    const topEvents = processTopEvents(topEventsResult.data || [])

    // Buscar estatísticas de usuários
    const { count: totalUsers } = await supabase
      .from('bookings')
      .select('user_id', { count: 'exact', head: true })

    // Buscar eventos criados recentemente (últimos 7 dias)
    const { data: recentEvents, count: recentEventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    // Calcular taxas de crescimento
    const growthRates = await calculateGrowthRates(supabase)

    const dashboardData = {
      metrics,
      stats: {
        totalEvents: eventsResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalUsers: totalUsers || 0,
        recentEvents: recentEventsCount || 0
      },
      monthlyRevenue,
      topEvents,
      recentEvents: recentEvents?.slice(0, 5) || [],
      growthRates
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      admin: {
        name: adminData.full_name,
        role: adminData.role
      }
    })

  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Função auxiliar para processar receita mensal
function processMonthlyRevenue(bookings: any[]) {
  const monthlyData: { [key: string]: any } = {}

  bookings.forEach(booking => {
    const month = new Date(booking.created_at).toISOString().slice(0, 7) // YYYY-MM

    if (!monthlyData[month]) {
      monthlyData[month] = {
        month,
        grossRevenue: 0,
        netRevenue: 0,
        serviceCosts: 0,
        stripeFees: 0,
        bookings: 0
      }
    }

    monthlyData[month].grossRevenue += parseFloat(booking.total_price || 0)
    monthlyData[month].netRevenue += parseFloat(booking.total_price || 0) * 0.95 // Estimativa 95%
    monthlyData[month].serviceCosts += 0
    monthlyData[month].stripeFees += parseFloat(booking.total_price || 0) * 0.05 // Estimativa 5%
    monthlyData[month].bookings += 1
  })

  return Object.values(monthlyData).sort((a: any, b: any) =>
    a.month.localeCompare(b.month)
  )
}

// Função auxiliar para processar top eventos
function processTopEvents(events: any[]) {
  const eventStats: { [key: string]: any } = {}

  events.forEach(event => {
    if (!eventStats[event.id]) {
      eventStats[event.id] = {
        id: event.id,
        title: event.title,
        category: event.category,
        startDate: event.start_datetime,
        revenue: 0,
        bookings: 0
      }
    }

    event.tickets_types?.forEach((ticketType: any) => {
      ticketType.bookings?.forEach((booking: any) => {
        if (booking.payment_status === 'PAID') {
          eventStats[event.id].revenue += parseFloat(booking.total_price || 0)
          eventStats[event.id].bookings += 1
        }
      })
    })
  })

  return Object.values(eventStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5)
}

// Função para calcular taxas de crescimento
async function calculateGrowthRates(supabase: any) {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

  // Receita do mês atual
  const { data: currentMonthData } = await supabase
    .from('bookings')
    .select('total_price')
    .eq('payment_status', 'PAID')
    .gte('created_at', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())

  // Receita do mês passado
  const { data: lastMonthData } = await supabase
    .from('bookings')
    .select('total_price')
    .eq('payment_status', 'PAID')
    .gte('created_at', lastMonth.toISOString())
    .lt('created_at', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())

  const currentRevenue = currentMonthData?.reduce((sum: number, b: any) => sum + parseFloat(b.total_price || 0), 0) || 0
  const lastRevenue = lastMonthData?.reduce((sum: number, b: any) => sum + parseFloat(b.total_price || 0), 0) || 0

  const revenueGrowth = lastRevenue > 0
    ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
    : 0

  // Crescimento de eventos
  const { count: currentMonthEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())

  const { count: lastMonthEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', lastMonth.toISOString())
    .lt('created_at', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())

  const eventsGrowth = (lastMonthEvents || 0) > 0
    ? (((currentMonthEvents || 0) - (lastMonthEvents || 0)) / (lastMonthEvents || 1)) * 100
    : 0

  return {
    revenue: parseFloat(revenueGrowth.toFixed(2)),
    events: parseFloat(eventsGrowth.toFixed(2)),
    currentMonth: {
      revenue: currentRevenue,
      events: currentMonthEvents || 0
    },
    lastMonth: {
      revenue: lastRevenue,
      events: lastMonthEvents || 0
    }
  }
}
