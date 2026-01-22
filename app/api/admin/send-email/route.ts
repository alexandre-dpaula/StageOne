import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

// Template HTML moderno para o email
function getEmailTemplate(toName: string, subject: string, message: string) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: #18181b; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">

          <!-- Header com Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #A3E635 0%, #84CC16 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #000; letter-spacing: -0.5px;">
                <span style="font-weight: 400;">Stage</span><span style="font-weight: 700;">One</span><sup style="font-size: 14px; position: relative; top: -10px;">™</sup>
              </h1>
              <p style="margin: 8px 0 0; font-size: 12px; color: rgba(0, 0, 0, 0.6); text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                Plataforma de Eventos
              </p>
            </td>
          </tr>

          <!-- Saudação -->
          <tr>
            <td style="padding: 40px 40px 30px; background: #18181b;">
              <p style="margin: 0; font-size: 16px; color: #A3E635; font-weight: 600;">
                Olá, ${toName}!
              </p>
            </td>
          </tr>

          <!-- Assunto -->
          <tr>
            <td style="padding: 0 40px 30px; background: #18181b;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #fafafa; line-height: 1.3;">
                ${subject}
              </h2>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 0 40px 40px; background: #18181b;">
              <div style="font-size: 16px; line-height: 1.8; color: #a1a1aa; white-space: pre-wrap;">
                ${message}
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px; background: #18181b;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(163, 230, 53, 0.3) 50%, transparent 100%);"></div>
            </td>
          </tr>

          <!-- CTA Button (opcional) -->
          <tr>
            <td style="padding: 40px; background: #18181b; text-align: center;">
              <a href="https://stage-one-1.vercel.app" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #A3E635 0%, #84CC16 100%); color: #000; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 30px rgba(163, 230, 53, 0.3); transition: all 0.3s ease;">
                Acessar Plataforma
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: #0a0a0a; border-top: 1px solid rgba(163, 230, 53, 0.1);">
              <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">
                Atenciosamente,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; font-weight: 700; color: #fafafa;">
                Equipe <span style="font-weight: 400;">Stage</span><span style="font-weight: 700;">One</span><sup style="font-size: 10px;">™</sup>
              </p>

              <!-- Social Links -->
              <div style="margin: 20px 0;">
                <a href="https://stage-one-1.vercel.app" style="color: #A3E635; text-decoration: none; font-size: 14px; margin-right: 20px;">
                  ● Website
                </a>
                <a href="mailto:contato@stageone.com" style="color: #A3E635; text-decoration: none; font-size: 14px; margin-right: 20px;">
                  ● Contato
                </a>
                <a href="https://stage-one-1.vercel.app/eventos" style="color: #A3E635; text-decoration: none; font-size: 14px;">
                  ● Eventos
                </a>
              </div>

              <!-- Legal -->
              <p style="margin: 20px 0 0; font-size: 12px; color: #52525b; line-height: 1.6;">
                Você está recebendo este email porque é um usuário cadastrado na plataforma StageOne™.<br>
                © 2026 StageOne™. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se é admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Obter dados do email
    const { to, toName, subject, message } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Enviar email com template HTML
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: 'StageOne™ <contato@stage-one-1.vercel.app>',
      to: [to],
      subject: subject,
      html: getEmailTemplate(toName, subject, message)
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
      emailId: data?.id
    })

  } catch (error: any) {
    console.error('Send email API error:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar email', details: error.message },
      { status: 500 }
    )
  }
}
