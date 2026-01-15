import { Certificate, CertificateTemplate } from '@/types/database.types'

/**
 * Gera HTML do certificado baseado no template
 * Este HTML pode ser convertido para PDF via Puppeteer, html2canvas, ou similar
 */
export function generateCertificateHTML(
  certificate: Certificate,
  template: CertificateTemplate
): string {
  const config = template.template_config
  const texts = config.text_sections

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `https://stageone.com.br/validar-certificado/${certificate.validation_token}`
  )}`

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificado - ${certificate.participant_name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${config.font_family}, sans-serif;
      background: ${config.background_color};
      color: #FFFFFF;
      width: 297mm; /* A4 landscape width */
      height: 210mm; /* A4 landscape height */
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    ${config.background_image_url ? `
    body::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url('${config.background_image_url}');
      background-size: cover;
      background-position: center;
      opacity: 0.1;
      z-index: 0;
    }
    ` : ''}

    .certificate {
      width: 100%;
      height: 100%;
      padding: 60px 80px;
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }

    ${config.show_border ? `
    .certificate::before {
      content: '';
      position: absolute;
      inset: 20px;
      border: 3px solid ${config.primary_color};
      ${config.border_style === 'neon' ? `
        box-shadow:
          0 0 10px ${config.primary_color}40,
          inset 0 0 10px ${config.primary_color}20;
      ` : ''}
      border-radius: 8px;
      z-index: -1;
    }
    ` : ''}

    .header {
      text-align: center;
      width: 100%;
    }

    ${config.show_logo && config.logo_url ? `
    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 20px;
    }
    ` : ''}

    .title {
      font-size: 48px;
      font-weight: 800;
      color: ${config.primary_color};
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 10px;
      text-shadow: 0 0 20px ${config.primary_color}60;
    }

    .subtitle {
      font-size: 18px;
      color: #FFFFFF90;
      font-weight: 400;
      letter-spacing: 2px;
    }

    .content {
      text-align: center;
      max-width: 800px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 24px;
    }

    .prefix {
      font-size: 20px;
      color: #FFFFFF80;
      font-weight: 400;
    }

    .participant-name {
      font-size: 42px;
      font-weight: 700;
      color: ${config.primary_color};
      margin: 16px 0;
      padding: 16px 32px;
      background: ${config.primary_color}15;
      border: 2px solid ${config.primary_color}30;
      border-radius: 8px;
      display: inline-block;
    }

    .event-info {
      font-size: 24px;
      color: #FFFFFF;
      line-height: 1.6;
      font-weight: 600;
    }

    .event-title {
      color: ${config.accent_color || config.primary_color};
      font-weight: 700;
    }

    .details {
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-top: 24px;
      flex-wrap: wrap;
    }

    .detail-item {
      text-align: center;
    }

    .detail-label {
      font-size: 14px;
      color: #FFFFFF60;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .detail-value {
      font-size: 20px;
      color: ${config.primary_color};
      font-weight: 700;
    }

    .footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 40px;
    }

    .signatures {
      flex: 1;
      display: flex;
      justify-content: center;
      gap: 80px;
    }

    .signature {
      text-align: center;
    }

    .signature-line {
      width: 200px;
      height: 2px;
      background: ${config.primary_color}40;
      margin-bottom: 8px;
    }

    .signature-name {
      font-size: 14px;
      color: #FFFFFF;
      font-weight: 600;
    }

    .signature-title {
      font-size: 12px;
      color: #FFFFFF60;
    }

    ${config.show_qr_code ? `
    .qr-section {
      text-align: center;
    }

    .qr-code {
      width: 100px;
      height: 100px;
      border: 2px solid ${config.primary_color}40;
      border-radius: 4px;
      padding: 4px;
      background: #FFFFFF;
    }

    .qr-label {
      font-size: 10px;
      color: #FFFFFF60;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }

    .validation-token {
      font-size: 9px;
      color: #FFFFFF40;
      margin-top: 2px;
      font-family: monospace;
    }
    ` : ''}

    .footer-text {
      font-size: 12px;
      color: #FFFFFF60;
      text-align: center;
      width: 100%;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      ${config.show_logo && config.logo_url ? `<img src="${config.logo_url}" alt="Logo" class="logo">` : ''}
      <h1 class="title">${texts.title}</h1>
      <p class="subtitle">StageOne™ - Plataforma de Eventos</p>
    </div>

    <div class="content">
      <p class="prefix">${texts.participant_prefix}</p>
      <div class="participant-name">${certificate.participant_name}</div>
      <p class="event-info">
        ${texts.event_prefix}<br>
        <span class="event-title">${certificate.event_title}</span>
      </p>

      <div class="details">
        <div class="detail-item">
          <div class="detail-label">Carga Horária</div>
          <div class="detail-value">${certificate.event_hours}h</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Data de Realização</div>
          <div class="detail-value">${new Date(certificate.completion_date).toLocaleDateString('pt-BR')}</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="signatures">
        ${config.signature_sections?.map(sig => `
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-name">${sig.name}</div>
            <div class="signature-title">${sig.title}</div>
          </div>
        `).join('') || ''}
      </div>

      ${config.show_qr_code ? `
      <div class="qr-section">
        <img src="${qrCodeUrl}" alt="QR Code" class="qr-code">
        <div class="qr-label">Validar Certificado</div>
        <div class="validation-token">${certificate.validation_token.substring(0, 16)}...</div>
      </div>
      ` : ''}
    </div>

    ${texts.footer ? `<div class="footer-text">${texts.footer}</div>` : ''}
  </div>
</body>
</html>
  `.trim()

  return html
}

/**
 * Gera um token único para validação do certificado
 */
export function generateValidationToken(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const randomPart2 = Math.random().toString(36).substring(2, 15)
  return `CERT-${timestamp}-${randomPart}${randomPart2}`.toUpperCase()
}
