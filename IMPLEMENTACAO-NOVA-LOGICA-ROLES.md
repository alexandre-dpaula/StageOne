# ✅ Implementação da Nova Lógica de Roles

## Mudanças Implementadas

### 1. **Navbar Dinâmica e Adaptativa** ✅

**Arquivo:** `components/Navbar.tsx`

A navbar agora se adapta automaticamente às ações do usuário:

#### PARTICIPANTE (sem eventos criados)
```
[StageOne™]              [Criar Evento] [Meus Ingressos] [Avatar] [Sair]
 Participante
```
- **"Criar Evento"**: Botão CTA destacado (fundo neon green)
- **"Meus Ingressos"**: Sempre visível

#### PALESTRANTE (com eventos criados)
```
[StageOne™]              [Meus Eventos] [Meus Ingressos] [Avatar] [Sair]
 Palestrante
```
- **"Meus Eventos"**: Link padrão para gerenciar eventos
- **"Meus Ingressos"**: Sempre visível

#### ADMIN
```
[StageOne™]              [Painel Admin] [Meus Ingressos] [Avatar] [Sair]
 Admin
```
- **"Painel Admin"**: Acesso total à plataforma
- **"Meus Ingressos"**: Sempre visível

---

### 2. **Helper Functions** ✅

#### `lib/get-user-with-meta.ts` (NOVO)
```typescript
export type UserWithMeta = User & {
  hasTickets?: boolean  // Possui ingressos comprados
  hasEvents?: boolean   // Criou pelo menos 1 evento
}

export async function getUserWithMeta(): Promise<UserWithMeta | null>
```

**Benefícios:**
- Centraliza a lógica de buscar usuário com metadados
- Reduz código duplicado
- Facilita manutenção futura

#### `lib/user-permissions.ts` (NOVO)
```typescript
export function getUserPermissions(user: User, userEvents?: Event[]): UserPermissions

export function canUserAccessEvent(user: User, event: Event): boolean

export function canUserEditEvent(user: User, event: Event): boolean

export function needsRoleUpgrade(user: User): boolean
```

**Benefícios:**
- Ownership-based permissions (usuário pode editar seus próprios eventos)
- Fácil verificar permissões em qualquer lugar do código
- Lógica de negócio centralizada

---

### 3. **Atualização de APIs** ✅

#### `app/api/tickets/create/route.ts`
**ANTES:**
```typescript
// Comprar ingresso → Vira PALESTRANTE ❌
if (userProfile?.role === 'PARTICIPANTE') {
  await supabase.update({ role: 'PALESTRANTE' })
}
```

**DEPOIS:**
```typescript
// REMOVIDO: Auto-upgrade ao comprar ingresso
// Nova lógica: Comprar ingresso NÃO promove para PALESTRANTE
// Apenas CRIAR EVENTO promove para PALESTRANTE
```

**Motivo:** Evitar confusão. Se o usuário apenas compra ingressos, não faz sentido mostrar "Meus Eventos" na navbar.

---

#### `app/api/events/create/route.ts`
**MANTIDO:**
```typescript
// Auto-upgrade: PARTICIPANTE que cria evento vira PALESTRANTE ✅
if (user.role === 'PARTICIPANTE') {
  await supabase.update({ role: 'PALESTRANTE' })
  console.log(`✅ Usuário promovido para PALESTRANTE ao criar evento`)
}
```

**Motivo:** Criar evento É uma ação de palestrante. Faz todo sentido promover o usuário.

---

#### `app/api/bookings/create/route.ts`
**MANTIDO (com comentários melhorados):**
```typescript
// Auto-upgrade: PARTICIPANTE que reserva espaço vira PALESTRANTE
// Motivo: A reserva de espaço cria um evento automaticamente
// Portanto, faz sentido promover o usuário já que ele estará criando um evento
```

---

### 4. **Atualização da Home Page** ✅

**Arquivo:** `app/page.tsx`

**ANTES:**
```typescript
let user: (User & { hasTickets?: boolean }) | null = null
if (authUser) {
  const [{ data }, { count: ticketsCount }] = await Promise.all([...])
  user = { ...data, hasTickets: (ticketsCount || 0) > 0 }
}
```

