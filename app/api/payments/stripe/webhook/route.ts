import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set - skipping signature verification')
      event = JSON.parse(body)
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    }
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    // Check if event was already processed (idempotency)
    const { data: existingEvent } = await supabase
      .from('stripe_webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single()

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true, skipped: true })
    }

    // Record event as being processed
    const { error: insertError } = await supabase
      .from('stripe_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
      })

    if (insertError) {
      console.error('Error recording webhook event:', insertError)
      // Continue processing even if insert fails
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.booking_id

        if (!bookingId) {
          console.error('No booking_id in payment intent metadata')
          break
        }

        // Update booking to paid
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            payment_status: 'PAID',
            paid_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        if (updateError) {
          console.error('Error updating booking:', updateError)
          break
        }

        // Get booking details for email
        const { data: booking } = await supabase
          .from('bookings')
          .select('*, ticket_type:tickets_types(*, event:events(*))')
          .eq('id', bookingId)
          .single()

        if (booking) {
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
        }

        console.log(`Payment succeeded for booking ${bookingId}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.booking_id

        if (!bookingId) {
          console.error('No booking_id in payment intent metadata')
          break
        }

        // Update booking to failed
        await supabase
          .from('bookings')
          .update({
            payment_status: 'FAILED',
          })
          .eq('id', bookingId)

        console.log(`Payment failed for booking ${bookingId}`)
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.booking_id

        if (!bookingId) {
          console.error('No booking_id in payment intent metadata')
          break
        }

        // Update booking to canceled
        await supabase
          .from('bookings')
          .update({
            payment_status: 'CANCELED',
          })
          .eq('id', bookingId)

        console.log(`Payment canceled for booking ${bookingId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
