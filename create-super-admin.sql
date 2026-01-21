-- ============================================================================
-- CRIAR SUPER ADMIN - alexandresiqueiradepaula@hotmail.com
-- ============================================================================
-- Este script cria um usuário Super Admin com permissões completas
-- ============================================================================

DO $$
DECLARE
  new_user_id UUID;
  user_email TEXT := 'alexandresiqueiradepaula@hotmail.com';
  user_password TEXT := 'Mma891372!';
  user_name TEXT := 'Alexandre Dpaula';
BEGIN

  RAISE NOTICE '';
  RAISE NOTICE '🔐 Criando Super Admin...';
  RAISE NOTICE '';

  -- ============================================================================
  -- PASSO 1: Verificar se o usuário já existe
  -- ============================================================================
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = user_email;

  IF new_user_id IS NOT NULL THEN
    RAISE NOTICE '⚠️ Usuário já existe com este email!';
    RAISE NOTICE '   UUID: %', new_user_id;
    RAISE NOTICE '';
    RAISE NOTICE '💡 OPÇÕES:';
    RAISE NOTICE '   1. Use o script delete-user para remover o existente';
    RAISE NOTICE '   2. Ou atualize a senha do existente (veja abaixo)';
    RAISE NOTICE '';
    RETURN;
  END IF;

  -- ============================================================================
  -- PASSO 2: Criar usuário no AUTH.USERS (Supabase Auth)
  -- ============================================================================
  RAISE NOTICE '📝 [1/3] Criando conta de autenticação...';

  -- Criar usuário no sistema de autenticação
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')), -- Senha criptografada com bcrypt
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', user_name),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  RAISE NOTICE '   ✅ Conta criada com UUID: %', new_user_id;

  -- ============================================================================
  -- PASSO 3: Criar perfil do usuário na tabela PUBLIC.USERS
  -- ============================================================================
  RAISE NOTICE '📝 [2/3] Criando perfil de Super Admin...';

  INSERT INTO public.users (
    id,
    name,
    email,
    role,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    user_name,
    user_email,
    'ADMIN', -- Role de ADMIN (super admin)
    NOW(),
    NOW()
  );

  RAISE NOTICE '   ✅ Perfil criado com role: ADMIN';

  -- ============================================================================
  -- PASSO 4: Criar identidade do usuário (necessário para login)
  -- ============================================================================
  RAISE NOTICE '📝 [3/3] Criando identidade de autenticação...';

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', user_email
    ),
    'email',
    new_user_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE '   ✅ Identidade criada';

  -- ============================================================================
  -- CONFIRMAÇÃO FINAL
  -- ============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║         ✅ SUPER ADMIN CRIADO COM SUCESSO! ✅             ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '👤 DADOS DO SUPER ADMIN:';
  RAISE NOTICE '   📧 Email: %', user_email;
  RAISE NOTICE '   👤 Nome: %', user_name;
  RAISE NOTICE '   🆔 UUID: %', new_user_id;
  RAISE NOTICE '   🔑 Role: ADMIN';
  RAISE NOTICE '   🔐 Senha: [CONFIGURADA]';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 CREDENCIAIS DE LOGIN:';
  RAISE NOTICE '   Email: %', user_email;
  RAISE NOTICE '   Senha: Mma891372!';
  RAISE NOTICE '';
  RAISE NOTICE '💡 PRÓXIMOS PASSOS:';
  RAISE NOTICE '   1. Acesse: https://stage-one-1.vercel.app/login';
  RAISE NOTICE '   2. Faça login com as credenciais acima';
  RAISE NOTICE '   3. Você terá acesso total como ADMIN';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANTE:';
  RAISE NOTICE '   • Guarde estas credenciais em local seguro';
  RAISE NOTICE '   • Considere trocar a senha após primeiro login';
  RAISE NOTICE '   • Como ADMIN, você pode criar eventos e gerenciar tudo';
  RAISE NOTICE '';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌ ERRO ao criar Super Admin:';
    RAISE NOTICE '   Mensagem: %', SQLERRM;
    RAISE NOTICE '   Código: %', SQLSTATE;
    RAISE NOTICE '';
    RAISE;
END;
$$;

-- ============================================================================
-- VERIFICAÇÃO PÓS-CRIAÇÃO
-- ============================================================================

-- Verificar se o usuário foi criado no auth.users
SELECT
  CASE
    WHEN COUNT(*) = 1 THEN '✅ Usuário criado em auth.users'
    ELSE '❌ ERRO: Usuário não foi criado em auth.users'
  END as status_auth
FROM auth.users
WHERE email = 'alexandresiqueiradepaula@hotmail.com';

-- Verificar se o perfil foi criado no public.users
SELECT
  CASE
    WHEN COUNT(*) = 1 THEN '✅ Perfil criado em public.users com role ADMIN'
    ELSE '❌ ERRO: Perfil não foi criado em public.users'
  END as status_public
FROM public.users
WHERE email = 'alexandresiqueiradepaula@hotmail.com'
  AND role = 'ADMIN';

-- Mostrar informações do usuário criado
SELECT
  id as user_id,
  name as nome,
  email,
  role,
  created_at as criado_em
FROM public.users
WHERE email = 'alexandresiqueiradepaula@hotmail.com';

-- Mensagem final
SELECT '🎉 Super Admin pronto para uso!' as resultado_final;
