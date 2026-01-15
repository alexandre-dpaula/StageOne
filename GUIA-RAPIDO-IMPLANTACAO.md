# ⚡ Guia Rápido de Implantação - Novos Recursos

**Tempo estimado:** 10 minutos
**Última atualização:** 13/12/2025

---

## 🎯 O QUE FOI IMPLEMENTADO

5 recursos críticos que colocam o StageOne em pé de igualdade com Sympla/Eventbrite:

1. ✅ **Lotes Automáticos** - Preços mudam por data/quantidade
2. ✅ **Cupons de Desconto** - Sistema completo com tracking
3. ✅ **Dashboard Analytics** - Vendas em tempo real
4. ✅ **Exportação CSV** - Participantes e vendas
5. ✅ **Certificados** - Geração automática com templates

---

## 📋 CHECKLIST DE IMPLANTAÇÃO

### ✅ Passo 1: Executar Migration SQL (5 min)

**Opção A - Via Supabase Dashboard:**
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Abra o arquivo `add-batch-and-coupon-system.sql`
4. Cole o conteúdo completo
5. Clique em **Run**
6. Aguarde confirmação de sucesso

**Opção B - Via CLI:**
```bash
# Na raiz do projeto StageOne
npx supabase db push
```

**O que a migration cria:**
- ✅ 4 novas tabelas (coupons, coupon_usages, certificates, certificate_templates)
- ✅ Campos adicionais em tickets e tickets_types
- ✅ Função SQL de validação de cupom
- ✅ Triggers automáticos
- ✅ RLS (Row Level Security) policies
- ✅ Template padrão de certificado

---

### ✅ Passo 2: Verificar Arquivos Criados (1 min)

Confirme que os seguintes arquivos foram criados:

#### **SQL:**
- ✅ `add-batch-and-coupon-system.sql`

#### **Types:**
- ✅ `types/database.types.ts` (atualizado)

#### **APIs:**
- ✅ `app/api/coupons/route.ts`
- ✅ `app/api/coupons/validate/route.ts`
- ✅ `app/api/analytics/[eventId]/route.ts`
- ✅ `app/api/export/participants/[eventId]/route.ts`
- ✅ `app/api/export/sales/[eventId]/route.ts`
- ✅ `app/api/certificates/generate/[ticketId]/route.ts`

#### **Libs:**
- ✅ `lib/certificates/generate-certificate.ts`

#### **Docs:**
- ✅ `NOVOS-RECURSOS-IMPLEMENTADOS.md`
- ✅ `RECURSOS-FALTANTES-ROADMAP.md`
- ✅ `GUIA-RAPIDO-IMPLANTACAO.md` (este arquivo)

---

### ✅ Passo 3: Testar APIs (2 min)

#### **Teste 1: Criar Cupom**
```bash
# Substitua [SEU_TOKEN] pelo token de autenticação de um admin
curl -X POST http://localhost:3000/api/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [SEU_TOKEN]" \
  -d '{
    "code": "TESTE10",
    "discount_type": "PERCENTAGE",
    "discount_value": 10,
    "valid_from": "2025-12-13T00:00:00Z",
    "usage_limit": 100
  }'
```

**Resposta esperada:**
```json
{
  "coupon": {
    "id": "uuid...",
    "code": "TESTE10",
    "discount_type": "PERCENTAGE",
    "discount_value": 10,
    "is_active": true,
    "usage_count": 0
  }
}
```

#### **Teste 2: Validar Cupom**
```bash
curl -X POST http://localhost:3000/api/coupons/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [SEU_TOKEN]" \
  -d '{
    "coupon_code": "TESTE10",
    "ticket_type_id": "[UUID_DO_TICKET_TYPE]",
    "ticket_price": 100
  }'
```

**Resposta esperada:**
```json
{
  "is_valid": true,
  "discount_amount": 10,
  "final_price": 90,
  "coupon_id": "uuid..."
}
```

#### **Teste 3: Analytics**
```bash
curl http://localhost:3000/api/analytics/[EVENT_ID] \
  -H "Authorization: Bearer [SEU_TOKEN]"
```

**Resposta esperada:**
```json
{
  "analytics": {
    "total_revenue": 1500,
    "total_tickets_sold": 10,
    "total_tickets_checked_in": 5,
    "checkin_rate": 50,
    "sales_by_day": [...],
    "sales_by_ticket_type": [...],
    "sales_by_hour": [...],
    "coupon_usage": [...]
  }
}
```

#### **Teste 4: Exportar Participantes**
```bash
curl http://localhost:3000/api/export/participants/[EVENT_ID]?format=csv \
  -H "Authorization: Bearer [SEU_TOKEN]" \
  --output participantes.csv
```

**Resultado:** Arquivo CSV baixado com lista de participantes

#### **Teste 5: Gerar Certificado**
```bash
curl -X POST http://localhost:3000/api/certificates/generate/[TICKET_ID] \
  -H "Authorization: Bearer [SEU_TOKEN]"
```

**Resposta esperada:**
```json
{
  "certificate": {
    "id": "uuid...",
    "participant_name": "João Silva",
    "event_title": "Treinamento de Liderança",
    "validation_token": "CERT-..."
  },
  "html": "<!DOCTYPE html>...",
  "message": "Certificado gerado com sucesso"
}
```

---

## 🔧 TROUBLESHOOTING

### ❌ Erro: "relation 'coupons' does not exist"
**Causa:** Migration não foi executada
**Solução:** Execute o Passo 1 novamente

