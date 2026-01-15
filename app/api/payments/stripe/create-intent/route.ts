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

    // Get idempotency key from header
    const idempotencyKey = request.headers.get('Idempotency-Key') || `${user.id}-${Date.now()}`

    const body = await request.json()
    const {
      ticket_type_id,
      customer_name,
      customer_email,
      customer_cpf,
      customer_phone,
      payment_method,
      quantity = 1,
    } = body

    // Validate required fields
    if (!ticket_type_id || !customer_name || !customer_email || !customer_cpf || !payment_method) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Get ticket type info
    const { data: ticketType, error: ticketError } = await supabase
      .from('tickets_types')
      .select('*, event:events(*)')
      .eq('id', ticket_type_id)
      .single()

    if (ticketError || !ticketType) {
      return NextResponse.json({ error: 'Tipo de ingresso não encontrado' }, { status: 404 })
    }

    const totalPrice = ticketType.price * quantity

    // Create booking in database
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        ticket_type_id,
        customer_name,
        customer_email,
        customer_cpf,
        customer_phone,
        quantity,
        total_price: totalPrice,
        payment_method,
        payment_status: 'PENDING',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json({ error: 'Erro ao criar reserva' }, { status: 500 })
    }

    // Create Stripe Payment Intent
    // Let Stripe automatically determine available payment methods based on currency and amount
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'brl',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: booking.id,
        ticket_type_id,
        event_id: ticketType.event_id,
        user_id: user.id,
        payment_method_preference: payment_method, // Store preference but don't restrict
      },
      description: `${ticketType.event.title} - ${ticketType.name}`,
      receipt_email: customer_email,
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams, {
      idempotencyKey, // Use idempotency key to prevent duplicate charges
    })

    console.log('Payment Intent created:', paymentIntent.id)
    console.log('Updating booking:', booking.id, 'with payment intent:', paymentIntent.id)

    // Update booking with Stripe payment intent ID - try multiple times if needed
    let updateAttempts = 0
    let updateSuccess = false

    while (updateAttempts < 3 && !updateSuccess) {
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({ external_payment_id: paymentIntent.id })
        .eq('id', booking.id)
        .select()
        .single()

      if (!updateError && updatedBooking) {
        console.log('Successfully updated booking with payment intent')
        updateSuccess = true
        break
      }

      console.error(`Update attempt ${updateAttempts + 1} failed:`, updateError)
      updateAttempts++

      // Wait a bit before retry
      if (updateAttempts < 3) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    if (!updateSuccess) {
      console.error('Failed to update booking after 3 attempts')
      // Don't fail the request, payment intent was created successfully
      // The client secret can still be used
    }

    return NextResponse.json({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })

  } catch (error: any) {
    console.error('Stripe payment intent error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar pagamento' },
      { status: 500 }
    )
  }
}
