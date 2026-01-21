# 📧 Templates de Email StageOne - Modo Claro

Todos os templates em **modo claro** (fundo branco) com a identidade visual do StageOne.

---

## 1. Reset Password - Redefinição de Senha

### Subject (Assunto):
```
Redefinição de Senha - StageOne™
```

### HTML Template:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha - StageOne™</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F3F4F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Container Principal -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Logo Header -->
          <tr>
            <td style="padding: 40px 40px 32px 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
                <span style="font-weight: 300;">Stage</span><span style="font-weight: 700;">One</span><sup style="font-size: 14px; vertical-align: top; position: relative; top: -0.5em; font-weight: 400;">™</sup>
              </h1>
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 2px;">
                Plataforma de Eventos
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">

              <!-- Título -->
              <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
                Redefinição de Senha
              </h2>

              <!-- Mensagem -->
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #4B5563; line-height: 1.6; text-align: center;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Para criar uma nova senha, clique no botão abaixo:
              </p>

              <!-- Botão CTA -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #84CC16; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(132, 204, 22, 0.25);">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 24px 0 0 0; font-size: 13px; color: #6B7280; text-align: center; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; text-align: center; word-break: break-all; line-height: 1.5;">
                <a href="{{ .ConfirmationURL }}" style="color: #65A30D; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>

              <!-- Divider -->
              <div style="margin: 32px 0; height: 1px; background-color: #E5E7EB;"></div>

              <!-- Avisos de Segurança -->
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; padding: 20px; margin-bottom: 20px; border-radius: 6px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="vertical-align: top; padding-right: 12px; width: 24px;">
                      <svg style="width: 20px; height: 20px; color: #6B7280; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </td>
                    <td>
                      <p style="margin: 0 0 12px 0; font-size: 13px; color: #374151; font-weight: 700;">
                        Informações de Segurança
                      </p>
                      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4B5563; line-height: 1.8;">
                        <li style="margin-bottom: 6px;">Este link expira em <strong>1 hora</strong> por segurança</li>
                        <li style="margin-bottom: 6px;">Se você não solicitou esta redefinição, ignore este e-mail</li>
                        <li>Nunca compartilhe este link com outras pessoas</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Dica -->
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-left: 4px solid #84CC16; padding: 20px; border-radius: 6px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="vertical-align: top; padding-right: 12px; width: 24px;">
                      <svg style="width: 20px; height: 20px; color: #65A30D; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </td>
                    <td>
                      <p style="margin: 0 0 12px 0; font-size: 13px; color: #3F6212; font-weight: 700;">
                        Dica: Crie uma senha forte
                      </p>
                      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4B5563; line-height: 1.8;">
                        <li style="margin-bottom: 6px;">Mínimo de 8 caracteres</li>
                        <li style="margin-bottom: 6px;">Combine letras maiúsculas e minúsculas</li>
                        <li>Inclua números e caracteres especiais</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 32px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;">
                Precisa de ajuda? Entre em contato conosco
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="mailto:stageone2026@gmail.com" style="color: #65A30D; text-decoration: none; font-weight: 600; font-size: 13px;">
                  stageone2026@gmail.com
                </a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                © 2025 StageOne™. Todos os direitos reservados.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #9CA3AF;">
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
```

---

## 2. Confirm Signup - Confirmação de Cadastro

### Subject (Assunto):
```
Bem-vindo ao StageOne™ - Confirme seu Email
```

### HTML Template:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao StageOne</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F3F4F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Container Principal -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Logo Header -->
          <tr>
            <td style="padding: 40px 40px 32px 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
                <span style="font-weight: 300;">Stage</span><span style="font-weight: 700;">One</span><sup style="font-size: 14px; vertical-align: top; position: relative; top: -0.5em; font-weight: 400;">™</sup>
              </h1>
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 2px;">
                Plataforma de Eventos
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">

              <!-- Título -->
              <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center; line-height: 1.2;">
                Bem-vindo ao StageOne™!
              </h2>

              <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; text-align: center; line-height: 1.6;">
                Estamos felizes em ter você conosco
              </p>

              <!-- Mensagem -->
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #4B5563; line-height: 1.6; text-align: center;">
                Para começar a usar a plataforma e garantir a segurança da sua conta, precisamos confirmar seu endereço de email.
              </p>

              <!-- Botão CTA -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #84CC16; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(132, 204, 22, 0.25);">
                      Confirmar Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 24px 0 0 0; font-size: 13px; color: #6B7280; text-align: center; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; text-align: center; word-break: break-all; line-height: 1.5;">
                <a href="{{ .ConfirmationURL }}" style="color: #65A30D; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>

              <!-- Divider -->
              <div style="margin: 32px 0; height: 1px; background-color: #E5E7EB;"></div>

              <!-- Benefícios -->
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-left: 4px solid #84CC16; padding: 20px; margin-bottom: 20px; border-radius: 6px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="vertical-align: top; padding-right: 12px; width: 24px;">
                      <svg style="width: 20px; height: 20px; color: #65A30D; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                      </svg>
                    </td>
                    <td>
                      <p style="margin: 0 0 12px 0; font-size: 13px; color: #3F6212; font-weight: 700;">
                        O que você pode fazer no StageOne™
                      </p>
                      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #374151; line-height: 1.8;">
                        <li style="margin-bottom: 6px;">Descobrir eventos e treinamentos presenciais incríveis</li>
                        <li style="margin-bottom: 6px;">Comprar ingressos de forma rápida e segura</li>
                        <li style="margin-bottom: 6px;">Gerenciar todos os seus ingressos em um só lugar</li>
                        <li>Receber atualizações sobre novos eventos</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Aviso -->
              <p style="margin: 0; font-size: 12px; color: #6B7280; text-align: center; line-height: 1.6;">
                Se você não criou uma conta no StageOne™, por favor ignore este email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 32px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;">
                Precisa de ajuda? Entre em contato conosco
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="mailto:stageone2026@gmail.com" style="color: #65A30D; text-decoration: none; font-weight: 600; font-size: 13px;">
                  stageone2026@gmail.com
                </a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                © 2025 StageOne™. Todos os direitos reservados.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #9CA3AF;">
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
```

