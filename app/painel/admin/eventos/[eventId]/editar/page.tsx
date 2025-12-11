import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EventEditForm from '@/components/EventEditForm'

export default async function EditarEventoPage({ params }: { params: { eventId: string } }) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  if (!user || user.role !== 'ADMIN') redirect('/')

  // Fetch event data
  const { data: event, error } = await supabase
    .from('events')
    .select('*, modules:event_modules(*), ticketTypes:tickets_types(*)')
    .eq('id', params.eventId)
    .single()

  if (error || !event) {
    redirect('/painel/admin/eventos')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/painel/admin/eventos" className="text-xl font-bold text-primary">
              ← Voltar aos Eventos
            </Link>
          </div>
        </div>
      </nav>

      <EventEditForm event={event} backUrl="/painel/admin/eventos" />
    </div>
  )
}
