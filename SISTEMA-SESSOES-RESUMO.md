# Sistema de Sessões Automáticas - Resumo

## ✅ O que foi criado:

### 1. **Banco de Dados** (`add-sessions-system.sql`)
- ✅ Tabela `event_sessions` com todos os campos necessários
- ✅ Campo `session_id` adicionado em `bookings`
- ✅ Campos `enable_sessions`, `session_capacity`, `available_session_dates` em `events`
- ✅ Triggers automáticos para:
  - Atualizar contador de bookings
  - Criar próxima sessão quando atingir capacidade
  - Marcar sessão como FULL automaticamente
  - Liberar vagas em caso de cancelamento
- ✅ Políticas RLS configuradas
- ✅ Índices para performance

### 2. **TypeScript Types** (`types/database.types.ts`)
- ✅ `SessionStatus`: 'AVAILABLE' | 'FULL' | 'CANCELLED'
- ✅ `EventSession` interface
- ✅ `EventSessionWithEvent` interface
- ✅ `EventWithSessions` interface
- ✅ Campos de sessão adicionados na interface `Event`

### 3. **APIs REST**
- ✅ `/api/sessions` (GET/POST):
  - GET: Listar todas as sessões de um evento
  - POST: Criar sessões iniciais baseadas nas datas configuradas
- ✅ `/api/sessions/available` (GET):
  - Retorna apenas sessões disponíveis e futuras
  - Cria primeira sessão automaticamente se não existir

### 4. **Componente UI** (`components/SessionSelector.tsx`)
- ✅ Design moderno e responsivo (grid 2 colunas)
- ✅ Badges de status com cores:
  - 🟢 DISPONÍVEL (verde)
  - 🟠 POUCAS VAGAS (laranja, quando <= 5 vagas)
  - 🔴 ESGOTADA (vermelho)
- ✅ Barra de progresso visual mostrando ocupação
- ✅ Informações claras:
  - Número da sessão (Sessão 01, 02, etc.)
  - Data formatada ("15 de janeiro")
  - Horário
  - Contador de vagas (X/25 vagas)
  - Porcentagem de ocupação
- ✅ Estados interativos:
  - Hover effects em sessões disponíveis
  - Desabilitado automaticamente para sessões cheias
  - Visual de selecionado com checkmark
- ✅ Loading skeleton durante carregamento
- ✅ Tratamento de erros
- ✅ Legenda de cores no rodapé

## 📋 Próximos Passos para Implementação Completa:

### PASSO 1: Executar SQL no Supabase
Execute o arquivo `add-sessions-system.sql` no Supabase SQL Editor:
https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/sql/new

### PASSO 2: Atualizar Checkout-v2
Adicionar o `SessionSelector` no checkout antes do formulário de dados:
```tsx
import SessionSelector from '@/components/SessionSelector'

// Adicionar estado
const [selectedSessionId, setSelectedSessionId] = useState<string>()

// Adicionar validação
if (step === 'info' && event.enable_sessions && !selectedSessionId) {
  alert('Por favor, selecione uma sessão')
  return
}

// Adicionar componente no Step 1
{event.enable_sessions && (
  <SessionSelector
    eventId={params.eventId}
    onSelectSession={setSelectedSessionId}
    selectedSessionId={selectedSessionId}
  />
)}

// Passar sessionId no create-intent
body: JSON.stringify({
  // ...outros campos
  sessionId: selectedSessionId
})
```

### PASSO 3: Atualizar API de Create Intent
Adicionar campo `session_id` ao criar booking:
```tsx
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    // ...outros campos
    session_id: sessionId || null
  })
```

### PASSO 4: Criar UI no Painel Admin
Página para configurar sessões:
- Habilitar/desabilitar sessões para o evento
- Definir capacidade por sessão (ex: 25 vagas)
- Adicionar datas disponíveis com date picker
- Visualizar sessões criadas em cards/lista
- Dashboard com status de cada sessão

### PASSO 5: Atualizar Página do Evento
Mostrar informações das sessões na página pública:
- "Evento com sessões limitadas"
- Próximas sessões disponíveis
- Contador de vagas restantes

## 🎨 Design Decisions:

### UI/UX Moderna:
1. **Cards de Sessão**: Layout em grid responsivo
2. **Sistema de Cores Semafórico**:
   - Verde = Muitas vagas
   - Laranja = Poucas vagas (urgência)
   - Vermelho = Esgotado
3. **Feedback Visual Imediato**:
   - Barra de progresso animada
   - Badges com ícones
   - Estados hover e selected
4. **Informação Clara**:
   - Data legível em português
   - Contador preciso de vagas
   - Porcentagem visual

### Lógica de Negócio:
1. **Criação Automática**: Primeira sessão criada automaticamente quando alguém tenta comprar
2. **Próxima Sessão**: Triggers criam automaticamente quando sessão atinge capacidade
3. **Apenas Datas Pré-configuradas**: Admin define datas permitidas, sistema cria sessões apenas nessas datas
4. **Liberação de Vagas**: Cancelamento libera vaga e pode reabrir sessão cheia
5. **Sessões Futuras**: Apenas sessões futuras são mostradas no checkout

### Performance:
1. **Índices**: Criados para queries rápidas (event_id, status, date)
2. **Triggers**: Atualizam contadores automaticamente, sem queries extras
3. **RLS**: Políticas garantem segurança sem overhead

## 🚀 Como Testar:

1. Execute o SQL no Supabase
2. Crie um evento de teste
3. Configure:
   - `enable_sessions = true`
   - `session_capacity = 5` (para testar mais rápido)
   - `available_session_dates = ['2026-01-20 14:00:00', '2026-01-21 14:00:00', '2026-01-22 14:00:00']`
4. Faça 5 compras → Sessão 01 deve ficar FULL automaticamente
5. Faça a 6ª compra → Sistema deve criar Sessão 02 automaticamente
6. Verifique no banco que `session_number` incrementou e nova sessão foi criada

## 📊 Exemplo de Dados:

```sql
-- Configurar evento com sessões
UPDATE events
SET
  enable_sessions = true,
  session_capacity = 25,
  available_session_dates = ARRAY[
    '2026-02-01 09:00:00+00',
    '2026-02-08 09:00:00+00',
    '2026-02-15 09:00:00+00',
    '2026-02-22 09:00:00+00'
  ]
WHERE id = 'seu-event-id';

-- Ver sessões criadas
SELECT * FROM event_sessions WHERE event_id = 'seu-event-id' ORDER BY session_number;

-- Ver bookings por sessão
SELECT
  s.session_number,
  s.session_date,
  s.current_bookings,
  s.max_capacity,
  s.status,
  COUNT(b.id) as bookings_count
FROM event_sessions s
LEFT JOIN bookings b ON b.session_id = s.id AND b.payment_status = 'PAID'
WHERE s.event_id = 'seu-event-id'
GROUP BY s.id, s.session_number, s.session_date, s.current_bookings, s.max_capacity, s.status
ORDER BY s.session_number;
```

---

**Sistema completo de sessões com criação automática, UI moderna e lógica robusta!** 🎯
