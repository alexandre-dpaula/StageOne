-- ============================================================================
-- FIX: Add INSERT policy for users table
-- ============================================================================
-- Problema: Novos usuários não conseguem se registrar porque falta uma
-- policy de INSERT na tabela users
-- ============================================================================

-- Drop existing policies if needed (optional, for clean state)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create policy to allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verificar policies existentes:
-- SELECT * FROM pg_policies WHERE tablename = 'users';
