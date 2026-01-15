# 🚀 Recursos Faltantes - Roadmap StageOne

Análise comparativa entre StageOne e plataformas concorrentes (Sympla, Eventbrite, Ticket Tailor, Eventim).

**Data da Análise:** 13 de Dezembro de 2025

---

## 📊 RECURSOS JÁ IMPLEMENTADOS NO STAGEONE

✅ **Gestão de Eventos Completa** - Criar, editar, publicar, excluir eventos
✅ **Múltiplos Tipos de Ingressos** - Lotes, preços, quantidades
✅ **Sistema de Check-in com QR Code** - Scan via câmera + entrada manual
✅ **Emails Automáticos** - Confirmação de compra com QR Code
✅ **Push Notifications** - Firebase Cloud Messaging
✅ **Dashboard Admin** - Gestão de eventos e usuários
✅ **Reserva de Espaços** - Sistema de orçamento e booking
✅ **Relatórios Básicos** - Lista de participantes, taxa de check-in
✅ **Design Responsivo** - Mobile-first, PWA-ready
✅ **Categorias de Eventos** - 8 categorias diferentes
✅ **Busca de Eventos** - Por título/palavras-chave
✅ **Google Maps** - Integração para localização
✅ **Upload de Imagens** - Banner e cover via Supabase Storage
✅ **Módulos/Currículo** - Estruturação de conteúdo do evento

---

## ❌ RECURSOS QUE FALTAM (Presentes em Sympla/Eventbrite)

### 🎟️ **1. VENDAS E INGRESSOS**

#### 🔴 **ALTA PRIORIDADE**

- [ ] **Assentos Numerados** (Sympla, Eventbrite)
  - Mapa de assentos interativo
  - Seleção de poltronas específicas
  - Setores e preços por área
  - Geração automática de layout de auditório
  - **Arquivos Afetados:** `/components/SeatMapEditor.tsx`, `/app/evento/[slug]/page.tsx`

- [ ] **Lotes Automáticos com Progressão** (Sympla)
  - Mudança automática de lote por data
  - Mudança automática por quantidade vendida
  - Agendamento de preços futuros
  - Contagem regressiva de lote
  - **Arquivos Afetados:** `/types/database.types.ts` (adicionar campos de lote), `/components/EventForm.tsx`

- [ ] **Desconto e Cupons Promocionais** (Ticket Tailor, Eventbrite)
  - Códigos de desconto personalizados
  - Desconto por percentual ou valor fixo
  - Limite de uso por cupom
  - Expiração de cupons
  - Tracking de origem de vendas por cupom
  - **Arquivos Novos:** `/app/api/coupons/`, `/lib/discount-calculator.ts`

- [ ] **Métodos de Pagamento Múltiplos** (Sympla, Eventbrite)
  - Boleto bancário (atualmente não implementado)
  - PIX (não implementado)
  - Cartão de crédito (parcialmente implementado)
  - Parcelamento em várias vezes
  - Split de pagamento (múltiplos organizadores)
  - **Arquivos Afetados:** `/app/checkout/[eventId]/[ticketTypeId]/page.tsx`, nova integração com gateway

- [ ] **Certificação PCI Compliance** (Sympla)
  - Compliance com padrões de segurança de cartões
  - Tokenização de dados de pagamento
  - Não armazenar dados sensíveis
  - **Impacto:** Arquitetura de pagamentos, infraestrutura

#### 🟡 **MÉDIA PRIORIDADE**

- [ ] **Vendas em Lote (Bulk Sales)** (Eventbrite)
  - Compra de múltiplos ingressos de uma vez
  - Desconto por quantidade
  - **Arquivos Afetados:** `/app/checkout/[eventId]/[ticketTypeId]/page.tsx`

- [ ] **Ingresso Cortesia/Gratuito** (Sympla)
  - Tipo de ingresso R$ 0,00
  - Código especial para ativação
  - Relatório de cortesias separado
  - **Arquivos Afetados:** `/components/EventForm.tsx`, ticket_types table

