-- ============================================================================
-- LIMPAR CACHES DO BANCO DE DADOS - SUPABASE/POSTGRES (VERSÃO CORRIGIDA)
-- ============================================================================
-- Execute cada comando separadamente (não em bloco de transação)
-- ============================================================================

-- Mensagem inicial
SELECT '🧹 Iniciando limpeza de caches do banco de dados...' as status;
SELECT '';

-- ============================================================================
-- 1. LIMPAR CACHE DE QUERIES (Query Plan Cache)
-- ============================================================================
SELECT '🗑️ [1/5] Limpando cache de queries...' as status;

DISCARD PLANS;

SELECT '   ✅ Cache de queries limpo' as status;
SELECT '';

-- ============================================================================
-- 2. LIMPAR CACHE DE SEQUENCES
-- ============================================================================
SELECT '🗑️ [2/5] Limpando cache de sequences...' as status;

DISCARD SEQUENCES;

SELECT '   ✅ Cache de sequences limpo' as status;
SELECT '';

-- ============================================================================
-- 3. LIMPAR CACHE TEMPORÁRIO (Temporary Objects)
-- ============================================================================
SELECT '🗑️ [3/5] Limpando objetos temporários...' as status;

DISCARD TEMP;

SELECT '   ✅ Objetos temporários limpos' as status;
SELECT '';

-- ============================================================================
-- 4. ATUALIZAR ESTATÍSTICAS DAS TABELAS (para melhor performance)
-- ============================================================================
SELECT '📊 [4/5] Atualizando estatísticas das tabelas...' as status;

ANALYZE public.users;
ANALYZE public.events;
ANALYZE public.event_modules;
ANALYZE public.tickets_types;
ANALYZE public.tickets;

-- Tentar analisar space_bookings se existir
DO $$
BEGIN
    EXECUTE 'ANALYZE public.space_bookings';
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

SELECT '   ✅ Estatísticas atualizadas' as status;
SELECT '';

-- ============================================================================
-- 5. VACUUM (Limpeza e otimização de espaço)
-- ============================================================================
SELECT '🧹 [5/5] Executando VACUUM nas tabelas principais...' as status;

VACUUM ANALYZE public.users;
VACUUM ANALYZE public.events;
VACUUM ANALYZE public.tickets;
VACUUM ANALYZE public.tickets_types;

SELECT '   ✅ VACUUM concluído' as status;
SELECT '';

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
SELECT '   ✓ Estatísticas das tabelas atualizadas (ANALYZE)' as status;
SELECT '   ✓ Tabelas otimizadas (VACUUM)' as status;
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
SELECT '';

-- ============================================================================
-- INFORMAÇÕES ADICIONAIS
-- ============================================================================
SELECT '💡 DICAS:' as status;
SELECT '   • Para limpar TODOS os caches de sessão, feche e reabra a conexão' as status;
SELECT '   • Para melhor performance, execute VACUUM FULL periodicamente' as status;
SELECT '   • Monitore o cache hit ratio para otimização contínua' as status;
SELECT '';
