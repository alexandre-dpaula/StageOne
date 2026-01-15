'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface BookingData {
  id: string
  customer_name: string
  total_price: number
  payment_status: string
  payment_method: string
  external_payment_id: string
  ticket_type: {
    name: string
    event: {
      title: string
    }
  }
}

export default function PaymentStatusPage({
  params
}: {
  params: { bookingId: string }
}) {
  const router = useRouter()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pollCount, setPollCount] = useState(0)

  const checkPaymentStatus = useCallback(async () => {
    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*, ticket_type:tickets_types(name, event:events(title))')
        .eq('id', params.bookingId)
        .single()

      if (fetchError || !data) {
        setError('Reserva não encontrada')
        return
      }

      setBooking(data as unknown as BookingData)

      // Se pagamento confirmado, redirecionar
      if (data.payment_status === 'PAID') {
        setTimeout(() => {
          router.push('/meus-ingressos')
        }, 2000)
      }
    } catch (err) {
      console.error('Error checking status:', err)
    } finally {
      setLoading(false)
    }
  }, [params.bookingId, router])

  const syncPaymentStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments/stripe/sync-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: params.bookingId }),
      })

      const result = await response.json()

      if (response.ok && result.status === 'PAID') {
        // Refresh data
        await checkPaymentStatus()
      } else if (!response.ok) {
        setError(result.error || 'Erro ao verificar status')
      }
    } catch (err) {
      console.error('Error syncing payment:', err)
      setError('Erro ao verificar status do pagamento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkPaymentStatus()

    // Polling rápido nos primeiros 30 segundos (1s), depois mais lento (3s)
    let fastPollCount = 0

    // Primeiros 30 segundos: polling a cada 1 segundo
    const fastInterval = setInterval(() => {
      fastPollCount++
      if (fastPollCount >= 30) {
        clearInterval(fastInterval)
      } else {
        checkPaymentStatus()
      }
    }, 1000)

    // Depois de 30s, polling a cada 3 segundos por até 5 minutos
    const slowInterval = setInterval(() => {
      setPollCount(prev => {
        if (prev >= 100) { // 100 * 3s = 5 minutos
          clearInterval(slowInterval)
          return prev
        }
        if (fastPollCount >= 30) { // Só faz polling lento depois do rápido
          checkPaymentStatus()
        }
        return prev + 1
      })
    }, 3000)

    return () => {
      clearInterval(fastInterval)
      clearInterval(slowInterval)
    }
  }, [checkPaymentStatus])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Erro</h1>
          <p className="text-placeholder mb-6">{error || 'Reserva não encontrada'}</p>
          <Button onClick={() => router.push('/')} className="w-full">
            Voltar para Início
          </Button>
        </div>
      </div>
    )
  }

  // Status: PAID - Redirect automatically
  if (booking.payment_status === 'PAID') {
    // Redirect immediately
    router.push('/meus-ingressos')

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Pagamento Confirmado</h1>
          <p className="text-placeholder mb-2">Redirecionando para seus ingressos...</p>
        </div>
      </div>
    )
  }

  // Status: PENDING
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Aguardando Pagamento
          </h1>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-placeholder text-sm">Evento</p>
            <p className="text-foreground font-semibold">{booking.ticket_type.event.title}</p>
          </div>

          <div>
            <p className="text-placeholder text-sm">Ingresso</p>
            <p className="text-foreground">{booking.ticket_type.name}</p>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center">
              <p className="text-foreground font-bold">Total</p>
              <p className="text-primary font-bold text-xl">{formatCurrency(booking.total_price)}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-yellow-700 dark:text-yellow-300 font-semibold text-sm">
                Processando Pagamento
              </p>
              <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                Estamos aguardando a confirmação do pagamento. Você receberá um e-mail assim que for confirmado.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={syncPaymentStatus} variant="secondary" className="w-full" isLoading={loading}>
            Verificar Status
          </Button>
          <Button onClick={() => router.push('/meus-ingressos')} className="w-full">
            Ir para Meus Ingressos
          </Button>
        </div>
      </div>
    </div>
  )
}