- [ ] **Ingresso Meia-Entrada** (Sympla)
  - Validação de documentação no check-in
  - Campos extras para comprovante
  - **Arquivos Afetados:** Formulário de checkout, tickets table

- [ ] **Venda de Produtos Extra no Checkout** (Ticket Tailor)
  - Merchandising (camisetas, copos, etc)
  - Upgrades de ingressos
  - Adicionar ao carrinho junto com ingresso
  - **Arquivos Novos:** `/app/api/products/`, tabela `products`

- [ ] **Lista de Espera (Waitlist)** (Eventbrite)
  - Inscrição quando evento esgotado
  - Notificação automática se vaga abrir
  - Prioridade de compra
  - **Arquivos Novos:** `/app/api/waitlist/`, tabela `waitlists`

---

### 📈 **2. MARKETING E PROMOÇÃO**

#### 🔴 **ALTA PRIORIDADE**

- [ ] **Integração com Google Analytics** (Sympla, Eventbrite)
  - Tracking de conversão
  - Funil de vendas
  - Origem de tráfego
  - **Arquivos Afetados:** `/app/layout.tsx`, analytics script

- [ ] **Integração com Meta Pixel (Facebook/Instagram)** (Sympla, Eventbrite)
  - Tracking de eventos (ViewContent, Purchase)
  - Remarketing
  - Lookalike audiences
  - **Arquivos Afetados:** `/app/layout.tsx`, pixel script

- [ ] **Links de Rastreamento de Afiliados** (Ticket Tailor)
  - UTM parameters automáticos
  - Dashboard de origem de vendas
  - Comissão por afiliado
  - **Arquivos Novos:** `/app/api/affiliates/`, tracking system

- [ ] **Compartilhamento em Redes Sociais Direto** (Eventbrite)
  - Botões de share (Facebook, Instagram, WhatsApp, Twitter)
  - Open Graph tags otimizadas
  - Preview cards customizados
  - **Arquivos Afetados:** `/app/evento/[slug]/page.tsx`, meta tags

#### 🟡 **MÉDIA PRIORIDADE**

- [ ] **Email Marketing Integrado** (Sympla via RD Station)
  - Integração com MailChimp
  - Integração com RD Station
  - Sync de participantes para lista
  - Campanhas automáticas
  - **Arquivos Novos:** `/lib/integrations/mailchimp.ts`

- [ ] **Landing Page Customizável** (Eventbrite)
  - Editor drag-and-drop para página do evento
  - Templates prontos
  - SEO customizável
  - **Arquivos Afetados:** `/app/evento/[slug]/page.tsx` com editor

- [ ] **Widget de Venda para Site Externo** (Sympla, Eventbrite)
  - Embed code para vender no seu site
  - iFrame responsivo
  - Botão de compra direto
  - **Arquivos Novos:** `/app/api/embed/`, widget JavaScript

---

### 📊 **3. RELATÓRIOS E ANALYTICS**

#### 🔴 **ALTA PRIORIDADE**

- [ ] **Dashboard de Vendas em Tempo Real** (Sympla, Eventbrite)
  - Gráfico de vendas por dia/hora
  - Receita acumulada
  - Taxa de conversão
  - Previsão de lotação
  - **Arquivos Novos:** `/app/painel/admin/eventos/[eventId]/analytics/page.tsx`

- [ ] **Relatórios Financeiros Detalhados** (Sympla)
  - Receita por tipo de ingresso
  - Taxas da plataforma
  - Valores a receber/recebidos
  - Exportação para Excel/PDF
  - **Arquivos Novos:** `/app/painel/admin/financeiro/page.tsx`

- [ ] **Exportação de Dados (CSV/Excel)** (Eventbrite, Ticket Tailor)
  - Lista de participantes exportável
  - Dados de vendas exportáveis
  - Relatório de check-ins
  - **Arquivos Novos:** `/app/api/export/participants`, `/app/api/export/sales`

