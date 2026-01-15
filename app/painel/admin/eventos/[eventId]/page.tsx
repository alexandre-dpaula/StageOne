import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { Ticket, Users, UserCheck, Clock } from 'lucide-react'

export default async function EventoAdminPage({ params }: { params: { eventId: string } }) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  if (!user || user.role !== 'ADMIN') redirect('/')

  // Get event
  const { data: event } = await supabase
    .from('events')
    .select('*, creator:users!events_created_by_fkey(*)')
    .eq('id', params.eventId)
    .single()

  if (!event) notFound()

  // Get modules
  const { data: modules } = await supabase
    .from('event_modules')
    .select('*')
    .eq('event_id', params.eventId)
    .order('order_index')

  // Get ticket types
  const { data: ticketTypes } = await supabase
    .from('tickets_types')
    .select('*')
    .eq('event_id', params.eventId)

  // Get tickets stats
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('event_id', params.eventId)

  const totalTickets = tickets?.length || 0
  const paidTickets = tickets?.filter(t => t.status === 'PAID' || t.status === 'USED').length || 0
  const checkedIn = tickets?.filter(t => t.checked_in_at).length || 0

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/painel/admin/eventos" className="text-xl font-bold text-primary">
              ← Voltar aos Eventos
            </Link>
            <div className="flex gap-2">
              <Link
                href={`/evento/${event.slug}`}
                target="_blank"
                className="px-4 py-2 bg-card hover:bg-card-hover text-foreground rounded-lg text-sm transition-colors"
              >
                Ver Página Pública
              </Link>
              <Link
                href={`/checkin/${params.eventId}`}
                className="px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-90"
                style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
              >
                Check-in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                event.is_published
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-yellow-500/20 text-yellow-500'
              }`}
            >
              {event.is_published ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
          <p className="text-placeholder">{event.subtitle}</p>
        </div>

        {/* Stats - Mini Cards */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Ingressos Vendidos */}
          <div className="rounded-xl px-4 py-3 hover:shadow-glow-md transition-all group flex items-center gap-3" style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}>
            <div className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ticket className="w-5 h-5" style={{ color: '#0A0B0D' }} />
            </div>
            <div>
              <p className="text-xs font-bold opacity-80">Ingressos Vendidos</p>
              <p className="text-2xl font-bold">{paidTickets}</p>
            </div>
          </div>

          {/* Capacidade */}
          <div className="glass rounded-xl px-4 py-3 border border-border/30 hover:border-primary/30 transition-all group flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-placeholder font-medium">Capacidade</p>
              <p className="text-2xl font-bold text-foreground">{event.capacity}</p>
            </div>
          </div>

          {/* Check-in Realizado */}
          <div className="glass rounded-xl px-4 py-3 border border-border/30 hover:border-accent-green/30 transition-all group flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <p className="text-xs text-placeholder font-medium">Check-in Realizado</p>
              <p className="text-2xl font-bold text-accent-green">{checkedIn}</p>
            </div>
          </div>

          {/* Duração */}
          <div className="glass rounded-xl px-4 py-3 border border-border/30 hover:border-primary/30 transition-all group flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-placeholder font-medium">Duração</p>
              <p className="text-2xl font-bold text-foreground">{event.total_hours}h</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Info and Ticket Types (separate cards) */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Informações</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-placeholder text-sm">Data e Hora</p>
                  <p className="text-foreground">{formatDateTime(event.start_datetime)}</p>
                </div>
                <div>
                  <p className="text-placeholder text-sm">Local</p>
                  <p className="text-foreground">{event.location_name}</p>
                  <p className="text-placeholder text-sm">{event.address}</p>
                </div>
                <div>
                  <p className="text-placeholder text-sm">Categoria</p>
                  <p className="text-foreground">{event.category}</p>
                </div>
                <div>
                  <p className="text-placeholder text-sm">Criado por</p>
                  <p className="text-foreground">{event.creator?.name}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Tipos de Ingressos</h2>
              {ticketTypes && ticketTypes.length > 0 ? (
                <div className="space-y-4">
                  {ticketTypes.map((ticket: any) => (
                    <div key={ticket.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-foreground font-semibold">{ticket.name}</p>
                          {ticket.description && (
                            <p className="text-placeholder text-sm mt-1">{ticket.description}</p>
                          )}
                        </div>
                        <p className="text-primary font-bold text-lg">
                          {formatCurrency(ticket.price)}
                        </p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-placeholder">
                          Vendidos: {ticket.sold_quantity}/{ticket.total_quantity}
                        </span>
                        <span
                          className={`font-semibold ${
                            ticket.is_active ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {ticket.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-placeholder text-sm">Nenhum tipo de ingresso configurado</p>
              )}
            </div>
          </div>

          {/* Right Column: Modules */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Módulos</h2>
            {modules && modules.length > 0 ? (
              <div className="space-y-3">
                {modules.map((module: any) => (
                  <div key={module.id} className="border-l-4 border-primary pl-4">
                    <p className="text-foreground font-semibold">{module.title}</p>
                    <p className="text-placeholder text-sm">{module.hours}h</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-placeholder text-sm">Nenhum módulo cadastrado</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link
            href={`/painel/admin/eventos/${params.eventId}/alunos`}
            className="bg-card hover:bg-card text-foreground p-6 rounded-lg text-center font-semibold transition-colors"
          >
            Ver Lista de Participantes
          </Link>
          <Link
            href={`/checkin/${params.eventId}`}
            className="p-6 rounded-lg text-center font-semibold transition-colors hover:opacity-90"
            style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
          >
            Sistema de Check-in
          </Link>
          <Link
            href={`/evento/${event.slug}`}
            target="_blank"
            className="bg-card hover:bg-card text-foreground p-6 rounded-lg text-center font-semibold transition-colors"
          >
            Ver Página Pública
          </Link>
        </div>
      </div>
    </div>
  )
}
