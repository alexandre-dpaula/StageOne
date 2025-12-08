# 💰 Sistema de Orçamento StageOne

## Visão Geral

Sistema completo de solicitação de orçamento que permite aos usuários:
1. Fazer cotação de eventos
2. Criar conta automaticamente
3. Processar pagamento
4. Acessar painel imediatamente

## 🎯 Fluxo Completo

### 1. **Página Inicial**
- Botão "Solicitar Orçamento" na Hero section
- CTA destacado com ícone de calculadora
- Acesso direto em `/orcamento`

### 2. **Formulário Multi-Step** (`/orcamento`)

#### **Step 1: Dados Pessoais**
- Nome completo
- E-mail
- Telefone/WhatsApp
- Criação de senha (mínimo 6 caracteres)

#### **Step 2: Detalhes do Evento**
- Nome do evento
- Data do evento
- Horas de locação (1-12h via slider)
- Número de participantes (10-200 via slider)
- **Serviços Adicionais:**
  - ✅ Equipamento Audiovisual - R$ 500
  - ✅ Cobertura Fotográfica - R$ 800
  - ✅ Coffee Break - R$ 15/pessoa
- Observações adicionais (opcional)

#### **Step 3: Resumo e Confirmação**
- Resumo completo dos dados
- Cálculo automático do valor total
- Detalhamento de preços:
  - Base: R$ 200/hora
  - Adicionais somados
  - Total final

### 3. **Processamento Automático**

Ao clicar em "Confirmar e Pagar":

1. **Criação de Usuário**
   - Cadastro automático no Supabase Auth
   - Criação de perfil em `public.users`
   - Role: `PARTICIPANTE`

2. **Criação de Reserva**
   - Inserção em `space_bookings`
   - Status: `PENDING`
   - Payment Status: `PENDING`
   - Todos os dados do evento salvos

3. **Redirecionamento**
   - Vai para `/checkout-reserva?new_user=true`
   - `booking_id` salvo em localStorage
   - Usuário já autenticado

### 4. **Checkout e Pagamento**
- Página de pagamento existente
- Confirmação de dados
- Processamento de pagamento
- Criação automática do evento após pagamento

## 📊 Tabela de Preços

| Item | Preço |
|------|-------|
| Locação do espaço | R$ 200/hora |
| Equipamento Audiovisual | R$ 500 (fixo) |
| Cobertura Fotográfica | R$ 800 (fixo) |
| Coffee Break | R$ 15/pessoa |

**Exemplo de Cálculo:**
- 4 horas de locação = R$ 800
- Audiovisual = R$ 500
- Coffee Break (50 pessoas) = R$ 750
- **Total: R$ 2.050**

## 🎨 Design e UX

### Componentes Visuais:
- ✅ Progress bar com 3 steps
- ✅ Cards com glass morphism
- ✅ Sliders interativos para horas e participantes
- ✅ Checkboxes estilizados para adicionais
- ✅ Cálculo em tempo real dos valores
- ✅ Resumo detalhado antes da confirmação

### Animações:
- Fade-in nos steps
- Hover effects nos cards
- Loading states no submit
- Transições suaves entre steps

## 🔒 Segurança

### Validações:
- Email válido (HTML5 validation)
- Senha mínimo 6 caracteres
- Campos obrigatórios validados
- Data do evento futura

### Tratamento de Erros:
- Try/catch em todas operações
- Mensagens de erro amigáveis
- Feedback visual para o usuário
- Log de erros no console

## 🔄 Integração com Sistema Existente

### Tabelas Utilizadas:
1. **`auth.users`** - Autenticação Supabase
2. **`public.users`** - Perfil do usuário
3. **`public.space_bookings`** - Reservas de espaço

### Fluxo Pós-Orçamento:
1. Usuário redireciona para checkout
2. Checkout usa booking_id existente
3. Após pagamento, cria evento
4. Usuário tem acesso ao painel

## 🚀 Melhorias Futuras

### Fase 2:
- [ ] Integração com gateway de pagamento real
- [ ] Email de confirmação de orçamento
- [ ] Dashboard de orçamentos pendentes (admin)
- [ ] Sistema de desconto por cupom
- [ ] Múltiplas formas de pagamento
- [ ] Parcelamento

### Fase 3:
- [ ] Chat em tempo real para esclarecimentos
- [ ] Calendário interativo para ver disponibilidade
- [ ] Upload de arquivos (logo, material)
- [ ] Contratos digitais
- [ ] Assinatura eletrônica

## 📱 Responsividade

- ✅ Mobile-first design
- ✅ Breakpoints: mobile, tablet, desktop
- ✅ Touch-friendly sliders
- ✅ Formulários adaptáveis
- ✅ Cards responsivos

## 🧪 Testes Necessários

### Cenários de Teste:
1. [ ] Criar orçamento com todos campos preenchidos
2. [ ] Criar orçamento sem adicionais
3. [ ] Criar orçamento com todos adicionais
4. [ ] Validar emails duplicados
5. [ ] Testar navegação entre steps
6. [ ] Testar botão voltar em cada step
7. [ ] Verificar cálculos de preço
8. [ ] Testar redirecionamento após submit
9. [ ] Verificar criação de usuário
10. [ ] Verificar criação de reserva

## 📝 Notas de Implementação

### Arquivos Criados:
- `app/orcamento/page.tsx` - Página principal do orçamento
- `ORCAMENTO-FLOW.md` - Esta documentação

### Arquivos Modificados:
- `app/page.tsx` - Adicionado botão CTA
- `components/ui/Button.tsx` - Melhorado estilo secondary

### Dependências:
- Nenhuma nova dependência adicionada
- Usa apenas bibliotecas existentes no projeto
