# Guia Completo: Limpeza de Caches

## 🎯 Objetivo

Limpar todos os caches do sistema para resolver problemas de dados desatualizados, melhorar performance e garantir que tudo está funcionando com as versões mais recentes.

---

## ✅ PARTE 1: Caches do Sistema (CONCLUÍDO)

O script automático já limpou:

- ✅ **Next.js** - Pasta `.next` removida
- ✅ **npm** - Cache limpo com `npm cache clean --force`
- ✅ **Vercel** - Cache local removido
- ✅ **TypeScript** - Build info removido
- ✅ **Arquivos temporários** - `.DS_Store` e `*.log` removidos

### Executado automaticamente:
```bash
./clear-system-cache.sh
```

---

## 🔄 PARTE 2: Caches do Banco de Dados

### Passo 1: Acessar Supabase SQL Editor

**URL**: https://supabase.com/dashboard/project/tzdraygdkeudxgtpoetp/sql/new

### Passo 2: Colar e Executar o Script

O script já está na área de transferência! Basta:

1. Abrir o SQL Editor no Supabase
2. Colar o script (Cmd+V)
3. Clicar em **Run**

### O que o script SQL faz:

1. 🗑️ Limpa cache de queries (DISCARD PLANS)
2. 🗑️ Limpa cache de sequences (DISCARD SEQUENCES)
3. 🗑️ Remove objetos temporários (DISCARD TEMP)
4. 🗑️ Limpa todos os caches de uma vez (DISCARD ALL)
5. 📊 Atualiza estatísticas das tabelas (ANALYZE)
6. 🧹 Otimiza tabelas com VACUUM
7. 💾 Mostra informações de espaço em disco

---

## 🌐 PARTE 3: Caches do Navegador

### Chrome/Edge/Brave:

1. **Abrir DevTools**: `Cmd + Option + I` (Mac) ou `F12` (Windows)
2. **Botão direito no ícone de refresh**
3. Selecionar: **"Empty Cache and Hard Reload"**

Ou:

1. `Cmd + Shift + Delete` (Mac) ou `Ctrl + Shift + Delete` (Windows)
2. Selecionar: "Cached images and files"
3. Time range: "All time"
4. Clicar em **Clear data**

### Safari:

1. `Cmd + Option + E` - Limpa cache
2. `Cmd + R` - Recarrega a página

### Firefox:

1. `Cmd + Shift + Delete`
2. Selecionar: "Cache"
3. Time range: "Everything"
4. Clicar em **Clear Now**

---

## 🚀 PARTE 4: Reiniciar Serviços

### 1. Reiniciar Servidor de Desenvolvimento

```bash
# Parar o servidor atual (Ctrl+C se estiver rodando)

# Reiniciar
npm run dev
```

### 2. Limpar Cache do Vercel (Produção)

Se o problema persistir em produção:

1. Acessar: https://vercel.com/dashboard
2. Ir no projeto StageOne
3. Settings → General
4. Scroll até "Deployment Protection"
5. Clicar em **"Clear Cache"**

Ou forçar novo deploy:

```bash
# Fazer um commit vazio para forçar redeploy
git commit --allow-empty -m "chore: force rebuild to clear cache"
git push origin main
```

---

## 🔍 PARTE 5: Verificação

### Verificar se os caches foram limpos:

#### Sistema Local:
```bash
# Verificar se .next foi removido
ls -la | grep .next  # Não deve retornar nada

# Verificar cache do npm
npm cache verify
```

#### Banco de Dados:
Execute no SQL Editor:
```sql
-- Ver tamanho das tabelas após VACUUM
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

#### Navegador:
1. Abrir DevTools (F12)
2. Network tab
3. Recarregar página
4. Verificar se recursos estão sendo baixados (não do cache)

---

## 📋 Checklist Completo

Execute na ordem:

- [x] **Sistema Local** - Script automático executado ✅
  - [x] Next.js cache limpo
  - [x] npm cache limpo
  - [x] Vercel cache limpo
  - [x] Arquivos temporários removidos

- [ ] **Banco de Dados** - Execute o script SQL
  - [ ] DISCARD ALL executado
  - [ ] ANALYZE executado
  - [ ] VACUUM executado

- [ ] **Navegador** - Limpeza manual
  - [ ] Cache do navegador limpo
  - [ ] Hard reload executado

- [ ] **Serviços** - Reiniciar
  - [ ] Servidor dev reiniciado
  - [ ] Vercel cache limpo (se necessário)

---

## 🛠️ Comandos Rápidos

### Limpeza completa rápida:

```bash
# 1. Sistema (já executado)
./clear-system-cache.sh

# 2. Reinstalar dependências (se necessário)
rm -rf node_modules
npm install

# 3. Reiniciar servidor
npm run dev
```

### Para o banco de dados:
```bash
# Copiar script SQL novamente
cat clear-database-cache.sql | pbcopy
```

Depois colar e executar no Supabase SQL Editor.

---

## ⚠️ Problemas Comuns

### "DISCARD não funcionou"
**Solução**: Reinicie a conexão do Supabase (feche e abra uma nova query)

### "Servidor não inicia após limpeza"
**Solução**:
```bash
rm -rf node_modules
npm install
npm run dev
```

### "Ainda vejo dados antigos"
**Solução**:
1. Limpar cache do navegador (Hard Reload)
2. Testar em aba anônima
3. Verificar se o deploy da Vercel terminou

### "VACUUM travou"
**Solução**: VACUUM pode demorar em tabelas grandes. Aguarde ou use CTRL+C para cancelar.

---

## 📊 Monitoramento

### Ver uso de cache em tempo real:

```sql
-- Ver cache hits do banco
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit)  as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

### Ver conexões ativas:
```sql
SELECT count(*) FROM pg_stat_activity;
```

---

## 🎉 Resultado Esperado

Após executar TODAS as etapas:

- ✅ Servidor local reiniciado com código atualizado
- ✅ Banco de dados otimizado e sem cache antigo
- ✅ Navegador carregando versão mais recente
- ✅ Vercel servindo build mais recente
- ✅ Performance melhorada
- ✅ Dados atualizados em todos os lugares

---

## 📞 Próximos Passos

1. **Execute o script SQL no Supabase** (já está na área de transferência)
2. **Limpe o cache do navegador** (Cmd+Shift+R)
3. **Teste a aplicação** para verificar se tudo funciona

---

**Última atualização**: 21 de Janeiro de 2026

**Arquivos**:
- `clear-system-cache.sh` - Limpeza do sistema (executado ✅)
- `clear-database-cache.sql` - Limpeza do banco (copiar e executar no Supabase)
