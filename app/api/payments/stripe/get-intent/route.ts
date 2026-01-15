import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing payment_intent_id' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
    })
  } catch (error: any) {
    console.error('Error retrieving payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar pagamento' },
      { status: 500 }
    )
  }
}
