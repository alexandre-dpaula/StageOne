# 🚀 Como Executar a Migration - StageOne v2.0

**Tempo estimado:** 5 minutos
**Dificuldade:** Fácil

---

## 📋 PRÉ-REQUISITOS

- ✅ Acesso ao Supabase Dashboard
- ✅ Arquivo `add-batch-and-coupon-system.sql` disponível

---

## 🎯 OPÇÃO 1: VIA SUPABASE DASHBOARD (Recomendado)

### Passo 1: Abrir SQL Editor

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto StageOne
3. No menu lateral esquerdo, clique em **"SQL Editor"**

### Passo 2: Criar Nova Query

1. Clique no botão **"New Query"**
2. Dê um nome: `Migration v2.0 - Batch, Coupons, Certificates`

### Passo 3: Copiar SQL

1. Abra o arquivo `add-batch-and-coupon-system.sql`
2. Selecione TODO o conteúdo (Ctrl+A / Cmd+A)
3. Copie (Ctrl+C / Cmd+C)

### Passo 4: Colar e Executar

1. Cole o SQL no editor (Ctrl+V / Cmd+V)
2. Clique no botão **"Run"** (ou Ctrl+Enter / Cmd+Enter)
3. Aguarde a execução (cerca de 10-15 segundos)

### Passo 5: Verificar Resultado

Você deve ver uma mensagem de sucesso com:

```
MIGRATION COMPLETED
coupons_table: 1
coupon_usages_table: 1
certificates_table: 1
templates_table: 1
```

✅ **Sucesso!** Todas as 4 tabelas foram criadas.

---

## 🎯 OPÇÃO 2: VIA SUPABASE CLI

### Passo 1: Instalar Supabase CLI (se não tiver)

```bash
npm install -g supabase
```

### Passo 2: Login no Supabase

```bash
supabase login
```

### Passo 3: Link com seu Projeto

```bash
cd "/Users/alexandredpaula/SaaS DEV/StageOne"
supabase link --project-ref [SEU_PROJECT_REF]
```

### Passo 4: Executar Migration

```bash
supabase db push
```

Ou via arquivo direto:

```bash
psql [SUA_CONNECTION_STRING] -f add-batch-and-coupon-system.sql
```

---

## ✅ VERIFICAÇÃO PÓS-MIGRATION

### 1. Verificar Tabelas Criadas

No SQL Editor do Supabase, execute:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('coupons', 'coupon_usages', 'certificates', 'certificate_templates')
ORDER BY table_name;
```

**Resultado esperado:**
```
certificate_templates
certificates
coupon_usages
coupons
```

✅ **Deve retornar 4 linhas**

---

### 2. Verificar Template Padrão Criado

```sql
SELECT id, name, is_default, is_active
FROM certificate_templates
WHERE is_default = true;
```

**Resultado esperado:**
```
name: "StageOne Moderno"
is_default: true
is_active: true
```

✅ **Deve retornar 1 linha**

---

### 3. Verificar Campos Adicionados em tickets_types

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tickets_types'
AND column_name IN ('batch_number', 'auto_advance_by_date', 'auto_advance_by_quantity', 'quantity_threshold', 'next_batch_price', 'next_batch_date');
```

**Resultado esperado:** 6 linhas (todos os campos novos)

✅ **Todos os 6 campos devem aparecer**

---

### 4. Verificar Campos Adicionados em tickets

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tickets'
AND column_name IN ('coupon_id', 'original_price', 'discount_amount', 'final_price');
```

**Resultado esperado:** 4 linhas

✅ **Todos os 4 campos devem aparecer**

---

### 5. Verificar Função SQL Criada

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'validate_and_apply_coupon';
```

**Resultado esperado:**
```
validate_and_apply_coupon
```

✅ **Função criada com sucesso**

---

