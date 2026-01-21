-- ============================================================================
-- DELETAR USUÁRIO: alexandresiqueiradepaula@hotmail.com (VERSÃO FINAL)
-- ============================================================================
-- Versão simplificada - bookings já foram deletados manualmente
-- ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
-- ============================================================================

DO $$
DECLARE
  user_uuid UUID;
  total_events INTEGER;
  total_tickets INTEGER;
  total_space_bookings INTEGER;
BEGIN
  -- Buscar UUID do usuário
  SELECT id INTO user_uuid
  FROM public.users
  WHERE email = 'alexandresiqueiradepaula@hotmail.com';

  -- Se usuário não existe, abortar
  IF user_uuid IS NULL THEN
    RAISE NOTICE '❌ Usuário não encontrado: alexandresiqueiradepaula@hotmail.com';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Usuário encontrado: %', user_uuid;

  -- Contar dados antes de deletar
  SELECT COUNT(*) INTO total_events
  FROM public.events
  WHERE created_by = user_uuid;

  SELECT COUNT(*) INTO total_tickets
  FROM public.tickets
  WHERE user_id = user_uuid;

  SELECT COUNT(*) INTO total_space_bookings
  FROM public.space_bookings
  WHERE user_id = user_uuid;

  RAISE NOTICE '';
  RAISE NOTICE '📊 DADOS A SEREM DELETADOS:';
  RAISE NOTICE '   - Eventos criados: %', total_events;
  RAISE NOTICE '   - Ingressos comprados: %', total_tickets;
  RAISE NOTICE '   - Reservas de espaço: %', total_space_bookings;
  RAISE NOTICE '';

  -- ============================================================================
  -- PASSO 1: Deletar TICKETS do usuário
  -- ============================================================================
  RAISE NOTICE '🗑️ [1/8] Deletando tickets do usuário...';
  DELETE FROM public.tickets WHERE user_id = user_uuid;
  RAISE NOTICE '   ✅ Tickets deletados';

  -- ============================================================================
  -- PASSO 2: Deletar TICKETS de outros participantes nos eventos criados
  -- ============================================================================
  RAISE NOTICE '🗑️ [2/8] Deletando tickets de outros participantes...';
  DELETE FROM public.tickets
  WHERE event_id IN (SELECT id FROM public.events WHERE created_by = user_uuid);
  RAISE NOTICE '   ✅ Tickets de outros participantes deletados';

  -- ============================================================================
  -- PASSO 3: Deletar SPACE_BOOKINGS
  -- ============================================================================
  RAISE NOTICE '🗑️ [3/8] Deletando reservas de espaço...';
  DELETE FROM public.space_bookings WHERE user_id = user_uuid;
  RAISE NOTICE '   ✅ Reservas de espaço deletadas';

  -- ============================================================================
  -- PASSO 4: Deletar EVENT_MODULES
  -- ============================================================================
  RAISE NOTICE '🗑️ [4/8] Deletando módulos dos eventos...';
  DELETE FROM public.event_modules
  WHERE event_id IN (SELECT id FROM public.events WHERE created_by = user_uuid);
  RAISE NOTICE '   ✅ Módulos deletados';

  -- ============================================================================
  -- PASSO 5: Deletar TICKETS_TYPES
  -- ============================================================================
  RAISE NOTICE '🗑️ [5/8] Deletando tipos de tickets...';
  DELETE FROM public.tickets_types
  WHERE event_id IN (SELECT id FROM public.events WHERE created_by = user_uuid);
  RAISE NOTICE '   ✅ Tipos de tickets deletados';

  -- ============================================================================
  -- PASSO 6: Deletar EVENTS
  -- ============================================================================
  RAISE NOTICE '🗑️ [6/8] Deletando eventos...';
  DELETE FROM public.events WHERE created_by = user_uuid;
  RAISE NOTICE '   ✅ Eventos deletados';

  -- ============================================================================
  -- PASSO 7: Deletar USER PROFILE
  -- ============================================================================
  RAISE NOTICE '🗑️ [7/8] Deletando perfil do usuário...';
  DELETE FROM public.users WHERE id = user_uuid;
  RAISE NOTICE '   ✅ Perfil deletado';

  -- ============================================================================
  -- PASSO 8: Deletar AUTH ACCOUNT
  -- ============================================================================
  RAISE NOTICE '🗑️ [8/8] Deletando conta de autenticação...';
  DELETE FROM auth.users WHERE id = user_uuid;
  RAISE NOTICE '   ✅ Conta de autenticação deletada';

  -- ============================================================================
  -- CONFIRMAÇÃO FINAL
  -- ============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║          ✅ USUÁRIO DELETADO COM SUCESSO! ✅              ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: alexandresiqueiradepaula@hotmail.com';
  RAISE NOTICE '🆔 UUID: %', user_uuid;
  RAISE NOTICE '';
  RAISE NOTICE '📊 DADOS REMOVIDOS:';
  RAISE NOTICE '   ✓ Perfil do usuário';
  RAISE NOTICE '   ✓ Conta de autenticação';
  RAISE NOTICE '   ✓ % eventos criados', total_events;
  RAISE NOTICE '   ✓ % ingressos comprados', total_tickets;
  RAISE NOTICE '   ✓ % reservas de espaço', total_space_bookings;
  RAISE NOTICE '   ✓ Módulos dos eventos';
  RAISE NOTICE '   ✓ Tipos de tickets';
  RAISE NOTICE '   ✓ Tickets de outros participantes';
  RAISE NOTICE '';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║                      ❌ ERRO ❌                            ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'Mensagem: %', SQLERRM;
    RAISE NOTICE 'Detalhe: %', SQLSTATE;
    RAISE NOTICE '';
    RAISE;
END;
$$;

-- ============================================================================
-- VERIFICAÇÃO PÓS-DELEÇÃO
-- ============================================================================

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Usuário removido de public.users'
    ELSE '❌ ERRO: Usuário ainda existe em public.users'
  END as status_public_users
FROM public.users
WHERE email = 'alexandresiqueiradepaula@hotmail.com';

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Conta removida de auth.users'
    ELSE '❌ ERRO: Conta ainda existe em auth.users'
  END as status_auth_users
FROM auth.users
WHERE email = 'alexandresiqueiradepaula@hotmail.com';

SELECT '🎉 PROCESSO COMPLETO! Todos os dados foram removidos.' as resultado_final;
