'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
          <p className="text-placeholder">Carregando...</p>
        </div>
      }
    >
      <CadastroContent />
    </Suspense>
  )
}

function CadastroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
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

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          role: 'PARTICIPANTE',
        })

        if (profileError) throw profileError

        // Redirect to the stored URL or home
        if (redirectUrl) {
          router.push(redirectUrl)
        } else {
          router.push('/')
        }
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl text-primary hover:text-glow transition-all">
            <span className="font-normal">Stage</span><span className="font-bold">One</span><sup className="text-[0.5em] top-[-0.3em] relative ml-0.5">™</sup>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-4">Criar sua conta</h1>
          <p className="text-placeholder mt-2">Comece a participar de eventos incríveis</p>
        </div>

        <div className="bg-card rounded-lg p-8">
          {redirectUrl && (
            <div className="mb-6 bg-primary/10 border border-primary/30 text-foreground px-4 py-3 rounded-lg text-sm">
              <p className="font-medium mb-1">🎫 Para continuar sua compra</p>
              <p className="text-placeholder text-xs">
                Crie sua conta para finalizar a compra do seu ingresso
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Nome completo"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Seu nome"
              required
            />

            <Input
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              required
            />

            <Input
              label="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirmar senha"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Criar Conta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-placeholder text-sm">
              Já tem uma conta?{' '}
              <Link
                href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                className="text-primary hover:text-primary-400"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
