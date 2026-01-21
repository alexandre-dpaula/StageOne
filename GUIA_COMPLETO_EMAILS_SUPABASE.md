# 📧 Guia Completo - Templates de Email StageOne

Este guia contém TODOS os templates de email necessários para configurar no Supabase Dashboard.

**IMPORTANTE**: Todos os templates usam APENAS as cores oficiais do StageOne:
- Primary: `#C4F82A` (verde lima)
- Background: `#0A0B0D` (preto)
- Grayscale: tons de cinza

---

## 📋 Índice

1. [Reset Password](#1-reset-password---redefinição-de-senha)
2. [Confirm Signup](#2-confirm-signup---confirmação-de-cadastro)
3. [Magic Link](#3-magic-link---login-sem-senha)
4. [Change Email](#4-change-email---mudança-de-email)

---

## 🚀 Como Configurar

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **StageOne**
3. Menu lateral: **Authentication** → **Email Templates**
4. Para cada template:
   - Selecione o template
   - Configure **Subject** (Assunto)
   - Cole o **HTML** no editor
   - Clique em **Save**

---

## 1. Reset Password - Redefinição de Senha

### Subject (Assunto):
```
Redefinição de Senha - StageOne
```

### HTML Template:

```html
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
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1b1e 0%, #0f1012 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">

          <!-- Header -->
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

              <!-- Ícone -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(196, 248, 42, 0.1); border: 2px solid rgba(196, 248, 42, 0.3); border-radius: 50%; margin-bottom: 24px;">
                  <svg style="width: 40px; height: 40px; color: #C4F82A;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h2 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                  Redefinição de Senha
                </h2>
                <p style="margin: 16px 0 0; font-size: 16px; color: #9CA3AF; line-height: 1.6;">
                  Recebemos uma solicitação para redefinir a senha da sua conta.
                </p>
              </div>

              <!-- Card Principal -->
              <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 36px; margin-bottom: 32px;">
                <p style="margin: 0 0 24px; font-size: 15px; color: #E5E7EB; line-height: 1.7; text-align: center;">
                  Para criar uma nova senha, clique no botão abaixo:
                </p>

                <!-- Botão CTA -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="{{ .ConfirmationURL }}" style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #C4F82A 0%, #9FD122 100%); color: #0A0B0D; text-decoration: none; padding: 18px 40px; border-radius: 14px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(196, 248, 42, 0.35);">
                    <span>Redefinir Senha</span>
                    <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </a>
                </div>

                <!-- Link alternativo -->
                <p style="margin: 24px 0 0; font-size: 13px; color: #6B7280; line-height: 1.7; text-align: center;">
                  Ou copie e cole este link no seu navegador:
                </p>
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 14px; margin-top: 12px; word-break: break-all;">
                  <a href="{{ .ConfirmationURL }}" style="color: #C4F82A; text-decoration: none; font-size: 12px; opacity: 0.9;">
                    {{ .ConfirmationURL }}
                  </a>
                </div>
              </div>

              <!-- Avisos de Segurança -->
              <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 24px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                  <svg style="width: 20px; height: 20px; color: #FCA5A5; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <p style="margin: 0; font-size: 14px; color: #FCA5A5; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    Informações de Segurança
                  </p>
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #E5E7EB; line-height: 1.9;">
                  <li>Este link expira em <strong style="color: #FCA5A5;">1 hora</strong> por segurança</li>
                  <li>Se você não solicitou esta redefinição, ignore este e-mail</li>
                  <li>Nunca compartilhe este link com outras pessoas</li>
                  <li>Sua senha atual permanece válida até você definir uma nova</li>
                </ul>
              </div>

              <!-- Dica de Senha Forte -->
              <div style="background: rgba(196, 248, 42, 0.08); border: 1px solid rgba(196, 248, 42, 0.25); border-radius: 14px; padding: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                  <svg style="width: 20px; height: 20px; color: #C4F82A; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <p style="margin: 0; font-size: 14px; color: #C4F82A; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    Dica: Crie uma senha forte
                  </p>
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #D1D5DB; line-height: 1.9;">
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
                <a href="mailto:suporte@stageone.com" style="color: #C4F82A; text-decoration: none; font-weight: 600;">
                  suporte@stageone.com
                </a>
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #4B5563;">
                © 2025 StageOne™. Todos os direitos reservados.
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
```

---

## 2. Confirm Signup - Confirmação de Cadastro

### Subject (Assunto):
```
Bem-vindo ao StageOne - Confirme seu Email
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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0B0D; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1b1e 0%, #0f1012 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">

          <!-- Header -->
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

              <!-- Ícone de Boas-vindas -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(196, 248, 42, 0.1); border: 2px solid rgba(196, 248, 42, 0.3); border-radius: 50%; margin-bottom: 24px;">
                  <svg style="width: 40px; height: 40px; color: #C4F82A;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path>
                  </svg>
                </div>
                <h2 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                  Bem-vindo ao StageOne!
                </h2>
                <p style="margin: 0; font-size: 16px; color: #9CA3AF; line-height: 1.6;">
                  Estamos felizes em ter você conosco
                </p>
              </div>

              <!-- Card Principal -->
              <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 36px; margin-bottom: 32px;">
                <p style="margin: 0 0 24px; font-size: 15px; color: #E5E7EB; line-height: 1.7; text-align: center;">
                  Para começar a usar a plataforma e garantir a segurança da sua conta, precisamos confirmar seu endereço de email.
                </p>

                <!-- Botão CTA -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="{{ .ConfirmationURL }}" style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #C4F82A 0%, #9FD122 100%); color: #0A0B0D; text-decoration: none; padding: 18px 40px; border-radius: 14px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(196, 248, 42, 0.35);">
                    <span>Confirmar Email</span>
                    <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </a>
                </div>

                <!-- Link alternativo -->
                <p style="margin: 24px 0 0; font-size: 13px; color: #6B7280; line-height: 1.7; text-align: center;">
                  Ou copie e cole este link no seu navegador:
                </p>
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 14px; margin-top: 12px; word-break: break-all;">
                  <a href="{{ .ConfirmationURL }}" style="color: #C4F82A; text-decoration: none; font-size: 12px; opacity: 0.9;">
                    {{ .ConfirmationURL }}
                  </a>
                </div>
              </div>

              <!-- O que você pode fazer -->
              <div style="background: rgba(196, 248, 42, 0.08); border: 1px solid rgba(196, 248, 42, 0.25); border-radius: 14px; padding: 24px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                  <svg style="width: 20px; height: 20px; color: #C4F82A; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                  <p style="margin: 0; font-size: 14px; color: #C4F82A; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    O que você pode fazer no StageOne
                  </p>
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #D1D5DB; line-height: 1.9;">
                  <li>Descobrir eventos e treinamentos presenciais incríveis</li>
                  <li>Comprar ingressos de forma rápida e segura</li>
                  <li>Gerenciar todos os seus ingressos em um só lugar</li>
                  <li>Receber atualizações sobre novos eventos</li>
                </ul>
              </div>

              <!-- Aviso de Segurança -->
              <div style="background: rgba(107, 114, 128, 0.15); border: 1px solid rgba(107, 114, 128, 0.3); border-radius: 14px; padding: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <svg style="width: 18px; height: 18px; color: #9CA3AF; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <p style="margin: 0; font-size: 13px; color: #D1D5DB; font-weight: 600;">
                    Segurança
                  </p>
                </div>
                <p style="margin: 0; font-size: 13px; color: #9CA3AF; line-height: 1.7;">
                  Se você não criou uma conta no StageOne, por favor ignore este email. Nenhuma conta será ativada sem a confirmação do email.
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
                <a href="mailto:suporte@stageone.com" style="color: #C4F82A; text-decoration: none; font-weight: 600;">
                  suporte@stageone.com
                </a>
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #4B5563;">
                © 2025 StageOne™. Todos os direitos reservados.
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
```

---

## 3. Magic Link - Login sem Senha

### Subject (Assunto):
```
Seu Link de Acesso ao StageOne
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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0B0D; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1b1e 0%, #0f1012 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">

          <!-- Header -->
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

              <!-- Ícone -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(196, 248, 42, 0.1); border: 2px solid rgba(196, 248, 42, 0.3); border-radius: 50%; margin-bottom: 24px;">
                  <svg style="width: 40px; height: 40px; color: #C4F82A;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                  </svg>
                </div>
                <h2 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                  Seu Link de Acesso
                </h2>
                <p style="margin: 16px 0 0; font-size: 16px; color: #9CA3AF; line-height: 1.6;">
                  Clique no botão abaixo para acessar sua conta
                </p>
              </div>

              <!-- Card Principal -->
              <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 36px; margin-bottom: 32px;">
                <!-- Botão CTA -->
                <div style="text-align: center; margin: 24px 0;">
                  <a href="{{ .ConfirmationURL }}" style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #C4F82A 0%, #9FD122 100%); color: #0A0B0D; text-decoration: none; padding: 18px 40px; border-radius: 14px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(196, 248, 42, 0.35);">
                    <span>Acessar StageOne</span>
                    <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </a>
                </div>

                <!-- Link alternativo -->
                <p style="margin: 24px 0 0; font-size: 13px; color: #6B7280; line-height: 1.7; text-align: center;">
                  Ou copie e cole este link no seu navegador:
                </p>
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 14px; margin-top: 12px; word-break: break-all;">
                  <a href="{{ .ConfirmationURL }}" style="color: #C4F82A; text-decoration: none; font-size: 12px; opacity: 0.9;">
                    {{ .ConfirmationURL }}
                  </a>
                </div>
              </div>

              <!-- Avisos -->
              <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                  <svg style="width: 20px; height: 20px; color: #FCA5A5; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <p style="margin: 0; font-size: 14px; color: #FCA5A5; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    Importante
                  </p>
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #E5E7EB; line-height: 1.9;">
                  <li>Este link expira em <strong style="color: #FCA5A5;">5 minutos</strong></li>
                  <li>Se você não solicitou este acesso, ignore este email</li>
                  <li>Nunca compartilhe este link com outras pessoas</li>
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
                <a href="mailto:suporte@stageone.com" style="color: #C4F82A; text-decoration: none; font-weight: 600;">
                  suporte@stageone.com
                </a>
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #4B5563;">
                © 2025 StageOne™. Todos os direitos reservados.
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
```

---

## 4. Change Email - Mudança de Email

### Subject (Assunto):
```
Confirme seu Novo Email - StageOne
```

### HTML Template:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu Novo Email - StageOne</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0B0D; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1b1e 0%, #0f1012 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">

          <!-- Header -->
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

              <!-- Ícone -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(196, 248, 42, 0.1); border: 2px solid rgba(196, 248, 42, 0.3); border-radius: 50%; margin-bottom: 24px;">
                  <svg style="width: 40px; height: 40px; color: #C4F82A;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h2 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                  Confirme seu Novo Email
                </h2>
                <p style="margin: 16px 0 0; font-size: 16px; color: #9CA3AF; line-height: 1.6;">
                  Você solicitou a mudança do email da sua conta
                </p>
              </div>

              <!-- Card Principal -->
              <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 36px; margin-bottom: 32px;">
                <p style="margin: 0 0 24px; font-size: 15px; color: #E5E7EB; line-height: 1.7; text-align: center;">
                  Para confirmar a mudança de email, clique no botão abaixo:
                </p>

                <!-- Botão CTA -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="{{ .ConfirmationURL }}" style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #C4F82A 0%, #9FD122 100%); color: #0A0B0D; text-decoration: none; padding: 18px 40px; border-radius: 14px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(196, 248, 42, 0.35);">
                    <span>Confirmar Novo Email</span>
                    <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </a>
                </div>

                <!-- Link alternativo -->
                <p style="margin: 24px 0 0; font-size: 13px; color: #6B7280; line-height: 1.7; text-align: center;">
                  Ou copie e cole este link no seu navegador:
                </p>
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 14px; margin-top: 12px; word-break: break-all;">
                  <a href="{{ .ConfirmationURL }}" style="color: #C4F82A; text-decoration: none; font-size: 12px; opacity: 0.9;">
                    {{ .ConfirmationURL }}
                  </a>
                </div>
              </div>

              <!-- Aviso de Segurança -->
              <div style="background: rgba(107, 114, 128, 0.15); border: 1px solid rgba(107, 114, 128, 0.3); border-radius: 14px; padding: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                  <svg style="width: 20px; height: 20px; color: #9CA3AF; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <p style="margin: 0; font-size: 14px; color: #D1D5DB; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    Segurança
                  </p>
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #9CA3AF; line-height: 1.9;">
                  <li>Se você não solicitou esta mudança, ignore este email</li>
                  <li>Seu email atual permanece válido até a confirmação</li>
                  <li>Nunca compartilhe este link com outras pessoas</li>
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
                <a href="mailto:suporte@stageone.com" style="color: #C4F82A; text-decoration: none; font-weight: 600;">
                  suporte@stageone.com
                </a>
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #4B5563;">
                © 2025 StageOne™. Todos os direitos reservados.
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
```

---

## ✅ Checklist de Configuração

- [ ] Reset Password configurado
- [ ] Confirm Signup configurado
- [ ] Magic Link configurado
- [ ] Change Email configurado
- [ ] Redirect URLs adicionadas no Supabase
- [ ] Testar cada template enviando email real

---

## 🎨 Paleta de Cores Oficial

**IMPORTANTE**: Use APENAS estas cores:

- **Primary**: `#C4F82A` (verde lima)
- **Primary Hover**: `#9FD122` (verde escuro)
- **Background**: `#0A0B0D` (preto)
- **Foreground**: `#FFFFFF` (branco)
- **Gray-50**: `#F9FAFB`
- **Gray-100**: `#F3F4F6`
- **Gray-200**: `#E5E7EB`
- **Gray-300**: `#D1D5DB`
- **Gray-400**: `#9CA3AF`
- **Gray-500**: `#6B7280`
- **Gray-600**: `#4B5563`
- **Gray-700**: `#374151`
- **Gray-800**: `#1F2937`
- **Gray-900**: `#111827`
- **Red (avisos)**: `#EF4444`, `#FCA5A5`

**❌ NÃO use**: Azul, roxo, laranja (exceto para avisos), rosa, ou qualquer cor secundária

---

## 📝 Notas Finais

1. **Logo atualizado**: Fonte weight 300 para "Stage" e 700 para "One"
2. **Sem cores secundárias**: Removido azul (#60A5FA) de todos os templates
3. **Consistência visual**: Todos os templates seguem o mesmo padrão de design
4. **Responsivo**: Funciona perfeitamente em mobile e desktop
5. **Acessível**: Contraste adequado e estrutura semântica

