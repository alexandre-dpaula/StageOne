import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      subtitle,
      description,
      slug,
      category,
      cover_image,
      start_datetime,
      capacity,
      location_name,
      address,
      is_published,
      modules,
      ticket_types,
    } = body

    const normalizedModules = Array.isArray(modules) ? modules : []
    const normalizedTicketTypes = Array.isArray(ticket_types) ? ticket_types : []

    // Atualizar evento
    const { error: eventError } = await supabase
      .from('events')
      .update({
        title,
        subtitle,
        description,
        slug,
        category,
        cover_image,
        start_datetime,
        capacity,
        location_name,
        address,
        is_published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.eventId)

    if (eventError) {
      console.error('Erro ao atualizar evento:', eventError)
      return NextResponse.json({ error: 'Erro ao atualizar evento' }, { status: 500 })
    }

    // Deletar módulos existentes
    await supabase.from('event_modules').delete().eq('event_id', params.eventId)

    // Inserir novos módulos
    if (normalizedModules.length > 0) {
      const modulesData = normalizedModules.map((m: any) => ({
        event_id: params.eventId,
        title: m.title,
        hours: m.hours,
        order_index: m.order_index,
      }))

      const { error: modulesError } = await supabase.from('event_modules').insert(modulesData)

      if (modulesError) {
        console.error('Erro ao atualizar módulos:', modulesError)
      }
    }

    // Buscar tipos de ingressos atuais para preservar saldos
    const { data: existingTicketTypes, error: existingTicketTypesError } = await supabase
      .from('tickets_types')
      .select('id, sold_quantity')
      .eq('event_id', params.eventId)

    if (existingTicketTypesError) {
      console.error('Erro ao buscar tipos de ingresso existentes:', existingTicketTypesError)
      return NextResponse.json({ error: 'Erro ao atualizar tipos de ingresso' }, { status: 500 })
    }

    const existingTicketMap = new Map(
      (existingTicketTypes || []).map((type) => [type.id, type])
    )

    const incomingTicketIds = new Set<string>()

    if (normalizedTicketTypes.length > 0) {
      const ticketsData = normalizedTicketTypes.map((t: any) => {
        const isExisting = typeof t.id === 'string' && !t.id.startsWith('new-')
        const existing = isExisting ? existingTicketMap.get(t.id) : null
        const preservedSold = existing?.sold_quantity || 0
        const sanitizedTotal =
          typeof t.total_quantity === 'number'
            ? Math.max(t.total_quantity, preservedSold)
            : preservedSold

        if (isExisting && t.id) {
          incomingTicketIds.add(t.id)
        }

        const baseData = {
          event_id: params.eventId,
          name: t.name,
          description: t.description || null,
          price: t.price,
          total_quantity: sanitizedTotal,
          sold_quantity: preservedSold,
          is_active: t.is_active ?? true,
        }

        return isExisting ? { ...baseData, id: t.id } : baseData
      })

      const { error: ticketsError } = await supabase
        .from('tickets_types')
        .upsert(ticketsData, { onConflict: 'id' })

      if (ticketsError) {
        console.error('Erro ao atualizar tipos de ingresso:', ticketsError)
        return NextResponse.json({ error: 'Erro ao atualizar tipos de ingresso' }, { status: 500 })
      }
    }

    // Tratar tipos removidos no formulário
    if (existingTicketTypes && existingTicketTypes.length > 0) {
      const removable = existingTicketTypes.filter((type) => !incomingTicketIds.has(type.id))

      if (removable.length > 0) {
        const { error: deactivateError } = await supabase
          .from('tickets_types')
          .update({ is_active: false })
          .in(
            'id',
            removable.map((type) => type.id)
          )

        if (deactivateError) {
          console.error('Erro ao desativar tipos de ingresso removidos:', deactivateError)
          return NextResponse.json({ error: 'Erro ao atualizar tipos de ingresso' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar evento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const adminSupabase = createAdminClient()

    // Deletar registros relacionados primeiro para evitar erros de foreign key
    // IMPORTANTE: Ordem de deleção baseada nas dependências do banco

    console.log(`Iniciando deleção do evento ${params.eventId}`)

    // 1. Primeiro, buscar todos os tickets_types deste evento
    const { data: ticketTypesData, error: fetchTicketTypesError } = await adminSupabase
      .from('tickets_types')
      .select('id')
      .eq('event_id', params.eventId)

    if (fetchTicketTypesError) {
      console.error('Erro ao buscar tickets_types:', fetchTicketTypesError)
    }

    console.log(`Found ${ticketTypesData?.length || 0} ticket types`)

    // 2. Deletar tickets (ingressos comprados) vinculados aos tickets_types
    if (ticketTypesData && ticketTypesData.length > 0) {
      const ticketTypeIds = ticketTypesData.map(tt => tt.id)

      const { error: ticketsError } = await adminSupabase
        .from('tickets')
        .delete()
        .in('ticket_type_id', ticketTypeIds)

      if (ticketsError) {
        console.error('Erro ao deletar tickets:', ticketsError)
        return NextResponse.json({
          error: `Erro ao deletar ingressos: ${ticketsError.message}. Detalhes: ${ticketsError.details}`
        }, { status: 500 })
      }
      console.log('Tickets deletados com sucesso')
    }

    // 3. Deletar tipos de ingresso
    const { error: ticketTypesError } = await adminSupabase
      .from('tickets_types')
      .delete()
      .eq('event_id', params.eventId)

    if (ticketTypesError) {
      console.error('Erro ao deletar tipos de ingresso:', ticketTypesError)
      return NextResponse.json({
        error: `Erro ao deletar tipos de ingresso: ${ticketTypesError.message}. Detalhes: ${ticketTypesError.details}`
      }, { status: 500 })
    }
    console.log('Ticket types deletados com sucesso')

    // 4. Deletar módulos
    const { error: modulesError } = await adminSupabase
      .from('event_modules')
      .delete()
      .eq('event_id', params.eventId)

    if (modulesError) {
      console.error('Erro ao deletar módulos:', modulesError)
      return NextResponse.json({
        error: `Erro ao deletar módulos: ${modulesError.message}. Detalhes: ${modulesError.details}`
      }, { status: 500 })
    }
    console.log('Módulos deletados com sucesso')

    // 5. Deletar possíveis reservas (space_bookings) vinculadas ao evento
    const { error: bookingsError } = await adminSupabase
      .from('space_bookings')
      .delete()
      .eq('event_id', params.eventId)

    if (bookingsError) {
      console.error('Erro ao deletar reservas:', bookingsError)
      // Não retorna erro aqui pois pode não existir essa relação
    } else {
      console.log('Reservas deletadas (se existiam)')
    }

    // 6. Finalmente, deletar o evento
    const { error: eventError } = await adminSupabase
      .from('events')
      .delete()
      .eq('id', params.eventId)

    if (eventError) {
      console.error('Erro ao deletar evento:', eventError)
      return NextResponse.json({
        error: `Erro ao deletar evento: ${eventError.message}. Detalhes: ${eventError.details || 'Nenhum detalhe disponível'}`
      }, { status: 500 })
    }
    console.log('Evento deletado com sucesso')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar evento:', error)
    return NextResponse.json({
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
}
