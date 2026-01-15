import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Listar cupons (admin vê todos, user vê apenas ativos)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Get user role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single()

    const isAdmin = user?.role === 'ADMIN'

    let query = supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    // Se não for admin, mostrar apenas cupons ativos
    if (!isAdmin) {
      query = query.eq('is_active', true)
    }

    const { data: coupons, error } = await query

    if (error) {
      console.error('Error fetching coupons:', error)
      return NextResponse.json({ error: 'Erro ao buscar cupons' }, { status: 500 })
    }

    return NextResponse.json({ coupons })
  } catch (error: any) {
    console.error('Error in get coupons API:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo cupom (apenas admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()

    const {
      code,
      discount_type,
      discount_value,
      max_discount_amount,
      valid_from,
      valid_until,
      usage_limit,
      usage_limit_per_user,
      event_id,
      ticket_type_id,
      minimum_purchase_amount,
      tracking_source,
      description
    } = body

    // Validações
    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json(
        { error: 'Código, tipo de desconto e valor são obrigatórios' },
        { status: 400 }
      )
    }

    if (discount_type !== 'PERCENTAGE' && discount_type !== 'FIXED_AMOUNT') {
      return NextResponse.json(
        { error: 'Tipo de desconto inválido' },
        { status: 400 }
      )
    }

    // Inserir cupom
    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase().trim(),
        discount_type,
        discount_value,
        max_discount_amount,
        valid_from: valid_from || new Date().toISOString(),
        valid_until,
        usage_limit,
        usage_limit_per_user: usage_limit_per_user || 1,
        event_id,
        ticket_type_id,
        minimum_purchase_amount,
        tracking_source,
        description,
        is_active: true,
        usage_count: 0,
        created_by: authUser.id
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'Código de cupom já existe' }, { status: 400 })
      }
      console.error('Error creating coupon:', error)
      return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 })
    }

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create coupon API:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
