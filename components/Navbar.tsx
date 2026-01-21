'use client'

import Link from 'next/link'
import { useState } from 'react'
import { User } from '@/types/database.types'

type NavbarUser = User & {
  hasTickets?: boolean
  hasEvents?: boolean // Novo: indica se o usuário tem eventos criados
  isSuperAdmin?: boolean // Indica se o usuário é um super admin
}

interface NavbarProps {
  user?: NavbarUser | null
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // NOVA LÓGICA DE NAVEGAÇÃO ADAPTATIVA (Baseada em Ações, não em Roles):
  // - Usuário SEM eventos: Mostra "Criar Evento" (CTA) + "Meus Ingressos"
  // - Usuário COM eventos: Mostra "Meus Eventos" + "Meus Ingressos"
  // - ADMIN: Mostra "Meus Eventos" (acesso total) + "Meus Ingressos"
  // - SUPER ADMIN: Mostra "Dashboard CRM" adicional

  const isAdmin = user?.role === 'ADMIN'
  const hasEvents = user?.hasEvents ?? false
  const isSuperAdmin = user?.isSuperAdmin ?? isAdmin // Se não tiver isSuperAdmin definido, usa isAdmin

  // Determina o que mostrar na navbar baseado em AÇÕES, não em roles
  // Se o usuário NUNCA criou eventos → Mostra CTA "Criar Evento"
  // Se o usuário JÁ CRIOU eventos → Mostra "Meus Eventos"
  // ADMIN sempre vê "Meus Eventos" (tem acesso a tudo)
  const showCriarEvento = !!user && !isAdmin && !hasEvents
  const showMeusEventos = !!user && (isAdmin || hasEvents)
  const showMeusIngressos = !!user // Sempre visível
  const showDashboardCRM = isAdmin // Todos os ADMINs veem o CRM

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - Simplificada quando há itens de menu */}
          <Link href="/" className="text-lg sm:text-xl md:text-2xl text-primary hover:text-glow transition-all">
            {user ? (
              // Logo compacta: St™ (quando usuário logado)
              <>
                <span className="font-bold">St</span><sup className="text-[0.5em] top-[-0.3em] relative ml-0.5">™</sup>
              </>
            ) : (
              // Logo completa: StageOne™ (quando não logado - home page)
              <>
                <span className="font-normal">Stage</span><span className="font-bold">One</span><sup className="text-[0.5em] top-[-0.3em] relative ml-0.5">™</sup>
              </>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {user ? (
              <>
                {/* Criar Evento (CTA para PARTICIPANTE ou PALESTRANTE sem eventos) */}
                {showCriarEvento && (
                  <Link
                    href="/painel/palestrante/eventos/novo"
                    className="bg-primary text-background font-bold px-5 lg:px-6 py-2 lg:py-2.5 rounded-full text-sm lg:text-base transition-all duration-300 hover:shadow-glow-md hover:scale-105"
                  >
                    Criar Evento
                  </Link>
                )}

                {/* Meus Eventos (para PALESTRANTE com eventos ou ADMIN) */}
                {showMeusEventos && (
                  <Link
                    href="/painel/palestrante"
                    className="text-placeholder hover:text-primary transition-colors font-medium text-base lg:text-lg"
                  >
                    Meus Eventos
                  </Link>
                )}

                {/* Meus Ingressos (sempre visível) */}
                {showMeusIngressos && (
                  <Link
                    href="/meus-ingressos"
                    className="text-placeholder hover:text-primary transition-colors font-medium text-base lg:text-lg"
                  >
                    Meus Ingressos
                  </Link>
                )}

                {/* Dashboard CRM (apenas para super admin) */}
                {showDashboardCRM && (
                  <Link
                    href="/painel/crm"
                    className="text-placeholder hover:text-primary transition-colors font-medium text-base lg:text-lg"
                  >
                    Dashboard CRM
                  </Link>
                )}

                <div className="flex items-center gap-3 lg:gap-4 ml-2">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-sm lg:text-base font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  {/* Nome do usuário */}
                  <span className="text-foreground font-medium hidden lg:block max-w-[150px] truncate text-base">{user.name}</span>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="text-sm lg:text-base text-placeholder hover:text-red-500 transition-colors font-medium whitespace-nowrap"
                    >
                      Sair
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-placeholder hover:text-primary transition-colors font-medium text-base lg:text-lg"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="bg-primary text-background font-bold px-5 lg:px-7 py-2 lg:py-2.5 rounded-full text-sm lg:text-base transition-all duration-300 hover:shadow-glow-md hover:scale-105"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors p-1"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden glass border-t border-border/30 animate-fade-in">
          <div className="px-4 py-3 space-y-2 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            {user ? (
              <>
                {/* Criar Evento (CTA Mobile) */}
                {showCriarEvento && (
                  <Link
                    href="/painel/palestrante/eventos/novo"
                    className="bg-primary text-background font-bold px-6 py-3 rounded-full text-sm transition-all duration-300 hover:shadow-glow-md block text-center mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Criar Evento
                  </Link>
                )}

                {/* Meus Eventos */}
                {showMeusEventos && (
                  <Link
                    href="/painel/palestrante"
                    className="block text-placeholder hover:text-primary transition-colors font-medium py-2.5 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meus Eventos
                  </Link>
                )}

                {/* Meus Ingressos */}
                {showMeusIngressos && (
                  <Link
                    href="/meus-ingressos"
                    className="block text-placeholder hover:text-primary transition-colors font-medium py-2.5 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meus Ingressos
                  </Link>
                )}

                {/* Dashboard CRM (apenas para super admin - Mobile) */}
                {showDashboardCRM && (
                  <Link
                    href="/painel/crm"
                    className="block text-placeholder hover:text-primary transition-colors font-medium py-2.5 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard CRM
                  </Link>
                )}

                <div className="pt-3 border-t border-border/30 mt-2">
                  <div className="flex items-center gap-3 mb-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-foreground font-medium truncate">{user.name}</span>
                  </div>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="text-sm text-placeholder hover:text-red-500 transition-colors font-medium py-2"
                    >
                      Sair
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-placeholder hover:text-primary transition-colors font-medium py-2.5 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="bg-primary text-background font-bold px-6 py-3 rounded-full text-sm transition-all duration-300 hover:shadow-glow-md block text-center mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
