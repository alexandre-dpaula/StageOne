'use client'

import Link from 'next/link'
import { useState } from 'react'
import { User } from '@/types/database.types'

interface NavbarProps {
  user?: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="text-lg sm:text-xl md:text-2xl text-primary hover:text-glow transition-all">
            <span className="font-normal">Stage</span><span className="font-bold">One</span><sup className="text-[0.5em] top-[-0.3em] relative ml-0.5">™</sup>
          </Link>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/painel/admin"
                    className="text-placeholder hover:text-primary transition-colors font-medium text-sm lg:text-base"
                  >
                    Painel Admin
                  </Link>
                )}
                {user.role === 'PALESTRANTE' && (
                  <Link
                    href="/painel/palestrante"
                    className="text-placeholder hover:text-primary transition-colors font-medium text-sm lg:text-base"
                  >
                    Meus Eventos
                  </Link>
                )}
                {user.role === 'PARTICIPANTE' && (
                  <Link
                    href="/meus-ingressos"
                    className="text-placeholder hover:text-primary transition-colors font-medium text-sm lg:text-base"
                  >
                    Meus Ingressos
                  </Link>
                )}

                <div className="flex items-center gap-2 lg:gap-3 ml-2">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-xs lg:text-sm text-foreground font-medium hidden lg:block max-w-[120px] truncate">{user.name}</span>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="text-xs lg:text-sm text-placeholder hover:text-red-500 transition-colors font-medium whitespace-nowrap"
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
                  className="text-placeholder hover:text-primary transition-colors font-medium text-sm lg:text-base"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="bg-primary text-background font-bold px-4 lg:px-6 py-2 rounded-full text-sm lg:text-base transition-all duration-300 hover:shadow-glow-md hover:scale-105"
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
                {user.role === 'ADMIN' && (
                  <Link
                    href="/painel/admin"
                    className="block text-placeholder hover:text-primary transition-colors font-medium py-2.5 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Painel Admin
                  </Link>
                )}
                {user.role === 'PALESTRANTE' && (
                  <Link
                    href="/painel/palestrante"
                    className="block text-placeholder hover:text-primary transition-colors font-medium py-2.5 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meus Eventos
                  </Link>
                )}
                {user.role === 'PARTICIPANTE' && (
                  <Link
                    href="/meus-ingressos"
                    className="block text-placeholder hover:text-primary transition-colors font-medium py-2.5 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meus Ingressos
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
