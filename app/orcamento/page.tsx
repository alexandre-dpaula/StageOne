'use client'

import { useState } from 'react'
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

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()
      const prices = calculatePrice()

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) throw signUpError

      if (!authData.user) {
        throw new Error('Erro ao criar usuário')
      }

      // 2. Criar perfil do usuário
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'PARTICIPANTE',
      })

      if (profileError) {
        // Se já existe, ignore o erro (pode ser re-signup)
        console.log('Profile creation note:', profileError)
      }

      // 3. Criar reserva de espaço
      const bookingDate = new Date(formData.eventDate)

      const { data: booking, error: bookingError } = await supabase
        .from('space_bookings')
        .insert({
          user_id: authData.user.id,
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

      // 4. Redirecionar para página de pagamento/checkout
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
          <Link href="/" className="text-3xl font-bold text-primary">
            StageOne
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
              <h2 className="text-2xl font-bold text-foreground mb-6">Seus Dados</h2>

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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                required
              />

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

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => router.push('/')}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  className="flex-1"
                  disabled={!formData.name || !formData.email || !formData.phone || formData.password.length < 6}
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
                  max="200"
                  step="10"
                  value={formData.expectedAttendees}
                  onChange={(e) => setFormData({ ...formData, expectedAttendees: parseInt(e.target.value) })}
                  className="w-full h-2 bg-card rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-placeholder mt-1">
                  <span>10</span>
                  <span>200</span>
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
                  disabled={!formData.eventName || !formData.eventDate}
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
                  <li>Sua conta será criada automaticamente</li>
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