**DEPOIS:**
```typescript
import { getUserWithMeta } from '@/lib/get-user-with-meta'

const user = await getUserWithMeta()
// user já vem com hasTickets E hasEvents
```

**Benefícios:**
- Código mais limpo
- Reutilizável em outras páginas
- Navbar recebe `hasEvents` para determinar o que mostrar

---

## Fluxos de Usuário

### Fluxo 1: Usuário Novo (PARTICIPANTE)
1. Cadastra-se → role = 'PARTICIPANTE'
2. Vê navbar: **[Criar Evento]** + [Meus Ingressos]
3. Compra ingresso → Continua PARTICIPANTE ✅
4. Vê navbar: **[Criar Evento]** + [Meus Ingressos] (não muda!)

### Fluxo 2: Usuário Cria Primeiro Evento
1. Usuário PARTICIPANTE clica em "Criar Evento"
2. Preenche formulário e salva
3. API promove para PALESTRANTE ✅
4. Navbar muda automaticamente: **[Meus Eventos]** + [Meus Ingressos]
5. Dashboard mostra seus eventos

### Fluxo 3: Usuário Reserva Espaço
1. Usuário PARTICIPANTE solicita orçamento
2. Finaliza pagamento da reserva
3. API cria evento automaticamente
4. API promove para PALESTRANTE ✅
5. Navbar muda: **[Meus Eventos]** + [Meus Ingressos]
6. Dashboard mostra o evento criado pela reserva

### Fluxo 4: Admin
1. Admin sempre vê: **[Painel Admin]** + [Meus Ingressos]
2. Dashboard mostra TODOS os eventos da plataforma
3. Pode editar/deletar qualquer evento
4. Vê carteira financeira completa

---

## Comparação: Antes vs Depois

| Cenário | ANTES | DEPOIS |
|---------|-------|--------|
| **Compra 1 ingresso** | Vira PALESTRANTE | Continua PARTICIPANTE ✅ |
| **Navbar mostra** | "Meus Eventos" (confuso!) | "Criar Evento" (correto!) ✅ |
| **Cria 1 evento** | Vira PALESTRANTE | Vira PALESTRANTE ✅ |
| **Pode editar evento** | Só ADMIN | Owner OU ADMIN ✅ |
| **Dashboard vazio** | "Sem eventos" | CTA "Criar Primeiro Evento" 🚧 |

🚧 = A implementar no futuro (dashboard adaptativo)

---

## Testes Recomendados

### Teste 1: PARTICIPANTE comprando ingresso
1. Criar usuário novo
2. Comprar ingresso de um evento
3. ✅ **Espera-se:** Navbar mostra "Criar Evento" (não "Meus Eventos")
4. ✅ **Espera-se:** Role continua PARTICIPANTE

### Teste 2: PARTICIPANTE criando evento
1. Criar usuário novo (ou usar o do Teste 1)
2. Clicar em "Criar Evento"
3. Preencher e salvar evento
4. ✅ **Espera-se:** Role muda para PALESTRANTE
5. ✅ **Espera-se:** Navbar muda para "Meus Eventos"

### Teste 3: PALESTRANTE editando próprio evento
1. Usuário PALESTRANTE criou evento X
2. Acessar página de edição do evento X
3. ✅ **Espera-se:** Pode editar (ownership)

### Teste 4: PALESTRANTE tentando editar evento de outro
1. Usuário PALESTRANTE A criou evento X
2. Usuário PALESTRANTE B tenta editar evento X
3. ⚠️ **Espera-se:** Negado (precisa implementar ownership check) 🚧

### Teste 5: ADMIN editando qualquer evento
1. ADMIN acessa qualquer evento
2. ✅ **Espera-se:** Pode editar/deletar qualquer evento

---

## Melhorias Futuras (Roadmap)

### Dashboard Adaptativo 🚧
**Status:** Não implementado ainda

