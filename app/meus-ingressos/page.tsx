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
              <span className="font-normal">Stage</span><span className="font-bold">One</span>
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
              <div key={ticket.id} className="bg-card rounded-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800 flex items-center justify-center">
                  <h3 className="text-foreground font-bold text-center px-4">{ticket.event.title}</h3>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-placeholder text-sm">Data</p>
                      <p className="text-foreground text-sm">{formatDateTime(ticket.event.start_datetime)}</p>
                    </div>

                    <div>
                      <p className="text-placeholder text-sm">Local</p>
                      <p className="text-foreground text-sm">{ticket.event.location_name}</p>
                    </div>

                    <div>
                      <p className="text-placeholder text-sm">Tipo de Ingresso</p>
                      <p className="text-foreground text-sm font-semibold">{ticket.ticket_type.name}</p>
                    </div>

                    <div>
                      <p className="text-placeholder text-sm">Status</p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          ticket.status === 'PAID'
                            ? 'bg-green-500/20 text-green-500'
                            : ticket.status === 'USED'
                            ? 'bg-blue-500/20 text-blue-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}
                      >
                        {ticket.status === 'PAID'
                          ? 'Pago'
                          : ticket.status === 'USED'
                          ? 'Utilizado'
                          : ticket.status}
                      </span>
                    </div>

                    {ticket.checked_in_at && (
                      <div>
                        <p className="text-placeholder text-sm">Check-in realizado</p>
                        <p className="text-green-500 text-sm">{formatDateTime(ticket.checked_in_at)}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => showTicketQR(ticket)}
                    className="btn-primary w-full"
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
