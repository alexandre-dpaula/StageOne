-- ============================================================================
-- CRIAR USUÁRIO ADMINISTRADOR
-- Email: alexandresiqueiradepaula@hotmail.com
-- Senha: Mma891372!
-- ============================================================================

-- PASSO 1: Primeiro, crie o usuário no Supabase Authentication Dashboard
-- Vá em: Authentication > Users > Add User
-- Email: alexandresiqueiradepaula@hotmail.com
-- Senha: Mma891372!
-- Copie o UUID do usuário criado

-- PASSO 2: Depois de criar o usuário na autenticação, execute este SQL
-- Substitua 'UUID_DO_USUARIO_CRIADO' pelo UUID real do usuário

-- Exemplo de como inserir o admin (substitua o UUID):
/*
INSERT INTO admins (user_id, full_name, role, permissions, is_active)
VALUES (
  'UUID_DO_USUARIO_CRIADO', -- Substitua pelo UUID real
  'Alexandre Siqueira de Paula',
  'super_admin',
  '{
    "dashboard": true,
    "events": true,
    "users": true,
    "bookings": true,
    "coupons": true,
    "reports": true,
    "settings": true,
    "admins": true
  }'::jsonb,
  true
);
*/

-- ============================================================================
-- SCRIPT ALTERNATIVO: Buscar e Atualizar
-- ============================================================================

-- Se o usuário já existe, você pode buscá-lo e criar o registro de admin:
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar o UUID do usuário pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'alexandresiqueiradepaula@hotmail.com';

  -- Se encontrou o usuário, criar o registro de admin
  IF v_user_id IS NOT NULL THEN
    INSERT INTO admins (user_id, full_name, role, permissions, is_active)
    VALUES (
      v_user_id,
      'Alexandre Siqueira de Paula',
      'super_admin',
      '{
        "dashboard": true,
        "events": true,
        "users": true,
        "bookings": true,
        "coupons": true,
        "reports": true,
        "settings": true,
        "admins": true
      }'::jsonb,
      true
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      role = 'super_admin',
      permissions = '{
        "dashboard": true,
        "events": true,
        "users": true,
        "bookings": true,
        "coupons": true,
        "reports": true,
        "settings": true,
        "admins": true
      }'::jsonb,
      is_active = true,
      updated_at = NOW();

    RAISE NOTICE 'Admin criado/atualizado com sucesso para user_id: %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário não encontrado. Por favor, crie primeiro no Supabase Auth Dashboard.';
  END IF;
END $$;

-- ============================================================================
-- VERIFICAR SE O ADMIN FOI CRIADO
-- ============================================================================

SELECT
  a.id,
  a.user_id,
  a.full_name,
  a.role,
  a.permissions,
  a.is_active,
  u.email
FROM admins a
JOIN auth.users u ON a.user_id = u.id
WHERE u.email = 'alexandresiqueiradepaula@hotmail.com';
