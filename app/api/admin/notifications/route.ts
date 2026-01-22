import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se é admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const notifications = []

    // 1. CRÍTICO - Eventos nas próximas 24 horas
    const { data: upcomingEvents } = await supabase
      .from('events')
      .select('id, title, start_datetime')
      .gte('start_datetime', new Date().toISOString())
      .lte('start_datetime', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .eq('is_published', true)
      .order('start_datetime', { ascending: true })
      .limit(3)

    if (upcomingEvents && upcomingEvents.length > 0) {
      const eventNames = upcomingEvents.map(e => e.title).join(', ')
      const hoursUntil = Math.floor((new Date(upcomingEvents[0].start_datetime).getTime() - Date.now()) / (1000 * 60 * 60))

      notifications.push({
        id: 'upcoming-events',
        type: 'event_reminder',
        priority: 'critical',
        title: 'Eventos Próximos',
        message: `${upcomingEvents.length} evento(s) em ${hoursUntil}h: ${eventNames}`,
        timestamp: new Date().toISOString(),
        actionUrl: '/painel/palestrante',
        metadata: {
          count: upcomingEvents.length,
          hours: hoursUntil,
          eventIds: upcomingEvents.map(e => e.id)
        }
      })
    }

    // 2. ALTO - Eventos pendentes de aprovação
    const { data: pendingEvents, count: pendingCount } = await supabase
      .from('events')
      .select('id, title', { count: 'exact' })
      .eq('status', 'PENDING_APPROVAL')
      .order('created_at', { ascending: false })
      .limit(5)

    if (pendingCount && pendingCount > 0) {
      notifications.push({
        id: 'pending-approvals',
        type: 'approval_needed',
        priority: 'high',
        title: 'Aprovações Pendentes',
        message: `${pendingCount} evento(s) aguardando aprovação`,
        timestamp: new Date().toISOString(),
        actionUrl: '/painel/admin/approvals',
        metadata: {
          count: pendingCount,
          eventIds: pendingEvents?.map(e => e.id) || []
        }
      })
    }

    // 3. ALTO - Saques disponíveis (withdrawals)
    const { data: availableWithdrawals } = await supabase
      .from('event_financials')
      .select('id, event_id, available_balance')
      .eq('can_withdraw', true)
      .gt('available_balance', 0)

    if (availableWithdrawals && availableWithdrawals.length > 0) {
      const totalAvailable = availableWithdrawals.reduce((sum, w) => sum + (w.available_balance || 0), 0)

      if (totalAvailable > 0) {
        notifications.push({
          id: 'withdrawals-available',
          type: 'withdrawal_ready',
          priority: 'high',
          title: 'Saques Disponíveis',
          message: `R$ ${totalAvailable.toFixed(2)} disponível para saque`,
          timestamp: new Date().toISOString(),
          actionUrl: '/painel/financeiro',
          metadata: {
            amount: totalAvailable,
            count: availableWithdrawals.length
          }
        })
      }
    }

    // 4. MÉDIO - Pagamentos pendentes (últimas 24h)
    const { data: pendingPayments, count: pendingPaymentsCount } = await supabase
      .from('tickets')
      .select('id, total_price', { count: 'exact' })
      .eq('status', 'PENDING_PAYMENT')
      .gte('purchased_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (pendingPaymentsCount && pendingPaymentsCount > 0) {
      const totalPending = pendingPayments?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0

      notifications.push({
        id: 'pending-payments',
        type: 'payment_pending',
        priority: 'medium',
        title: 'Pagamentos Pendentes',
        message: `${pendingPaymentsCount} pagamento(s) aguardando confirmação (R$ ${totalPending.toFixed(2)})`,
        timestamp: new Date().toISOString(),
        actionUrl: '/painel/admin/payments',
        metadata: {
          count: pendingPaymentsCount,
          amount: totalPending
        }
      })
    }

    // 5. MÉDIO - Novos ingressos vendidos (última hora)
    const { data: recentTickets, count: recentTicketsCount } = await supabase
      .from('tickets')
      .select('id, event_id', { count: 'exact' })
      .eq('status', 'PAID')
      .gte('purchased_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('purchased_at', { ascending: false })
      .limit(5)

    if (recentTicketsCount && recentTicketsCount > 0) {
      notifications.push({
        id: 'recent-sales',
        type: 'ticket_sale',
        priority: 'medium',
        title: 'Vendas Recentes',
        message: `${recentTicketsCount} ingresso(s) vendido(s) na última hora`,
        timestamp: new Date().toISOString(),
        actionUrl: '/painel/admin/sales',
        metadata: {
          count: recentTicketsCount
        }
      })
    }

    // 6. BAIXO - Novos usuários cadastrados (últimas 24h)
    const { count: newUsersCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (newUsersCount && newUsersCount > 0) {
      notifications.push({
        id: 'new-users',
        type: 'user_signup',
        priority: 'low',
        title: 'Novos Cadastros',
        message: `${newUsersCount} novo(s) usuário(s) cadastrado(s) hoje`,
        timestamp: new Date().toISOString(),
        actionUrl: '/painel/crm',
        metadata: {
          count: newUsersCount
        }
      })
    }

    // 7. BAIXO - Mensagens não lidas (mockado por enquanto)
    notifications.push({
      id: 'unread-messages',
      type: 'message',
      priority: 'low',
      title: 'Mensagens',
      message: 'Você tem mensagens não lidas',
      timestamp: new Date().toISOString(),
      actionUrl: '/painel/crm/messages',
      metadata: {
        count: 0
      }
    })

    // Ordenar por prioridade (critical > high > medium > low)
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return NextResponse.json({
      success: true,
      notifications,
      total: notifications.length
    })

  } catch (error: any) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notificações', details: error.message },
      { status: 500 }
    )
  }
}
