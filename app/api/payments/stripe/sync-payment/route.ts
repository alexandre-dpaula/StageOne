import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId é obrigatório' }, { status: 400 })
    }

    // Get booking from database
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', user.id) // Security: only user's own bookings
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 })
    }

    // Check if already paid
    if (booking.payment_status === 'PAID') {
      return NextResponse.json({
        status: 'PAID',
        message: 'Pagamento já confirmado'
      })
    }

    // Get payment intent from Stripe
    if (!booking.external_payment_id) {
      return NextResponse.json({
        error: 'ID de pagamento não encontrado',
        status: booking.payment_status
      }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(booking.external_payment_id)

    // Update booking based on Stripe status
    let newStatus = booking.payment_status

    if (paymentIntent.status === 'succeeded') {
      newStatus = 'PAID'

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'PAID',
          paid_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (updateError) {
        console.error('Error updating booking:', updateError)
        return NextResponse.json({ error: 'Erro ao atualizar reserva' }, { status: 500 })
      }

      // Send confirmation email
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-ticket`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        })
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
      }

    } else if ((paymentIntent as any).status === 'canceled' || (paymentIntent as any).status === 'payment_failed') {
      newStatus = 'FAILED'
      await supabase
        .from('bookings')
        .update({ payment_status: 'FAILED' })
        .eq('id', bookingId)
    }

    return NextResponse.json({
      status: newStatus,
      stripeStatus: paymentIntent.status,
      message: newStatus === 'PAID' ? 'Pagamento confirmado!' : 'Status atualizado'
    })

  } catch (error: any) {
    console.error('Sync payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar pagamento' },
      { status: 500 }
    )
  }
}
