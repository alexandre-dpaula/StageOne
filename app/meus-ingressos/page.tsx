'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TicketWithEventAndType } from '@/types/database.types'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import QRCode from 'qrcode'
import Link from 'next/link'

export default function MeusIngressosPage() {
  const [tickets, setTickets] = useState<TicketWithEventAndType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<TicketWithEventAndType | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('tickets')
        .select(`
          *,
          event:events(*),
          ticket_type:tickets_types(*)
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false })

      setTickets(data || [])
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  async function showTicketQR(ticket: TicketWithEventAndType) {
    setSelectedTicket(ticket)

    // Generate QR Code with scan URL
    const scanUrl = `${window.location.origin}/scan?token=${ticket.qr_code_token}`
    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 300,
      margin: 2,
    })
    setQrCodeUrl(qrDataUrl)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl text-primary hover:text-glow transition-all">
              <span className="font-normal">Stage</span><span className="font-bold">One</span><sup className="text-[0.5em] top-[-0.3em] relative ml-0.5">™</sup>
            </Link>
            <Link href="/" className="text-placeholder hover:text-foreground">
              Voltar
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Meus Ingressos</h1>

        {tickets.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <p className="text-placeholder mb-4">Você ainda não possui ingressos</p>
            <Link
              href="/"
              className="btn-primary inline-block"
            >
              Ver Eventos Disponíveis
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-card rounded-xl overflow-hidden border border-border/30 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                {/* Cover Image */}
                <div className="relative h-56 bg-background/50 group overflow-hidden">
                  {ticket.event.cover_image ? (
                    <img
                      src={ticket.event.cover_image}
                      alt={ticket.event.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-background/80">
                      <svg
                        className="w-16 h-16 text-placeholder/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Gradient Overlay com hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-foreground text-sm line-clamp-2">{ticket.event.subtitle || ticket.event.description}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${
                        ticket.status === 'PAID'
                          ? 'bg-green-500/90 text-white'
                          : ticket.status === 'USED'
                          ? 'bg-blue-500/90 text-white'
                          : 'bg-yellow-500/90 text-white'
                      }`}
                    >
                      {ticket.status === 'PAID'
                        ? '✓ Pago'
                        : ticket.status === 'USED'
                        ? '✓ Utilizado'
                        : ticket.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Título do Evento */}
                  <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-2">{ticket.event.title}</h3>

                  {/* Informações em Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border/30">
                    <div>
                      <p className="text-placeholder text-xs mb-1 font-medium">📅 Data</p>
                      <p className="text-foreground text-sm font-semibold">{formatDateTime(ticket.event.start_datetime)}</p>
                    </div>

                    <div>
                      <p className="text-placeholder text-xs mb-1 font-medium">📍 Local</p>
                      <p className="text-foreground text-sm font-semibold truncate">{ticket.event.location_name}</p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-placeholder text-xs mb-1 font-medium">🎫 Tipo de Ingresso</p>
                      <p className="text-primary text-sm font-bold">{ticket.ticket_type.name}</p>
                    </div>

                    {ticket.checked_in_at && (
                      <div className="col-span-2">
                        <p className="text-placeholder text-xs mb-1 font-medium">✓ Check-in realizado</p>
                        <p className="text-green-500 text-sm font-semibold">{formatDateTime(ticket.checked_in_at)}</p>
                      </div>
                    )}
                  </div>

                  {/* Botão QR Code */}
                  <button
                    onClick={() => showTicketQR(ticket)}
                    className="w-full py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:shadow-glow hover:scale-105"
                    style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
                  >
                    Ver QR Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Seu Ingresso
            </h2>

            <div className="bg-gray-100 rounded-lg p-6 mb-4">
              <p className="text-gray-900 font-bold text-center mb-2">{selectedTicket.event.title}</p>
              <p className="text-gray-600 text-sm text-center mb-4">
                {selectedTicket.ticket_type.name}
              </p>

              <div className="flex justify-center mb-4">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                )}
              </div>

              <div className="space-y-2 text-center">
                <p className="text-gray-600 text-sm">
                  {formatDateTime(selectedTicket.event.start_datetime)}
                </p>
                <p className="text-gray-600 text-sm">{selectedTicket.event.location_name}</p>
                <p className="text-gray-900 font-semibold">{selectedTicket.buyer_name}</p>
              </div>

              {selectedTicket.checked_in_at && (
                <div className="mt-4 bg-green-100 border border-green-500 rounded-lg p-3">
                  <p className="text-green-700 text-sm text-center font-semibold">
                    ✓ Check-in realizado
                  </p>
                  <p className="text-green-600 text-xs text-center mt-1">
                    {formatDateTime(selectedTicket.checked_in_at)}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full bg-card hover:bg-card text-foreground py-3 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
