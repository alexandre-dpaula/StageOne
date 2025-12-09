import { createClient } from '@/lib/supabase/server'
import { Event, User } from '@/types/database.types'
import Navbar from '@/components/Navbar'
import EventCarousel from '@/components/EventCarousel'
import EventSearch from '@/components/EventSearch'
import Link from 'next/link'
import Image from 'next/image'

export default async function HomePage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  let user: User | null = null
  if (authUser) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    user = data
  }

  // Fetch published events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('start_datetime', { ascending: true })
    .returns<Event[]>()

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
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
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
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20 w-full">
          <div className="text-center mb-12 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className="text-primary text-sm font-bold uppercase tracking-wider">
                Plataforma de Eventos
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Bem-vindo ao
              <span className="text-primary text-glow"> <span className="font-normal">Stage</span><span className="font-bold">One</span></span>
            </h1>

            <p className="text-xl text-placeholder mb-12 max-w-3xl mx-auto">
              Encontre e participe dos melhores eventos e treinamentos presenciais
            </p>
          </div>

          {/* Search Component */}
          <div className="animate-slide-up">
            <EventSearch allEvents={events || []} />
          </div>

          {/* CTA Orçamento */}
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/orcamento"
              className="inline-flex items-center gap-2 bg-primary text-background px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Solicitar Orçamento
            </Link>
            <p className="text-placeholder text-sm mt-3">
              Faça uma cotação rápida e garanta seu espaço
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-6 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl font-bold text-primary mb-2">{events?.length || 0}</div>
              <div className="text-placeholder text-sm font-medium">Eventos Disponíveis</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold text-primary mb-2">{upcomingEvents.length}</div>
              <div className="text-placeholder text-sm font-medium">Próximos Eventos</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold text-primary mb-2">4</div>
              <div className="text-placeholder text-sm font-medium">Categorias</div>
            </div>
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
          <p>&copy; 2025 StageOne. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
