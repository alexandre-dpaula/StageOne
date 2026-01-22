'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

function PaymentConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!bookingId) {
      setStatus('error')
      setMessage('ID da reserva não encontrado')
      return
    }

    checkPaymentStatus()
  }, [bookingId])

  async function checkPaymentStatus() {
    try {
      const supabase = createClient()

      const { data: booking, error } = await supabase
        .from('bookings')
        .select('payment_status')
        .eq('id', bookingId)
        .single()

      if (error || !booking) {
        setStatus('error')
        setMessage('Reserva não encontrada')
        return
      }

      if (booking.payment_status === 'PAID') {
        setStatus('success')
        setMessage('Pagamento confirmado com sucesso!')
      } else {
        setStatus('error')
        setMessage('Aguardando confirmação do pagamento...')
      }
    } catch (err) {
      setStatus('error')
      setMessage('Erro ao verificar status do pagamento')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="mb-4 flex justify-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verificando Pagamento</h1>
            <p className="text-placeholder">Aguarde um momento...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Pagamento Confirmado!</h1>
            <p className="text-placeholder mb-6">{message}</p>
            <p className="text-sm text-placeholder mb-6">
              Um e-mail de confirmação foi enviado com todos os detalhes do seu ingresso.
            </p>
            <Button onClick={() => router.push('/meus-ingressos')} className="w-full">
              Ver Meus Ingressos
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4 flex justify-center">
              <AlertCircle className="w-20 h-20 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Atenção</h1>
            <p className="text-placeholder mb-6">{message}</p>
            <div className="space-y-3">
              <Button onClick={() => checkPaymentStatus()} variant="secondary" className="w-full">
                Verificar Novamente
              </Button>
              <Button onClick={() => router.push('/meus-ingressos')} className="w-full">
                Ir para Meus Ingressos
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card rounded-lg p-8 text-center">
          <div className="mb-4 flex justify-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Carregando...</h1>
          <p className="text-placeholder">Aguarde um momento...</p>
        </div>
      </div>
    }>
      <PaymentConfirmationContent />
    </Suspense>
  )
}
