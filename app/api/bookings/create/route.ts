import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      hours,
      booking_date,
      has_audiovisual,
      has_coverage,
      has_coffee_break,
      base_price,
      addons_price,
      discount_percentage,
      total_price,
    } = body

    // Validate required fields
    if (!hours || !booking_date || base_price === undefined || total_price === undefined) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('space_bookings')
      .insert({
        user_id: user.id,
        hours: parseInt(hours),
        booking_date,
        has_audiovisual: has_audiovisual || false,
        has_coverage: has_coverage || false,
        has_coffee_break: has_coffee_break || false,
        base_price: parseFloat(base_price),
        addons_price: parseFloat(addons_price || 0),
        discount_percentage: parseInt(discount_percentage || 0),
        total_price: parseFloat(total_price),
        payment_status: 'PAID', // Simulando pagamento aprovado
        payment_method: 'DEMO',
        payment_date: new Date().toISOString(),
        status: 'CONFIRMED',
        confirmation_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json({ error: 'Erro ao criar reserva' }, { status: 500 })
    }

    // REMOVIDO: Auto-upgrade de PARTICIPANTE para PALESTRANTE
    // Nova lógica: Todos os usuários podem reservar espaço sem mudança de role
    // A navegação é baseada em hasEvents (se criou evento após reserva), não no role

    return NextResponse.json({
      success: true,
      booking,
      message: 'Reserva criada com sucesso!',
    })
  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
