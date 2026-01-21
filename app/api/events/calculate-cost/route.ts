import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CalculateCostRequest, EventCostCalculation } from '@/types/database.types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: CalculateCostRequest = await request.json()

    const { duration_hours, has_audiovisual, has_coffee_break, has_coverage } = body

    if (!duration_hours || duration_hours < 3) {
      return NextResponse.json(
        { error: 'Duração mínima de 3 horas' },
        { status: 400 }
      )
    }

    // Chamar função SQL que calcula os custos
    const { data, error } = await supabase.rpc('calculate_event_costs', {
      p_duration_hours: duration_hours,
      p_has_audiovisual: has_audiovisual || false,
      p_has_coffee_break: has_coffee_break || false,
      p_has_coverage: has_coverage || false,
    })

    if (error) {
      console.error('Error calculating costs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const costs: EventCostCalculation = data[0]

    return NextResponse.json({
      success: true,
      costs: {
        room_price: Number(costs.room_price),
        audiovisual_price: Number(costs.audiovisual_price),
        coffee_break_price: Number(costs.coffee_break_price),
        coverage_price: Number(costs.coverage_price),
        total_service_cost: Number(costs.total_service_cost),
      },
    })
  } catch (error: any) {
    console.error('Calculate cost error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
