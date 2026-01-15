import { createClient } from '@/lib/supabase/server'
import { EventWithTicketTypes } from '@/types/database.types'
import { getUserWithMeta } from '@/lib/get-user-with-meta'
import Navbar from '@/components/Navbar'
import EventCarousel from '@/components/EventCarousel'
import EventSearch from '@/components/EventSearch'

export default async function HomePage() {
  const supabase = await createClient()

  // Get current user with metadata (hasTickets, hasEvents)
  const user = await getUserWithMeta()

  // Fetch published events with ticket types
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      ticket_types:tickets_types(*)
    `)
    .eq('is_published', true)
    .order('start_datetime', { ascending: true })

  // Categorize events
  const now = new Date()
  const upcomingEvents = events?.filter((e) => new Date(e.start_datetime) > now) || []
  const recentEvents = events?.slice(0, 8) || [] // Últimos 8 eventos cadastrados

  const eventsByCategory = {
    'LIDERANÇA': events?.filter((e) => e.category === 'LIDERANÇA') || [],
    'NEGÓCIOS': events?.filter((e) => e.category === 'NEGÓCIOS') || [],
    'MÍDIA': events?.filter((e) => e.category === 'MÍDIA') || [],
    'JUVENTUDE': events?.filter((e) => e.category === 'JUVENTUDE') || [],
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      {/* Hero Section - Search Focus */}
      <section className="relative min-h-[75vh] sm:min-h-[80vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(196, 248, 42, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(196, 248, 42, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />

          {/* Glow orbs */}
          <div className="absolute top-20 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-accent-blue/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 w-full">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider">
                Plataforma de Eventos
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-4">
              Bem-vindo ao
              <span className="text-primary text-glow"> <span className="font-normal">Stage</span><span className="font-bold">One</span><sup className="text-[0.5em] top-[-0.3em] relative ml-1">™</sup></span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-placeholder mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-4">
              Encontre e participe dos melhores eventos e treinamentos presenciais
            </p>
          </div>

          {/* Search Component */}
          <div className="animate-slide-up">
            <EventSearch allEvents={events || []} />
          </div>
        </div>
      </section>

      {/* Events Carousels */}
      <section id="eventos" className="pt-8 pb-20">
        {/* Últimos Eventos Cadastrados */}
        {recentEvents.length > 0 && (
          <EventCarousel title="Últimos Eventos Cadastrados" events={recentEvents} />
        )}

        {/* Próximos Eventos */}
        {upcomingEvents.length > 0 && (
          <EventCarousel title="Próximos Treinamentos" events={upcomingEvents} />
        )}

        {/* Eventos por Categoria */}
        {eventsByCategory['LIDERANÇA'].length > 0 && (
          <EventCarousel title="Liderança" events={eventsByCategory['LIDERANÇA']} />
        )}

        {eventsByCategory['NEGÓCIOS'].length > 0 && (
          <EventCarousel title="Negócios" events={eventsByCategory['NEGÓCIOS']} />
        )}

        {eventsByCategory['MÍDIA'].length > 0 && (
          <EventCarousel title="Mídia e Comunicação" events={eventsByCategory['MÍDIA']} />
        )}

        {eventsByCategory['JUVENTUDE'].length > 0 && (
          <EventCarousel title="Juventude" events={eventsByCategory['JUVENTUDE']} />
        )}

        {events?.length === 0 && (
          <div className="text-center py-20">
            <div className="glass rounded-2xl p-12 max-w-md mx-4 md:mx-auto">
              <svg className="w-20 h-20 text-placeholder/30 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-placeholder text-lg font-medium mb-2">Nenhum evento disponível</p>
              <p className="text-placeholder/60 text-sm">
                Novos eventos serão publicados em breve. Volte mais tarde!
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-card py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-placeholder">
          <p>&copy; 2025 <span className="font-normal">Stage</span><span className="font-bold">One</span>™. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
