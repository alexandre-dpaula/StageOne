-- ============================================================================
-- LIMPAR CACHES DO BANCO DE DADOS - VERSÃO SIMPLIFICADA PARA SUPABASE
-- ============================================================================
-- Esta versão funciona dentro das limitações do Supabase SQL Editor
-- ============================================================================

SELECT '🧹 Iniciando limpeza de caches...' as status;

-- ============================================================================
-- ATUALIZAR ESTATÍSTICAS DAS TABELAS (ANALYZE)
-- ============================================================================
SELECT '📊 Atualizando estatísticas das tabelas...' as status;

ANALYZE public.users;
ANALYZE public.events;
ANALYZE public.event_modules;
ANALYZE public.tickets_types;
ANALYZE public.tickets;

SELECT '   ✅ Estatísticas atualizadas' as status;

-- ============================================================================
-- RESETAR ÍNDICES (Reindex para otimizar)
-- ============================================================================
SELECT '🔄 Otimizando índices...' as status;

REINDEX TABLE public.users;
REINDEX TABLE public.events;
REINDEX TABLE public.tickets;

SELECT '   ✅ Índices otimizados' as status;

-- ============================================================================
-- VERIFICAÇÃO DE ESPAÇO EM DISCO
-- ============================================================================
SELECT '';
SELECT '💾 INFORMAÇÕES DE ESPAÇO EM DISCO:' as status;
SELECT '';

SELECT
    tablename as tabela,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho_total,
    pg_size_pretty(pg_relation_size('public.'||tablename)) as tamanho_dados,
    pg_size_pretty(pg_total_relation_size('public.'||tablename) - pg_relation_size('public.'||tablename)) as tamanho_indices
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC
LIMIT 10;

-- ============================================================================
-- ESTATÍSTICAS DE CACHE HIT RATIO
-- ============================================================================
SELECT '';
SELECT '📊 CACHE HIT RATIO (quanto maior, melhor):' as status;
SELECT '';

SELECT
    'Cache Hit Ratio' as metrica,
    ROUND(
        sum(heap_blks_hit) * 100.0 / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0),
        2
    )::text || '%' as valor
FROM pg_statio_user_tables;

-- ============================================================================
-- CONEXÕES ATIVAS
-- ============================================================================
SELECT '';
SELECT '🔌 CONEXÕES ATIVAS:' as status;
SELECT '';

SELECT
    count(*) as total_conexoes,
    count(*) FILTER (WHERE state = 'active') as conexoes_ativas,
    count(*) FILTER (WHERE state = 'idle') as conexoes_idle
FROM pg_stat_activity;

-- ============================================================================
-- RESUMO FINAL
-- ============================================================================
SELECT '';
SELECT '╔════════════════════════════════════════════════════════════╗' as status;
SELECT '║                                                            ║' as status;
SELECT '║         ✅ OTIMIZAÇÃO CONCLUÍDA! ✅                       ║' as status;
SELECT '║                                                            ║' as status;
SELECT '╚════════════════════════════════════════════════════════════╝' as status;
SELECT '';
SELECT '📋 OPERAÇÕES REALIZADAS:' as status;
SELECT '   ✓ Estatísticas das tabelas atualizadas (ANALYZE)' as status;
SELECT '   ✓ Índices otimizados (REINDEX)' as status;
SELECT '   ✓ Informações de espaço verificadas' as status;
SELECT '   ✓ Cache hit ratio calculado' as status;
SELECT '';
SELECT '💡 PARA LIMPEZA COMPLETA DE CACHE:' as status;
SELECT '   • Feche e reabra a conexão do Supabase' as status;
SELECT '   • Reinicie o servidor de desenvolvimento (npm run dev)' as status;
SELECT '   • Limpe o cache do navegador (Cmd+Shift+R)' as status;
SELECT '';
SELECT '🎉 Processo completo!' as status;
