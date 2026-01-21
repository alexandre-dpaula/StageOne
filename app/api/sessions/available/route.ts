import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Obter sessões disponíveis para um evento
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'eventId é obrigatório' }, { status: 400 })
    }

    // Buscar evento para verificar se tem sessões habilitadas
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('enable_sessions, session_capacity, available_session_dates')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    // Se sessões não estão habilitadas, retornar vazio
    if (!event.enable_sessions) {
      return NextResponse.json({ sessions: [], enabled: false })
    }

    // Buscar sessões disponíveis (não cheias e não canceladas)
    const { data: sessions, error: sessionsError } = await supabase
      .from('event_sessions')
      .select('*')
      .eq('event_id', eventId)
      .in('status', ['AVAILABLE', 'FULL']) // Mostrar todas para indicar esgotadas
      .gte('session_date', new Date().toISOString()) // Apenas sessões futuras
      .order('session_date', { ascending: true })

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return NextResponse.json({ error: sessionsError.message }, { status: 500 })
    }

    // Se não há sessões criadas ainda, criar a primeira automaticamente
    if (!sessions || sessions.length === 0) {
      const availableDates = event.available_session_dates || []

      if (availableDates.length > 0) {
        // Pegar a primeira data disponível que seja futura
        const nextDate = availableDates.find(
          (date: string) => new Date(date) >= new Date()
        )

        if (nextDate) {
          const { data: newSession, error: createError } = await supabase
            .from('event_sessions')
            .insert({
              event_id: eventId,
              session_number: 1,
              session_date: nextDate,
              max_capacity: event.session_capacity || 25,
              current_bookings: 0,
              status: 'AVAILABLE',
            })
            .select()
            .single()

          if (!createError && newSession) {
            return NextResponse.json({
              sessions: [newSession],
              enabled: true,
            })
          }
        }
      }
    }

    return NextResponse.json({
      sessions: sessions || [],
      enabled: true,
    })
  } catch (error: any) {
    console.error('GET available sessions error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
