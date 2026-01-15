import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateValidationToken, generateCertificateHTML } from '@/lib/certificates/generate-certificate'

export async function POST(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { ticketId } = params

    // Buscar ticket com evento
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        event:events(*)
      `)
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ingresso não encontrado' }, { status: 404 })
    }

    // Verificar se o ticket pertence ao usuário
    if (ticket.user_id !== authUser.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Verificar se ticket foi pago e teve check-in
    if (ticket.status !== 'USED') {
      return NextResponse.json(
        { error: 'Certificado disponível apenas após check-in no evento' },
        { status: 400 }
      )
    }

    // Verificar se já existe certificado para este ticket
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('*')
      .eq('ticket_id', ticketId)
      .single()

    if (existingCert) {
      return NextResponse.json({
        certificate: existingCert,
        message: 'Certificado já emitido anteriormente'
      })
    }

    // Buscar template (específico do evento ou padrão)
    let { data: template } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('event_id', ticket.event_id)
      .eq('is_active', true)
      .single()

    // Se não tem template específico, pegar o padrão
    if (!template) {
      const { data: defaultTemplate } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .single()

      template = defaultTemplate
    }

    if (!template) {
      return NextResponse.json({ error: 'Template de certificado não encontrado' }, { status: 500 })
    }

    // Gerar token de validação
    const validationToken = generateValidationToken()

    // Criar certificado
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert({
        event_id: ticket.event_id,
        ticket_id: ticketId,
        user_id: authUser.id,
        participant_name: ticket.buyer_name,
        event_title: ticket.event.title,
        event_hours: ticket.event.total_hours,
        completion_date: ticket.checked_in_at ? new Date(ticket.checked_in_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        validation_token: validationToken,
        template_id: template.id
      })
      .select()
      .single()

    if (certError) {
      console.error('Error creating certificate:', certError)
      return NextResponse.json({ error: 'Erro ao criar certificado' }, { status: 500 })
    }

    // Gerar HTML do certificado
    const html = generateCertificateHTML(certificate, template)

    return NextResponse.json({
      certificate,
      html,
      message: 'Certificado gerado com sucesso'
    })
  } catch (error: any) {
    console.error('Error in generate certificate API:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
