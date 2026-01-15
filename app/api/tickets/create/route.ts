import { createClient } from '@/lib/supabase/server'
import { generateQRToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import {
  sendTicketConfirmationEmail,
  generateQRCodeUrl,
  formatEventDate,
  formatEventTime,
  formatPrice,
} from '@/lib/email/send-ticket-email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { event_id, ticket_type_id, buyer_name, buyer_email, buyer_phone } = body

    // Validate required fields
    if (!event_id || !ticket_type_id || !buyer_name || !buyer_email) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Get event details
    const { data: event } = await supabase.from('events').select('*').eq('id', event_id).single()

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    // Check if ticket type still has availability
    const { data: ticketType } = await supabase
      .from('tickets_types')
      .select('*')
      .eq('id', ticket_type_id)
      .single()

    if (!ticketType) {
      return NextResponse.json({ error: 'Tipo de ingresso não encontrado' }, { status: 404 })
    }

    if (ticketType.sold_quantity >= ticketType.total_quantity) {
      return NextResponse.json({ error: 'Ingressos esgotados' }, { status: 400 })
    }

    // Create ticket with PAID status (simulating payment approval)
    // TODO: Integrate real payment gateway
    const qrToken = generateQRToken()

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        event_id,
        ticket_type_id,
        user_id: user.id,
        buyer_name,
        buyer_email,
        buyer_phone,
        qr_code_token: qrToken,
        status: 'PAID',
        purchased_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Update sold quantity
    await supabase
      .from('tickets_types')
      .update({ sold_quantity: ticketType.sold_quantity + 1 })
      .eq('id', ticket_type_id)

    // Send confirmation email
    try {
      await sendTicketConfirmationEmail({
        to: buyer_email,
        participantName: buyer_name,
        eventTitle: event.title,
        eventSubtitle: event.subtitle || '',
        eventDate: formatEventDate(event.start_datetime),
        eventTime: formatEventTime(event.start_datetime),
        locationName: event.location_name,
        locationAddress: event.address,
        ticketTypeName: ticketType.name,
        ticketPrice: formatPrice(ticketType.price),
        qrCodeUrl: generateQRCodeUrl(ticket.qr_code_token),
        ticketId: ticket.id,
      })
    } catch (emailError) {
      console.error('Erro ao enviar email, mas ticket foi criado:', emailError)
      // Não retornar erro pois o ticket foi criado com sucesso
    }

    // REMOVIDO: Auto-upgrade ao comprar ingresso
    // Nova lógica: Comprar ingresso NÃO promove para PALESTRANTE
    // Apenas CRIAR EVENTO promove para PALESTRANTE
    // Isso evita confusão: "Por que vejo 'Meus Eventos' se nunca criei nada?"

    // Get user FCM token for push notification
    const { data: userProfile } = await supabase
      .from('users')
      .select('fcm_token')
      .eq('id', user.id)
      .single()

    // Send push notification
    try {
      if (userProfile?.fcm_token) {
        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
          },
          body: JSON.stringify({
            to: userProfile.fcm_token,
            notification: {
              title: '🎉 Ingresso Confirmado!',
              body: `Seu ingresso para "${event.title}" foi confirmado com sucesso!`,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: 'ticket-notification',
              requireInteraction: true,
            },
            data: {
              ticketId: ticket.id,
              eventId: event.id,
              url: '/meus-ingressos',
            },
          }),
        })
      }
    } catch (notificationError) {
      console.error('Erro ao enviar notificação push, mas ticket foi criado:', notificationError)
      // Não retornar erro pois o ticket foi criado com sucesso
    }

    return NextResponse.json({ success: true, ticket }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar ingresso' },
      { status: 500 }
    )
  }
}
