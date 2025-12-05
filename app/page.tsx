import { createClient } from '@/lib/supabase/server'
import { Event, User } from '@/types/database.types'
import Navbar from '@/components/Navbar'
import EventCarousel from '@/components/EventCarousel'
import Link from 'next/link'

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

  const eventsByCategory = {
    'LIDERANÇA': events?.filter((e) => e.category === 'LIDERANÇA') || [],
    'NEGÓCIOS': events?.filter((e) => e.category === 'NEGÓCIOS') || [],
    'MÍDIA': events?.filter((e) => e.category === 'MÍDIA') || [],
    'JUVENTUDE': events?.filter((e) => e.category === 'JUVENTUDE') || [],
  }

  // Featured event (first upcoming)
  const featuredEvent = upcomingEvents[0]

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      {/* Hero Section - Crypto/Fintech Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
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

        {featuredEvent ? (
          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary text-sm font-bold uppercase tracking-wider">
                    {featuredEvent.category}
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                  {featuredEvent.title.split(' ').slice(0, 3).join(' ')}
                  <span className="text-primary text-glow"> {featuredEvent.title.split(' ').slice(3).join(' ')}</span>
                </h1>

                <p className="text-lg text-placeholder mb-8 leading-relaxed">
                  {featuredEvent.subtitle || featuredEvent.description.substring(0, 150) + '...'}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center text-xs font-bold text-primary">
                      +{upcomingEvents.length}
                    </div>
                  </div>
                  <div>
                    <p className="text-foreground font-bold">{featuredEvent.capacity} vagas</p>
                    <p className="text-placeholder text-sm">Disponíveis</p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/evento/${featuredEvent.slug}`}
                    className="group btn-primary text-lg flex items-center justify-center gap-2"
                  >
                    <span>Garantir Ingresso</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href={`/evento/${featuredEvent.slug}`}
                    className="glass text-foreground px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:border-primary/50 flex items-center justify-center"
                  >
                    Saber Mais
                  </Link>
                </div>
              </div>

              {/* Right Content - Feature Card */}
              <div className="relative animate-slide-up">
                <div className="glass rounded-2xl p-6 shadow-glow-md">
                  {featuredEvent.banner_url ? (
                    <img
                      src={featuredEvent.banner_url}
                      alt={featuredEvent.title}
                      className="w-full h-64 object-cover rounded-xl mb-4"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-accent-blue/20 rounded-xl mb-4 flex items-center justify-center">
                      <svg className="w-20 h-20 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-placeholder text-sm">Data do Evento</span>
                      <span className="text-foreground font-bold">
                        {new Date(featuredEvent.start_datetime).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-placeholder text-sm">Localização</span>
                      <span className="text-foreground font-bold">{featuredEvent.location_name}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-placeholder text-sm">A partir de</span>
                      <span className="text-primary text-2xl font-bold">R$ 99</span>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-primary text-foreground px-4 py-2 rounded-full font-bold shadow-glow-md animate-pulse-slow">
                  Destaque
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center py-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary text-sm font-bold uppercase tracking-wider">
                Plataforma de Eventos
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Bem-vindo ao
              <span className="text-primary text-glow"> StageOne</span>
            </h1>

            <p className="text-xl text-placeholder mb-12 max-w-3xl mx-auto">
              Plataforma completa para eventos e treinamentos presenciais com tecnologia de ponta
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reserva"
                className="btn-primary text-lg"
              >
                Reserve Agora
              </Link>
              <Link
                href="#eventos"
                className="glass text-foreground px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:border-primary/50"
              >
                Ver Eventos
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Events Carousels */}
      <section className="pt-8 pb-20">
        {upcomingEvents.length > 0 && (
          <EventCarousel title="Próximos Treinamentos" events={upcomingEvents} />
        )}

        {eventsByCategory['LIDERANÇA'].length > 0 && (
          <EventCarousel title="Para Líderes" events={eventsByCategory['LIDERANÇA']} />
        )}

        {eventsByCategory['NEGÓCIOS'].length > 0 && (
          <EventCarousel title="Para Empreendedores" events={eventsByCategory['NEGÓCIOS']} />
        )}

        {eventsByCategory['JUVENTUDE'].length > 0 && (
          <EventCarousel title="Para Jovens" events={eventsByCategory['JUVENTUDE']} />
        )}

        {eventsByCategory['MÍDIA'].length > 0 && (
          <EventCarousel title="Mídia e Comunicação" events={eventsByCategory['MÍDIA']} />
        )}

        {events?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-placeholder text-lg">Nenhum evento disponível no momento.</p>
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
