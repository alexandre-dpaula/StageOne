# 🏗️ Arquitetura - StageOne Platform

## 📐 Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         STAGEONE PLATFORM                        │
│                   Sistema de Gestão de Eventos                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │◄───┤  Next.js 14  ├───►│   Backend    │
│  (React UI)  │    │  App Router  │    │(Supabase API)│
└──────────────┘    └──────────────┘    └──────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Tailwind    │    │  TypeScript  │    │  PostgreSQL  │
│     CSS      │    │   (Types)    │    │   Database   │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🎭 Arquitetura de Roles

```
                    ┌─────────────┐
                    │    ADMIN    │
                    │ (Controle   │
                    │   Total)    │
                    └──────┬──────┘
                           │
                ┌──────────┼──────────┐
                │                     │
        ┌───────▼──────┐      ┌──────▼─────────┐
        │ PALESTRANTE  │      │  PARTICIPANTE  │
        │ (Gerencia    │      │  (Compra       │
        │  Eventos)    │      │   Ingressos)   │
        └──────────────┘      └────────────────┘
```

### Permissões por Role

**ADMIN:**
- ✅ Ver todos os eventos
- ✅ Gerenciar usuários
- ✅ Criar eventos
- ✅ Fazer check-in
- ✅ Ver todos os participantes

**PALESTRANTE:**
- ✅ Ver próprios eventos
- ✅ Criar eventos
- ✅ Fazer check-in nos seus eventos
- ✅ Ver participantes dos seus eventos

**PARTICIPANTE:**
- ✅ Ver eventos públicos
- ✅ Comprar ingressos
- ✅ Ver seus QR Codes
- ✅ Receber check-in

---

## 🗄️ Arquitetura do Banco de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐          ┌──────────────┐
│    users     │          │    events    │
├──────────────┤          ├──────────────┤
│ id (PK)      │◄─────────┤ created_by   │
│ name         │          │ slug (UK)    │
│ email (UK)   │          │ title        │
│ role         │          │ capacity     │
│ avatar_url   │          │ is_published │
└──────────────┘          └──────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼────┐ ┌─────▼────┐ ┌────▼─────┐
            │  modules   │ │  tickets │ │ tickets  │
            │            │ │  _types  │ │          │
            ├────────────┤ ├──────────┤ ├──────────┤
            │ event_id   │ │ event_id │ │ event_id │
            │ title      │ │ name     │ │ user_id  │
            │ hours      │ │ price    │ │ qr_code  │
            │ order      │ │ quantity │ │ status   │
            └────────────┘ └──────────┘ └──────────┘
                                 │
                                 │
                          ┌──────▼────────┐
                          │  materials    │
                          ├───────────────┤
                          │ event_id      │
                          │ title         │
                          │ file_url      │
                          └───────────────┘
```

### Relacionamentos

- `users` 1:N `events` (criador)
- `events` 1:N `modules` (módulos do evento)
- `events` 1:N `tickets_types` (tipos de ingresso)
- `events` 1:N `tickets` (ingressos vendidos)
- `users` 1:N `tickets` (comprador)
- `events` 1:N `materials` (materiais pós-evento)

---

## 🌐 Arquitetura de Páginas

```
                    ┌─────────────────┐
                    │  PUBLIC ROUTES  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌────────▼────────┐   ┌──────▼──────┐
│     HOME      │   │    EVENTO       │   │  AUTH       │
│  (Netflix)    │   │   [slug]        │   │ Login/Signup│
└───────────────┘   └─────────────────┘   └─────────────┘
                             │
                             │ (após login)
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  PARTICIPANTE  │  │  PALESTRANTE    │  │     ADMIN      │
│  /meus-        │  │  /painel/       │  │  /painel/admin │
│  ingressos     │  │  palestrante    │  │                │
└────────────────┘  └─────────────────┘  └────────────────┘
        │                    │                    │
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   CHECKOUT     │  │  CRIAR EVENTO   │  │  GERENCIAR     │
│  [eventId]/    │  │  (SQL)          │  │  USUARIOS      │
│  [ticketId]    │  │                 │  │                │
└────────────────┘  └─────────────────┘  └────────────────┘
                             │                    │
                             │                    │
                             └──────┬─────────────┘
                                    │
                            ┌───────▼────────┐
                            │   CHECK-IN     │
                            │  /checkin/     │
                            │  [eventId]     │
                            └────────────────┘
```

---

## 🔄 Fluxos de Dados

### 1. Fluxo de Compra de Ingresso

```
Usuario → Ver Evento → Selecionar Ingresso → Preencher Dados
    ↓
Validar Disponibilidade
    ↓
Criar Ticket (status: PAID)
    ↓
Gerar QR Code Token (único)
    ↓
Atualizar sold_quantity (trigger automático)
    ↓
