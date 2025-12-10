import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  if (!user || user.role !== 'ADMIN') {
    redirect('/')
  }

  // Get statistics
  const [{ count: totalEvents }, { count: totalUsers }, { count: totalTickets }] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('tickets').select('*', { count: 'exact', head: true }),
  ])

  // Get upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime')
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl text-primary hover:text-glow transition-all">
              <span className="font-normal">Stage</span><span className="font-bold">One</span> <span className="text-foreground">Admin</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-foreground font-medium">{user.name}</span>
              <form action="/api/auth/logout" method="POST">
                <button className="text-placeholder hover:text-red-500 transition-colors">Sair</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Dashboard <span className="text-primary text-glow">Admin</span>
          </h1>
          <p className="text-placeholder">Visão geral da plataforma</p>
        </div>

        {/* Stats with glassmorphism */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 animate-slide-up">
          <div className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/30 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-placeholder text-sm uppercase tracking-wider">Total de Eventos</p>
            </div>
            <p className="text-5xl font-bold text-foreground">{totalEvents || 0}</p>
          </div>
          <div className="glass rounded-2xl p-6 border border-border/30 hover:border-accent-blue/30 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
              <p className="text-placeholder text-sm uppercase tracking-wider">Total de Usuários</p>
            </div>
            <p className="text-5xl font-bold text-foreground">{totalUsers || 0}</p>
          </div>
          <div className="glass rounded-2xl p-6 border border-border/30 hover:border-accent-purple/30 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
              <p className="text-placeholder text-sm uppercase tracking-wider">Total de Ingressos</p>
            </div>
            <p className="text-5xl font-bold text-foreground">{totalTickets || 0}</p>
          </div>
        </div>

        {/* Quick Actions - Numbered cards like reference */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/painel/admin/eventos"
            className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/50 hover:shadow-glow-sm transition-all group relative overflow-hidden"
          >
            <div className="absolute -top-2 -right-2 text-6xl font-bold text-border/20">01.</div>
            <div className="relative z-10">
              <span className="text-primary text-sm font-bold mb-2 block">01.</span>
              <h3 className="text-foreground font-bold text-lg group-hover:text-primary transition-colors">
                Gerenciar Eventos
              </h3>
            </div>
          </Link>

          <Link
            href="/painel/admin/eventos/novo"
            className="rounded-2xl p-6 relative overflow-hidden group transition-all hover:shadow-glow-md hover:scale-105"
            style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
          >
            <div className="absolute -top-2 -right-2 text-6xl font-bold text-white/20">02.</div>
            <div className="relative z-10">
              <span className="font-bold mb-2 block">02.</span>
              <h3 className="font-bold text-lg mb-2">Criar Novo Evento</h3>
              <p className="text-sm opacity-90">Adicionar novo evento à plataforma</p>
            </div>
          </Link>

          <Link
            href="#eventos"
            className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/50 hover:shadow-glow-sm transition-all group relative overflow-hidden"
          >
            <div className="absolute -top-2 -right-2 text-6xl font-bold text-border/20">03.</div>
            <div className="relative z-10">
              <span className="text-primary text-sm font-bold mb-2 block">03.</span>
              <h3 className="text-foreground font-bold text-lg group-hover:text-primary transition-colors">
                Próximos Eventos
              </h3>
            </div>
          </Link>

          <Link
            href="/"
            className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/50 hover:shadow-glow-sm transition-all group relative overflow-hidden"
          >
            <div className="absolute -top-2 -right-2 text-6xl font-bold text-border/20">04.</div>
            <div className="relative z-10">
              <span className="text-primary text-sm font-bold mb-2 block">04.</span>
              <h3 className="text-foreground font-bold text-lg group-hover:text-primary transition-colors">
                Ver Site Público
              </h3>
            </div>
          </Link>
        </div>

        {/* Upcoming Events */}
        <div id="eventos" className="glass rounded-2xl p-6 border border-border/30 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-4">Próximos Eventos</h2>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
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
            <p className="text-placeholder">Nenhum evento próximo</p>
          )}
        </div>
      </div>
    </div>
  )
}
