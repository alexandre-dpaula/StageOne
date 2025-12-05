import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function EventosAdminPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  if (!user || user.role !== 'ADMIN') redirect('/')

  const { data: events } = await supabase
    .from('events')
    .select('*, creator:users!events_created_by_fkey(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/painel/admin" className="text-xl font-bold text-primary">
              ← Voltar ao Dashboard
            </Link>
            <Link
              href="/painel/admin/eventos/novo"
              className="px-4 py-2 rounded-lg font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
            >
              + Novo Evento
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Gerenciar Eventos</h1>

        {events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event: any) => (
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
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-card text-foreground">
                        {event.category}
                      </span>
                    </div>

                    <p className="text-placeholder text-sm mb-3 line-clamp-2">{event.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Data</p>
                        <p className="text-foreground">{formatDate(event.start_datetime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Local</p>
                        <p className="text-foreground">{event.location_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Capacidade</p>
                        <p className="text-foreground">{event.capacity} pessoas</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Criado por</p>
                        <p className="text-foreground">{event.creator?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-card">
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
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg p-12 text-center">
            <p className="text-placeholder mb-4">Nenhum evento criado ainda</p>
            <Link
              href="/painel/admin/eventos/novo"
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
