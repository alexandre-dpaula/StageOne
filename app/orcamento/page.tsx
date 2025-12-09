'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface OrcamentoData {
  // Dados pessoais
  name: string
  email: string
  phone: string
  password: string

  // Dados do evento
  eventName: string
  eventDate: string
  hours: number
  expectedAttendees: number

  // Adicionais
  hasAudiovisual: boolean
  hasCoverage: boolean
  hasCoffeeBreak: boolean

  // Observações
  notes: string
}

export default function OrcamentoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Dados pessoais, 2: Dados do evento, 3: Resumo
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userExists, setUserExists] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Novo state para verificar se está logado

  const [formData, setFormData] = useState<OrcamentoData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    eventName: '',
    eventDate: '',
    hours: 4,
    expectedAttendees: 50,
    hasAudiovisual: false,
    hasCoverage: false,
    hasCoffeeBreak: false,
    notes: '',
  })

  // Cálculo de preços
  const PRICE_PER_HOUR = 200
  const AUDIOVISUAL_PRICE = 500
  const COVERAGE_PRICE = 800
  const COFFEE_BREAK_PRICE_PER_PERSON = 15

  const calculatePrice = () => {
    let basePrice = formData.hours * PRICE_PER_HOUR
    let addonsPrice = 0

    if (formData.hasAudiovisual) addonsPrice += AUDIOVISUAL_PRICE
    if (formData.hasCoverage) addonsPrice += COVERAGE_PRICE
    if (formData.hasCoffeeBreak) addonsPrice += COFFEE_BREAK_PRICE_PER_PERSON * formData.expectedAttendees

    return {
      basePrice,
      addonsPrice,
      total: basePrice + addonsPrice,
    }
  }

  // Verificar se o usuário já existe
  const checkUserExists = async () => {
    if (!formData.email) return

    setIsCheckingUser(true)
    setError('')

    try {
      const supabase = createClient()

      // Verificar se o email existe na tabela users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, name, phone')
        .eq('email', formData.email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = não encontrado (usuário não existe)
        throw checkError
      }

      if (existingUser) {
        setUserExists(true)
        // Preencher dados existentes
        setFormData({
          ...formData,
          name: existingUser.name,
          phone: existingUser.phone || '',
        })
      } else {
        setUserExists(false)
      }
    } catch (err: any) {
      console.error('Erro ao verificar usuário:', err)
      setError('Erro ao verificar email')
    } finally {
      setIsCheckingUser(false)
    }
  }

  // Verificar se usuário já está logado ao carregar a página
  useEffect(() => {
    const checkAuthUser = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Usuário está logado, buscar dados do perfil
        const { data: profile } = await supabase
          .from('users')
          .select('name, email, phone')
          .eq('id', user.id)
          .single()

        if (profile) {
          setFormData({
            ...formData,
            name: profile.name,
            email: profile.email,
            phone: profile.phone || '',
          })
          setUserExists(true)
          setIsLoggedIn(true) // Marcar que está logado
          setStep(2) // Pular para Step 2 automaticamente
        }
      }
    }

    checkAuthUser()
  }, [])

  // Avançar para próximo step após validação do Step 1
  const handleStep1Next = async () => {
    if (!formData.name || !formData.email) {
      setError('Preencha todos os campos')
      return
    }

    await checkUserExists()
    setStep(2)
  }

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()
      const prices = calculatePrice()
      let userId: string

      // Verificar se já está autenticado
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        // Usuário já está logado, usar o ID dele
        userId = authUser.id
      } else if (userExists) {
        // Usuário existe mas não está logado - fazer login
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email)
          .single()

        if (!existingUser) {
          throw new Error('Usuário não encontrado')
        }

        userId = existingUser.id

        // Fazer login automático (silent auth)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (signInError) {
          throw new Error('Senha incorreta. Por favor, faça login em /login')
        }
      } else {
        // Novo usuário - criar conta
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Senha deve ter no mínimo 6 caracteres')
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (signUpError) throw signUpError

        if (!authData.user) {
          throw new Error('Erro ao criar usuário')
        }

        userId = authData.user.id

        // Criar perfil do usuário
        const { error: profileError } = await supabase.from('users').insert({
          id: userId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'PARTICIPANTE',
        })

        if (profileError) {
          console.log('Profile creation note:', profileError)
        }
      }

      // Criar reserva de espaço
      const bookingDate = new Date(formData.eventDate)

      const { data: booking, error: bookingError } = await supabase
        .from('space_bookings')
        .insert({
          user_id: userId,
          hours: formData.hours,
          booking_date: bookingDate.toISOString(),
          has_audiovisual: formData.hasAudiovisual,
          has_coverage: formData.hasCoverage,
          has_coffee_break: formData.hasCoffeeBreak,
          base_price: prices.basePrice,
          addons_price: prices.addonsPrice,
          discount_percentage: 0,
          total_price: prices.total,
          payment_status: 'PENDING',
          status: 'PENDING',
          notes: `Evento: ${formData.eventName}\nParticipantes esperados: ${formData.expectedAttendees}\n${formData.notes}`,
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Redirecionar para página de pagamento/checkout
      localStorage.setItem('booking_id', booking.id)
      router.push('/checkout-reserva?new_user=true')

    } catch (err: any) {
      console.error('Erro ao criar orçamento:', err)
      setError(err.message || 'Erro ao processar orçamento')
    } finally {
      setIsLoading(false)
    }
  }

  const prices = calculatePrice()

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl text-primary hover:text-glow transition-all">
            <span className="font-normal">Stage</span><span className="font-bold">One</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-4">
            Solicitar Orçamento
          </h1>
          <p className="text-placeholder mt-2">
            Preencha os dados e receba seu orçamento instantâneo
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-primary text-background' : 'bg-card text-placeholder'
            }`}>
              1
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">Dados Pessoais</span>
          </div>
          <div className="w-12 h-px bg-border" />
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-primary text-background' : 'bg-card text-placeholder'
            }`}>
              2
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">Detalhes do Evento</span>
          </div>
          <div className="w-12 h-px bg-border" />
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-primary text-background' : 'bg-card text-placeholder'
            }`}>
              3
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">Resumo</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Dados Pessoais */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Identificação</h2>
              <p className="text-placeholder -mt-4 mb-4">
                Informe seus dados para verificarmos se você já possui cadastro
              </p>

              <Input
                label="Nome Completo"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome completo"
                required
              />

              <Input
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setUserExists(false) // Reset ao mudar email
                }}
                placeholder="seu@email.com"
                required
              />

              {userExists && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-foreground">Email já cadastrado!</p>
                      <p className="text-placeholder mt-1">
                        Encontramos uma conta com este email. Você precisará informar sua senha no resumo final.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => router.push('/')}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleStep1Next}
                  className="flex-1"
                  disabled={!formData.name || !formData.email}
                  isLoading={isCheckingUser}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Dados do Evento */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Detalhes do Evento</h2>

              {/* Campos adicionais se for novo usuário */}
              {!userExists && (
                <>
                  <Input
                    label="Telefone/WhatsApp"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />

                  <Input
                    label="Criar Senha"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />

                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm text-foreground">
                    <strong>📝 Nova conta:</strong> Seus dados serão salvos para facilitar futuros orçamentos
                  </div>
                </>
              )}

              {userExists && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm text-foreground">
                  <strong>✓ Bem-vindo de volta!</strong> Vamos usar seus dados cadastrados
                </div>
              )}

              <Input
                label="Nome do Evento"
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                placeholder="Ex: Treinamento de Liderança 2025"
                required
              />

              <Input
                label="Data do Evento"
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Horas de Locação: {formData.hours}h
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) })}
                  className="w-full h-2 bg-card rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-placeholder mt-1">
                  <span>1h</span>
                  <span>12h</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Participantes Esperados: {formData.expectedAttendees}
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  step="2"
                  value={formData.expectedAttendees}
                  onChange={(e) => setFormData({ ...formData, expectedAttendees: parseInt(e.target.value) })}
                  className="w-full h-2 bg-card rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-placeholder mt-1">
                  <span>10</span>
                  <span>24</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Serviços Adicionais</label>

                <label className="flex items-center gap-3 glass rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasAudiovisual}
                    onChange={(e) => setFormData({ ...formData, hasAudiovisual: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">Equipamento Audiovisual</div>
                    <div className="text-sm text-placeholder">Projetor, som, microfones</div>
                  </div>
                  <div className="font-bold text-primary">R$ {AUDIOVISUAL_PRICE}</div>
                </label>

                <label className="flex items-center gap-3 glass rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasCoverage}
                    onChange={(e) => setFormData({ ...formData, hasCoverage: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">Cobertura Fotográfica</div>
                    <div className="text-sm text-placeholder">Fotógrafo profissional</div>
                  </div>
                  <div className="font-bold text-primary">R$ {COVERAGE_PRICE}</div>
                </label>

                <label className="flex items-center gap-3 glass rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasCoffeeBreak}
                    onChange={(e) => setFormData({ ...formData, hasCoffeeBreak: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">Coffee Break</div>
                    <div className="text-sm text-placeholder">R$ {COFFEE_BREAK_PRICE_PER_PERSON}/pessoa</div>
                  </div>
                  <div className="font-bold text-primary">
                    R$ {formData.hasCoffeeBreak ? COFFEE_BREAK_PRICE_PER_PERSON * formData.expectedAttendees : 0}
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre seu evento..."
                  rows={4}
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="secondary"
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1"
                  disabled={
                    !formData.eventName ||
                    !formData.eventDate ||
                    (!userExists && (!formData.phone || formData.password.length < 6))
                  }
                >
                  Ver Orçamento
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Resumo e Confirmação */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Resumo do Orçamento</h2>

              {/* Dados Pessoais */}
              <div className="glass rounded-xl p-4">
                <h3 className="font-bold text-foreground mb-3">Dados Pessoais</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-placeholder">Nome:</span>
                    <span className="text-foreground font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-placeholder">Email:</span>
                    <span className="text-foreground font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-placeholder">Telefone:</span>
                    <span className="text-foreground font-medium">{formData.phone}</span>
                  </div>
                </div>
              </div>

              {/* Dados do Evento */}
              <div className="glass rounded-xl p-4">
                <h3 className="font-bold text-foreground mb-3">Detalhes do Evento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-placeholder">Evento:</span>
                    <span className="text-foreground font-medium">{formData.eventName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-placeholder">Data:</span>
                    <span className="text-foreground font-medium">
                      {new Date(formData.eventDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-placeholder">Duração:</span>
                    <span className="text-foreground font-medium">{formData.hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-placeholder">Participantes:</span>
                    <span className="text-foreground font-medium">{formData.expectedAttendees}</span>
                  </div>
                </div>
              </div>

              {/* Campo de senha para usuários existentes (apenas se não estiver logado) */}
              {userExists && !isLoggedIn && (
                <div className="glass rounded-xl p-4 border-2 border-primary/30">
                  <h3 className="font-bold text-foreground mb-3">Confirmação de Acesso</h3>
                  <p className="text-sm text-placeholder mb-4">
                    Identificamos uma conta cadastrada. Confirme sua senha para continuar.
                  </p>

                  <div className="bg-card/50 rounded-lg p-3 mb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm">
                        <span className="text-placeholder">Nome:</span>{' '}
                        <span className="text-foreground font-medium">{formData.name}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">
                        <span className="text-placeholder">Email:</span>{' '}
                        <span className="text-foreground font-medium">{formData.email}</span>
                      </span>
                    </div>
                  </div>

                  <Input
                    label="Senha"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Digite sua senha"
                    required
                  />
                </div>
              )}

              {/* Usuário já está logado */}
              {isLoggedIn && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-foreground">Você já está logado!</p>
                      <p className="text-sm text-placeholder mt-1">
                        Seus dados foram carregados automaticamente. Basta confirmar o orçamento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Valores */}
              <div className="glass rounded-xl p-4 border-2 border-primary/30">
                <h3 className="font-bold text-foreground mb-4">Valores</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-placeholder">Locação do espaço ({formData.hours}h × R$ {PRICE_PER_HOUR})</span>
                    <span className="text-foreground font-medium">R$ {prices.basePrice.toFixed(2)}</span>
                  </div>

                  {formData.hasAudiovisual && (
                    <div className="flex justify-between text-sm">
                      <span className="text-placeholder">Equipamento Audiovisual</span>
                      <span className="text-foreground font-medium">R$ {AUDIOVISUAL_PRICE.toFixed(2)}</span>
                    </div>
                  )}

                  {formData.hasCoverage && (
                    <div className="flex justify-between text-sm">
                      <span className="text-placeholder">Cobertura Fotográfica</span>
                      <span className="text-foreground font-medium">R$ {COVERAGE_PRICE.toFixed(2)}</span>
                    </div>
                  )}

                  {formData.hasCoffeeBreak && (
                    <div className="flex justify-between text-sm">
                      <span className="text-placeholder">
                        Coffee Break ({formData.expectedAttendees} × R$ {COFFEE_BREAK_PRICE_PER_PERSON})
                      </span>
                      <span className="text-foreground font-medium">
                        R$ {(COFFEE_BREAK_PRICE_PER_PERSON * formData.expectedAttendees).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        R$ {prices.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm text-foreground">
                <strong>📋 Próximos passos:</strong>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  {!userExists && <li>Sua conta será criada automaticamente</li>}
                  {userExists && !isLoggedIn && <li>Faremos login com suas credenciais</li>}
                  {isLoggedIn && <li>Você já está autenticado no sistema</li>}
                  <li>A reserva será registrada no sistema</li>
                  <li>Você será redirecionado para o pagamento</li>
                  <li>Após confirmação, terá acesso ao painel</li>
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="secondary"
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  disabled={userExists && !isLoggedIn && !formData.password}
                  className="flex-1"
                >
                  Confirmar e Pagar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
