'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Event, TicketType } from '@/types/database.types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import SessionSelector from '@/components/SessionSelector'
import { Check } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type CheckoutStep = 'info' | 'payment' | 'processing'

function PaymentForm({
  clientSecret,
  onSuccess
}: {
  clientSecret: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setProcessing(true)
    setError('')

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'Erro ao processar pagamento')
      setProcessing(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pagamento/confirmacao`,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message || 'Erro ao confirmar pagamento')
      setProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <PaymentElement />

      <Button
        type="submit"
        className="w-full"
        isLoading={processing}
        disabled={!stripe || processing}
      >
        {processing ? 'Processando...' : 'Finalizar Compra'}
      </Button>

      <p className="text-xs text-placeholder text-center">
        Pagamento 100% seguro processado via Stripe
      </p>
    </form>
  )
}

export default function CheckoutV2Page({
  params
}: {
  params: { eventId: string; ticketTypeId: string }
}) {
  const router = useRouter()
  const [step, setStep] = useState<CheckoutStep>('info')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [event, setEvent] = useState<Event | null>(null)
  const [ticketType, setTicketType] = useState<TicketType | null>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [bookingId, setBookingId] = useState('')

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_cpf: '',
    customer_phone: '',
  })
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirect=/checkout-v2/${params.eventId}/${params.ticketTypeId}`)
        return
      }

      const [{ data: eventData }, { data: ticketData }, { data: userData }] = await Promise.all([
        supabase.from('events').select('*').eq('id', params.eventId).single(),
        supabase.from('tickets_types').select('*').eq('id', params.ticketTypeId).single(),
        supabase.from('users').select('*').eq('id', user.id).single(),
      ])

      if (!eventData || !ticketData) {
        setError('Evento ou ingresso não encontrado')
        setLoading(false)
        return
      }

      setEvent(eventData)
      setTicketType(ticketData)

      if (userData) {
        setFormData({
          customer_name: userData.name || '',
          customer_email: userData.email || '',
          customer_cpf: userData.cpf || '',
          customer_phone: userData.phone || '',
        })
      }
    } catch (err) {
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate session selection if event has sessions enabled
    if (event?.enable_sessions && !selectedSessionId) {
      setError('Por favor, selecione uma sessão')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/login?redirect=/checkout-v2/${params.eventId}/${params.ticketTypeId}`)
        return
      }

      // Gerar idempotency key baseado no user + ticket
      const idempotencyKey = `${user.id}-${params.ticketTypeId}-${Date.now()}`

      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          ticket_type_id: params.ticketTypeId,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_cpf: formData.customer_cpf,
          customer_phone: formData.customer_phone,
          payment_method: 'CARD', // Stripe decide automaticamente
          quantity: 1,
          sessionId: selectedSessionId, // Include selected session
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento')
      }

      setClientSecret(result.clientSecret)
      setBookingId(result.bookingId)
      setStep('payment')
    } catch (err: any) {
      setError(err.message || 'Erro ao processar compra')
    } finally {
      setLoading(false)
    }
  }

  function handlePaymentSuccess() {
    setStep('processing')
    // Redirecionar para página de status
    setTimeout(() => {
      router.push(`/pagamento/status/${bookingId}`)
    }, 1500)
  }

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Button onClick={() => router.push('/')}>Voltar para Início</Button>
        </div>
      </div>
    )
  }

  if (!event || !ticketType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Evento não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'info' ? 'text-primary' : step === 'payment' || step === 'processing' ? 'text-green-500' : 'text-placeholder'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'info' ? 'border-primary bg-primary/10' : step === 'payment' || step === 'processing' ? 'border-green-500 bg-green-500/10' : 'border-border'}`}>
                {step === 'payment' || step === 'processing' ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Seus Dados</span>
            </div>

            <div className="w-12 h-0.5 bg-border"></div>

            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : step === 'processing' ? 'text-green-500' : 'text-placeholder'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'payment' ? 'border-primary bg-primary/10' : step === 'processing' ? 'border-green-500 bg-green-500/10' : 'border-border'}`}>
                {step === 'processing' ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Pagamento</span>
            </div>

            <div className="w-12 h-0.5 bg-border"></div>

            <div className={`flex items-center gap-2 ${step === 'processing' ? 'text-primary' : 'text-placeholder'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'processing' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                3
              </div>
              <span className="text-sm font-medium">Confirmação</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg p-6">
              {step === 'info' && (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Seus Dados</h2>

                  <form onSubmit={handleContinueToPayment} className="space-y-6">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    {/* Session Selector - Only show if event has sessions enabled */}
                    {event.enable_sessions && (
                      <div className="pb-6 border-b border-border">
                        <SessionSelector
                          eventId={params.eventId}
                          onSelectSession={setSelectedSessionId}
                          selectedSessionId={selectedSessionId}
                        />
                      </div>
                    )}

                    <Input
                      label="Nome completo"
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                    />

                    <Input
                      label="E-mail"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      required
                    />

                    <Input
                      label="CPF"
                      type="text"
                      value={formData.customer_cpf}
                      onChange={(e) => setFormData({ ...formData, customer_cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      required
                    />

                    <Input
                      label="WhatsApp"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                    />

                    <Button type="submit" className="w-full" isLoading={loading}>
                      Continuar para Pagamento
                    </Button>
                  </form>
                </>
              )}

              {step === 'payment' && clientSecret && (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Pagamento</h2>

                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#3b82f6',
                          colorBackground: '#ffffff',
                          colorText: '#1f2937',
                          colorDanger: '#ef4444',
                          fontFamily: 'system-ui, sans-serif',
                          spacingUnit: '4px',
                          borderRadius: '8px',
                        },
                      },
                      locale: 'pt-BR',
                    }}
                  >
                    <PaymentForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
                  </Elements>

                  <button
                    onClick={() => setStep('info')}
                    className="text-sm text-placeholder hover:text-foreground mt-4"
                  >
                    ← Voltar para dados
                  </button>
                </>
              )}

              {step === 'processing' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Processando Pagamento</h2>
                  <p className="text-placeholder">Aguarde enquanto confirmamos seu pagamento</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-bold text-foreground mb-4">Resumo do Pedido</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-placeholder text-sm">Evento</p>
                  <p className="text-foreground font-semibold">{event.title}</p>
                </div>

                <div>
                  <p className="text-placeholder text-sm">Data</p>
                  <p className="text-foreground">{formatDateTime(event.start_datetime)}</p>
                </div>

                <div>
                  <p className="text-placeholder text-sm">Local</p>
                  <p className="text-foreground">{event.location_name}</p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-placeholder text-sm">Ingresso</p>
                  <p className="text-foreground font-semibold">{ticketType.name}</p>
                  {ticketType.description && (
                    <p className="text-placeholder text-sm mt-1">{ticketType.description}</p>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-foreground">Subtotal</p>
                    <p className="text-foreground">{formatCurrency(ticketType.price)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-foreground font-bold text-lg">Total</p>
                    <p className="text-primary font-bold text-2xl">{formatCurrency(ticketType.price)}</p>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="text-foreground font-semibold text-sm">Pagamento Seguro</p>
                      <p className="text-placeholder text-xs mt-1">
                        Seus dados são protegidos com criptografia de ponta
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
