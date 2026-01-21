interface PasswordResetEmailData {
  participantName: string
  resetUrl: string
}

export function generatePasswordResetEmail(data: PasswordResetEmailData): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha - StageOne</title>
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
                <span style="font-weight: 300;">Stage</span><span style="font-weight: 700;">One</span><sup style="font-size: 14px; vertical-align: top; position: relative; top: 0.15em; font-weight: 400;">™</sup>
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; font-weight: 600; color: #0A0B0D; text-transform: uppercase; letter-spacing: 2px;">
                Plataforma de Eventos
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 48px 32px;">

              <!-- Ícone de Segurança -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(196, 248, 42, 0.1); border: 2px solid rgba(196, 248, 42, 0.3); border-radius: 50%; margin-bottom: 24px;">
                  <svg style="width: 40px; height: 40px; color: #C4F82A;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                  Redefinição de Senha
                </h2>
                <p style="margin: 16px 0 0; font-size: 16px; color: #9CA3AF; line-height: 1.6;">
                  Olá, ${data.participantName}!
                </p>
                <p style="margin: 8px 0 0; font-size: 16px; color: #9CA3AF; line-height: 1.6;">
                  Recebemos uma solicitação para redefinir a senha da sua conta.
                </p>
              </div>

              <!-- Informações -->
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; margin-bottom: 32px;">
                <p style="margin: 0 0 16px; font-size: 15px; color: #E5E7EB; line-height: 1.7;">
                  Para criar uma nova senha, clique no botão abaixo:
                </p>

                <!-- Botão CTA Principal -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${data.resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #C4F82A 0%, #9FD122 100%); color: #0A0B0D; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(196, 248, 42, 0.3);">
                    Redefinir Senha
                  </a>
                </div>

                <p style="margin: 24px 0 0; font-size: 14px; color: #9CA3AF; line-height: 1.7; text-align: center;">
                  Ou copie e cole este link no seu navegador:
                </p>
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; margin-top: 12px; word-break: break-all;">
                  <a href="${data.resetUrl}" style="color: #60A5FA; text-decoration: none; font-size: 13px;">
                    ${data.resetUrl}
                  </a>
                </div>
              </div>

              <!-- Avisos de Segurança -->
              <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px; font-size: 14px; color: #FCA5A5; font-weight: 600;">
                  ⚠️ Informações de Segurança
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #E5E7EB; line-height: 1.8;">
                  <li>Este link expira em <strong style="color: #FCA5A5;">1 hora</strong> por segurança</li>
                  <li>Se você não solicitou esta redefinição, ignore este e-mail</li>
                  <li>Nunca compartilhe este link com outras pessoas</li>
                  <li>Sua senha atual permanece válida até você definir uma nova</li>
                </ul>
              </div>

              <!-- Dica de Senha Forte -->
              <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 20px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #60A5FA; font-weight: 600;">
                  💡 Dica: Crie uma senha forte
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #9CA3AF; line-height: 1.8;">
                  <li>Mínimo de 8 caracteres</li>
                  <li>Combine letras maiúsculas e minúsculas</li>
                  <li>Inclua números e caracteres especiais</li>
                  <li>Evite informações pessoais óbvias</li>
                </ul>
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
