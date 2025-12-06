import { generateTicketConfirmationEmail } from './templates/ticket-confirmation'

interface SendTicketEmailParams {
  to: string
  participantName: string
  eventTitle: string
  eventSubtitle: string
  eventDate: string
  eventTime: string
  locationName: string
  locationAddress: string
  ticketTypeName: string
  ticketPrice: string
  qrCodeUrl: string
  ticketId: string
}

/**
 * Envia email de confirmação de ingresso para o participante
 *
 * IMPORTANTE: Configure as variáveis de ambiente:
 * - RESEND_API_KEY (para Resend)
 * ou
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (para SMTP genérico)
 */
export async function sendTicketConfirmationEmail(params: SendTicketEmailParams): Promise<boolean> {
  try {
    const htmlContent = generateTicketConfirmationEmail(params)

    // OPÇÃO 1: Usando Resend (Recomendado)
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'StageOne <noreply@stageone.com>',
          to: params.to,
          subject: `Confirmação de Inscrição - ${params.eventTitle}`,
          html: htmlContent,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Erro ao enviar email via Resend:', error)
        return false
      }

      console.log(`Email enviado com sucesso para ${params.to}`)
      return true
    }

    // OPÇÃO 2: Usando Nodemailer (SMTP genérico)
    // Descomente abaixo se preferir usar SMTP tradicional
    /*
    const nodemailer = require('nodemailer')

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: '"StageOne" <noreply@stageone.com>',
      to: params.to,
      subject: `Confirmação de Inscrição - ${params.eventTitle}`,
      html: htmlContent,
    })

    console.log(`Email enviado com sucesso para ${params.to}`)
    return true
    */

    // MODO DESENVOLVIMENTO: Apenas loga o email
    console.log('='.repeat(80))
    console.log('📧 EMAIL DE CONFIRMAÇÃO (MODO DESENVOLVIMENTO)')
    console.log('='.repeat(80))
    console.log(`Para: ${params.to}`)
    console.log(`Assunto: Confirmação de Inscrição - ${params.eventTitle}`)
    console.log(`Evento: ${params.eventTitle}`)
    console.log(`Participante: ${params.participantName}`)
    console.log(`Ticket ID: ${params.ticketId}`)
    console.log(`QR Code: ${params.qrCodeUrl}`)
    console.log('='.repeat(80))
    console.log('NOTA: Configure RESEND_API_KEY para enviar emails reais')
    console.log('='.repeat(80))

    return true
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error)
    return false
  }
}

/**
 * Gera URL do QR Code usando API gratuita
 */
export function generateQRCodeUrl(ticketId: string): string {
  // Usando API do QR Server (gratuito)
  const qrData = encodeURIComponent(`https://stageone.com/scan?token=${ticketId}`)
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}&bgcolor=ffffff&color=0A0B0D&qzone=2`
}

/**
 * Formata data para exibição em português
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Formata hora para exibição
 */
export function formatEventTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Formata preço para real brasileiro
 */
export function formatPrice(price: number): string {
  if (price === 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}
