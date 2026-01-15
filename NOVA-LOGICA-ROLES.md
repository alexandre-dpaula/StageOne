# 🎯 Nova Lógica de Roles - StageOne

## Filosofia
O sistema de roles deve ser **invisível** para o usuário e **adaptativo** às suas ações. Ao invés de forçar roles, a UI se adapta ao que o usuário realmente faz.

---

## 1. Três Estados de Usuário

### 🎫 PARTICIPANTE (Default - Comprador de Ingressos)
**Quando?** Usuário novo ou que nunca criou eventos

**O que vê na navbar:**
- "Meus Ingressos" → Link sempre visível
- "Criar Evento" → CTA destacado (não "Meus Eventos")

**Comportamento:**
- Pode comprar ingressos
- Pode solicitar orçamentos
- Ao criar PRIMEIRO evento → Auto-upgrade para PALESTRANTE

**Tela "Meus Ingressos":**
- Lista de ingressos comprados
- Se vazio: "Você ainda não tem ingressos" + CTA para explorar eventos

---

### 🎤 PALESTRANTE (Criador de Eventos)
**Quando?** Usuário que criou pelo menos 1 evento

**O que vê na navbar:**
- "Meus Eventos" → Substitui "Criar Evento"
- "Meus Ingressos" → Permanece visível

**Comportamento:**
- Dashboard mostra APENAS seus eventos
- Pode editar APENAS seus eventos
- Pode fazer check-in APENAS em seus eventos
- Pode ver alunos APENAS de seus eventos
- Continua podendo comprar ingressos

**Auto-Upgrade:**
- Trigger: Criar primeiro evento via `/painel/palestrante/eventos/novo`
- Trigger: Finalizar reserva de espaço (cria evento automaticamente)

**Auto-Downgrade (opcional):**
- Se deletar TODOS os eventos criados → Volta para PARTICIPANTE
- Menu volta a mostrar "Criar Evento" ao invés de "Meus Eventos"

---

### 👑 ADMIN (Acesso Total - Manual Only)
**Quando?** Atribuição manual no banco de dados (não há auto-upgrade)

**O que vê na navbar:**
- "Painel Admin" → Dashboard especial
- "Meus Ingressos" → Permanece visível

**Comportamento:**
- Dashboard mostra TODOS os eventos da plataforma
- Pode editar QUALQUER evento
- Pode deletar QUALQUER evento
- Pode gerenciar usuários
- Vê carteira financeira completa
- Nunca sofre downgrade

---

## 2. Matriz de Acesso

| Funcionalidade | PARTICIPANTE | PALESTRANTE | ADMIN |
|----------------|--------------|-------------|-------|
| Comprar ingressos | ✅ | ✅ | ✅ |
| Ver meus ingressos | ✅ | ✅ | ✅ |
| Solicitar orçamento | ✅ | ✅ | ✅ |
| **Criar evento** | ✅ (vira PALESTRANTE) | ✅ | ✅ |
| Ver meus eventos | ❌ | ✅ (só seus) | ✅ (todos) |
| Editar evento | ❌ | ✅ (só seus) | ✅ (todos) |
| Deletar evento | ❌ | ✅ (só seus) | ✅ (todos) |
| Check-in de alunos | ❌ | ✅ (só seus eventos) | ✅ (todos) |
| Ver alunos do evento | ❌ | ✅ (só seus eventos) | ✅ (todos) |
| Gerenciar usuários | ❌ | ❌ | ✅ |
| Ver carteira financeira | ❌ | ❌ | ✅ |

---

## 3. Fluxo de Navegação Adaptativa

### Navbar Desktop - PARTICIPANTE
```
[StageOne™]                     [Meus Ingressos] [Criar Evento]
 Participante
```

### Navbar Desktop - PALESTRANTE
```
[StageOne™]                     [Meus Eventos] [Meus Ingressos]
 Palestrante
```

### Navbar Desktop - ADMIN
```
[StageOne™]                     [Painel Admin] [Meus Ingressos]
 Admin
```

---

## 4. Triggers de Auto-Upgrade

### PARTICIPANTE → PALESTRANTE

**Trigger 1: Criar Evento**
- Arquivo: `app/api/events/create/route.ts`
- Momento: Ao criar evento com sucesso
- Lógica:
  ```typescript
  if (user.role === 'PARTICIPANTE') {
    await supabase
      .from('users')
      .update({ role: 'PALESTRANTE' })
      .eq('id', user.id)
  }
  ```

