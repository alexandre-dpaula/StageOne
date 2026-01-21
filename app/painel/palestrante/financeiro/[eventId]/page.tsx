import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FinancialDashboard from '@/components/FinancialDashboard'

interface PageProps {
  params: Promise<{ eventId: string }>
}

export default async function FinanceiroEventoPage({ params }: PageProps) {
  const { eventId } = await params
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

  if (!user) redirect('/')

  // Buscar evento
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('created_by', authUser.id)
    .single()

  if (!event) {
    redirect('/painel/palestrante')
  }

  // Buscar dados financeiros
  const { data: financials } = await supabase
    .from('event_financials')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', authUser.id)
    .single()

  // Buscar histórico de saques
  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('event_id', eventId)
    .order('requested_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/painel/palestrante" className="text-xl font-bold text-primary">
              ← Voltar ao Painel
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Financeiro - <span className="text-primary text-glow">{event.title}</span>
          </h1>
          <p className="text-placeholder">
            Acompanhe as vendas, custos e saldo disponível para saque
          </p>
        </div>

        <FinancialDashboard
          event={event}
          financials={financials}
          withdrawals={withdrawals || []}
          user={user}
        />
      </div>
    </div>
  )
}
