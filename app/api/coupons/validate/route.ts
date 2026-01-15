import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { coupon_code, ticket_type_id, ticket_price } = await request.json()

    if (!coupon_code || !ticket_type_id || !ticket_price) {
      return NextResponse.json(
        { error: 'Código do cupom, tipo de ingresso e preço são obrigatórios' },
        { status: 400 }
      )
    }

    // Call database function to validate coupon
    const { data, error } = await supabase.rpc('validate_and_apply_coupon', {
      p_coupon_code: coupon_code,
      p_ticket_type_id: ticket_type_id,
      p_user_id: authUser.id,
      p_ticket_price: ticket_price
    })

    if (error) {
      console.error('Error validating coupon:', error)
      return NextResponse.json({ error: 'Erro ao validar cupom' }, { status: 500 })
    }

    const result = data?.[0]

    if (!result) {
      return NextResponse.json({ error: 'Cupom inválido' }, { status: 400 })
    }

    return NextResponse.json({
      is_valid: result.is_valid,
      discount_amount: result.discount_amount || 0,
      final_price: result.final_price || ticket_price,
      coupon_id: result.coupon_id,
      error_message: result.error_message
    })
  } catch (error: any) {
    console.error('Error in validate coupon API:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
