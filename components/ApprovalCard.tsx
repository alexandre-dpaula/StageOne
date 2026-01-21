'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ApprovalCardProps {
  event: any
}

export default function ApprovalCard({ event }: ApprovalCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleApprove = async () => {
    if (!confirm('Deseja aprovar este evento? Ele será publicado imediatamente.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/events/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          action: 'approve',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao aprovar evento')
      }

      alert('Evento aprovado e publicado com sucesso!')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Erro ao aprovar evento')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Por favor, informe o motivo da rejeição')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/events/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          action: 'reject',
          rejectionReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao rejeitar evento')
      }

      alert('Evento rejeitado. O criador será notificado.')
      setShowRejectModal(false)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Erro ao rejeitar evento')
    } finally {
      setLoading(false)
    }
  }

  const totalCost = Number(event.total_service_cost || 0)
  const platformFee = event.platform_fee_percentage || 3

  return (
    <>
      <div className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/50 transition-all">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Event Image */}
          {event.cover_image && (
            <div className="lg:w-64 flex-shrink-0">
              <img
                src={event.cover_image}
                alt={event.title}
                className="w-full h-48 lg:h-full object-cover rounded-lg"
              />
            </div>
          )}

          {/* Event Details */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold text-foreground">{event.title}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/30">
                  PENDENTE
                </span>
              </div>
              <p className="text-placeholder text-sm">{event.subtitle}</p>
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="text-foreground font-semibold">{event.creator?.name || 'Criador Desconhecido'}</p>
                <p className="text-xs text-placeholder">{event.creator?.email}</p>
              </div>
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-placeholder mb-1">Data</p>
                <p className="text-sm font-semibold text-foreground">
                  {format(new Date(event.start_datetime), "dd 'de' MMM", { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-xs text-placeholder mb-1">Horário</p>
                <p className="text-sm font-semibold text-foreground">
                  {format(new Date(event.start_datetime), 'HH:mm', { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-xs text-placeholder mb-1">Duração</p>
                <p className="text-sm font-semibold text-foreground">
                  {event.event_duration_hours || 0}h
                </p>
              </div>
              <div>
                <p className="text-xs text-placeholder mb-1">Categoria</p>
                <p className="text-sm font-semibold text-foreground">{event.category}</p>
              </div>
            </div>

            {/* Financial Info */}
            <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
              <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Custos do Evento
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-placeholder mb-1">Sala</p>
                  <p className="font-semibold text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      Number(event.room_price || 0)
                    )}
                  </p>
                </div>
                {event.has_audiovisual && (
                  <div>
                    <p className="text-placeholder mb-1">Audiovisual</p>
                    <p className="font-semibold text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        Number(event.audiovisual_price || 0)
                      )}
                    </p>
                  </div>
                )}
                {event.has_coffee_break && (
                  <div>
                    <p className="text-placeholder mb-1">Coffee Break</p>
                    <p className="font-semibold text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        Number(event.coffee_break_price || 0)
                      )}
                    </p>
                  </div>
                )}
                {event.has_coverage && (
                  <div>
                    <p className="text-placeholder mb-1">Cobertura</p>
                    <p className="font-semibold text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        Number(event.coverage_price || 0)
                      )}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                <span className="text-foreground font-bold">Total</span>
                <span className="text-primary font-bold text-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost)}
                </span>
              </div>
              <p className="text-xs text-placeholder mt-2">
                + Taxa da plataforma: {platformFee}% sobre vendas
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {loading ? 'Processando...' : 'Aprovar Evento'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full border border-border/30">
            <h3 className="text-xl font-bold text-foreground mb-4">Rejeitar Evento</h3>
            <p className="text-placeholder text-sm mb-4">
              Informe o motivo da rejeição. O criador receberá esta mensagem.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              rows={4}
              placeholder="Ex: O evento não atende aos requisitos de qualidade da plataforma..."
              disabled={loading}
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                disabled={loading}
                className="px-6 py-3 bg-background hover:bg-card text-foreground rounded-lg font-bold transition-all border border-border"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