### 6. Verificar RLS Policies

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('coupons', 'coupon_usages', 'certificates', 'certificate_templates')
ORDER BY tablename, policyname;
```

**Resultado esperado:** 8 policies (2 por tabela)

✅ **RLS configurado corretamente**

---

## 🧪 TESTE RÁPIDO

### Criar um cupom de teste:

```sql
INSERT INTO coupons (code, discount_type, discount_value, valid_from, is_active)
VALUES ('TESTE10', 'PERCENTAGE', 10, NOW(), true);
```

### Verificar criação:

```sql
SELECT id, code, discount_type, discount_value, is_active, usage_count
FROM coupons
WHERE code = 'TESTE10';
```

**Resultado esperado:**
```
code: TESTE10
discount_type: PERCENTAGE
discount_value: 10
is_active: true
usage_count: 0
```

✅ **Cupom criado com sucesso!**

### Limpar teste:

```sql
DELETE FROM coupons WHERE code = 'TESTE10';
```

---

## ❌ TROUBLESHOOTING

### Erro: "permission denied for table coupons"

**Causa:** RLS não configurado corretamente

**Solução:**
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'coupons';

-- Se rowsecurity = false, executar:
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
```

---

### Erro: "relation 'certificate_templates' already exists"

**Causa:** Migration já foi executada antes

**Solução:**
1. Verificar se as tabelas já existem:
```sql
SELECT * FROM certificate_templates LIMIT 1;
```

2. Se existem, a migration já foi executada. **Não execute novamente!**

---

### Erro: "function validate_and_apply_coupon already exists"

**Causa:** Migration parcialmente executada

**Solução:**
```sql
-- Dropar função antiga
DROP FUNCTION IF EXISTS validate_and_apply_coupon;

-- Reexecutar a migration completa
```

---

### Erro: "constraint violation" ao inserir dados

**Causa:** Violação de constraint (unique, foreign key, etc)

**Solução:**
1. Verificar qual constraint foi violada na mensagem de erro
2. Corrigir os dados antes de inserir

---

## 🔄 ROLLBACK (Se necessário)

**⚠️ ATENÇÃO:** Isso vai deletar TODAS as tabelas e dados criados!

```sql
-- Dropar tabelas (em ordem devido a foreign keys)
DROP TABLE IF EXISTS coupon_usages CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS certificate_templates CASCADE;

-- Dropar função
DROP FUNCTION IF EXISTS validate_and_apply_coupon;
DROP FUNCTION IF EXISTS increment_coupon_usage;

-- Remover campos de tickets_types
ALTER TABLE tickets_types
  DROP COLUMN IF EXISTS batch_number,
  DROP COLUMN IF EXISTS auto_advance_by_date,
  DROP COLUMN IF EXISTS auto_advance_by_quantity,
  DROP COLUMN IF EXISTS quantity_threshold,
  DROP COLUMN IF EXISTS next_batch_price,
  DROP COLUMN IF EXISTS next_batch_date;

-- Remover campos de tickets
ALTER TABLE tickets
  DROP COLUMN IF EXISTS coupon_id,
  DROP COLUMN IF EXISTS original_price,
  DROP COLUMN IF EXISTS discount_amount,
  DROP COLUMN IF EXISTS final_price;
```

**⚠️ Use apenas se realmente precisar desfazer tudo!**

---

## ✅ CHECKLIST FINAL

Antes de prosseguir, confirme:

- [ ] Migration executada sem erros
- [ ] 4 tabelas criadas (coupons, coupon_usages, certificates, certificate_templates)
- [ ] Template padrão "StageOne Moderno" existe
- [ ] 6 campos adicionados em tickets_types
- [ ] 4 campos adicionados em tickets
- [ ] Função validate_and_apply_coupon criada
- [ ] 8 RLS policies criadas
- [ ] Teste de criação de cupom funcionou

---

## 🎉 PRÓXIMOS PASSOS

Após executar a migration com sucesso:

1. ✅ Fazer deploy do código (Vercel/Git)
2. ✅ Testar APIs em produção
3. ⏳ Implementar UI dos novos recursos

---

## 📞 SUPORTE

Se tiver problemas:

1. Verifique os logs do Supabase Dashboard > Logs
2. Consulte `GUIA-RAPIDO-IMPLANTACAO.md`
3. Revise `NOVOS-RECURSOS-IMPLEMENTADOS.md`

---

**StageOne™ v2.0**
**Migration Guide**
**13 de Dezembro de 2025**
