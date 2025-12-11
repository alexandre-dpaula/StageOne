import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import EventActions from '@/components/EventActions'

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <Link href="/painel/admin" className="text-base sm:text-lg md:text-xl font-bold text-primary hover:underline">
              ← Voltar ao Dashboard
            </Link>
            <Link
              href="/painel/admin/eventos/novo"
              className="w-full sm:w-auto text-center px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
            >
              + Novo Evento
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 sm:mb-8">Gerenciar Eventos</h1>

        {events && events.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {events.map((event: any) => (
              <div
                key={event.id}
                className="bg-card rounded-xl overflow-hidden border border-border/30 hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail Section */}
                  <div className="relative w-full lg:w-64 xl:w-80 h-40 sm:h-48 lg:h-auto bg-background/50">
                    {event.cover_image ? (
                      <Image
                        src={event.cover_image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 320px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-background/80">
                        <svg
                          className="w-12 h-12 sm:w-16 sm:h-16 text-placeholder/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-4 sm:p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground line-clamp-2">{event.title}</h3>
                        </div>
                        <p className="text-placeholder text-xs sm:text-sm line-clamp-2">{event.description}</p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                            event.is_published
                              ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                          }`}
                        >
                          {event.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                        <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary border border-primary/30 whitespace-nowrap text-center">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border/30">
                      <div>
                        <p className="text-placeholder text-[10px] sm:text-xs mb-1 font-medium">Data</p>
                        <p className="text-foreground text-xs sm:text-sm font-semibold truncate">
                          {formatDate(event.start_datetime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-placeholder text-[10px] sm:text-xs mb-1 font-medium">Local</p>
                        <p className="text-foreground text-xs sm:text-sm font-semibold truncate">{event.location_name}</p>
                      </div>
                      <div>
                        <p className="text-placeholder text-[10px] sm:text-xs mb-1 font-medium">Capacidade</p>
                        <p className="text-foreground text-xs sm:text-sm font-semibold">{event.capacity} pessoas</p>
                      </div>
                      <div>
                        <p className="text-placeholder text-[10px] sm:text-xs mb-1 font-medium">Criado por</p>
                        <p className="text-foreground text-xs sm:text-sm font-semibold truncate">
                          {event.creator?.name || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <EventActions eventId={event.id} eventTitle={event.title} />
                      <Link
                        href={`/evento/${event.slug}`}
                        className="px-3 sm:px-4 py-2 bg-card hover:bg-card-hover text-foreground rounded-lg text-xs sm:text-sm transition-colors border border-border/30 whitespace-nowrap"
                      >
                        Ver Página
                      </Link>
                      <Link
                        href={`/painel/admin/eventos/${event.id}/alunos`}
                        className="px-3 sm:px-4 py-2 bg-card hover:bg-card-hover text-foreground rounded-lg text-xs sm:text-sm transition-colors border border-border/30 whitespace-nowrap"
                      >
                        Ver Alunos
                      </Link>
                      <Link
                        href={`/checkin/${event.id}`}
                        className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-glow whitespace-nowrap"
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
          <div className="bg-card rounded-lg p-8 sm:p-12 text-center">
            <p className="text-placeholder text-sm sm:text-base mb-4">Nenhum evento criado ainda</p>
            <Link
              href="/painel/admin/eventos/novo"
              className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base transition-colors hover:opacity-90"
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
