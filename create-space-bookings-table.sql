-- ============================================================================
-- CRIAR TABELA SPACE BOOKINGS (Reservas de Espaço)
-- ============================================================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Criar a tabela space_bookings
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_space_bookings_user_id ON public.space_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_space_bookings_event_id ON public.space_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_space_bookings_payment_status ON public.space_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_space_bookings_status ON public.space_bookings(status);
CREATE INDEX IF NOT EXISTS idx_space_bookings_booking_date ON public.space_bookings(booking_date);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_space_bookings_updated_at
  BEFORE UPDATE ON public.space_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.space_bookings ENABLE ROW LEVEL SECURITY;

-- Criar policies de segurança
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

-- Verificar se a tabela foi criada com sucesso
SELECT 'Tabela space_bookings criada com sucesso!' as message;
