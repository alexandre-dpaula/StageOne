# Sistema de Roles Simplificado - StageOne

## Resumo das Mudanças

**Data:** 2025-12-13

### O Que Mudou?

Simplificamos drasticamente o sistema de roles da plataforma, eliminando complexidade desnecessária e alinhando com como plataformas líderes de mercado (Sympla, Eventbrite) funcionam.

**ANTES:**
- 3 roles: ADMIN, PALESTRANTE, PARTICIPANTE
- Auto-upgrade automático ao comprar ingresso
- Auto-upgrade automático ao criar evento
- Navegação baseada em role
- Confusão: "Por que vejo 'Meus Eventos' se nunca criei nada?"

**DEPOIS:**
- 2 roles: ADMIN, USER
- Sem auto-upgrade (removido completamente)
- Navegação baseada em AÇÕES (hasEvents), não em role
- UX clara: vê "Criar Evento" até criar o primeiro, depois vê "Meus Eventos"

---

## Nova Lógica de Roles

### Roles Disponíveis

```typescript
type UserRole = 'ADMIN' | 'USER'
```

#### ADMIN
- Acesso total à plataforma
- Pode gerenciar todos os eventos (de qualquer usuário)
- Pode ver todos os ingressos vendidos
- Pode acessar dashboard administrativo
- Pode ver estatísticas financeiras

#### USER
- Usuário padrão da plataforma
- Pode criar eventos (sem limite)
- Pode comprar ingressos
- Pode gerenciar SEUS PRÓPRIOS eventos (ownership-based)
- Pode ver SEUS PRÓPRIOS ingressos

---

## Navegação Adaptativa (Baseada em Ações)

A navbar se adapta com base no que o usuário **JÁ FEZ**, não no que ele **É**:

### Usuário SEM eventos criados
```
[St™]    [Criar Evento] [Meus Ingressos] [Avatar] [Sair]
```
- **"Criar Evento"**: Botão CTA destacado (fundo neon green)
- **"Meus Ingressos"**: Sempre visível

### Usuário COM eventos criados
```
[St™]    [Meus Eventos] [Meus Ingressos] [Avatar] [Sair]
```
- **"Meus Eventos"**: Link para dashboard de eventos
- **"Meus Ingressos"**: Sempre visível

### ADMIN
```
[St™]    [Meus Eventos] [Meus Ingressos] [Avatar] [Sair]
```
- **"Meus Eventos"**: Acesso TOTAL (todos os eventos da plataforma)
- **"Meus Ingressos"**: Sempre visível

---

## Permissões (Ownership-Based)

### Criar Eventos
- ✅ **USER**: Pode criar eventos
- ✅ **ADMIN**: Pode criar eventos

### Editar/Deletar Eventos
- ✅ **USER**: Pode editar/deletar SEUS PRÓPRIOS eventos (created_by === user.id)
- ✅ **ADMIN**: Pode editar/deletar QUALQUER evento

### Ver Lista de Alunos
- ✅ **USER**: Pode ver alunos dos SEUS eventos
- ✅ **ADMIN**: Pode ver alunos de QUALQUER evento

### Fazer Check-in
- ✅ **USER**: Pode fazer check-in nos SEUS eventos
- ✅ **ADMIN**: Pode fazer check-in em QUALQUER evento

### Gerenciar Usuários
- ❌ **USER**: Não tem acesso
- ✅ **ADMIN**: Acesso total

### Ver Financeiro
- ❌ **USER**: Não tem acesso
- ✅ **ADMIN**: Acesso total

---

## Fluxos de Usuário

### Fluxo 1: Novo Usuário Comprando Ingresso
1. Cadastra-se → role = 'USER'
2. Vê navbar: **[Criar Evento]** + [Meus Ingressos]
3. Compra ingresso de um evento
4. ✅ Continua sendo USER (SEM auto-upgrade)
5. ✅ Navbar continua: **[Criar Evento]** + [Meus Ingressos]
6. Pode comprar quantos ingressos quiser → Continua vendo "Criar Evento"

### Fluxo 2: Usuário Criando Primeiro Evento
1. Usuário USER clica em "Criar Evento"
2. Preenche formulário e salva
3. ✅ Continua sendo USER (SEM auto-upgrade)
4. ✅ Navbar muda automaticamente: **[Meus Eventos]** + [Meus Ingressos]
5. Dashboard mostra seus eventos
6. Pode editar/deletar seus próprios eventos

### Fluxo 3: Usuário Reservando Espaço
1. Usuário USER solicita orçamento
2. Finaliza pagamento da reserva
3. ✅ Continua sendo USER (SEM auto-upgrade)
4. Pode criar evento vinculado à reserva
5. Após criar evento → Navbar muda: **[Meus Eventos]** + [Meus Ingressos]

### Fluxo 4: Admin
1. Admin sempre vê: **[Meus Eventos]** + [Meus Ingressos]
2. Dashboard mostra TODOS os eventos da plataforma
3. Pode editar/deletar qualquer evento
4. Vê carteira financeira completa
5. Pode gerenciar usuários

