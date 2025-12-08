-- ============================================================================
-- DIAGNÓSTICO DE AUTENTICAÇÃO - SUPABASE
-- ============================================================================
-- Execute este SQL no Supabase SQL Editor para verificar os problemas
-- ============================================================================

-- 1. Verificar usuários na tabela auth.users
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar usuários na tabela public.users
SELECT
  id,
  name,
  email,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar policies da tabela users
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- 4. Verificar se há usuários em auth.users mas não em public.users
SELECT
  a.id,
  a.email,
  a.email_confirmed_at,
  CASE
    WHEN p.id IS NULL THEN 'FALTANDO EM public.users'
    ELSE 'OK'
  END as status
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
ORDER BY a.created_at DESC;
