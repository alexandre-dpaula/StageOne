-- ============================================================================
-- DELETAR USUÁRIO: alexandresiqueiradepaula@hotmail.com (VERSÃO CORRIGIDA)
-- ============================================================================
-- Este script deleta o usuário e TODOS os seus dados relacionados
-- ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
-- ============================================================================

-- Verificar se o usuário existe e obter ID
DO $$
DECLARE
  user_uuid UUID;
  total_events INTEGER;
  total_tickets INTEGER;
  total_bookings INTEGER;
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

  -- Contar bookings (se a tabela existir)
  BEGIN
    SELECT COUNT(*) INTO total_bookings
    FROM public.bookings
    WHERE user_id = user_uuid;
  EXCEPTION
    WHEN undefined_table THEN
      total_bookings := 0;
  END;

  RAISE NOTICE '';
  RAISE NOTICE '📊 DADOS A SEREM DELETADOS:';
  RAISE NOTICE '   - Eventos criados: %', total_events;
  RAISE NOTICE '   - Ingressos comprados: %', total_tickets;
  RAISE NOTICE '   - Reservas (bookings): %', total_bookings;
  RAISE NOTICE '   - Reservas de espaço: %', total_space_bookings;
  RAISE NOTICE '';

  -- ============================================================================
  -- PASSO 1: Deletar BOOKINGS dos eventos criados pelo usuário
  -- ============================================================================
  RAISE NOTICE '🗑️ Deletando bookings dos eventos criados pelo usuário...';

  BEGIN
    DELETE FROM public.bookings
    WHERE event_id IN (
      SELECT id FROM public.events WHERE created_by = user_uuid
    );
    RAISE NOTICE '   ✅ Bookings dos eventos deletados';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '   ⚠️ Tabela bookings não existe, pulando...';
  END;

  -- ============================================================================
  -- PASSO 2: Deletar BOOKINGS do usuário (como participante)
  -- ============================================================================
  RAISE NOTICE '🗑️ Deletando bookings do usuário...';

  BEGIN
    DELETE FROM public.bookings
    WHERE user_id = user_uuid;
    RAISE NOTICE '   ✅ Bookings do usuário deletados';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '   ⚠️ Tabela bookings não existe, pulando...';
  END;

  -- ============================================================================
  -- PASSO 3: Deletar TICKETS do usuário (participações em eventos)
  -- ============================================================================
  RAISE NOTICE '🗑️ Deletando tickets do usuário...';

  DELETE FROM public.tickets
  WHERE user_id = user_uuid;

  RAISE NOTICE '   ✅ Tickets deletados';

  -- ============================================================================
  -- PASSO 4: Deletar TICKETS de outros usuários nos eventos criados
  -- ============================================================================
  RAISE NOTICE '🗑️ Deletando tickets de outros participantes nos eventos criados...';

  DELETE FROM public.tickets
  WHERE event_id IN (
    SELECT id FROM public.events WHERE created_by = user_uuid
  );

  RAISE NOTICE '   ✅ Tickets de outros participantes deletados';

  -- ============================================================================
  -- PASSO 5: Deletar SPACE_BOOKINGS (reservas de espaço)
  -- ============================================================================
  RAISE NOTICE '🗑️ Deletando reservas de espaço...';

  DELETE FROM public.space_bookings
  WHERE user_id = user_uuid;

  RAISE NOTICE '   ✅ Reservas de espaço deletadas';

  -- ============================================================================
  -- PASSO 6: Deletar MÓDULOS dos eventos
  -- ============================================================================
  RAISE NOTICE '🗑️ Deletando módulos dos eventos...';

  DELETE FROM public.event_modules
  WHERE event_id IN (
    SELECT id FROM public.events WHERE created_by = user_uuid
  );

  RAISE NOTICE '   ✅ Módulos deletados';

  -- ============================================================================
  -- PASSO 7: Deletar TIPOS DE TICKETS dos eventos
  -- ============================================================================
  RAISE NOTICE '🗑️ Deletando tipos de tickets dos eventos...';

  DELETE FROM public.tickets_types
  WHERE event_id IN (
    SELECT id FROM public.events WHERE created_by = user_uuid
  );

  RAISE NOTICE '   ✅ Tipos de tickets deletados';

  -- ============================================================================
  -- PASSO 8: Deletar EVENTOS criados pelo usuário
  -- ============================================================================
  RAISE NOTICE '🗑️ Deletando eventos criados pelo usuário...';

  DELETE FROM public.events
  WHERE created_by = user_uuid;

  RAISE NOTICE '   ✅ Eventos deletados';

  -- ============================================================================
  -- PASSO 9: Deletar perfil do usuário na tabela PUBLIC.USERS
  -- ============================================================================
  RAISE NOTICE '🗑️ Deletando perfil do usuário...';

  DELETE FROM public.users
  WHERE id = user_uuid;

  RAISE NOTICE '   ✅ Perfil deletado';

  -- ============================================================================
  -- PASSO 10: Deletar conta de autenticação no AUTH.USERS (Supabase Auth)
  -- ============================================================================
  RAISE NOTICE '🗑️ Deletando conta de autenticação...';

  DELETE FROM auth.users
  WHERE id = user_uuid;

  RAISE NOTICE '   ✅ Conta de autenticação deletada';

  -- ============================================================================
  -- CONFIRMAÇÃO FINAL
  -- ============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ USUÁRIO DELETADO COM SUCESSO! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: alexandresiqueiradepaula@hotmail.com';
  RAISE NOTICE '🆔 UUID: %', user_uuid;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ Todos os dados relacionados foram removidos:';
  RAISE NOTICE '   - Perfil do usuário';
  RAISE NOTICE '   - Conta de autenticação';
  RAISE NOTICE '   - % eventos criados', total_events;
  RAISE NOTICE '   - % ingressos comprados', total_tickets;
  RAISE NOTICE '   - % bookings', total_bookings;
  RAISE NOTICE '   - % reservas de espaço', total_space_bookings;
  RAISE NOTICE '   - Módulos dos eventos';
  RAISE NOTICE '   - Tipos de tickets';
  RAISE NOTICE '   - Tickets de outros participantes nos eventos criados';
  RAISE NOTICE '';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌ ERRO ao deletar usuário: %', SQLERRM;
    RAISE NOTICE '';
    RAISE;
END;
$$;

-- ============================================================================
-- VERIFICAÇÃO PÓS-DELEÇÃO
-- ============================================================================

-- Verificar se o usuário foi deletado
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Usuário deletado com sucesso da tabela public.users'
    ELSE '❌ ERRO: Usuário ainda existe na tabela public.users'
  END as status_public_users
FROM public.users
WHERE email = 'alexandresiqueiradepaula@hotmail.com';

-- Verificar se a conta foi deletada do auth
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Conta deletada com sucesso do auth.users'
    ELSE '❌ ERRO: Conta ainda existe no auth.users'
  END as status_auth_users
FROM auth.users
WHERE email = 'alexandresiqueiradepaula@hotmail.com';

-- Mensagem final
SELECT '🎉🎉🎉 PROCESSO COMPLETO! Usuário e todos os dados foram removidos.' as resultado_final;
