import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EventForm from '@/components/EventForm'

export default async function NovoEventoPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  if (!user || !['ADMIN', 'PALESTRANTE'].includes(user.role)) redirect('/')

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

      <EventForm backUrl="/painel/admin/eventos" redirectBase="/painel/admin/eventos" />
    </div>
  )
}