---

## 3. Magic Link - Login sem Senha

### Subject (Assunto):
```
Seu Link de Acesso ao StageOne™
```

### HTML Template:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu Link de Acesso - StageOne</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F3F4F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Container Principal -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Logo Header -->
          <tr>
            <td style="padding: 40px 40px 32px 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
                <span style="font-weight: 300;">Stage</span><span style="font-weight: 700;">One</span><sup style="font-size: 14px; vertical-align: top; position: relative; top: -0.5em; font-weight: 400;">™</sup>
              </h1>
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 2px;">
                Plataforma de Eventos
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">

              <!-- Título -->
              <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
                Seu Link de Acesso
              </h2>

              <!-- Mensagem -->
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #4B5563; line-height: 1.6; text-align: center;">
                Clique no botão abaixo para acessar sua conta:
              </p>

              <!-- Botão CTA -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #84CC16; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(132, 204, 22, 0.25);">
                      Acessar StageOne™
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 24px 0 0 0; font-size: 13px; color: #6B7280; text-align: center; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; text-align: center; word-break: break-all; line-height: 1.5;">
                <a href="{{ .ConfirmationURL }}" style="color: #65A30D; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>

              <!-- Divider -->
              <div style="margin: 32px 0; height: 1px; background-color: #E5E7EB;"></div>

              <!-- Aviso -->
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; padding: 20px; border-radius: 6px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="vertical-align: top; padding-right: 12px; width: 24px;">
                      <svg style="width: 20px; height: 20px; color: #6B7280; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </td>
                    <td>
                      <p style="margin: 0 0 12px 0; font-size: 13px; color: #374151; font-weight: 700;">
                        Importante
                      </p>
                      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4B5563; line-height: 1.8;">
                        <li style="margin-bottom: 6px;">Este link expira em <strong>5 minutos</strong></li>
                        <li style="margin-bottom: 6px;">Se você não solicitou este acesso, ignore este email</li>
                        <li>Nunca compartilhe este link com outras pessoas</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 32px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;">
                Precisa de ajuda? Entre em contato conosco
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="mailto:stageone2026@gmail.com" style="color: #65A30D; text-decoration: none; font-weight: 600; font-size: 13px;">
                  stageone2026@gmail.com
                </a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                © 2025 StageOne™. Todos os direitos reservados.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #9CA3AF;">
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
```

---

## 4. Change Email - Mudança de Email

### Subject (Assunto):
```
Confirme seu Novo Email - StageOne™
```

### HTML Template:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu Novo Email - StageOne™</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F3F4F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Container Principal -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Logo Header -->
          <tr>
            <td style="padding: 40px 40px 32px 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
                <span style="font-weight: 300;">Stage</span><span style="font-weight: 700;">One</span><sup style="font-size: 14px; vertical-align: top; position: relative; top: -0.5em; font-weight: 400;">™</sup>
              </h1>
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 2px;">
                Plataforma de Eventos
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">

              <!-- Título -->
              <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
                Confirme seu Novo Email
              </h2>

              <!-- Mensagem -->
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #4B5563; line-height: 1.6; text-align: center;">
                Você solicitou a mudança do email da sua conta. Para confirmar, clique no botão abaixo:
              </p>

              <!-- Botão CTA -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #84CC16; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(132, 204, 22, 0.25);">
                      Confirmar Novo Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 24px 0 0 0; font-size: 13px; color: #6B7280; text-align: center; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; text-align: center; word-break: break-all; line-height: 1.5;">
                <a href="{{ .ConfirmationURL }}" style="color: #65A30D; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>

              <!-- Divider -->
              <div style="margin: 32px 0; height: 1px; background-color: #E5E7EB;"></div>

              <!-- Aviso -->
              <p style="margin: 0; font-size: 13px; color: #6B7280; text-align: center; line-height: 1.6;">
                Se você não solicitou esta mudança, ignore este email. Seu email atual permanece válido até a confirmação.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 32px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;">
                Precisa de ajuda? Entre em contato conosco
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="mailto:stageone2026@gmail.com" style="color: #65A30D; text-decoration: none; font-weight: 600; font-size: 13px;">
                  stageone2026@gmail.com
                </a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                © 2025 StageOne™. Todos os direitos reservados.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #9CA3AF;">
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
```