---

## Arquivos Modificados

### Core Logic
- ✅ `components/Navbar.tsx` - Navegação baseada em hasEvents
- ✅ `lib/user-permissions.ts` - Permissões ownership-based
- ✅ `lib/get-user-with-meta.ts` - Helper para buscar hasEvents
- ✅ `types/database.types.ts` - Adicionado 'USER' ao enum

### API Routes (Removido Auto-Upgrade)
- ✅ `app/api/events/create/route.ts` - Removido auto-upgrade
- ✅ `app/api/bookings/create/route.ts` - Removido auto-upgrade
- ✅ `app/api/tickets/create/route.ts` - Já estava sem auto-upgrade

### Admin Pages
- ✅ `app/painel/admin/usuarios/page.tsx` - Exibe USER/ADMIN (não mais PALESTRANTE/PARTICIPANTE)

---

## Comparação: Antes vs Depois

| Cenário | ANTES | DEPOIS |
|---------|-------|--------|
| **Cadastro inicial** | Role = PARTICIPANTE | Role = USER ✅ |
| **Compra 1 ingresso** | Vira PALESTRANTE ❌ | Continua USER ✅ |
| **Navbar após compra** | "Meus Eventos" (confuso!) | "Criar Evento" (correto!) ✅ |
| **Cria 1 evento** | Vira PALESTRANTE | Continua USER ✅ |
| **Navbar após criar** | "Meus Eventos" | "Meus Eventos" ✅ |
| **Pode editar evento** | Só ADMIN/PALESTRANTE | Owner OU ADMIN ✅ |
| **Dashboard vazio** | "Sem eventos" | CTA "Criar Primeiro Evento" ✅ |
| **Roles na plataforma** | 3 roles (confuso) | 2 roles (simples) ✅ |

---

## Migração de Dados (Pendente)

Para aplicar completamente esta lógica, será necessário migrar os dados existentes no banco:

```sql
-- Migração de PALESTRANTE e PARTICIPANTE para USER
UPDATE users
SET role = 'USER'
WHERE role IN ('PALESTRANTE', 'PARTICIPANTE');

-- Opcional: Adicionar constraint no enum (após migração)
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('ADMIN', 'USER'));
```

**IMPORTANTE:** Executar esta migração apenas quando todos os códigos já estiverem atualizados.

---

## Vantagens da Nova Lógica

### 1. **Simplicidade**
- Menos roles = Menos complexidade
- Mais fácil de entender e manter
- Código mais limpo

### 2. **UX Melhorada**
- Navegação intuitiva baseada em ações reais
- Sem confusão: "Por que vejo X se nunca fiz Y?"
- CTA claro para quem nunca criou eventos

### 3. **Alinhamento com Mercado**
- Sympla, Eventbrite, Meetup → Todos funcionam assim
- Usuário = Usuário (sem distinção artificial)
- Permissões baseadas em ownership, não em "cargo"

### 4. **Escalabilidade**
- Fácil adicionar novos recursos
- Não precisa criar novos roles para cada feature
- Ownership resolve 90% dos casos de permissão

### 5. **Menos Bugs**
- Sem auto-upgrade = Sem side effects inesperados
- Estado da UI reflete estado real do usuário
- Mais previsível e testável

---

## Próximos Passos (Opcional)

### 1. Migração SQL ✅ Recomendado
Executar script de migração para converter PALESTRANTE/PARTICIPANTE → USER

### 2. Dashboard Adaptativo 🚧 Futuro
- Estado vazio personalizado para usuários sem eventos
- CTA grande "Crie Seu Primeiro Evento"
- Estatísticas personalizadas por tipo de usuário

### 3. Onboarding Melhorado 🚧 Futuro
- Tour guiado para novos usuários
- "Você ainda não criou eventos, vamos começar?"
- Tutoriais contextuais

### 4. Analytics 🚧 Futuro
- Tracking de conversão: Cadastro → Primeiro Evento
- Tempo médio até criar primeiro evento
- Taxa de ativação de usuários

---

## Checklist de Implementação

- [x] Atualizar `types/database.types.ts` com 'USER'
- [x] Remover auto-upgrade em `app/api/events/create/route.ts`
- [x] Remover auto-upgrade em `app/api/bookings/create/route.ts`
- [x] Atualizar `components/Navbar.tsx` para lógica baseada em hasEvents
- [x] Atualizar `lib/user-permissions.ts` para ownership-based
- [x] Atualizar `app/painel/admin/usuarios/page.tsx` para exibir USER/ADMIN
- [ ] Executar migração SQL (UPDATE users SET role = 'USER')
- [ ] Testar todos os fluxos de usuário
- [ ] Atualizar documentação de API
- [ ] Atualizar README.md

---

## Status

✅ **Implementação Core Completa**
📅 **Data:** 2025-12-13
⏳ **Pendente:** Migração SQL (aguardando aprovação)

---

**Resultado Final:** Sistema mais simples, intuitivo e alinhado com as melhores práticas do mercado. 🚀
