-- ============================================================================
-- CORREÇÕES COMPLETAS DO BANCO DE DADOS - STAGEONE
-- ============================================================================
-- Execute TODO este SQL no Supabase SQL Editor para corrigir os problemas
-- ============================================================================

-- 1. FIX: Adicionar policy de INSERT para a tabela users
-- ============================================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. CRIAR: Tabela space_bookings (se não existir)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.space_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID UNIQUE REFERENCES public.events(id) ON DELETE SET NULL,

  -- Booking details
  hours INTEGER NOT NULL CHECK (hours >= 1),
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Addons
  has_audiovisual BOOLEAN DEFAULT FALSE,
  has_coverage BOOLEAN DEFAULT FALSE,
  has_coffee_break BOOLEAN DEFAULT FALSE,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  addons_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  total_price DECIMAL(10,2) NOT NULL,

  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED')),
  payment_method TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_id TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  confirmation_date TIMESTAMP WITH TIME ZONE,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. CRIAR: Índices para space_bookings
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_space_bookings_user_id ON public.space_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_space_bookings_event_id ON public.space_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_space_bookings_payment_status ON public.space_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_space_bookings_status ON public.space_bookings(status);
CREATE INDEX IF NOT EXISTS idx_space_bookings_booking_date ON public.space_bookings(booking_date);

-- 4. CRIAR: Trigger para updated_at em space_bookings
-- ============================================================================
DROP TRIGGER IF EXISTS update_space_bookings_updated_at ON public.space_bookings;

CREATE TRIGGER update_space_bookings_updated_at
  BEFORE UPDATE ON public.space_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. HABILITAR: RLS para space_bookings
-- ============================================================================
ALTER TABLE public.space_bookings ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR: Policies para space_bookings
-- ============================================================================
-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Users can view own bookings" ON public.space_bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.space_bookings;
DROP POLICY IF EXISTS "Users can update own pending bookings" ON public.space_bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.space_bookings;

-- Usuários podem ver suas próprias reservas
CREATE POLICY "Users can view own bookings" ON public.space_bookings
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem criar suas próprias reservas
CREATE POLICY "Users can create own bookings" ON public.space_bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar suas próprias reservas pendentes
CREATE POLICY "Users can update own pending bookings" ON public.space_bookings
  FOR UPDATE USING (user_id = auth.uid() AND status = 'PENDING');

-- Admins podem gerenciar todas as reservas
CREATE POLICY "Admins can manage all bookings" ON public.space_bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ============================================================================
-- VERIFICAÇÕES FINAIS
-- ============================================================================

-- Verificar se a tabela foi criada
SELECT
  'space_bookings' as tabela,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'space_bookings'
  ) as existe;

-- Verificar policies da tabela users
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Verificar policies da tabela space_bookings
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'space_bookings'
ORDER BY policyname;

-- Mensagem de sucesso
SELECT '✅ Todas as correções foram aplicadas com sucesso!' as status;
