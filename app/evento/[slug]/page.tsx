import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Event, EventModule, TicketType, User } from '@/types/database.types'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { formatDateTime, formatCurrency, getAvailableSpots } from '@/lib/utils'
import { OFFICIAL_LOCATION } from '@/lib/constants/location'

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

  const resolvedLocationName = event.location_name || OFFICIAL_LOCATION.name
  const resolvedAddress = event.address || OFFICIAL_LOCATION.address

  const locationQuery = encodeURIComponent(`${resolvedLocationName} ${resolvedAddress}`)
  const mapShareUrl = event.google_maps_url
    ? event.google_maps_url
    : `https://www.google.com/maps/search/?api=1&query=${locationQuery}`
  const mapEmbedUrl = `https://www.google.com/maps?q=${locationQuery}&output=embed`

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
        className="relative h-[40vh] sm:h-[45vh] md:h-[55vh] lg:h-[60vh] bg-cover bg-black"
        style={{
          backgroundImage: event.cover_image
            ? `url(${event.cover_image})`
            : event.banner_url
              ? `url(${event.banner_url})`
              : undefined,
          backgroundPosition: 'center bottom',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3" style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}>
              {event.category}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-1 sm:mb-2 leading-tight">{event.title}</h1>
            {event.subtitle && <p className="text-base sm:text-lg md:text-xl text-foreground">{event.subtitle}</p>}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 md:space-y-12">
            {/* Event Info */}
            <div className="bg-card rounded-lg p-4 sm:p-5 md:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Sobre o Evento</h2>
              <p className="text-foreground text-sm sm:text-base whitespace-pre-line leading-relaxed">{event.description}</p>
            </div>

            {/* Modules */}
            {modules && modules.length > 0 && (
              <div className="bg-card rounded-lg p-4 sm:p-5 md:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">O que você vai aprender</h2>
                <div className="space-y-3 sm:space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="border-l-4 border-primary pl-3 sm:pl-4">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{module.title}</h3>
                      {module.description && <p className="text-placeholder text-xs sm:text-sm mt-1">{module.description}</p>}
                      <p className="text-primary text-xs sm:text-sm mt-1">{module.hours}h</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target Audience */}
            {event.target_audience && (
              <div className="bg-card rounded-lg p-4 sm:p-5 md:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Pra quem é</h2>
                <p className="text-foreground text-sm sm:text-base leading-relaxed">{event.target_audience}</p>
              </div>
            )}

            {/* Included Items */}
            {event.included_items && event.included_items.length > 0 && (
              <div className="bg-card rounded-lg p-4 sm:p-5 md:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">O que está incluído</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {event.included_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-foreground">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-card rounded-lg p-4 sm:p-5 md:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Local</h2>
              <div className="space-y-2">
                <p className="text-foreground font-semibold text-sm sm:text-base">{resolvedLocationName}</p>
                <p className="text-placeholder text-sm sm:text-base">{resolvedAddress}</p>
                <div className="mt-3 sm:mt-4 space-y-3">
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-border/40">
                    <iframe
                      src={mapEmbedUrl}
                      className="w-full h-full"
                      title="Mapa do evento"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                  <a
                    href={mapShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 btn-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25V4.5L3 9m0 0l4.5 4.5V9m0 8.25V19.5L3 15m0 0l4.5-4.5V15m13.5-6h-9m9 6h-9" />
                    </svg>
                    Compartilhar Localização
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Event Details */}
            <div className="bg-card rounded-lg p-4 sm:p-5 md:p-6 lg:sticky lg:top-20">
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div>
                  <p className="text-placeholder text-xs sm:text-sm">Data e Hora</p>
                  <p className="text-foreground font-semibold text-sm sm:text-base">{formatDateTime(event.start_datetime)}</p>
                </div>
                <div>
                  <p className="text-placeholder text-xs sm:text-sm">Duração</p>
                  <p className="text-foreground font-semibold text-sm sm:text-base">{event.total_hours}h</p>
                </div>
                <div>
                  <p className="text-placeholder text-xs sm:text-sm">Formato</p>
                  <p className="text-foreground font-semibold text-sm sm:text-base">{event.mode}</p>
                </div>
                <div>
                  <p className="text-placeholder text-xs sm:text-sm">Vagas</p>
                  <p className="text-foreground font-semibold text-sm sm:text-base">{event.capacity} pessoas</p>
                </div>
              </div>

              <div className="border-t border-card pt-4 sm:pt-6">
                <h3 className="font-bold text-foreground mb-3 sm:mb-4 text-base sm:text-lg">Ingressos</h3>
                {ticketTypes && ticketTypes.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {ticketTypes.map((ticket) => {
                      const available = getAvailableSpots(ticket.total_quantity, ticket.sold_quantity)
                      return (
                        <div key={ticket.id} className="border border-border rounded-lg p-3 sm:p-4">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-sm sm:text-base">{ticket.name}</p>
                              {ticket.description && (
                                <p className="text-xs sm:text-sm text-placeholder mt-1 line-clamp-2">{ticket.description}</p>
                              )}
                            </div>
                            <p className="font-bold text-primary text-base sm:text-lg flex-shrink-0">{formatCurrency(ticket.price)}</p>
                          </div>
                          <p className="text-[10px] sm:text-xs text-placeholder mb-2 sm:mb-3">{available} vagas disponíveis</p>
                          <Link
                            href={`/checkout/${event.id}/${ticket.id}`}
                            className="btn-primary block w-full text-center text-sm sm:text-base py-2 sm:py-3"
                          >
                            Comprar
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-placeholder text-xs sm:text-sm">Ingressos em breve</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-card border-t border-card py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-placeholder">
          <p>&copy; 2025 <span className="font-normal">Stage</span><span className="font-bold">One</span>™. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
