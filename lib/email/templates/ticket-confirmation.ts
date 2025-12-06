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
            <td style="background: linear-gradient(135deg, #C4F82A 0%, #9FD122 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0A0B0D; letter-spacing: -0.5px;">
                StageOne
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; font-weight: 600; color: #0A0B0D; text-transform: uppercase; letter-spacing: 2px;">
                Plataforma de Eventos
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 48px 32px;">

              <!-- Mensagem de Confirmação -->
              <div style="text-align: center; margin-bottom: 40px;">
                <div style="display: inline-block; background: rgba(196, 248, 42, 0.1); border: 1px solid rgba(196, 248, 42, 0.3); border-radius: 12px; padding: 12px 24px; margin-bottom: 16px;">
                  <span style="font-size: 24px; margin-right: 8px;">✓</span>
                  <span style="color: #C4F82A; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Inscrição Confirmada</span>
                </div>
                <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                  Olá, ${data.participantName}!
                </h2>
                <p style="margin: 16px 0 0; font-size: 16px; color: #9CA3AF; line-height: 1.6;">
                  Sua inscrição foi confirmada com sucesso. Estamos animados para te ver no evento!
                </p>
              </div>

              <!-- Detalhes do Evento -->
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 24px; font-size: 20px; font-weight: 700; color: #ffffff;">
                  Detalhes do Evento
                </h3>

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
              <div style="background: #ffffff; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px;">
                <p style="margin: 0 0 16px; font-size: 14px; color: #374151; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Seu QR Code de Acesso
                </p>
                <img src="${data.qrCodeUrl}" alt="QR Code" style="max-width: 200px; width: 100%; height: auto; margin: 0 auto 16px; display: block; border-radius: 8px;" />
                <p style="margin: 0; font-size: 12px; color: #6B7280;">
                  ID: ${data.ticketId}
                </p>
                <p style="margin: 8px 0 0; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                  Apresente este QR Code na entrada do evento
                </p>
              </div>

              <!-- Informações Importantes -->
              <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 32px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #60A5FA; font-weight: 600;">
                  ℹ️ Informações Importantes
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #9CA3AF; line-height: 1.8;">
                  <li>Chegue com 15 minutos de antecedência</li>
                  <li>Traga um documento com foto para identificação</li>
                  <li>Este ingresso é pessoal e intransferível</li>
                  <li>Guarde este e-mail para consulta futura</li>
                </ul>
              </div>

              <!-- Botão CTA -->
              <div style="text-align: center;">
                <a href="https://stageone.com/meus-ingressos" style="display: inline-block; background: linear-gradient(135deg, #C4F82A 0%, #9FD122 100%); color: #0A0B0D; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(196, 248, 42, 0.3); transition: all 0.3s;">
                  Ver Meus Ingressos
                </a>
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
