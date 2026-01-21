'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [emailFromUrl, setEmailFromUrl] = useState<string | null>(null)

  // Puxar e-mail da URL se vier da tela de login
  useEffect(() => {
    const urlEmail = searchParams.get('email')
    if (urlEmail) {
      const decodedEmail = decodeURIComponent(urlEmail)
      setEmail(decodedEmail)
      setEmailFromUrl(decodedEmail) // Marca que veio da URL (não editável)
    }
  }, [searchParams])

  // Validação de e-mail no frontend
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Função para mascarar o e-mail (limitar caracteres visíveis)
  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@')
    if (!localPart || !domain) return '***************'

    // Mostra apenas os primeiros 3 caracteres + 12 asteriscos + @dominio
    const visibleStart = localPart.substring(0, 3)
    const maskedPart = '*'.repeat(12)

    return `${visibleStart}${maskedPart}@${domain}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica de e-mail
    if (!email || !isValidEmail(email)) {
      return // Input HTML5 já valida, mas garantimos aqui também
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // SEGURANÇA: SEMPRE mostramos sucesso, independente do e-mail existir
      // Isso previne "user enumeration" (descobrir quais e-mails existem)
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      // Sempre marca como sucesso
      setSuccess(true)
    } catch (err: any) {
      // Mesmo com erro, mostramos sucesso (segurança)
      setSuccess(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Tela de sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full animate-fade-in">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h1 className="text-3xl font-bold text-primary">
                <span className="font-normal">Stage</span>
                <span className="font-bold">One</span>
                <sup className="text-xs ml-1">™</sup>
              </h1>
            </Link>
          </div>

          <div className="glass rounded-2xl p-8 border border-border/30 shadow-xl text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3">
              Verifique seu e-mail
            </h2>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-foreground mb-2">
                Enviamos instruções para <span className="font-semibold text-primary">{email}</span>
              </p>
              <p className="text-xs text-placeholder">
                Se este e-mail estiver cadastrado, você receberá o link de recuperação em alguns minutos.
              </p>
            </div>

            <div className="space-y-3 text-sm text-placeholder text-left mb-6">
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verifique sua caixa de entrada e pasta de spam
              </p>
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                O link expira em 1 hora por segurança
              </p>
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Não recebeu? Aguarde alguns minutos e tente novamente
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Formulário inicial
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
              <h1 className="relative text-4xl font-bold text-primary">
                <span className="font-normal">Stage</span>
                <span className="font-bold">One</span>
                <sup className="text-xs ml-1">™</sup>
              </h1>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Recuperar senha
          </h2>
          <p className="text-placeholder">
            Digite seu e-mail para receber o link de recuperação
          </p>
        </div>

        <div className="glass rounded-2xl p-8 border border-border/30 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                E-mail da conta
              </label>
              {emailFromUrl ? (
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <div className="w-full bg-primary/5 text-foreground pl-12 pr-12 py-3.5 rounded-xl border border-primary/30 font-medium">
                      {maskEmail(emailFromUrl)}
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    E-mail preenchido automaticamente da tela de login
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className="w-full bg-background text-foreground pl-12 pr-4 py-3.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-placeholder"
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    autoFocus
                  />
                  <p className="text-xs text-placeholder mt-2">
                    Use o e-mail que você cadastrou na plataforma
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-background font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  Enviar link
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-placeholder">ou</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-placeholder text-sm">
              Lembrou sua senha?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-placeholder animate-pulse">Carregando...</p>
          </div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  )
}
