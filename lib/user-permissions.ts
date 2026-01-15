import { User } from '@/types/database.types'

interface Event {
  id: string
  created_by: string
  [key: string]: any
}

interface UserPermissions {
  // Navigation - O que aparece na navbar
  showMeusEventos: boolean // "Meus Eventos" link
  showCriarEvento: boolean // "Criar Evento" CTA
  showMeusIngressos: boolean // "Meus Ingressos" link (sempre true)

  // Dashboard behavior
  dashboardType: 'user' | 'admin'

  // Actions - O que o usuário pode fazer
  canCreateEvent: boolean
  canEditEvent: (event: Event) => boolean
  canDeleteEvent: (event: Event) => boolean
  canViewEventStudents: (event: Event) => boolean
  canCheckinStudents: (event: Event) => boolean
  canManageUsers: boolean
  canViewFinancials: boolean
  canViewAllEvents: boolean
}

/**
 * Calcula as permissões do usuário baseado em AÇÕES (ownership), não em roles
 *
 * Nova Lógica Simplificada:
 * - Usuário SEM eventos criados → Vê "Criar Evento" (CTA)
 * - Usuário COM eventos criados → Vê "Meus Eventos"
 * - ADMIN: Acesso total a todos os eventos
 * - Permissões baseadas em ownership: usuário pode editar seus próprios eventos
 */
export function getUserPermissions(user: User, userEvents?: Event[]): UserPermissions {
  const isAdmin = user.role === 'ADMIN'

  // Verifica se o usuário TEM eventos criados por ele
  const hasCreatedEvents = !!(userEvents && userEvents.length > 0)

  return {
    // NAVBAR LOGIC - Baseada em AÇÕES, não em roles
    // Se nunca criou eventos → mostra CTA "Criar Evento"
    // Se já criou eventos → mostra "Meus Eventos"
    // ADMIN sempre vê "Meus Eventos" (acesso total)
    showCriarEvento: !isAdmin && !hasCreatedEvents,
    showMeusEventos: isAdmin || hasCreatedEvents,
    showMeusIngressos: true, // Sempre visível para todos

    // DASHBOARD TYPE
    dashboardType: isAdmin ? 'admin' : 'user',

    // ACTIONS
    canCreateEvent: true, // Todos podem criar eventos

    // Ownership-based permissions (não baseado em role)
    canEditEvent: (event: Event) => isAdmin || event.created_by === user.id,
    canDeleteEvent: (event: Event) => isAdmin || event.created_by === user.id,
    canViewEventStudents: (event: Event) => isAdmin || event.created_by === user.id,
    canCheckinStudents: (event: Event) => isAdmin || event.created_by === user.id,

    // Admin-only permissions
    canManageUsers: isAdmin,
    canViewFinancials: isAdmin,
    canViewAllEvents: isAdmin,
  }
}

/**
 * Helper para verificar se um usuário pode acessar um evento específico
 */
export function canUserAccessEvent(user: User, event: Event): boolean {
  const isAdmin = user.role === 'ADMIN'
  const isOwner = event.created_by === user.id
  return isAdmin || isOwner
}

/**
 * Helper para verificar se um usuário pode editar um evento
 */
export function canUserEditEvent(user: User, event: Event): boolean {
  const isAdmin = user.role === 'ADMIN'
  const isOwner = event.created_by === user.id
  return isAdmin || isOwner
}

/**
 * REMOVIDO: Auto-upgrade de roles
 * Nova lógica: Não há mais PARTICIPANTE/PALESTRANTE
 * Todos os usuários são 'USER' ou 'ADMIN'
 * Navegação é baseada em hasEvents, não em role
 */
export function needsRoleUpgrade(user: User): boolean {
  return false // Não há mais auto-upgrade
}
