import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function PalestranteDashboard() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  if (!user || !['PALESTRANTE', 'ADMIN'].includes(user.role)) {
    redirect('/')
  }

  // Get events created by this user
  const { data: myEvents } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const totalEvents = myEvents?.length || 0
  const publishedEvents = myEvents?.filter(e => e.is_published).length || 0

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl text-primary hover:text-glow transition-all">
              <span className="font-normal">Stage</span><span className="font-bold">One</span><sup className="text-[0.5em] top-[-0.3em] relative ml-0.5">™</sup> <span className="text-foreground">Palestrante</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-foreground">{user.name}</span>
              <form action="/api/auth/logout" method="POST">
                <button className="text-placeholder hover:text-foreground">Sair</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Meus Eventos</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6">
            <p className="text-placeholder text-sm">Total de Eventos</p>
            <p className="text-4xl font-bold text-foreground mt-2">{totalEvents}</p>
          </div>
          <div className="bg-card rounded-lg p-6">
            <p className="text-placeholder text-sm">Eventos Publicados</p>
            <p className="text-4xl font-bold text-green-500 mt-2">{publishedEvents}</p>
          </div>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Link
            href="/painel/palestrante/eventos/novo"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90"
            style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
          >
            + Criar Novo Evento
          </Link>
        </div>

        {/* Events List */}
        {myEvents && myEvents.length > 0 ? (
          <div className="space-y-4">
            {myEvents.map((event: any) => (
              <div key={event.id} className="bg-card rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          event.is_published
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}
                      >
                        {event.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>

                    <p className="text-placeholder text-sm mb-3">{formatDate(event.start_datetime)}</p>

                    <div className="flex gap-2">
                      <Link
                        href={`/evento/${event.slug}`}
                        className="px-4 py-2 bg-card hover:bg-card-hover text-foreground rounded-lg text-sm transition-colors"
                      >
                        Ver Página
                      </Link>
                      <Link
                        href={`/painel/admin/eventos/${event.id}/alunos`}
                        className="px-4 py-2 bg-card hover:bg-card-hover text-foreground rounded-lg text-sm transition-colors"
                      >
                        Ver Alunos
                      </Link>
                      <Link
                        href={`/checkin/${event.id}`}
                        className="px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
                      >
                        Check-in
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg p-12 text-center">
            <p className="text-placeholder mb-4">Você ainda não criou nenhum evento</p>
            <Link
              href="/painel/palestrante/eventos/novo"
              className="inline-block px-6 py-3 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
            >
              Criar Primeiro Evento
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