**Trigger 2: Finalizar Reserva de Espaço (com evento automático)**
- Arquivo: `app/api/bookings/create/route.ts`
- Momento: Ao finalizar pagamento da reserva
- Lógica: Mesma do Trigger 1

**❌ REMOVIDO: Compra de Ingresso NÃO promove mais**
- Comprar ingresso não torna usuário em criador de eventos
- Isso causava confusão: "Por que vejo 'Meus Eventos' se nunca criei nada?"

---

## 5. Lógica de Propriedade (Ownership)

### Verificação de Propriedade do Evento
```typescript
const isOwner = event.created_by === user.id
const isAdmin = user.role === 'ADMIN'
const canEdit = isOwner || isAdmin
```

### Aplicar em:
- ✅ Edição de eventos: `app/painel/admin/eventos/[eventId]/editar/page.tsx`
- ✅ Deletar eventos: `app/api/eventos/[eventId]/route.ts`
- ✅ Ver alunos: `app/painel/admin/eventos/[eventId]/alunos/page.tsx`
- ✅ Check-in: `app/checkin/[eventId]/page.tsx`

---

## 6. Rotas Unificadas

### Consolidação de Rotas de Eventos

**ANTES (confuso):**
- `/painel/palestrante/eventos/novo` → Qualquer user
- `/painel/admin/eventos/novo` → ADMIN ou PALESTRANTE
- `/painel/admin/eventos/[eventId]/editar` → Só ADMIN

**DEPOIS (unificado):**
- `/painel/eventos/novo` → Qualquer user autenticado (auto-upgrade)
- `/painel/eventos/[eventId]/editar` → Owner OU ADMIN
- `/painel/eventos/[eventId]/alunos` → Owner OU ADMIN
- `/painel/admin/*` → Só para recursos exclusivos de ADMIN

---

## 7. Dashboard Adaptativo

### `/painel/palestrante` (renomear para `/painel`)

**Se PARTICIPANTE (sem eventos):**
```
┌─────────────────────────────────────┐
│ Bem-vindo ao StageOne               │
│                                     │
│ [CTA Grande] Criar Seu Primeiro    │
│              Evento                 │
│                                     │
│ 📊 Você tem X ingressos comprados  │
└─────────────────────────────────────┘
```

**Se PALESTRANTE (com eventos):**
```
┌─────────────────────────────────────┐
│ Meus Eventos (3)                    │
│                                     │
│ [Lista dos eventos criados]        │
│                                     │
│ 📊 Stats: X eventos, Y ingressos   │
└─────────────────────────────────────┘
```

**Se ADMIN:**
```
┌─────────────────────────────────────┐
│ Painel Admin                        │
│                                     │
│ 💰 Carteira Financeira             │
│ 📊 Todos os Eventos (25)           │
│ 👥 Usuários (150)                  │
└─────────────────────────────────────┘
```

---

## 8. Implementação Técnica

### Helper Function (Nova)
```typescript
// lib/user-permissions.ts

export function getUserPermissions(user: User, events?: Event[]) {
  const hasEvents = events && events.length > 0
  const isAdmin = user.role === 'ADMIN'
  const isPalestrante = user.role === 'PALESTRANTE'
  const isParticipante = user.role === 'PARTICIPANTE'

  return {
    // Navigation
    showMeusEventos: isPalestrante || isAdmin,
    showCriarEvento: isParticipante || (!hasEvents && !isAdmin),
    showPainelAdmin: isAdmin,
    showMeusIngressos: true, // Sempre

    // Actions
    canCreateEvent: true, // Todos (com auto-upgrade)
    canEditEvent: (event: Event) => isAdmin || event.created_by === user.id,
    canDeleteEvent: (event: Event) => isAdmin || event.created_by === user.id,
    canManageUsers: isAdmin,
    canViewFinancials: isAdmin,
  }
}
```

### Navbar Dinâmica
```typescript
// components/Navbar.tsx

const userEvents = await getUserEvents(user.id)
const permissions = getUserPermissions(user, userEvents)

{permissions.showCriarEvento && (
  <Link href="/painel/eventos/novo">Criar Evento</Link>
)}

{permissions.showMeusEventos && (
  <Link href="/painel">Meus Eventos</Link>
)}

{permissions.showPainelAdmin && (
  <Link href="/painel/admin">Painel Admin</Link>
)}

{permissions.showMeusIngressos && (
  <Link href="/meus-ingressos">Meus Ingressos</Link>
)}
```