Exibir QR Code para usuário
```

### 2. Fluxo de Check-in

```
Scanner → Ler QR Code → Extrair Token
    ↓
Buscar Ticket no Banco
    ↓
Validar: evento correto? status PAID? não usado?
    ↓
Se válido: Registrar checked_in_at
    ↓
Exibir confirmação com dados do participante
```

### 3. Fluxo de Criação de Evento

```
Admin/Palestrante → SQL Editor
    ↓
INSERT evento (title, slug, capacity...)
    ↓
INSERT módulos (title, hours...)
    ↓
INSERT tipos de ingressos (price, quantity...)
    ↓
Trigger: Calcular total_hours automaticamente
    ↓
Evento disponível na plataforma
```

---

## 🔐 Arquitetura de Segurança

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                         │
└─────────────────────────────────────────────────────────────┘

LAYER 1: Middleware
├── ✅ Verificar autenticação
├── ✅ Redirecionar se não autenticado
└── ✅ Proteger rotas sensíveis

LAYER 2: Server Components
├── ✅ Validar role do usuário
├── ✅ Bloquear acesso não autorizado
└── ✅ Queries filtradas por usuário

LAYER 3: Row Level Security (RLS)
├── ✅ Isolamento a nível de linha
├── ✅ Políticas por tabela
└── ✅ Validação no banco de dados

LAYER 4: API Routes
├── ✅ Verificar auth em cada request
├── ✅ Validar permissões
└── ✅ Rate limiting (futuro)
```

---

## 📱 Arquitetura de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                       │
└─────────────────────────────────────────────────────────────┘

app/
├── layout.tsx (Root Layout)
│   └── Navbar (condicional por role)
│
├── page.tsx (Home)
│   ├── EventCarousel
│   │   └── EventCard (múltiplos)
│   └── Hero Section
│
├── evento/[slug]/page.tsx
│   ├── Hero Banner
│   ├── Modules List
│   ├── Ticket Types Cards
│   └── CTA Buttons
│
├── painel/
│   ├── admin/
│   │   ├── Dashboard Cards
│   │   ├── Events Table
│   │   └── Users Table
│   │
│   └── palestrante/
│       ├── Dashboard Cards
│       └── My Events List
│
└── checkin/[eventId]/page.tsx
    ├── QR Scanner
    ├── Manual Input
    └── Result Display
```

---

## 🚀 Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION STACK                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Vercel    │         │   Supabase   │         │  Supabase    │
│  (Frontend)  │◄───────►│   (Auth)     │◄───────►│  (Database)  │
│              │         │              │         │              │
│  Next.js App │         │  Auth Server │         │ PostgreSQL   │
│  Static/SSR  │         │  JWT Tokens  │         │ Row Security │
└──────────────┘         └──────────────┘         └──────────────┘
       │                         │                        │
       │                         │                        │
       └─────────────────────────┴────────────────────────┘
                                 │
                                 ▼
                      ┌──────────────────┐
                      │   CDN Global     │
                      │  Edge Network    │
                      └──────────────────┘
```

### Stack de Produção

**Frontend:**
- Vercel (deploy automático)
- Edge Functions
- ISR (Incremental Static Regeneration)

**Backend:**
- Supabase Cloud
- API REST Auto-gerada
- Realtime subscriptions

**Database:**
- PostgreSQL (Supabase)
- Backups automáticos
- Réplicas multi-região

---

## 🔧 Arquitetura de Desenvolvimento

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT FLOW                          │
└─────────────────────────────────────────────────────────────┘

Desenvolvimento Local
    ↓
├── npm run dev (localhost:3000)
├── TypeScript + ESLint
├── Hot Module Replacement
└── Supabase Cloud (dev project)
    ↓
Commit & Push
    ↓
├── GitHub Repository
├── CI/CD (futuro)
└── Code Review (opcional)
    ↓
Deploy Automático
    ↓
├── Vercel Preview (PR)
├── Vercel Production (main)
└── Rollback instantâneo
```

---

## 📊 Arquitetura de Performance

```
┌─────────────────────────────────────────────────────────────┐
│                  PERFORMANCE OPTIMIZATION                    │
└─────────────────────────────────────────────────────────────┘

Frontend:
├── ✅ Server Components (RSC)
├── ✅ Image Optimization (next/image)
├── ✅ Code Splitting automático
├── ⏳ Lazy Loading (futuro)
└── ⏳ Service Worker (PWA futuro)

Database:
├── ✅ 15 Indexes estratégicos
├── ✅ Queries otimizadas
├── ✅ Foreign Keys
├── ⏳ Connection Pooling
└── ⏳ Redis Cache (futuro)

