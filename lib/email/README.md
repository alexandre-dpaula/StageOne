# 📧 Sistema de Envio de Emails - StageOne

Sistema automatizado de envio de emails de confirmação para participantes de eventos.

## 🎯 Funcionalidades

- ✅ Email de confirmação de inscrição com QR Code
- ✅ Template HTML responsivo e moderno
- ✅ Geração automática de QR Code
- ✅ Formatação de dados em português
- ✅ Suporte a Resend ou SMTP genérico

## 📋 Quando os Emails São Enviados

Os emails são enviados automaticamente quando:
1. Um participante completa a inscrição em um evento
2. O pagamento é confirmado (simulado atualmente)
3. O ticket é criado no banco de dados

## 🎨 Conteúdo do Email

O email inclui:
- **Header com branding** (logo e nome da plataforma)
- **Mensagem de confirmação** personalizada
- **Detalhes do evento**:
  - Título e subtítulo
  - Data e horário formatados
  - Local e endereço
  - Tipo de ingresso e valor
- **QR Code** para check-in
- **ID do ticket** para referência
- **Informações importantes** e dicas
- **Botão CTA** para acessar ingressos
- **Footer** com suporte e informações legais

## 🚀 Configuração

### Opção 1: Resend (Recomendado)

1. Crie uma conta em [resend.com](https://resend.com)
2. Verifique seu domínio
3. Obtenha sua API Key
4. Adicione ao `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Opção 2: SMTP Genérico

Para usar Gmail, SendGrid, Mailgun, etc:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Nota para Gmail:**
1. Ative "Verificação em 2 etapas"
2. Gere uma "Senha de app" em [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use essa senha em `SMTP_PASS`

## 📝 Modo de Desenvolvimento

Se nenhuma configuração de email estiver presente, o sistema irá:
- ✅ Continuar funcionando normalmente
- 📝 Logar os detalhes do email no console
- ⚠️ NÃO enviar emails reais

Isso permite testar sem configurar um provedor de email.

## 🧪 Testando

Para testar o envio de emails:

1. Configure suas credenciais no `.env.local`
2. Faça uma inscrição em um evento
3. Verifique o console para logs
4. Verifique o email do participante

## 📂 Estrutura de Arquivos

```
lib/email/
├── templates/
│   └── ticket-confirmation.ts    # Template HTML do email
├── send-ticket-email.ts           # Lógica de envio
└── README.md                      # Esta documentação
```

## 🎨 Personalizando o Template

Para personalizar o email, edite:
```typescript
lib/email/templates/ticket-confirmation.ts
```

Você pode modificar:
- Cores e estilos
- Conteúdo e textos
- Layout e estrutura
- Adicionar mais seções

## 🔧 Funções Disponíveis

### `sendTicketConfirmationEmail(params)`
Envia o email de confirmação para o participante.

```typescript
await sendTicketConfirmationEmail({
  to: 'participante@email.com',
  participantName: 'João Silva',
  eventTitle: 'Workshop de React',
  eventSubtitle: 'Aprenda React do zero',
  eventDate: 'Segunda-feira, 15 de Janeiro de 2024',
  eventTime: '19:00',
  locationName: 'Centro de Convenções',
  locationAddress: 'Av. Paulista, 1000',
  ticketTypeName: 'Ingresso VIP',
  ticketPrice: 'R$ 150,00',
  qrCodeUrl: 'https://...',
  ticketId: 'abc123'
})
```

### `generateQRCodeUrl(ticketId)`
Gera URL do QR Code usando API pública.

```typescript
const qrUrl = generateQRCodeUrl('ticket-uuid')
// Retorna: https://api.qrserver.com/v1/create-qr-code/?...
```

### `formatEventDate(dateString)`
Formata data em português.

```typescript
formatEventDate('2024-01-15T19:00:00')
// Retorna: "Segunda-feira, 15 de Janeiro de 2024"
```

### `formatEventTime(dateString)`
Formata hora.

```typescript
formatEventTime('2024-01-15T19:00:00')
// Retorna: "19:00"
```

### `formatPrice(price)`
Formata preço em Real.

```typescript
formatPrice(150)
// Retorna: "R$ 150,00"

formatPrice(0)
// Retorna: "Gratuito"
```

## 🐛 Troubleshooting

### Email não está sendo enviado

1. Verifique se `RESEND_API_KEY` está configurado
2. Verifique os logs do console para erros
3. Teste a API key diretamente

### QR Code não aparece

1. Verifique se a URL do QR Code está sendo gerada
2. Teste a URL diretamente no navegador
3. Verifique se o serviço `qrserver.com` está online

### Formatação quebrada

1. Teste o email em diferentes clientes
2. Valide o HTML
3. Verifique estilos inline

## 📧 Provedores Recomendados

| Provedor | Gratuito | Emails/mês | Dificuldade |
|----------|----------|------------|-------------|
| Resend | ✅ Sim | 3,000 | ⭐ Fácil |
| SendGrid | ✅ Sim | 100/dia | ⭐⭐ Médio |
| Mailgun | ✅ Sim | 5,000 | ⭐⭐ Médio |
| Gmail | ✅ Sim | 500/dia | ⭐⭐⭐ Difícil |

## 🔐 Segurança

- ✅ Nunca commite arquivos `.env.local`
- ✅ Use variáveis de ambiente
- ✅ Não exponha API keys no frontend
- ✅ Valide dados antes de enviar emails

## 📚 Recursos

- [Resend Documentation](https://resend.com/docs)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/)
