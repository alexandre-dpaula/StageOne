import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EventSession } from '@/types/database.types'

// GET - Listar sessões de um evento
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'eventId é obrigatório' }, { status: 400 })
    }

    const { data: sessions, error } = await supabase
      .from('event_sessions')
      .select('*')
      .eq('event_id', eventId)
      .order('session_number', { ascending: true })

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sessions })
  } catch (error: any) {
    console.error('GET sessions error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar sessões iniciais baseadas nas datas configuradas
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, sessionDates, capacity } = body

    if (!eventId || !sessionDates || !Array.isArray(sessionDates) || !capacity) {
      return NextResponse.json(
        { error: 'eventId, sessionDates (array) e capacity são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário é admin ou criador do evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (event.created_by !== user.id && userData?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Criar sessões para cada data
    const sessions: Partial<EventSession>[] = sessionDates.map((date: string, index: number) => ({
      event_id: eventId,
      session_number: index + 1,
      session_date: date,
      max_capacity: capacity,
      current_bookings: 0,
      status: 'AVAILABLE' as const,
    }))

    const { data: createdSessions, error: insertError } = await supabase
      .from('event_sessions')
      .insert(sessions)
      .select()

    if (insertError) {
      console.error('Error creating sessions:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Atualizar evento com configurações de sessões
    const { error: updateError } = await supabase
      .from('events')
      .update({
        enable_sessions: true,
        session_capacity: capacity,
        available_session_dates: sessionDates,
      })
      .eq('id', eventId)

    if (updateError) {
      console.error('Error updating event:', updateError)
    }

    return NextResponse.json({
      success: true,
      sessions: createdSessions,
      message: `${createdSessions.length} sessões criadas com sucesso`,
    })
  } catch (error: any) {
    console.error('POST sessions error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
