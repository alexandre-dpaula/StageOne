'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Event, TicketWithDetails } from '@/types/database.types'
import { formatDateTime } from '@/lib/utils'
import { Html5Qrcode } from 'html5-qrcode'

export default function CheckinPage({ params }: { params: { eventId: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [result, setResult] = useState<{
    success: boolean
    message: string
    ticket?: TicketWithDetails
    alreadyCheckedIn?: boolean
  } | null>(null)

  let html5QrCode: Html5Qrcode | null = null

  useEffect(() => {
    checkPermissionAndLoadEvent()

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
      }
    }
  }, [])

  async function checkPermissionAndLoadEvent() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()

      if (!userData || !['ADMIN', 'PALESTRANTE'].includes(userData.role)) {
        router.push('/')
        return
      }

      const { data: eventData } = await supabase.from('events').select('*').eq('id', params.eventId).single()

      setEvent(eventData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function startScanning() {
    setScanning(true)
    setResult(null)

    try {
      html5QrCode = new Html5Qrcode('reader')

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => {}
      )
    } catch (error) {
      console.error('Error starting scanner:', error)
      setScanning(false)
      alert('Erro ao iniciar scanner. Verifique as permissões da câmera.')
    }
  }

  async function stopScanning() {
    if (html5QrCode && html5QrCode.isScanning) {
      await html5QrCode.stop()
    }
    setScanning(false)
  }

  async function onScanSuccess(decodedText: string) {
    await stopScanning()

    // Extract token from URL or use directly
    let token = decodedText
    try {
      const url = new URL(decodedText)
      const tokenParam = url.searchParams.get('token')
      if (tokenParam) token = tokenParam
    } catch {
      // Not a URL, use as is
    }

    await processCheckin(token)
  }

  async function handleManualCheckin(e: React.FormEvent) {
    e.preventDefault()
    await processCheckin(manualToken)
    setManualToken('')
  }

  async function processCheckin(token: string) {
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: params.eventId,
          qr_code_token: token,
        }),
      })

      const data = await response.json()
      setResult(data)

      // Auto-clear result after 5 seconds if successful
      if (data.success) {
        setTimeout(() => {
          setResult(null)
        }, 5000)
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Erro ao processar check-in',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Evento não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-foreground">Check-in: {event.title}</h1>
            <button onClick={() => router.back()} className="text-placeholder hover:text-foreground">
              Voltar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Event Info */}
        <div className="bg-card rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">{event.title}</h2>
          <p className="text-placeholder">{formatDateTime(event.start_datetime)}</p>
          <p className="text-placeholder">{event.location_name}</p>
        </div>

        {/* Scanner Controls */}
        <div className="bg-card rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Escanear QR Code</h3>

          {!scanning ? (
            <button
              onClick={startScanning}
              className="w-full bg-primary hover:bg-primary-500 text-foreground py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Iniciar Scanner
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="w-full bg-red-600 hover:bg-red-700 text-foreground py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Parar Scanner
            </button>
          )}

          {scanning && (
            <div id="reader" className="mt-4 rounded-lg overflow-hidden"></div>
          )}
        </div>

        {/* Manual Input */}
        <div className="bg-card rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Entrada Manual</h3>
          <form onSubmit={handleManualCheckin} className="flex gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Digite o código do ingresso"
              className="flex-1 px-4 py-3 rounded-lg bg-card text-foreground border border-border focus:border-primary-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-500 text-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Confirmar
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-lg p-6 ${
              result.success
                ? 'bg-green-500/20 border-2 border-green-500'
                : 'bg-red-500/20 border-2 border-red-500'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {result.success ? (
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <h3
                className={`text-xl font-bold ${
                  result.success ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {result.message}
              </h3>
            </div>

            {result.ticket && (
              <div className="bg-background/30 rounded-lg p-4 space-y-2">
                <p className="text-foreground">
                  <strong>Participante:</strong> {result.ticket.buyer_name}
                </p>
                <p className="text-foreground">
                  <strong>E-mail:</strong> {result.ticket.buyer_email}
                </p>
                <p className="text-foreground">
                  <strong>Tipo de Ingresso:</strong> {result.ticket.ticket_type?.name}
                </p>
                {result.alreadyCheckedIn && result.ticket.checked_in_at && (
                  <p className="text-yellow-300">
                    <strong>Check-in anterior:</strong> {formatDateTime(result.ticket.checked_in_at)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
