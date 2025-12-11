'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 sm:py-12">
          <p className="text-placeholder">Carregando...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  useEffect(() => {
    // Get redirect URL from query params
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectUrl(redirect)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Redirect to the stored URL or home
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push('/')
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="text-xl sm:text-2xl text-primary hover:text-glow transition-all">
            <span className="font-normal">Stage</span><span className="font-bold">One</span><sup className="text-[0.5em] top-[-0.3em] relative ml-0.5">™</sup>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-3 sm:mt-4">Entrar na sua conta</h1>
          <p className="text-placeholder text-sm sm:text-base mt-2">Acesse seus eventos e ingressos</p>
        </div>

        <div className="bg-card rounded-lg p-5 sm:p-6 md:p-8">
          {redirectUrl && (
            <div className="mb-5 sm:mb-6 bg-primary/10 border border-primary/30 text-foreground px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm">
              <p className="font-medium mb-1">🎫 Para continuar sua compra</p>
              <p className="text-placeholder text-[10px] sm:text-xs">
                Faça login ou cadastre-se para finalizar a compra do seu ingresso
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-placeholder text-sm">
              Não tem uma conta?{' '}
              <Link
                href={redirectUrl ? `/cadastro?redirect=${encodeURIComponent(redirectUrl)}` : '/cadastro'}
                className="text-primary hover:text-primary-400"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
