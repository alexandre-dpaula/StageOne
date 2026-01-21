import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ApprovalCard from '@/components/ApprovalCard'

export default async function EventosPendentesPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user || user.role !== 'ADMIN') {
    redirect('/')
  }

  // Buscar eventos pendentes de aprovação
  const { data: pendingEvents } = await supabase
    .from('events')
    .select(`
      *,
      creator:users!events_created_by_fkey(id, name, email)
    `)
    .eq('status', 'PENDING_APPROVAL')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/painel/admin" className="text-xl font-bold text-primary">
              ← Voltar ao Painel Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Eventos <span className="text-primary text-glow">Pendentes de Aprovação</span>
          </h1>
          <p className="text-placeholder">
            Revise e aprove eventos submetidos por criadores
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-6 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingEvents?.length || 0}</p>
                <p className="text-sm text-placeholder">Aguardando Aprovação</p>
              </div>
            </div>
          </div>
        </div>

        {/* Eventos Pendentes */}
        {!pendingEvents || pendingEvents.length === 0 ? (
          <div className="glass rounded-2xl p-12 border border-border/30 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum evento pendente</h3>
            <p className="text-placeholder">
              Todos os eventos foram revisados. Novos eventos aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingEvents.map((event: any) => (
              <ApprovalCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