---

## 5. Ticket Confirmation - Confirmação de Ingresso

### Subject (Assunto):
```
Confirmação de Inscrição - {{EVENT_NAME}}
```

### HTML Template:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Inscrição</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F3F4F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Container Principal -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Logo Header -->
          <tr>
            <td style="padding: 40px 40px 32px 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
                <span style="font-weight: 300;">Stage</span><span style="font-weight: 700;">One</span><sup style="font-size: 14px; vertical-align: top; position: relative; top: -0.5em; font-weight: 400;">™</sup>
              </h1>
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 2px;">
                Plataforma de Eventos
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">

              <!-- Badge de Confirmação -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #ECFCCB; border: 2px solid #84CC16; border-radius: 8px; padding: 12px 24px;">
                  <table role="presentation" style="display: inline-table;">
                    <tr>
                      <td style="vertical-align: middle; padding-right: 6px;">
                        <svg style="width: 16px; height: 16px; color: #3F6212;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </td>
                      <td style="vertical-align: middle;">
                        <span style="color: #3F6212; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Inscrição Confirmada</span>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Título -->
              <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
                Olá, {{PARTICIPANT_NAME}}!
              </h2>

              <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; text-align: center; line-height: 1.6;">
                Sua inscrição foi confirmada com sucesso. Estamos animados para te ver no evento!
              </p>

              <!-- Detalhes do Evento -->
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Detalhes do Evento
                </p>

                <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: #111827;">
                  {{EVENT_TITLE}}
                </p>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #6B7280;">
                  {{EVENT_SUBTITLE}}
                </p>

                <table style="width: 100%; margin-bottom: 16px;">
                  <tr>
                    <td style="padding: 8px 0; width: 50%;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280; font-weight: 600;">Data</p>
                      <p style="margin: 0; font-size: 14px; color: #111827; font-weight: 600;">{{EVENT_DATE}}</p>
                    </td>
                    <td style="padding: 8px 0; width: 50%;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280; font-weight: 600;">Horário</p>
                      <p style="margin: 0; font-size: 14px; color: #111827; font-weight: 600;">{{EVENT_TIME}}</p>
                    </td>
                  </tr>
                </table>

                <div style="border-top: 1px solid #E5E7EB; padding-top: 16px;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280; font-weight: 600;">Local</p>
                  <p style="margin: 0 0 2px 0; font-size: 14px; color: #111827; font-weight: 600;">{{LOCATION_NAME}}</p>
                  <p style="margin: 0; font-size: 13px; color: #6B7280;">{{LOCATION_ADDRESS}}</p>
                </div>
              </div>

              <!-- QR Code -->
              <div style="background-color: #FAFAFA; border: 2px dashed #D1D5DB; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #374151; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Seu QR Code de Acesso
                </p>
                <img src="{{QR_CODE_URL}}" alt="QR Code" style="max-width: 180px; width: 100%; height: auto; margin: 0 auto 16px; display: block;" />
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #6B7280; font-weight: 600;">ID do Ingresso</p>
                <p style="margin: 0; font-size: 13px; color: #111827; font-weight: 700; font-family: 'Courier New', monospace;">{{TICKET_ID}}</p>
              </div>

              <!-- Informações Importantes -->
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-left: 4px solid #84CC16; padding: 20px; margin-bottom: 24px; border-radius: 6px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="vertical-align: top; padding-right: 12px; width: 24px;">
                      <svg style="width: 20px; height: 20px; color: #65A30D; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </td>
                    <td>
                      <p style="margin: 0 0 12px 0; font-size: 13px; color: #3F6212; font-weight: 700;">
                        Informações Importantes
                      </p>
                      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #374151; line-height: 1.8;">
                        <li style="margin-bottom: 6px;">Chegue com 15 minutos de antecedência</li>
                        <li style="margin-bottom: 6px;">Traga um documento com foto para identificação</li>
                        <li>Este ingresso é pessoal e intransferível</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Botão CTA -->
              <table role="presentation" style="width: 100%; margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="{{APP_URL}}/meus-ingressos" style="display: inline-block; background-color: #84CC16; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(132, 204, 22, 0.25);">
                      Ver Meus Ingressos
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 32px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;">
                Precisa de ajuda? Entre em contato conosco
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="mailto:stageone2026@gmail.com" style="color: #65A30D; text-decoration: none; font-weight: 600; font-size: 13px;">
                  stageone2026@gmail.com
                </a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                © 2025 StageOne™. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Características dos Templates

