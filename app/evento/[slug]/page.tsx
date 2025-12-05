import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Event, EventModule, TicketType, User } from '@/types/database.types'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { formatDateTime, formatCurrency, getAvailableSpots } from '@/lib/utils'

export default async function EventoPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  let user: User | null = null
  if (authUser) {
    const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
    user = data
  }

  // Fetch event
  const { data: event } = await supabase
    .from('events')
    .select('*, creator:users!events_created_by_fkey(*)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single<Event & { creator: User }>()

  if (!event) notFound()

  // Fetch modules
  const { data: modules } = await supabase
    .from('event_modules')
    .select('*')
    .eq('event_id', event.id)
    .order('order_index')
    .returns<EventModule[]>()

  // Fetch ticket types
  const { data: ticketTypes } = await supabase
    .from('tickets_types')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_active', true)
    .returns<TicketType[]>()

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      {/* Hero Banner */}
      <section
        className="relative h-[50vh] md:h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage: event.banner_url
            ? `url(${event.banner_url})`
            : 'linear-gradient(to right, #dc2626, #991b1b)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3" style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}>
              {event.category}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2">{event.title}</h1>
            {event.subtitle && <p className="text-xl text-foreground">{event.subtitle}</p>}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-12">
            {/* Event Info */}
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Sobre o Evento</h2>
              <p className="text-foreground whitespace-pre-line">{event.description}</p>
            </div>

            {/* Modules */}
            {modules && modules.length > 0 && (
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">O que você vai aprender</h2>
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="border-l-4 border-primary pl-4">
                      <h3 className="font-semibold text-foreground">{module.title}</h3>
                      {module.description && <p className="text-placeholder text-sm mt-1">{module.description}</p>}
                      <p className="text-primary text-sm mt-1">{module.hours}h</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target Audience */}
            {event.target_audience && (
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Pra quem é</h2>
                <p className="text-foreground">{event.target_audience}</p>
              </div>
            )}

            {/* Included Items */}
            {event.included_items && event.included_items.length > 0 && (
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">O que está incluído</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {event.included_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Local</h2>
              <div className="space-y-2">
                <p className="text-foreground font-semibold">{event.location_name}</p>
                <p className="text-placeholder">{event.address}</p>
                {event.google_maps_url && (
                  <a
                    href={event.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-primary hover:text-primary-400 mt-2"
                  >
                    Ver no Google Maps →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <div className="bg-card rounded-lg p-6 sticky top-20">
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-placeholder text-sm">Data e Hora</p>
                  <p className="text-foreground font-semibold">{formatDateTime(event.start_datetime)}</p>
                </div>
                <div>
                  <p className="text-placeholder text-sm">Duração</p>
                  <p className="text-foreground font-semibold">{event.total_hours}h</p>
                </div>
                <div>
                  <p className="text-placeholder text-sm">Formato</p>
                  <p className="text-foreground font-semibold">{event.mode}</p>
                </div>
                <div>
                  <p className="text-placeholder text-sm">Vagas</p>
                  <p className="text-foreground font-semibold">{event.capacity} pessoas</p>
                </div>
              </div>

              <div className="border-t border-card pt-6">
                <h3 className="font-bold text-foreground mb-4">Ingressos</h3>
                {ticketTypes && ticketTypes.length > 0 ? (
                  <div className="space-y-3">
                    {ticketTypes.map((ticket) => {
                      const available = getAvailableSpots(ticket.total_quantity, ticket.sold_quantity)
                      return (
                        <div key={ticket.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-foreground">{ticket.name}</p>
                              {ticket.description && (
                                <p className="text-sm text-placeholder mt-1">{ticket.description}</p>
                              )}
                            </div>
                            <p className="font-bold text-primary text-lg">{formatCurrency(ticket.price)}</p>
                          </div>
                          <p className="text-xs text-placeholder mb-3">{available} vagas disponíveis</p>
                          <Link
                            href={`/checkout/${event.id}/${ticket.id}`}
                            className="btn-primary block w-full text-center"
                          >
                            Comprar
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-placeholder text-sm">Ingressos em breve</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-card border-t border-card py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-placeholder">
          <p>&copy; 2025 StageOne. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
