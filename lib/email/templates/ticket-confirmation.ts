interface TicketEmailData {
  participantName: string
  eventTitle: string
  eventSubtitle: string
  eventDate: string
  eventTime: string
  locationName: string
  locationAddress: string
  ticketTypeName: string
  ticketPrice: string
  qrCodeUrl: string
  ticketId: string
}

export function generateTicketConfirmationEmail(data: TicketEmailData): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Inscrição - ${data.eventTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0B0D; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Container Principal -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1b1e 0%, #0f1012 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">

          <!-- Header com Gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #C4F82A 0%, #9FD122 100%); padding: 48px 32px; text-align: center;">
              <div style="margin-bottom: 12px;">
                <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #0A0B0D; letter-spacing: -1px; line-height: 1;">
                  <span style="font-weight: 300; color: #2D2D2D;">Stage</span><span style="font-weight: 700; color: #0A0B0D;">One</span><sup style="font-size: 16px; vertical-align: top; position: relative; top: -0.5em; font-weight: 400; color: #2D2D2D;">™</sup>
                </h1>
              </div>
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: #0A0B0D; text-transform: uppercase; letter-spacing: 3px; opacity: 0.8;">
                Plataforma de Eventos
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 48px 32px;">

              <!-- Mensagem de Confirmação -->
              <div style="text-align: center; margin-bottom: 40px;">
                <!-- Badge de Confirmação Melhorado -->
                <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(196, 248, 42, 0.15); border: 2px solid rgba(196, 248, 42, 0.4); border-radius: 16px; padding: 14px 28px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(196, 248, 42, 0.2);">
                  <svg style="width: 20px; height: 20px; color: #C4F82A;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span style="color: #C4F82A; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">Inscrição Confirmada</span>
                </div>

                <h2 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                  Olá, ${data.participantName}!
                </h2>
                <p style="margin: 0; font-size: 16px; color: #9CA3AF; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto;">
                  Sua inscrição foi confirmada com sucesso. Estamos animados para te ver no evento!
                </p>
              </div>

              <!-- Detalhes do Evento -->
              <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 36px; margin-bottom: 32px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                  <svg style="width: 24px; height: 24px; color: #C4F82A; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                  </svg>
                  <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                    Detalhes do Evento
                  </h3>
                </div>

                <!-- Título do Evento -->
                <div style="margin-bottom: 24px;">
                  <p style="margin: 0 0 4px; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                    Evento
                  </p>
                  <p style="margin: 0; font-size: 18px; font-weight: 600; color: #C4F82A;">
                    ${data.eventTitle}
                  </p>
                  ${data.eventSubtitle ? `
                  <p style="margin: 4px 0 0; font-size: 14px; color: #9CA3AF;">
                    ${data.eventSubtitle}
                  </p>
                  ` : ''}
                </div>

                <!-- Data e Hora -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                  <div>
                    <p style="margin: 0 0 4px; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      📅 Data
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 500;">
                      ${data.eventDate}
                    </p>
                  </div>
                  <div>
                    <p style="margin: 0 0 4px; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      ⏰ Horário
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 500;">
                      ${data.eventTime}
                    </p>
                  </div>
                </div>

                <!-- Local -->
                <div style="margin-bottom: 24px;">
                  <p style="margin: 0 0 4px; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                    📍 Local
                  </p>
                  <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 500;">
                    ${data.locationName}
                  </p>
                  <p style="margin: 4px 0 0; font-size: 14px; color: #9CA3AF;">
                    ${data.locationAddress}
                  </p>
                </div>

                <!-- Tipo de Ingresso -->
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 24px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <p style="margin: 0 0 4px; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                        Tipo de Ingresso
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 500;">
                        ${data.ticketTypeName}
                      </p>
                    </div>
                    <div style="text-align: right;">
                      <p style="margin: 0 0 4px; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                        Valor
                      </p>
                      <p style="margin: 0; font-size: 20px; color: #C4F82A; font-weight: 700;">
                        ${data.ticketPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- QR Code -->
              <div style="background: #ffffff; border-radius: 20px; padding: 40px 32px; text-align: center; margin-bottom: 32px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);">
                <!-- Título com ícone -->
                <div style="display: inline-flex; align-items: center; gap: 8px; background: #F3F4F6; border-radius: 12px; padding: 10px 20px; margin-bottom: 24px;">
                  <svg style="width: 18px; height: 18px; color: #0A0B0D;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                  </svg>
                  <span style="color: #0A0B0D; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px;">Seu QR Code de Acesso</span>
                </div>

                <!-- QR Code com moldura -->
                <div style="background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%); border: 3px solid #E5E7EB; border-radius: 16px; padding: 20px; display: inline-block; margin-bottom: 20px;">
                  <img src="${data.qrCodeUrl}" alt="QR Code" style="max-width: 200px; width: 100%; height: auto; display: block; border-radius: 8px;" />
                </div>

                <!-- ID do Ticket -->
                <div style="background: #F3F4F6; border-radius: 10px; padding: 12px 20px; margin-bottom: 16px; display: inline-block;">
                  <p style="margin: 0; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                    ID do Ingresso
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #0A0B0D; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                    ${data.ticketId}
                  </p>
                </div>

                <!-- Instruções -->
                <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.6; max-width: 280px; margin-left: auto; margin-right: auto;">
                  Apresente este QR Code na entrada do evento para validar seu ingresso
                </p>
              </div>

              <!-- Informações Importantes -->
              <div style="background: rgba(196, 248, 42, 0.08); border: 1px solid rgba(196, 248, 42, 0.25); border-radius: 14px; padding: 24px; margin-bottom: 32px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                  <svg style="width: 20px; height: 20px; color: #C4F82A; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p style="margin: 0; font-size: 14px; color: #C4F82A; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    Informações Importantes
                  </p>
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #D1D5DB; line-height: 1.9;">
                  <li>Chegue com 15 minutos de antecedência</li>
                  <li>Traga um documento com foto para identificação</li>
                  <li>Este ingresso é pessoal e intransferível</li>
                  <li>Guarde este e-mail para consulta futura</li>
                </ul>
              </div>

              <!-- Botão CTA -->
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://stage-one-1.vercel.app'}/meus-ingressos" style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #C4F82A 0%, #9FD122 100%); color: #0A0B0D; text-decoration: none; padding: 18px 40px; border-radius: 14px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(196, 248, 42, 0.35);">
                  <span>Ver Meus Ingressos</span>
                  <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </a>
                <p style="margin: 16px 0 0; font-size: 12px; color: #6B7280;">
                  Acesse sua conta para gerenciar seus ingressos
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: rgba(255, 255, 255, 0.02); padding: 32px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 16px; font-size: 14px; color: #6B7280; line-height: 1.6;">
                Precisa de ajuda? Entre em contato conosco
              </p>
              <p style="margin: 0 0 8px;">
                <a href="mailto:suporte@stageone.com" style="color: #C4F82A; text-decoration: none; font-weight: 500;">
                  suporte@stageone.com
                </a>
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #4B5563;">
                © ${new Date().getFullYear()} StageOne. Todos os direitos reservados.
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #6B7280;">
                Este é um e-mail automático, por favor não responda.
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