### Modo Claro
- ✅ Fundo branco (#FFFFFF)
- ✅ Background cinza claro (#F3F4F6)
- ✅ Texto escuro (#111827, #4B5563)
- ✅ Tipografia clean e moderna
- ✅ Botões em verde escuro (#84CC16) para melhor contraste
- ✅ Links em verde escuro (#65A30D)
- ✅ Bordas e divisores sutis
- ✅ Sem emojis - apenas ícones SVG profissionais
- ✅ Cards de informação em tons de cinza (#F9FAFB)

### Design Pattern
- Logo no topo (sem background colorido)
- Título centralizado
- Mensagem clara e objetiva
- Botão CTA destacado com texto branco
- Link alternativo para acessibilidade
- Avisos em cards cinza com ícones SVG
- Ícones utilizando tabelas para compatibilidade com clientes de email
- Footer cinza claro
- Mobile responsive
- Email de suporte: stageone2026@gmail.com

### Cores Utilizadas
- **Primary (Buttons)**: #84CC16 (darker green for light mode)
- **Primary (Links)**: #65A30D (darker green for links)
- **Primary (Accents)**: #3F6212 (text on green backgrounds)
- **Text**: #111827, #4B5563, #6B7280, #374151
- **Background**: #FFFFFF, #F3F4F6, #F9FAFB
- **Success**: #ECFCCB (light green), #3F6212 (dark green)
- **Borders**: #E5E7EB, #D1D5DB
- **Icon Colors**: #6B7280 (gray), #65A30D (green)