API:
├── ✅ Edge Functions
├── ✅ Revalidação de cache
├── ⏳ Rate Limiting (futuro)
└── ⏳ CDN para assets (futuro)
```

---

## 🎯 Pontos de Integração Futuros

```
┌─────────────────────────────────────────────────────────────┐
│                   FUTURE INTEGRATIONS                        │
└─────────────────────────────────────────────────────────────┘

PAGAMENTOS
├── Stripe API
├── PagSeguro API
└── Mercado Pago API

EMAILS
├── Resend
├── SendGrid
└── React Email (templates)

STORAGE
├── Supabase Storage (imagens)
├── CloudFlare R2 (alternativa)
└── Image CDN

ANALYTICS
├── Vercel Analytics
├── Google Analytics
└── Sentry (error tracking)

NOTIFICAÇÕES
├── Push Notifications (PWA)
├── Email Notifications
└── SMS (opcional)
```

---

## 📈 Escalabilidade

```
Atual: 1-100 eventos/mês
├── ✅ Supabase Free Tier suficiente
├── ✅ Vercel Hobby Plan
└── ✅ Performance adequada

Crescimento: 100-1000 eventos/mês
├── ⚠️ Upgrade Supabase Pro
├── ⚠️ Implementar Redis Cache
└── ⚠️ CDN para imagens

Escala: 1000+ eventos/mês
├── 🔴 Supabase Team/Enterprise
├── 🔴 Sharding de database
├── 🔴 Load Balancer
└── 🔴 Microservices (se necessário)
```

---

## 🔍 Monitoramento

```
┌─────────────────────────────────────────────────────────────┐
│                      MONITORING STACK                        │
└─────────────────────────────────────────────────────────────┘

Application:
├── Vercel Analytics (built-in)
├── Supabase Dashboard (queries, performance)
└── Browser DevTools (desenvolvimento)

Erros:
├── ⏳ Sentry (futuro)
├── ⏳ Error Boundaries React
└── ⏳ Logs estruturados

Performance:
├── ⏳ Lighthouse CI (futuro)
├── ⏳ Web Vitals tracking
└── ⏳ Database query analytics
```

---

## 🎨 Design System Architecture

```
Colors:
├── Primary: Red (#dc2626)
├── Background: Black (#0a0a0a)
├── Cards: Gray-900 (#1a1a1a)
└── Text: White/Gray variants

Typography:
├── Font: System Default (Geist)
├── Headings: Bold, White
├── Body: Regular, Gray-300
└── Small: text-sm, Gray-400

Components:
├── Button (4 variants)
├── Input (form field)
├── EventCard (hover effects)
├── EventCarousel (scroll)
└── Navbar (role-based)

Layout:
├── Max Width: 7xl (1280px)
├── Spacing: Consistent padding/margin
├── Responsive: Mobile-first
└── Grid: Tailwind Grid System
```

---

## 🗺️ Roadmap Técnico

### Fase 1: MVP (✅ COMPLETO)
- ✅ Autenticação
- ✅ CRUD Eventos (SQL)
- ✅ Sistema de Ingressos
- ✅ QR Code
- ✅ Check-in

### Fase 2: Produção (PRÓXIMO)
- ⏳ Formulário UI de Eventos
- ⏳ Gateway de Pagamento
- ⏳ Sistema de Emails
- ⏳ Upload de Imagens

### Fase 3: Crescimento
- ⏳ Dashboard com Gráficos
- ⏳ Certificados PDF
- ⏳ Exportações CSV
- ⏳ Sistema de Cupons

### Fase 4: Escala
- ⏳ PWA
- ⏳ Notificações Push
- ⏳ Programa de Afiliados
- ⏳ API Pública

---

## 💡 Decisões Arquiteturais

### Por que Next.js 14 App Router?
- ✅ Server Components (performance)
- ✅ Server Actions (simplifica APIs)
- ✅ Streaming SSR
- ✅ Built-in optimization
- ✅ Ecosystem maduro

### Por que Supabase?
- ✅ PostgreSQL (robusto)
- ✅ Auth integrado
- ✅ Row Level Security
- ✅ Realtime subscriptions
- ✅ Auto-generated APIs
- ✅ Free tier generoso

### Por que Tailwind CSS?
- ✅ Utility-first (produtividade)
- ✅ Sem CSS global
- ✅ PurgeCSS automático
- ✅ Design system consistente
- ✅ Responsivo simples

---

## 🎓 Padrões de Código

```typescript
// Server Component Pattern
export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  return <div>{/* render */}</div>
}

// Client Component Pattern
'use client'
export default function Component() {
  const [state, setState] = useState()
  return <div>{/* interactive UI */}</div>
}

// API Route Pattern
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  // validate auth
  // process request
  return NextResponse.json({ data })
}

// Type Safety Pattern
interface Event {
  id: string
  title: string
  // ... all fields typed
}
```

---

**Última Atualização:** Dezembro 2024

**Status:** 🟢 Arquitetura estável e pronta para produção
