import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { eventId, action, rejection_reason } = body // action: 'approve' | 'reject'

    if (!eventId || !action) {
      return NextResponse.json(
        { error: 'eventId e action são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, created_by')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    if (event.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: 'Evento não está pendente de aprovação' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Aprovar evento
      const { error: updateError } = await supabase
        .from('events')
        .update({
          status: 'PUBLISHED',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          is_published: true,
        })
        .eq('id', eventId)

      if (updateError) {
        console.error('Error approving event:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // TODO: Enviar email para criador notificando aprovação

      return NextResponse.json({
        success: true,
        message: 'Evento aprovado com sucesso',
        event: {
          id: eventId,
          status: 'PUBLISHED',
        },
      })
    } else if (action === 'reject') {
      // Rejeitar evento
      if (!rejection_reason) {
        return NextResponse.json(
          { error: 'Motivo da rejeição é obrigatório' },
          { status: 400 }
        )
      }

      const { error: updateError } = await supabase
        .from('events')
        .update({
          status: 'CANCELLED',
          rejection_reason,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', eventId)

      if (updateError) {
        console.error('Error rejecting event:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // TODO: Enviar email para criador notificando rejeição

      return NextResponse.json({
        success: true,
        message: 'Evento rejeitado',
        event: {
          id: eventId,
          status: 'CANCELLED',
          rejection_reason,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Ação inválida. Use "approve" ou "reject"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Approve event error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
