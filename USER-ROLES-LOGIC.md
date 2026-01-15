# Lógica de Roles de Usuários - StageOne

## Estrutura de Roles

O sistema possui 3 níveis de acesso:

### 1. PARTICIPANTE (Padrão)
- **Criado quando:** Usuário se cadastra na plataforma
- **Permissões:**
  - Ver eventos públicos
  - Comprar ingressos
  - Ver seus próprios ingressos em `/meus-ingressos`
- **Navegação visível:**
  - Meus Ingressos

### 2. PALESTRANTE (Auto-upgrade)
- **Criado quando:**
  - PARTICIPANTE compra primeiro ingresso (upgrade automático)
  - OU usuário cria seu primeiro evento
- **Permissões:**
  - Todas de PARTICIPANTE +
  - Criar eventos
  - Gerenciar eventos próprios
  - Ver alunos dos seus eventos
  - Fazer check-in nos eventos próprios
- **Navegação visível:**
  - Meus Eventos (Dashboard)
  - Meus Ingressos

### 3. ADMIN (Manual)
- **Criado quando:** Manualmente no banco de dados
- **Permissões:**
  - Todas de PALESTRANTE +
  - Ver todos eventos da plataforma
  - Editar qualquer evento
  - Gerenciar usuários
  - Ver dashboard financeiro
  - Acessar todas ferramentas administrativas
- **Navegação visível:**
  - Painel Admin
  - Meus Ingressos

## Fluxos de Upgrade

### Fluxo 1: PARTICIPANTE → PALESTRANTE (via compra)
```
1. Usuário cadastra-se (role: PARTICIPANTE)
2. Usuário compra ingresso
3. API /api/tickets/create detecta role PARTICIPANTE
4. Sistema atualiza role para PALESTRANTE
5. Usuário pode criar eventos + ver ingressos
```

### Fluxo 2: PARTICIPANTE → PALESTRANTE (via criação de evento)
```
1. Usuário cadastra-se (role: PARTICIPANTE)
2. Usuário cria evento via /painel/palestrante/eventos/novo
3. Role permanece PALESTRANTE
4. Usuário pode criar eventos (mas ainda não tem ingressos)
```

### Fluxo 3: PALESTRANTE com ambos
```
1. Usuário já é PALESTRANTE (criou evento)
2. Usuário compra ingresso
3. Sistema não altera role (já é PALESTRANTE)
4. Usuário tem acesso a: criar eventos + ver ingressos
```

## Regras de Acesso por Página

| Rota | PARTICIPANTE | PALESTRANTE | ADMIN |
|------|--------------|-------------|-------|
| `/` | ✅ | ✅ | ✅ |
| `/evento/[slug]` | ✅ | ✅ | ✅ |
| `/meus-ingressos` | ✅ | ✅ | ✅ |
| `/painel/palestrante` | ❌ | ✅ | ✅ |
| `/painel/palestrante/eventos/novo` | ❌ | ✅ | ✅ |
| `/painel/admin` | ❌ | ❌ | ✅ |
| `/painel/admin/eventos` | ❌ | ❌ | ✅ |
| `/painel/admin/usuarios` | ❌ | ❌ | ✅ |

## Vantagens desta Lógica

1. **Engajamento:** Participantes que compram ingressos ganham poder de criar eventos
2. **Simplicidade:** Auto-upgrade sem intervenção manual
3. **Flexibilidade:** PALESTRANTE pode criar eventos E comprar ingressos
4. **Escalabilidade:** Admin mantém controle total da plataforma

## Implementação

### Navbar (components/Navbar.tsx)
```typescript
const showAdminPanel = user?.role === 'ADMIN'
const showEventosPanel = user?.role === 'PALESTRANTE' || user?.role === 'ADMIN'
const showMeusIngressos = !!user // Todos usuários autenticados
```

### API Tickets (app/api/tickets/create/route.ts)
```typescript
if (userProfile?.role === 'PARTICIPANTE') {
  await supabase
    .from('users')
    .update({ role: 'PALESTRANTE' })
    .eq('id', user.id)
}
```

### Dashboard Palestrante (app/painel/palestrante/page.tsx)
- Mostra eventos criados
- Mostra total de ingressos comprados
- Botões: "Criar Evento" + "Ver Meus Ingressos"

## Observações

- Role NUNCA faz downgrade (uma vez PALESTRANTE, sempre PALESTRANTE)
- ADMIN é definido manualmente no banco de dados
- Sistema prioriza UX: usuário com ingresso pode criar evento
- Layout e design mantidos intactos, apenas lógica de acesso alterada
