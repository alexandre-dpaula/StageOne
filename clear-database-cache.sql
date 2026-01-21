-- ============================================================================
-- LIMPAR CACHES DO BANCO DE DADOS - SUPABASE/POSTGRES
-- ============================================================================
-- Este script limpa todos os caches do banco de dados para melhorar performance
-- e resolver problemas de dados desatualizados
-- ============================================================================

-- Mensagem inicial
SELECT '🧹 Iniciando limpeza de caches do banco de dados...' as status;

-- ============================================================================
-- 1. LIMPAR CACHE DE QUERIES (Query Plan Cache)
-- ============================================================================
SELECT '🗑️ [1/6] Limpando cache de queries...' as status;

-- Descartar todos os planos de query em cache
DISCARD PLANS;

SELECT '   ✅ Cache de queries limpo' as status;

-- ============================================================================
-- 2. LIMPAR CACHE DE SEQUENCES
-- ============================================================================
SELECT '🗑️ [2/6] Limpando cache de sequences...' as status;

-- Descartar cache de sequences
DISCARD SEQUENCES;

SELECT '   ✅ Cache de sequences limpo' as status;

-- ============================================================================
-- 3. LIMPAR CACHE TEMPORÁRIO (Temporary Objects)
-- ============================================================================
SELECT '🗑️ [3/6] Limpando objetos temporários...' as status;

-- Descartar todas as tabelas temporárias e objetos
DISCARD TEMP;

SELECT '   ✅ Objetos temporários limpos' as status;

-- ============================================================================
-- 4. LIMPAR TODOS OS CACHES DE UMA VEZ
-- ============================================================================
SELECT '🗑️ [4/6] Limpando todos os caches...' as status;

-- Comando completo que limpa tudo
DISCARD ALL;

SELECT '   ✅ Todos os caches limpos' as status;

-- ============================================================================
-- 5. ATUALIZAR ESTATÍSTICAS DAS TABELAS (para melhor performance)
-- ============================================================================
SELECT '📊 [5/6] Atualizando estatísticas das tabelas...' as status;

-- Analisar todas as tabelas para atualizar estatísticas
ANALYZE public.users;
ANALYZE public.events;
ANALYZE public.event_modules;
ANALYZE public.tickets_types;
ANALYZE public.tickets;
ANALYZE public.space_bookings;

-- Analisar tabelas de webhook/stripe se existirem
DO $$
BEGIN
    ANALYZE public.stripe_webhook_events;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Ignorar se não existir
END;
$$;

SELECT '   ✅ Estatísticas atualizadas' as status;

-- ============================================================================
-- 6. VACUUM (Limpeza e otimização de espaço)
-- ============================================================================
SELECT '🧹 [6/6] Executando VACUUM nas tabelas principais...' as status;

-- Nota: VACUUM FULL não pode ser executado dentro de transação
-- Então vamos fazer VACUUM normal que também ajuda
VACUUM (ANALYZE, VERBOSE) public.users;
VACUUM (ANALYZE, VERBOSE) public.events;
VACUUM (ANALYZE, VERBOSE) public.tickets;

SELECT '   ✅ VACUUM concluído' as status;

-- ============================================================================
-- RESUMO FINAL
-- ============================================================================
SELECT '';
SELECT '╔════════════════════════════════════════════════════════════╗' as status;
SELECT '║                                                            ║' as status;
SELECT '║         ✅ LIMPEZA DE CACHE CONCLUÍDA! ✅                 ║' as status;
SELECT '║                                                            ║' as status;
SELECT '╚════════════════════════════════════════════════════════════╝' as status;
SELECT '';
SELECT '📋 OPERAÇÕES REALIZADAS:' as status;
SELECT '   ✓ Cache de queries limpo (DISCARD PLANS)' as status;
SELECT '   ✓ Cache de sequences limpo (DISCARD SEQUENCES)' as status;
SELECT '   ✓ Objetos temporários removidos (DISCARD TEMP)' as status;
SELECT '   ✓ Todos os caches limpos (DISCARD ALL)' as status;
SELECT '   ✓ Estatísticas das tabelas atualizadas (ANALYZE)' as status;
SELECT '   ✓ Tabelas otimizadas (VACUUM)' as status;
SELECT '';
SELECT '💡 DICA: Se ainda tiver problemas de cache, reinicie a conexão do Supabase' as status;
SELECT '';

-- ============================================================================
-- VERIFICAÇÃO DE ESPAÇO EM DISCO (Informativo)
-- ============================================================================
SELECT '';
SELECT '💾 INFORMAÇÕES DE ESPAÇO EM DISCO:' as status;
SELECT '';

SELECT
    schemaname as schema,
    tablename as tabela,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho_total,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as tamanho_tabela,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as tamanho_indices
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

SELECT '';
SELECT '🎉 Processo completo!' as status;