**PARTICIPANTE sem eventos:**
```
┌─────────────────────────────────────┐
│ 🎯 Crie Seu Primeiro Evento         │
│                                     │
│ [CTA Grande] Começar Agora         │
│                                     │
│ 📊 Você tem X ingressos comprados  │
└─────────────────────────────────────┘
```

**PALESTRANTE com eventos:**
```
┌─────────────────────────────────────┐
│ Meus Eventos (3)                    │
│ [Lista de eventos]                  │
│ 📊 X eventos publicados             │
└─────────────────────────────────────┘
```

### Ownership Checks nas APIs 🚧
**Status:** Helpers criados, falta aplicar nas rotas

**Arquivos a modificar:**
- `app/api/eventos/[eventId]/route.ts` (PUT, DELETE)
- `app/painel/admin/eventos/[eventId]/editar/page.tsx`
- `app/painel/admin/eventos/[eventId]/alunos/page.tsx`

**Lógica:**
```typescript
import { canUserEditEvent } from '@/lib/user-permissions'

if (!canUserEditEvent(user, event)) {
  return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
}
```

### Auto-Downgrade (Opcional) 🤔
**Status:** Não decidido se implementar

**Proposta:**
- Se PALESTRANTE deletar TODOS seus eventos → Volta para PARTICIPANTE?
- Ou: Uma vez PALESTRANTE, sempre PALESTRANTE (mesmo sem eventos ativos)?

**Decisão:** Aguardando feedback do cliente

---

## Arquivos Modificados

### Novos Arquivos
- ✅ `lib/user-permissions.ts` - Helper de permissões
- ✅ `lib/get-user-with-meta.ts` - Helper para buscar usuário com metadados
- ✅ `NOVA-LOGICA-ROLES.md` - Documentação da proposta
- ✅ `IMPLEMENTACAO-NOVA-LOGICA-ROLES.md` - Este arquivo

### Arquivos Atualizados
- ✅ `components/Navbar.tsx` - Navegação adaptativa
- ✅ `app/page.tsx` - Usa getUserWithMeta
- ✅ `app/api/tickets/create/route.ts` - Removido auto-upgrade
- ✅ `app/api/bookings/create/route.ts` - Comentários melhorados
- ✅ `app/api/events/create/route.ts` - Mantido auto-upgrade (correto)

---

## Checklist de Implementação

- [x] Criar helper `getUserWithMeta`
- [x] Criar helper `getUserPermissions`
- [x] Atualizar Navbar com lógica adaptativa
- [x] Adicionar `hasEvents` ao tipo de usuário
- [x] Remover auto-upgrade em `tickets/create`
- [x] Manter auto-upgrade em `events/create`
- [x] Manter auto-upgrade em `bookings/create`
- [x] Atualizar home page para passar `hasEvents`
- [ ] Implementar ownership checks nas APIs de edição
- [ ] Atualizar dashboard com estados vazios personalizados
- [ ] Atualizar outras páginas (checkout, evento/[slug], etc) para usar getUserWithMeta
- [ ] Testar todos os fluxos de usuário
- [ ] Decidir sobre auto-downgrade

---

## Resumo Executivo

### O Que Mudou?
1. **Navbar inteligente:** Mostra "Criar Evento" para quem nunca criou, e "Meus Eventos" para quem já criou
2. **Comprar ingresso não promove mais:** PARTICIPANTE continua PARTICIPANTE
3. **Criar evento promove:** PARTICIPANTE vira PALESTRANTE (lógica correta)
4. **Código mais organizado:** Helpers reutilizáveis

### Por Que Mudou?
- **Evitar confusão:** "Por que vejo 'Meus Eventos' se nunca criei nada?"
- **UI adaptativa:** Cada usuário vê o que realmente importa para ele
- **Melhor UX:** CTA claro para quem nunca criou eventos

### Próximos Passos?
1. Implementar ownership checks (PALESTRANTE só edita seus eventos)
2. Criar dashboard adaptativo com empty states
3. Testar todos os fluxos
4. Feedback do cliente sobre auto-downgrade

---

**Status:** ✅ Implementação Core Completa
**Data:** 2025-12-12
**Pendências:** Dashboard adaptativo + Ownership checks
