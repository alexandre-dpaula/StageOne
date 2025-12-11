'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Event, TicketType } from '@/types/database.types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function CheckoutPage({ params }: { params: { eventId: string; ticketTypeId: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [ticketType, setTicketType] = useState<TicketType | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const supabase = createClient()

      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Redirect to login with return URL
        router.push(`/login?redirect=/checkout/${params.eventId}/${params.ticketTypeId}`)
        return
      }

      const [{ data: eventData }, { data: ticketData }] = await Promise.all([
        supabase.from('events').select('*').eq('id', params.eventId).single(),
        supabase.from('tickets_types').select('*').eq('id', params.ticketTypeId).single(),
      ])

      setEvent(eventData)
      setTicketType(ticketData)

      // Pre-fill with user data
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (userData) {
        setFormData({
          buyer_name: userData.name || '',
          buyer_email: userData.email || '',
          buyer_phone: userData.phone || '',
        })
      }
    } catch (err) {
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const supabase = createClient()

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirect=/checkout/${params.eventId}/${params.ticketTypeId}`)
        return
      }

      // Call API to create ticket
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: params.eventId,
          ticket_type_id: params.ticketTypeId,
          ...formData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar ingresso')
      }

      // Redirect to ticket page
      router.push(`/meus-ingressos`)
    } catch (err: any) {
      setError(err.message || 'Erro ao processar compra')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  if (!event || !ticketType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Evento ou ingresso não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Finalizar Inscrição</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Seus Dados</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Nome completo"
                type="text"
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                required
              />

              <Input
                label="E-mail"
                type="email"
                value={formData.buyer_email}
                onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                required
              />

              <Input
                label="WhatsApp"
                type="tel"
                value={formData.buyer_phone}
                onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                placeholder="(00) 00000-0000"
                required
              />

              <Button type="submit" className="w-full" isLoading={submitting}>
                Confirmar Inscrição
              </Button>

              <p className="text-xs text-placeholder text-center mt-4">
                Ao confirmar, você concorda com os termos e condições
              </p>
            </form>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-lg p-6 h-fit sticky top-4">
            <h2 className="text-xl font-bold text-foreground mb-6">Resumo do Pedido</h2>

            <div className="space-y-4">
              <div>
                <p className="text-placeholder text-sm">Evento</p>
                <p className="text-foreground font-semibold">{event.title}</p>
              </div>

              <div>
                <p className="text-placeholder text-sm">Data</p>
                <p className="text-foreground">{formatDateTime(event.start_datetime)}</p>
              </div>

              <div>
                <p className="text-placeholder text-sm">Local</p>
                <p className="text-foreground">{event.location_name}</p>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-placeholder text-sm">Tipo de Ingresso</p>
                <p className="text-foreground font-semibold">{ticketType.name}</p>
                {ticketType.description && (
                  <p className="text-placeholder text-sm mt-1">{ticketType.description}</p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-foreground font-bold text-lg">Total</p>
                  <p className="text-primary font-bold text-2xl">{formatCurrency(ticketType.price)}</p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mt-4">
                <p className="text-yellow-500 text-sm">
                  <strong>Nota:</strong> Esta é uma demonstração. O pagamento real será integrado posteriormente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