#### 🟡 **MÉDIA PRIORIDADE**

- [ ] **Mais de 15 Tipos de Relatórios** (Eventbrite)
  - Vendas por canal
  - Vendas por dia da semana/hora
  - Taxa de abandono de carrinho
  - Origem geográfica dos participantes
  - **Arquivos Novos:** `/app/painel/admin/relatorios/page.tsx`

- [ ] **Análise de Abandono de Carrinho** (Eventbrite)
  - Tracking de checkouts não completados
  - Email de recuperação
  - Taxa de conversão
  - **Arquivos Novos:** `/app/api/abandoned-cart/`, tabela `cart_sessions`

---

### 📱 **4. APLICATIVOS MOBILE NATIVOS**

#### 🟢 **BAIXA PRIORIDADE (Curto Prazo)**

- [ ] **App Mobile para Participantes** (Sympla, Eventbrite, Eventim)
  - iOS e Android nativos
  - Compra de ingressos pelo app
  - Wallet/Carteira de ingressos
  - Notificações push nativas
  - **Tecnologia:** React Native ou Flutter

- [ ] **App Mobile para Organizadores** (Sympla, Eventbrite)
  - Monitorar vendas em tempo real
  - Check-in via app
  - Relatórios mobile
  - Gestão de eventos
  - **Tecnologia:** React Native ou Flutter

---

### ✅ **5. CHECK-IN E CREDENCIAMENTO**

#### 🔴 **ALTA PRIORIDADE**

- [ ] **Check-in Offline** (Sympla)
  - Funcionamento sem internet
  - Sincronização posterior
  - Download de lista de participantes
  - **Arquivos Afetados:** `/app/checkin/[eventId]/page.tsx`, Service Worker

- [ ] **Múltiplos Pontos de Check-in Simultâneos** (Sympla)
  - Vários dispositivos ao mesmo tempo
  - Sincronização em tempo real
  - Evitar duplicação de check-in
  - **Arquivos Afetados:** `/app/api/checkin/route.ts`, websockets

- [ ] **Impressão de Credenciais/Crachás** (Sympla)
  - Template de crachá customizável
  - QR Code no crachá
  - Impressão térmica
  - **Arquivos Novos:** `/app/api/badges/print`, template engine

#### 🟡 **MÉDIA PRIORIDADE**

- [ ] **Check-in com Validação de Documento** (para meia-entrada)
  - Campo para upload de comprovante
  - Validação manual no check-in
  - **Arquivos Afetados:** `/app/checkin/[eventId]/page.tsx`

- [ ] **Histórico de Check-ins por Participante**
  - Timestamp de entrada/saída
  - Múltiplas entradas (eventos multi-dia)
  - **Arquivos Afetados:** Tickets table, `/app/painel/admin/eventos/[eventId]/alunos/page.tsx`

---

### 🎓 **6. CERTIFICADOS E PÓS-EVENTO**

#### 🟡 **MÉDIA PRIORIDADE**

- [ ] **Geração Automática de Certificados** (Sympla)
  - Template de certificado customizável
  - Geração em PDF
  - Envio automático por email
  - Verificação de autenticidade
  - **Arquivos Novos:** `/app/api/certificates/`, `/lib/pdf-generator.ts`

- [ ] **Certificado Digital com QR de Validação**
  - QR Code único por certificado
  - Página de validação pública
  - Blockchain/hash para autenticidade
  - **Arquivos Novos:** `/app/validar-certificado/[token]/page.tsx`

---

### 🔗 **7. INTEGRAÇÕES**

#### 🔴 **ALTA PRIORIDADE**

- [ ] **Integração com CRM (RD Station, HubSpot)** (Sympla)
  - Sync automático de leads
  - Atualização de status de compra
  - Segmentação de público
  - **Arquivos Novos:** `/lib/integrations/rdstation.ts`, `/lib/integrations/hubspot.ts`

