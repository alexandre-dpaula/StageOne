import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import {
  sendTicketConfirmationEmail,
  generateQRCodeUrl,
  formatEventDate,
  formatEventTime,
  formatPrice,
} from '@/lib/email/send-ticket-email'

/**
 * API para reenviar emails de confirmação para tickets existentes
 * POST /api/resend-emails
 */
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

    // Buscar todos os tickets pagos com informações do evento e tipo
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        *,
        events (*),
        tickets_types (*)
      `)
      .eq('status', 'PAID')

    if (ticketsError) throw ticketsError

    if (!tickets || tickets.length === 0) {
      return NextResponse.json(
        { message: 'Nenhum ticket encontrado para reenviar emails' },
        { status: 200 }
      )
    }

    const results = {
      total: tickets.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Reenviar email para cada ticket
    for (const ticket of tickets) {
      try {
        const event = ticket.events
        const ticketType = ticket.tickets_types

        if (!event || !ticketType) {
          results.failed++
          results.errors.push(`Ticket ${ticket.id}: Evento ou tipo de ingresso não encontrado`)
          continue
        }

        await sendTicketConfirmationEmail({
          to: ticket.buyer_email,
          participantName: ticket.buyer_name,
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

        results.sent++
        console.log(`✅ Email reenviado para: ${ticket.buyer_email} (Ticket: ${ticket.id})`)
      } catch (emailError: any) {
        results.failed++
        results.errors.push(`Ticket ${ticket.id}: ${emailError.message}`)
        console.error(`❌ Erro ao enviar email para ${ticket.buyer_email}:`, emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processo concluído: ${results.sent} enviados, ${results.failed} falharam`,
      results,
    })
  } catch (error: any) {
    console.error('Erro ao reenviar emails:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao reenviar emails' },
      { status: 500 }
    )
  }
}
