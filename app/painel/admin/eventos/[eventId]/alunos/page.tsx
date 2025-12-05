import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

export default async function AlunosEventoPage({ params }: { params: { eventId: string } }) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  if (!user || !['ADMIN', 'PALESTRANTE'].includes(user.role)) redirect('/')

  // Get event
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.eventId)
    .single()

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Evento não encontrado</div>
      </div>
    )
  }

  // Get tickets/participants
  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      *,
      user:users(*),
      ticket_type:tickets_types(*)
    `)
    .eq('event_id', params.eventId)
    .order('purchased_at', { ascending: false })

  const totalTickets = tickets?.length || 0
  const paidTickets = tickets?.filter((t: any) => t.status === 'PAID').length || 0
  const checkedInTickets = tickets?.filter((t: any) => t.checked_in_at).length || 0

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/painel/admin/eventos" className="text-xl font-bold text-primary">
              ← Voltar aos Eventos
            </Link>
            <Link
              href={`/checkin/${params.eventId}`}
              className="px-4 py-2 rounded-lg font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
            >
              Fazer Check-in
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{event.title}</h1>
        <p className="text-placeholder mb-8">Lista de Participantes</p>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6">
            <p className="text-placeholder text-sm">Total de Ingressos</p>
            <p className="text-4xl font-bold text-foreground mt-2">{totalTickets}</p>
          </div>
          <div className="bg-card rounded-lg p-6">
            <p className="text-placeholder text-sm">Pagos</p>
            <p className="text-4xl font-bold text-green-500 mt-2">{paidTickets}</p>
          </div>
          <div className="bg-card rounded-lg p-6">
            <p className="text-placeholder text-sm">Check-in Realizado</p>
            <p className="text-4xl font-bold text-blue-500 mt-2">{checkedInTickets}</p>
          </div>
        </div>

        {/* Participants List */}
        {tickets && tickets.length > 0 ? (
          <div className="bg-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-card">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-placeholder uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-placeholder uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-placeholder uppercase tracking-wider">
                      WhatsApp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-placeholder uppercase tracking-wider">
                      Tipo de Ingresso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-placeholder uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-placeholder uppercase tracking-wider">
                      Check-in
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {tickets.map((ticket: any) => (
                    <tr key={ticket.id} className="hover:bg-card/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {ticket.user?.avatar_url ? (
                            <img
                              src={ticket.user.avatar_url}
                              alt={ticket.buyer_name}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-foreground font-bold mr-3">
                              {ticket.buyer_name.charAt(0)}
                            </div>
                          )}
                          <span className="text-foreground font-medium">{ticket.buyer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground">{ticket.buyer_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground">
                        {ticket.buyer_phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground">
                        {ticket.ticket_type?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ticket.status === 'PAID'
                              ? 'bg-green-500/20 text-green-500'
                              : ticket.status === 'USED'
                              ? 'bg-blue-500/20 text-blue-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}
                        >
                          {ticket.status === 'PAID'
                            ? 'Pago'
                            : ticket.status === 'USED'
                            ? 'Utilizado'
                            : ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.checked_in_at ? (
                          <div>
                            <span className="text-green-500 font-semibold">✓ Realizado</span>
                            <p className="text-xs text-placeholder mt-1">
                              {formatDateTime(ticket.checked_in_at)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500">Pendente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg p-12 text-center">
            <p className="text-placeholder">Nenhum participante inscrito ainda</p>
          </div>
        )}
      </div>
    </div>
  )
}