- [ ] **Integração com ERPs** (Sympla)
  - Sincronização de receitas
  - Emissão de notas fiscais
  - Conciliação bancária
  - **Arquivos Novos:** `/lib/integrations/erp/`

- [ ] **Webhooks para Eventos do Sistema** (Eventbrite)
  - Notificar sistemas externos
  - Evento de compra
  - Evento de check-in
  - Evento de cancelamento
  - **Arquivos Novos:** `/app/api/webhooks/`, tabela `webhook_subscriptions`

#### 🟡 **MÉDIA PRIORIDADE**

- [ ] **Integração com Zoom/Google Meet** (para eventos online)
  - Geração automática de link de reunião
  - Envio do link no email de confirmação
  - **Arquivos Afetados:** `/app/api/events/create/route.ts`, `/lib/integrations/zoom.ts`

- [ ] **Integração com Stripe Tap to Pay** (Ticket Tailor)
  - Venda de ingressos presencial via celular
  - Pagamento por aproximação
  - **Arquivos Novos:** `/lib/integrations/stripe-tap.ts`

- [ ] **API Pública para Desenvolvedores**
  - Endpoints REST documentados
  - Rate limiting
  - API Keys
  - Webhook subscriptions
  - **Arquivos Novos:** `/app/api/public/v1/`, documentação

---

### 💬 **8. COMUNICAÇÃO**

#### 🟡 **MÉDIA PRIORIDADE**

- [ ] **Email para Todos os Participantes** (Sympla)
  - Envio em massa
  - Templates de email
  - Agendamento de envio
  - **Arquivos Novos:** `/app/painel/admin/eventos/[eventId]/emails/page.tsx`

- [ ] **Lembretes Automáticos de Evento** (Eventbrite)
  - 7 dias antes
  - 1 dia antes
  - 2 horas antes
  - Customizável
  - **Arquivos Novos:** `/lib/cron/event-reminders.ts`

- [ ] **SMS Notifications** (opcional)
  - Confirmação de compra
  - Lembrete de evento
  - Integração com Twilio
  - **Arquivos Novos:** `/lib/sms/send-sms.ts`

- [ ] **Chat/Suporte ao Vivo** (Eventbrite)
  - Widget de chat
  - Atendimento em tempo real
  - Integração com Zendesk/Intercom
  - **Arquivos Novos:** Script de terceiros

---

### 👥 **9. GESTÃO DE PARTICIPANTES**

#### 🟡 **MÉDIA PRIORIDADE**

- [ ] **Formulários Customizáveis de Inscrição** (Sympla, Ticket Tailor)
  - Campos personalizados por evento
  - Campos obrigatórios/opcionais
  - Diferentes tipos de input (texto, select, checkbox)
  - **Arquivos Afetados:** `/components/EventForm.tsx`, tabela `custom_fields`

- [ ] **Segmentação de Participantes**
  - Tags personalizadas
  - Filtros avançados
  - Export de segmentos
  - **Arquivos Novos:** Tabela `participant_tags`

- [ ] **Avaliação e Feedback Pós-Evento** (Eventim)
  - Formulário de avaliação
  - NPS (Net Promoter Score)
  - Comentários e sugestões
  - **Arquivos Novos:** `/app/avaliar/[eventId]/page.tsx`

---

### 🎨 **10. PERSONALIZAÇÃO E BRANDING**

#### 🟢 **BAIXA PRIORIDADE**

- [ ] **White Label (Marca Própria)**
  - Logo customizável
  - Cores da marca
  - Domínio próprio
  - **Arquivos Afetados:** Configurações globais, CSS variables

- [ ] **Templates de Evento Prontos**
  - Templates por categoria
  - Clone de eventos anteriores
  - Biblioteca de templates
  - **Arquivos Novos:** `/app/painel/admin/templates/`

---

### 🔐 **11. SEGURANÇA E COMPLIANCE**

#### 🔴 **ALTA PRIORIDADE**

