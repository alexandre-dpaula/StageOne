import { createClient } from '@/lib/supabase/server'
import { User } from '@/types/database.types'

export type UserWithMeta = User & {
  hasTickets?: boolean
  hasEvents?: boolean
  isSuperAdmin?: boolean
}

/**
 * Busca o usuário autenticado com metadados adicionais:
 * - hasTickets: Se o usuário possui ingressos comprados
 * - hasEvents: Se o usuário criou pelo menos um evento
 * - isSuperAdmin: Se o usuário é um super admin ativo
 *
 * Esses metadados são usados para determinar a navegação adaptativa
 */
export async function getUserWithMeta(): Promise<UserWithMeta | null> {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const [{ data: userData }, { count: ticketsCount }, { count: eventsCount }, { data: adminData }] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).single(),
    supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .eq('status', 'PAID'),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', authUser.id),
    supabase
      .from('admins')
      .select('role, is_active')
      .eq('user_id', authUser.id)
      .eq('is_active', true)
      .eq('role', 'super_admin')
      .single(),
  ])

  if (!userData) return null

  return {
    ...userData,
    hasTickets: (ticketsCount || 0) > 0,
    hasEvents: (eventsCount || 0) > 0,
    isSuperAdmin: !!adminData,
  }
}
