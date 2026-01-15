import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Wallet, Target, TrendingUp, CreditCard, Users as UsersIcon, Ticket as TicketIcon, LayoutDashboard, Plus, Globe } from 'lucide-react'

export default async function PalestranteDashboard() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  if (!user) redirect('/')

  const isAdmin = user.role === 'ADMIN'

  // Get events data
  const { data: myEvents } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  // Get all events if admin
  const { data: allEvents } = isAdmin
    ? await supabase.from('events').select('*').order('created_at', { ascending: false })
    : { data: null }

  const eventsToShow = isAdmin && allEvents ? allEvents : myEvents || []

  // Get tickets purchased by this user
  const { data: myTickets } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(*),
      ticket_type:tickets_types(*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'PAID')
    .order('purchased_at', { ascending: false })

  // Admin statistics
  const [{ count: totalUsers }, { count: totalAllEvents }, { count: totalAllTickets }] = isAdmin
    ? await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('tickets').select('*', { count: 'exact', head: true }),
      ])
    : [{ count: 0 }, { count: 0 }, { count: 0 }]

  // Financial data for admin
  const { data: tickets } = isAdmin
    ? await supabase
        .from('tickets')
        .select(`
          *,
          ticket_type:tickets_types(price),
          event:events(title)
        `)
        .eq('status', 'PAID')
    : { data: [] }

  const totalRevenue =
    tickets?.reduce((sum, ticket) => sum + (ticket.ticket_type?.price || 0), 0) || 0
  const todayRevenue =
    tickets
      ?.filter(ticket => {
        const ticketDate = new Date(ticket.purchased_at)
        const today = new Date()
        return ticketDate.toDateString() === today.toDateString()
      })
      .reduce((sum, ticket) => sum + (ticket.ticket_type?.price || 0), 0) || 0
  const thisMonthRevenue =
    tickets
      ?.filter(ticket => {
        const ticketDate = new Date(ticket.purchased_at)
        const today = new Date()
        return (
          ticketDate.getMonth() === today.getMonth() &&
          ticketDate.getFullYear() === today.getFullYear()
        )
      })
      .reduce((sum, ticket) => sum + (ticket.ticket_type?.price || 0), 0) || 0
  const thisMonthTickets =
    tickets?.filter(ticket => {
      const ticketDate = new Date(ticket.purchased_at)
      const today = new Date()
      return (
        ticketDate.getMonth() === today.getMonth() &&
        ticketDate.getFullYear() === today.getFullYear()
      )
    }).length || 0

  // Upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime')
    .limit(5)

  const totalEvents = myEvents?.length || 0
  const publishedEvents = myEvents?.filter(e => e.is_published).length || 0
  const totalTickets = myTickets?.length || 0

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl text-primary hover:text-glow transition-all">
              <span className="font-bold">St</span>
              <sup className="text-[0.5em] top-[-0.3em] relative ml-0.5">™</sup>
            </Link>
            <div className="flex items-center gap-4">
              {/* Nome do usuário - 14px */}
              <span className="text-foreground font-medium" style={{ fontSize: '14px' }}>{user.name}</span>
              <form action="/api/auth/logout" method="POST">
                <button className="text-placeholder hover:text-red-500 transition-colors">Sair</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {isAdmin ? 'Painel' : 'Meus'} <span className="text-primary text-glow">Eventos</span>
            </h1>
            <p className="text-placeholder">
              {isAdmin ? 'Visão geral da plataforma' : 'Gerencie seus eventos e ingressos'}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/30">
                Eventos {String(totalAllEvents || 0).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Financial Wallet - Apenas para Admin */}
        {isAdmin && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#C4F82A' }}
              >
                <Wallet className="w-5 h-5" style={{ color: '#0A0B0D' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Carteira Financeira</h2>
                <p className="text-placeholder text-sm">Receitas e vendas de ingressos</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="glass rounded-2xl p-6 border border-border/30 relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-placeholder text-sm font-medium">Receita Total</span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      totalRevenue
                    )}
                  </p>
                  <p className="text-xs text-placeholder">{totalAllTickets || 0} ingressos vendidos</p>
                </div>
              </div>

              {/* Today Revenue */}
              <div
                className="rounded-2xl p-6 relative overflow-hidden group hover:shadow-glow-md transition-all"
                style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold opacity-80">Hoje</span>
                    <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center">
                      <Target className="w-4 h-4" style={{ color: '#0A0B0D' }} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      todayRevenue
                    )}
                  </p>
                  <p className="text-xs font-medium opacity-80">Vendas de hoje</p>
                </div>
              </div>

              {/* This Month Revenue */}
              <div className="glass rounded-2xl p-6 border border-border/30 relative overflow-hidden group hover:border-accent-green/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-green/5 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-placeholder text-sm font-medium">Este Mês</span>
                    <div className="w-8 h-8 rounded-lg bg-accent-green/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-accent-green" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      thisMonthRevenue
                    )}
                  </p>
                  <p className="text-xs text-accent-green font-medium">
                    {thisMonthTickets} vendas este mês
                  </p>
                </div>
              </div>

              {/* Average Ticket */}
              <div className="glass rounded-2xl p-6 border border-border/30 relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-placeholder text-sm font-medium">Ticket Médio</span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      totalAllTickets ? totalRevenue / totalAllTickets : 0
                    )}
                  </p>
                  <p className="text-xs text-placeholder">Valor médio por ingresso</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats - Para Palestrantes */}
        {!isAdmin && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg p-6">
              <p className="text-placeholder text-sm">Eventos Criados</p>
              <p className="text-4xl font-bold text-foreground mt-2">{totalEvents}</p>
            </div>
            <div className="bg-card rounded-lg p-6">
              <p className="text-placeholder text-sm">Eventos Publicados</p>
              <p className="text-4xl font-bold text-green-500 mt-2">{publishedEvents}</p>
            </div>
            <div className="bg-card rounded-lg p-6">
              <p className="text-placeholder text-sm">Meus Ingressos</p>
              <p className="text-4xl font-bold text-primary mt-2">{totalTickets}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link
            href="/painel/palestrante/eventos/novo"
            className="rounded-2xl p-6 relative overflow-hidden group transition-all hover:shadow-glow-md hover:scale-105"
            style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
          >
            <div className="absolute -top-2 -right-2 text-6xl font-bold text-white/20">01.</div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" style={{ color: '#0A0B0D' }} />
                </div>
                <span className="font-bold text-sm">01.</span>
              </div>
              <h3 className="font-bold text-lg mb-1">Criar Novo Evento</h3>
              <p className="text-sm opacity-80">Adicionar novo evento à plataforma</p>
            </div>
          </Link>

          <Link
            href="/meus-ingressos"
            className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/50 hover:shadow-glow-sm transition-all group relative overflow-hidden"
          >
            <div className="absolute -top-2 -right-2 text-6xl font-bold text-border/20">02.</div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TicketIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-primary text-sm font-bold">02.</span>
              </div>
              <h3 className="text-foreground font-bold text-lg group-hover:text-primary transition-colors">
                Meus Ingressos
              </h3>
              <p className="text-placeholder text-sm mt-1">Ver ingressos comprados</p>
            </div>
          </Link>

          <Link
            href="/"
            className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/50 hover:shadow-glow-sm transition-all group relative overflow-hidden"
          >
            <div className="absolute -top-2 -right-2 text-6xl font-bold text-border/20">03.</div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <span className="text-primary text-sm font-bold">03.</span>
              </div>
              <h3 className="text-foreground font-bold text-lg group-hover:text-primary transition-colors">
                Ver Site Público
              </h3>
              <p className="text-placeholder text-sm mt-1">Acessar página pública de eventos</p>
            </div>
          </Link>

          {/* Cupons - Apenas para Admin */}
          {isAdmin && (
            <Link
              href="/painel/admin/cupons"
              className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/50 hover:shadow-glow-sm transition-all group relative overflow-hidden"
            >
              <div className="absolute -top-2 -right-2 text-6xl font-bold text-border/20">04.</div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TicketIcon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-primary text-sm font-bold">04.</span>
                </div>
                <h3 className="text-foreground font-bold text-lg group-hover:text-primary transition-colors">
                  Gerenciar Cupons
                </h3>
                <p className="text-placeholder text-sm mt-1">Criar e gerenciar cupons de desconto</p>
              </div>
            </Link>
          )}
        </div>

        {/* Events List */}
        <div className="glass rounded-2xl p-6 border border-border/30 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {isAdmin ? 'Todos os Eventos' : 'Meus Eventos'}
          </h2>
          {eventsToShow && eventsToShow.length > 0 ? (
            <div className="space-y-3">
              {eventsToShow.map((event: any) => (
                <Link
                  key={event.id}
                  href={`/painel/admin/eventos/${event.id}`}
                  className="block glass rounded-xl p-4 border border-border/30 hover:border-primary/30 hover:shadow-glow-sm transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{event.title}</h3>
                      <p className="text-sm text-placeholder">
                        {new Date(event.start_datetime).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        event.is_published
                          ? 'bg-accent-green/10 text-accent-green border border-accent-green/30'
                          : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                      }`}
                    >
                      {event.is_published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
          ) : (
            <p className="text-placeholder">
              {isAdmin ? 'Nenhum evento encontrado' : 'Você ainda não criou nenhum evento'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
