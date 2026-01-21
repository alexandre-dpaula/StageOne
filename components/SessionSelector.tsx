'use client'

import { useState, useEffect } from 'react'
import { EventSession } from '@/types/database.types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SessionSelectorProps {
  eventId: string
  onSelectSession: (sessionId: string) => void
  selectedSessionId?: string
}

export default function SessionSelector({
  eventId,
  onSelectSession,
  selectedSessionId,
}: SessionSelectorProps) {
  const [sessions, setSessions] = useState<EventSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [eventId])

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/sessions/available?eventId=${eventId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar sessões')
      }

      if (!data.enabled) {
        setSessions([])
        setLoading(false)
        return
      }

      setSessions(data.sessions || [])
    } catch (err: any) {
      console.error('Error fetching sessions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Escolha a sessão
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
        {error}
      </div>
    )
  }

  if (sessions.length === 0) {
    return null // Sem sessões habilitadas para este evento
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Escolha a data da sessão *
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sessions.map((session) => {
          const isSelected = selectedSessionId === session.id
          const isFull = session.status === 'FULL' || session.current_bookings >= session.max_capacity
          const availableSpots = session.max_capacity - session.current_bookings
          const fillPercentage = (session.current_bookings / session.max_capacity) * 100

          return (
            <button
              key={session.id}
              type="button"
              onClick={() => !isFull && onSelectSession(session.id)}
              disabled={isFull}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : isFull
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
                }
              `}
            >
              {/* Badge de status */}
              <div className="absolute top-2 right-2">
                {isFull ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                    ESGOTADA
                  </span>
                ) : availableSpots <= 5 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {availableSpots} VAGAS
                  </span>
                ) : isSelected ? (
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    DISPONÍVEL
                  </span>
                )}
              </div>

              {/* Número da sessão */}
              <div className="text-sm font-medium text-gray-500 mb-1">
                Sessão {String(session.session_number).padStart(2, '0')}
              </div>

              {/* Data */}
              <div className={`text-lg font-semibold mb-2 ${isFull ? 'text-gray-400' : 'text-gray-900'}`}>
                {format(new Date(session.session_date), "dd 'de' MMMM", { locale: ptBR })}
              </div>

              {/* Horário */}
              <div className={`text-sm mb-3 ${isFull ? 'text-gray-400' : 'text-gray-600'}`}>
                {format(new Date(session.session_date), 'HH:mm', { locale: ptBR })}
              </div>

              {/* Barra de progresso de vagas */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={isFull ? 'text-gray-400' : 'text-gray-600'}>
                    {session.current_bookings}/{session.max_capacity} vagas
                  </span>
                  <span className={isFull ? 'text-red-600 font-medium' : availableSpots <= 5 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                    {fillPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isFull
                        ? 'bg-red-500'
                        : fillPercentage >= 80
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Poucas vagas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Esgotada</span>
        </div>
      </div>
    </div>
  )
}
