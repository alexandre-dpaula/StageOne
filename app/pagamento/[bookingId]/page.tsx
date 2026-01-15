'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BookingData {
  id: string
  customer_name: string
  customer_email: string
  total_price: number
  payment_status: string
  payment_method: string
  ticket_type: {
    name: string
    event: {
      title: string
    }
  }
}

function CheckoutForm({ bookingId, booking }: { bookingId: string; booking: BookingData }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError('')

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'Erro ao processar pagamento')
      setProcessing(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pagamento/confirmacao?booking_id=${bookingId}`,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message || 'Erro ao confirmar pagamento')
      setProcessing(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setSucceeded(true)
      setTimeout(() => {
        router.push('/meus-ingressos')
      }, 2000)
    }
  }

  if (succeeded) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Pagamento Confirmado!</h2>
        <p className="text-placeholder">Redirecionando para seus ingressos...</p>
      </div>
    )
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
        {processing ? 'Processando...' : `Pagar ${formatCurrency(booking.total_price)}`}
      </Button>

      <p className="text-xs text-placeholder text-center">
        Pagamento 100% seguro via Stripe
      </p>
    </form>
  )
}

export default function PaymentPage({ params }: { params: { bookingId: string } }) {
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadPaymentData()
  }, [])

  async function loadPaymentData() {
    try {
      const supabase = createClient()

      // Check sessionStorage first for fresh payment data
      const paymentDataStr = sessionStorage.getItem('payment_data')
      if (paymentDataStr) {
        try {
          const paymentData = JSON.parse(paymentDataStr)
          if (paymentData.bookingId === params.bookingId && paymentData.clientSecret) {
            console.log('Using client secret from sessionStorage')
            setClientSecret(paymentData.clientSecret)
            // Clear it so it's only used once
            sessionStorage.removeItem('payment_data')
          }
        } catch (e) {
          console.error('Error parsing payment data from sessionStorage:', e)
        }
      }

      // Get booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*, ticket_type:tickets_types(name, event:events(title))')
        .eq('id', params.bookingId)
        .single()

      console.log('Booking data:', bookingData)
      console.log('Booking error:', bookingError)

      if (bookingError || !bookingData) {
        setError('Reserva não encontrada')
        setLoading(false)
        return
      }

      setBooking(bookingData as unknown as BookingData)

      // Check if already paid
      if (bookingData.payment_status === 'PAID') {
        router.push('/meus-ingressos')
        return
      }

      // If we don't have client secret from sessionStorage, try to get from payment intent
      if (!clientSecret && bookingData.external_payment_id) {
        console.log('Fetching payment intent from API:', bookingData.external_payment_id)
        const response = await fetch(
          `/api/payments/stripe/get-intent?payment_intent_id=${bookingData.external_payment_id}`
        )

        const paymentIntent = await response.json()
        console.log('Payment intent response:', paymentIntent)

        if (paymentIntent.client_secret) {
          console.log('Client secret found:', paymentIntent.client_secret.substring(0, 20) + '...')
          setClientSecret(paymentIntent.client_secret)
        } else {
          console.error('No client secret in response')
          setError('Erro ao carregar dados de pagamento: ' + (paymentIntent.error || 'sem client_secret'))
        }
      } else if (!clientSecret && !bookingData.external_payment_id) {
        console.error('No external_payment_id found and no sessionStorage data')
        setError('ID de pagamento não encontrado')
      }
    } catch (err: any) {
      console.error('Load payment data error:', err)
      setError(err.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Erro ao carregar pagamento'}</div>
          <Button onClick={() => router.push('/')}>Voltar para Início</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Pagamento</h1>

          <div className="space-y-3 mb-6">
            <div>
              <p className="text-placeholder text-sm">Evento</p>
              <p className="text-foreground font-semibold">{booking.ticket_type.event.title}</p>
            </div>

            <div>
              <p className="text-placeholder text-sm">Ingresso</p>
              <p className="text-foreground">{booking.ticket_type.name}</p>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center">
                <p className="text-foreground font-bold">Total</p>
                <p className="text-primary font-bold text-2xl">{formatCurrency(booking.total_price)}</p>
              </div>
            </div>
          </div>

          {clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#3b82f6',
                  },
                },
                locale: 'pt-BR',
              }}
            >
              <CheckoutForm bookingId={params.bookingId} booking={booking} />
            </Elements>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg text-sm">
              Carregando formulário de pagamento... Se essa mensagem persistir, verifique o console para erros.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
