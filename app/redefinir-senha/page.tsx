'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  // Verificar se o token de recuperação é válido ao montar o componente
  useEffect(() => {
    const checkRecoveryToken = async () => {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        setTokenValid(false)
        setError('Link expirado ou inválido. Por favor, solicite um novo link de recuperação.')
      } else {
        setTokenValid(true)
      }
    }

    checkRecoveryToken()
  }, [])

  // Validação de força de senha
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 0, label: '', color: '' }
    if (pass.length < 6) return { strength: 1, label: 'Muito fraca', color: 'text-red-500' }
    if (pass.length < 8) return { strength: 2, label: 'Fraca', color: 'text-orange-500' }
    if (pass.length < 10 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return { strength: 3, label: 'Média', color: 'text-yellow-500' }
    }
    if (pass.length >= 10 && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) {
      return { strength: 4, label: 'Forte', color: 'text-primary' }
    }
    return { strength: 2, label: 'Fraca', color: 'text-orange-500' }
  }

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validações de segurança
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    if (password.length > 128) {
      setError('A senha não pode ter mais de 128 caracteres')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    // Verificar senhas comuns (exemplo básico)
    const commonPasswords = ['123456', 'password', '123456789', '12345678', '12345', '111111', '1234567', 'sunshine', 'qwerty', 'iloveyou']
    if (commonPasswords.includes(password.toLowerCase())) {
      setError('Esta senha é muito comum. Escolha uma senha mais segura.')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      setSuccess(true)

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      // Mensagens de erro amigáveis
      if (err.message?.includes('same')) {
        setError('A nova senha não pode ser igual à senha anterior')
      } else if (err.message?.includes('token')) {
        setError('Link expirado. Solicite um novo link de recuperação.')
      } else {
        setError('Erro ao redefinir senha. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Tela de erro - Token inválido ou expirado
  if (tokenValid === false) {
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
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Link Expirado
            </h2>
            <p className="text-placeholder mb-6">
              Este link de recuperação expirou ou já foi utilizado. Por favor, solicite um novo link de recuperação de senha.
            </p>
            <Link
              href="/esqueci-senha"
              className="inline-flex items-center gap-2 bg-primary text-background font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20 mb-4"
            >
              Solicitar novo link
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <p className="text-sm text-placeholder">
              ou{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">
                voltar para o login
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
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
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Senha redefinida!
            </h2>
            <p className="text-placeholder mb-6">
              Sua senha foi atualizada com sucesso. Você já pode fazer login com a nova senha.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary text-background font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20"
            >
              Fazer login
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-8 group"
          >
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
            Redefinir senha
          </h2>
          <p className="text-placeholder">
            Digite sua nova senha abaixo
          </p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-8 border border-border/30 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-shake">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Nova senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background text-foreground pl-12 pr-12 py-3.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-placeholder"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-placeholder hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Indicador de força de senha */}
              {password.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-placeholder">Força da senha:</span>
                    <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength === 1
                          ? 'bg-red-500 w-1/4'
                          : passwordStrength.strength === 2
                          ? 'bg-orange-500 w-1/2'
                          : passwordStrength.strength === 3
                          ? 'bg-yellow-500 w-3/4'
                          : passwordStrength.strength === 4
                          ? 'bg-primary w-full'
                          : 'w-0'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-placeholder mt-2">
                    Use 10+ caracteres, maiúsculas, números e símbolos para senha forte
                  </p>
                </div>
              )}

              {!password && (
                <p className="text-xs text-placeholder mt-2">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Confirmar nova senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background text-foreground pl-12 pr-12 py-3.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-placeholder"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-placeholder hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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
                  Redefinindo...
                </>
              ) : (
                <>
                  Redefinir senha
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-placeholder">ou</span>
            </div>
          </div>

          {/* Back to login link */}
          <div className="text-center">
            <p className="text-placeholder text-sm">
              Lembrou sua senha?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Voltar para o login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-placeholder">
          Ao continuar, você concorda com nossos{' '}
          <Link href="/termos" className="text-primary hover:underline">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link href="/privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  )
}
