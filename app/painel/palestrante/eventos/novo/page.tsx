import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EventForm from '@/components/EventForm'

export default async function NovoEventoPalestrantePage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  // Permitir todos usuários autenticados criarem eventos
  // PARTICIPANTE será promovido a PALESTRANTE automaticamente ao criar evento
  if (!user) redirect('/')

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

      <EventForm backUrl="/painel/palestrante" redirectBase="/painel/admin/eventos" />
    </div>
  )
}