### ❌ Erro: "permission denied for function validate_and_apply_coupon"
**Causa:** RLS policies não foram criadas
**Solução:** Verifique se todas as policies foram criadas na migration

### ❌ Erro: "coupon not found or inactive"
**Causa:** Cupom não existe ou está inativo
**Solução:** Verifique se o cupom foi criado corretamente

### ❌ Erro: "certificate available only after check-in"
**Causa:** Ticket não teve check-in ainda (status != 'USED')
**Solução:** Realize check-in do ticket primeiro

### ❌ Erro: Type errors no build
**Causa:** Types não foram atualizados
**Solução:** Reinicie o servidor de desenvolvimento

```bash
# Parar servidor
Ctrl+C

# Limpar cache
rm -rf .next

# Reinstalar dependências (se necessário)
npm install

# Reiniciar
npm run dev
```

---

## 📊 VERIFICAÇÃO FINAL

Execute este checklist para confirmar que tudo está funcionando:

- [ ] Migration executada sem erros
- [ ] Todas as 4 tabelas criadas (coupons, coupon_usages, certificates, certificate_templates)
- [ ] Template padrão "StageOne Moderno" existe
- [ ] API de cupons responde corretamente
- [ ] API de analytics retorna dados
- [ ] Exportação CSV funciona
- [ ] Certificado é gerado em HTML
- [ ] Build passa sem erros TypeScript

```bash
# Testar build
npm run build
```

**Resultado esperado:** Build completo sem erros

---

## 🎨 PRÓXIMOS PASSOS (OPCIONAL - UI)

Para completar a implementação com interface visual, siga os próximos passos:

### 1. Dashboard de Analytics (Priority 1)
Criar página: `app/painel/admin/eventos/[eventId]/analytics/page.tsx`

**Componentes necessários:**
- Cards de métricas (Receita, Tickets, Check-in Rate)
- Gráfico de vendas por dia (Line Chart)
- Gráfico de vendas por tipo (Pie Chart)
- Gráfico de vendas por hora (Bar Chart)
- Lista de cupons usados

**Biblioteca recomendada:**
```bash
npm install recharts
```

### 2. Gerenciamento de Cupons (Priority 2)
Criar página: `app/painel/admin/cupons/page.tsx`

**Funcionalidades:**
- Formulário de criação de cupom
- Lista de cupons com filtros
- Editar/desativar cupom
- Relatório de uso

### 3. Campo de Cupom no Checkout (Priority 3)
Atualizar: `app/checkout/[eventId]/[ticketTypeId]/page.tsx`

**Adicionar:**
- Input para código do cupom
- Botão "Aplicar"
- Validação em tempo real
- Exibição do desconto

### 4. Página de Certificados (Priority 4)
Criar página: `app/meus-certificados/page.tsx`

**Funcionalidades:**
- Lista de certificados do usuário
- Preview do certificado
- Botão de download/impressão

### 5. Validação Pública de Certificado (Priority 5)
Criar página: `app/validar-certificado/[token]/page.tsx`

**Funcionalidades:**
- Verificar autenticidade
- Mostrar dados do certificado
- QR Code scanner (opcional)

### 6. Botões de Exportação (Priority 6)
Atualizar: `app/painel/admin/eventos/[eventId]/alunos/page.tsx`

**Adicionar:**
- Botão "Exportar Participantes (CSV)"
- Botão "Exportar Vendas (CSV)"

---

## 💡 DICAS IMPORTANTES

### Segurança:
- ✅ Todas as APIs têm validação de autenticação
- ✅ RLS está habilitado em todas as tabelas
- ✅ Apenas admin pode criar cupons
- ✅ Apenas dono do ticket pode gerar certificado

### Performance:
- ✅ Índices criados em todas as colunas de busca
- ✅ Queries otimizadas com joins
- ✅ Função SQL executa no banco (não no servidor)

### Escalabilidade:
- ✅ Sistema suporta milhares de cupons
- ✅ Triggers automáticos para contadores
- ✅ Preparado para alto volume de vendas

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para detalhes técnicos completos, consulte:
- **NOVOS-RECURSOS-IMPLEMENTADOS.md** - Documentação técnica detalhada
- **RECURSOS-FALTANTES-ROADMAP.md** - Roadmap de recursos futuros

---

## 🆘 SUPORTE

Se encontrar problemas:

1. **Verifique os logs:**
```bash
# Logs do Next.js
npm run dev

# Logs do Supabase
# Acesse Supabase Dashboard > Logs
```

2. **Verifique o banco de dados:**
```sql
-- Ver tabelas criadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('coupons', 'coupon_usages', 'certificates', 'certificate_templates');

-- Ver template padrão
SELECT * FROM certificate_templates WHERE is_default = true;

-- Ver cupons
SELECT * FROM coupons;
```

3. **TypeScript errors:**
```bash
# Verificar tipos
npm run type-check

# Ou
npx tsc --noEmit
```

---

## ✅ CONCLUSÃO

Após seguir este guia, você terá:

- ✅ **5 recursos críticos** funcionando
- ✅ **Backend completo** implementado
- ✅ **APIs prontas** para consumo
- ✅ **Sistema escalável** e seguro

**Próximo passo:** Implementar as interfaces visuais (UI) dos novos recursos.

**Tempo estimado para UI:** 1-2 semanas

---

**StageOne™ v2.0.0**
*Desenvolvido com Claude Sonnet 4.5*
*13 de Dezembro de 2025*
