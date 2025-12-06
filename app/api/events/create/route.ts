import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Check user role
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (!user || !['ADMIN', 'PALESTRANTE'].includes(user.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      title,
      subtitle,
      description,
      slug,
      category,
      banner_url,
      start_datetime,
      capacity,
      location_name,
      address,
      city,
      state,
      is_published,
      booking_id,
      modules,
      ticket_types,
    } = body

    // Validate required fields
    if (!title || !subtitle || !description || !slug || !start_datetime || !capacity) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Check if slug already exists
    const { data: existingEvent } = await supabase
      .from('events')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingEvent) {
      return NextResponse.json(
        { error: 'Já existe um evento com este título. Por favor, escolha outro.' },
        { status: 400 }
      )
    }

    // If booking_id is provided, validate the booking
    if (booking_id) {
      const { data: booking, error: bookingError } = await supabase
        .from('space_bookings')
        .select('*')
        .eq('id', booking_id)
        .eq('user_id', user.id)
        .single()

      if (bookingError || !booking) {
        return NextResponse.json({ error: 'Reserva não encontrada ou sem permissão' }, { status: 404 })
      }

      // Check if booking already has an event linked
      if (booking.event_id) {
        return NextResponse.json(
          { error: 'Esta reserva já possui um evento vinculado. Cada reserva permite criar apenas 1 evento.' },
          { status: 400 }
        )
      }

      // Check if payment is completed
      if (booking.payment_status !== 'PAID') {
        return NextResponse.json(
          { error: 'Pagamento da reserva ainda não foi confirmado' },
          { status: 400 }
        )
      }
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title,
        subtitle,
        description,
        slug,
        category,
        start_datetime,
        end_datetime: start_datetime, // TODO: Calculate based on modules
        capacity,
        location_name,
        address: address || '',
        mode: 'PRESENCIAL',
        is_published,
        created_by: user.id,
        banner_url: banner_url || null,
        total_hours: 0, // Will be calculated by trigger
      })
      .select()
      .single()

    if (eventError) {
      console.error('Error creating event:', eventError)
      return NextResponse.json({ error: eventError.message }, { status: 500 })
    }

    // If booking_id exists, link the event to the booking
    if (booking_id) {
      const { error: updateBookingError } = await supabase
        .from('space_bookings')
        .update({ event_id: event.id })
        .eq('id', booking_id)

      if (updateBookingError) {
        console.error('Error linking booking to event:', updateBookingError)
        // Continue anyway, the event was created successfully
      }
    }

    // Create modules
    if (modules && modules.length > 0) {
      const modulesData = modules.map((module: any) => ({
        event_id: event.id,
        title: module.title,
        hours: module.hours,
        order_index: module.order_index,
      }))

      const { error: modulesError } = await supabase.from('event_modules').insert(modulesData)

      if (modulesError) {
        console.error('Error creating modules:', modulesError)
        // Continue anyway, modules can be added later
      }
    }

    // Create ticket types
    if (ticket_types && ticket_types.length > 0) {
      const ticketsData = ticket_types.map((ticket: any) => ({
        event_id: event.id,
        name: ticket.name,
        description: ticket.description || null,
        price: ticket.price,
        total_quantity: ticket.total_quantity,
        sold_quantity: 0,
        is_active: ticket.is_active !== false,
      }))

      const { error: ticketsError } = await supabase.from('tickets_types').insert(ticketsData)

      if (ticketsError) {
        console.error('Error creating ticket types:', ticketsError)
        // Continue anyway, tickets can be added later
      }
    }

    return NextResponse.json({
      success: true,
      eventId: event.id,
      slug: event.slug,
      message: 'Evento criado com sucesso!',
    })
  } catch (error: any) {
    console.error('Error in create event API:', error)
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 })
  }
}