- [ ] **Certificação PCI-DSS** (Sympla)
  - Não armazenar dados de cartão
  - Tokenização via gateway
  - Auditoria de segurança
  - **Impacto:** Arquitetura de pagamentos

- [ ] **LGPD Compliance**
  - Termo de consentimento
  - Opção de exclusão de dados
  - Relatório de dados pessoais
  - **Arquivos Novos:** `/app/privacidade/meus-dados/page.tsx`

- [ ] **Two-Factor Authentication (2FA)**
  - Autenticação em duas etapas
  - SMS ou app autenticador
  - **Arquivos Afetados:** `/app/login/page.tsx`, Supabase Auth

---

### 💰 **12. MONETIZAÇÃO E RECEITA**

#### 🟡 **MÉDIA PRIORIDADE**

- [ ] **Taxa de Serviço Configurável**
  - % sobre vendas
  - Valor fixo por ingresso
  - Split de receita
  - **Arquivos Novos:** Configurações de pricing

- [ ] **Repasse Automático de Valores**
  - Transferência bancária automática
  - Calendário de repasse
  - Retenção de taxa da plataforma
  - **Arquivos Novos:** `/lib/financial/payouts.ts`

---

## 🎯 PRIORIZAÇÃO ESTRATÉGICA

### 🚀 **SPRINT 1 (Próximas 2-4 semanas) - CRÍTICO**
1. Lotes Automáticos com Progressão
2. Cupons de Desconto
3. Dashboard de Vendas em Tempo Real
4. Integração com Google Analytics
5. Integração com Meta Pixel

### 📈 **SPRINT 2 (1-2 meses) - IMPORTANTE**
1. Assentos Numerados
2. Métodos de Pagamento (Boleto + PIX)
3. Relatórios Financeiros
4. Exportação de Dados (CSV/Excel)
5. Check-in Offline

### 🎨 **SPRINT 3 (2-3 meses) - CRESCIMENTO**
1. Certificados Automáticos
2. Integração com CRM (RD Station)
3. Webhooks
4. Formulários Customizáveis
5. Email Marketing para Participantes

### 🌟 **BACKLOG (3-6 meses) - EXPANSÃO**
1. App Mobile Nativo
2. White Label
3. API Pública
4. Múltiplos Idiomas
5. Marketplace de Eventos

---

## 📚 FONTES DA PESQUISA

- [Plataforma Sympla - Funcionalidades](https://produtores.sympla.com.br/funcionalidades/)
- [Integrações da Sympla](https://blog.sympla.com.br/blog-do-produtor/integracoes-sympla/)
- [Eventbrite Features](https://www.eventbrite.com.br/l/funcionalidades/)
- [Eventbrite - Sell Tickets Online](https://www.eventbrite.com/organizer/features/sell-tickets/)
- [Ticket Tailor 2025 Features](https://www.capterra.com/p/112510/Ticket-Tailor/)
- [Eventbrite 2025 Reviews & Features](https://www.getapp.com/customer-management-software/a/eventbrite/)

---

## 💡 OBSERVAÇÕES FINAIS

O **StageOne** já possui uma base sólida com 90+ recursos implementados. Os recursos mais críticos para competir com Sympla/Eventbrite são:

1. **Lotes e Cupons** - Essencial para estratégias de preço
2. **Mais Métodos de Pagamento** - PIX é obrigatório no Brasil
3. **Analytics e Relatórios** - Organizadores precisam de dados
4. **Integrações de Marketing** - GA e Meta Pixel são padrão
5. **Check-in Offline** - Eventos grandes precisam de resiliência

**Diferencial do StageOne:**
- Sistema de Reserva de Espaços integrado (não tem em Sympla/Eventbrite)
- Push Notifications nativas já implementadas
- Design moderno e responsivo superior
- Código open-source e customizável

---

**Última atualização:** 13/12/2025
**Autor:** Claude Sonnet 4.5 via StageOne Analysis
