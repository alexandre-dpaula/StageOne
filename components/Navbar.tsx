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
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl text-primary hover:text-glow transition-all">
            <span className="font-normal">Stage</span><span className="font-bold">One</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-placeholder hover:text-primary transition-colors font-medium">
              Eventos
            </Link>

            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/painel/admin"
                    className="text-placeholder hover:text-primary transition-colors font-medium"
                  >
                    Painel Admin
                  </Link>
                )}
                {user.role === 'PALESTRANTE' && (
                  <Link
                    href="/painel/palestrante"
                    className="text-placeholder hover:text-primary transition-colors font-medium"
                  >
                    Meus Eventos
                  </Link>
                )}
                {user.role === 'PARTICIPANTE' && (
                  <Link
                    href="/meus-ingressos"
                    className="text-placeholder hover:text-primary transition-colors font-medium"
                  >
                    Meus Ingressos
                  </Link>
                )}

                <div className="flex items-center gap-3 ml-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <span className="text-primary text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-foreground font-medium">{user.name}</span>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="text-sm text-placeholder hover:text-red-500 transition-colors font-medium"
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
                  className="text-placeholder hover:text-primary transition-colors font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="btn-primary"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
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
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block text-placeholder hover:text-primary transition-colors font-medium py-2"
            >
              Eventos
            </Link>

            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/painel/admin"
                    className="block text-placeholder hover:text-primary transition-colors font-medium py-2"
                  >
                    Painel Admin
                  </Link>
                )}
                {user.role === 'PALESTRANTE' && (
                  <Link
                    href="/painel/palestrante"
                    className="block text-placeholder hover:text-primary transition-colors font-medium py-2"
                  >
                    Meus Eventos
                  </Link>
                )}
                {user.role === 'PARTICIPANTE' && (
                  <Link
                    href="/meus-ingressos"
                    className="block text-placeholder hover:text-primary transition-colors font-medium py-2"
                  >
                    Meus Ingressos
                  </Link>
                )}

                <div className="pt-3 border-t border-border/30 mt-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-foreground font-medium">{user.name}</span>
                  </div>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="text-sm text-placeholder hover:text-red-500 transition-colors font-medium"
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
                  className="block text-placeholder hover:text-primary transition-colors font-medium py-2"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="btn-primary block text-center mt-2"
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