---

## 9. Mensagens e Feedback

### Empty States

**PARTICIPANTE sem ingressos:**
> "Você ainda não tem ingressos. Explore nossos eventos!"
> [CTA: Ver Eventos Disponíveis]

**PARTICIPANTE (ao clicar "Criar Evento" pela primeira vez):**
> "Crie seu primeiro evento e comece a vender ingressos!"

**PALESTRANTE sem eventos (após deletar todos):**
> "Você ainda não tem eventos ativos. Que tal criar um?"
> [CTA: Criar Evento]

### Success Messages

**Após criar primeiro evento:**
> "✅ Parabéns! Seu evento foi criado. Agora você é um organizador!"
> "Seu perfil foi atualizado para Palestrante."

---

## 10. Migrações Necessárias

### Arquivos a Modificar

1. **components/Navbar.tsx** → Lógica adaptativa
2. **app/painel/palestrante/page.tsx** → Dashboard adaptativo
3. **app/api/tickets/create/route.ts** → Remover auto-upgrade
4. **app/api/events/create/route.ts** → Manter auto-upgrade
5. **app/api/eventos/[eventId]/route.ts** → Adicionar ownership check
6. **app/painel/admin/eventos/[eventId]/editar/page.tsx** → Ownership check
7. **lib/user-permissions.ts** → Criar helper functions

### SQL para verificar inconsistências
```sql
-- Usuários PALESTRANTE sem eventos (candidatos a downgrade)
SELECT u.id, u.name, u.email, u.role
FROM users u
LEFT JOIN events e ON e.created_by = u.id
WHERE u.role = 'PALESTRANTE'
  AND e.id IS NULL;

-- Usuários PARTICIPANTE que criaram eventos (inconsistência)
SELECT u.id, u.name, u.email, u.role, COUNT(e.id) as event_count
FROM users u
INNER JOIN events e ON e.created_by = u.id
WHERE u.role = 'PARTICIPANTE'
GROUP BY u.id, u.name, u.email, u.role;
```

---

## 11. Resumo das Mudanças

| Aspecto | ANTES | DEPOIS |
|---------|-------|--------|
| **Comprar ingresso** | Vira PALESTRANTE | Continua PARTICIPANTE |
| **Criar evento** | Vira PALESTRANTE | Vira PALESTRANTE ✅ |
| **Navbar PARTICIPANTE** | "Meus Eventos" | "Criar Evento" (CTA) |
| **Navbar PALESTRANTE** | "Meus Eventos" | "Meus Eventos" ✅ |
| **Navbar ADMIN** | "Meus Eventos" | "Painel Admin" |
| **Editar evento** | Só ADMIN | Owner OU ADMIN |
| **Deletar evento** | Só ADMIN | Owner OU ADMIN |
| **Dashboard vazio** | Mostra "sem eventos" | CTA "Criar Primeiro Evento" |

---

## 12. Benefícios da Nova Lógica

✅ **Mais intuitivo**: UI se adapta ao que o usuário FAZ, não ao que ele É
✅ **Menos confuso**: PARTICIPANTE não vê "Meus Eventos" se nunca criou nenhum
✅ **Mais justo**: PALESTRANTE pode editar seus próprios eventos
✅ **Mais escalável**: Fácil adicionar novos níveis ou permissões
✅ **Melhor UX**: Cada usuário vê exatamente o que precisa

---

## 13. Roadmap de Implementação

### Fase 1: Limpeza (Low Risk)
- ✅ Remover auto-upgrade em `tickets/create`
- ✅ Criar `lib/user-permissions.ts`
- ✅ Adicionar ownership checks em APIs

### Fase 2: UI Adaptativa (Medium Risk)
- ✅ Atualizar `components/Navbar.tsx`
- ✅ Atualizar dashboard `/painel/palestrante`
- ✅ Criar empty states personalizados

### Fase 3: Testes (High Priority)
- ✅ Testar fluxo PARTICIPANTE → cria evento → vira PALESTRANTE
- ✅ Testar fluxo PALESTRANTE → deleta eventos → continua PALESTRANTE
- ✅ Testar ownership de eventos
- ✅ Testar ADMIN pode editar tudo

---

**Versão:** 2.0
**Data:** 2025-12-12
**Status:** Proposta para Aprovação
