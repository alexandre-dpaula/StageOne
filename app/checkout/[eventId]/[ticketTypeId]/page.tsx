'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Event, TicketType } from '@/types/database.types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { CreditCard } from 'lucide-react'

type PaymentMethod = 'PIX' | 'CREDIT_CARD'

export default function CheckoutPage({ params }: { params: { eventId: string; ticketTypeId: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [ticketType, setTicketType] = useState<TicketType | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX')

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_cpf: '',
    customer_phone: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const supabase = createClient()

      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Redirect to login with return URL
        router.push(`/login?redirect=/checkout/${params.eventId}/${params.ticketTypeId}`)
        return
      }

      const [{ data: eventData }, { data: ticketData }] = await Promise.all([
        supabase.from('events').select('*').eq('id', params.eventId).single(),
        supabase.from('tickets_types').select('*').eq('id', params.ticketTypeId).single(),
      ])

      setEvent(eventData)
      setTicketType(ticketData)

      // Pre-fill with user data
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const supabase = createClient()

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirect=/checkout/${params.eventId}/${params.ticketTypeId}`)
        return
      }

      if (!ticketType || !event) {
        throw new Error('Dados do evento não encontrados')
      }

      // Create payment intent for both PIX and Credit Card
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_type_id: params.ticketTypeId,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_cpf: formData.customer_cpf,
          customer_phone: formData.customer_phone,
          payment_method: paymentMethod,
          quantity: 1,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento')
      }

      // Store payment data in sessionStorage
      sessionStorage.setItem('payment_data', JSON.stringify({
        bookingId: result.bookingId,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      }))

      // Redirect to payment page
      router.push(`/pagamento/${result.bookingId}`)
    } catch (err: any) {
      setError(err.message || 'Erro ao processar compra')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  if (!event || !ticketType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Evento ou ingresso não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Finalizar Inscrição</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Seus Dados</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
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

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`border-2 rounded-lg p-4 text-center transition-all ${
                      paymentMethod === 'PIX'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">🔵</div>
                    <div className="font-semibold text-foreground">PIX</div>
                    <div className="text-xs text-placeholder mt-1">Aprovação instantânea</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`border-2 rounded-lg p-4 text-center transition-all ${
                      paymentMethod === 'CREDIT_CARD'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="mb-2">
                      <CreditCard className="w-8 h-8 mx-auto text-primary" />
                    </div>
                    <div className="font-semibold text-foreground">Cartão</div>
                    <div className="text-xs text-placeholder mt-1">Crédito ou débito</div>
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={submitting}>
                {paymentMethod === 'PIX' ? 'Gerar PIX' : 'Ir para Pagamento'}
              </Button>

              <p className="text-xs text-placeholder text-center mt-4">
                Pagamento 100% seguro via Stripe
              </p>
            </form>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-lg p-6 h-fit sticky top-4">
            <h2 className="text-xl font-bold text-foreground mb-6">Resumo do Pedido</h2>

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
                <p className="text-placeholder text-sm">Tipo de Ingresso</p>
                <p className="text-foreground font-semibold">{ticketType.name}</p>
                {ticketType.description && (
                  <p className="text-placeholder text-sm mt-1">{ticketType.description}</p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-foreground font-bold text-lg">Total</p>
                  <p className="text-primary font-bold text-2xl">{formatCurrency(ticketType.price)}</p>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg">🔒</span>
                  <div>
                    <p className="text-foreground font-semibold text-sm">Pagamento Seguro</p>
                    <p className="text-placeholder text-xs mt-1">
                      Processado via Stripe - Gateway de pagamento certificado
                    </p>
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
