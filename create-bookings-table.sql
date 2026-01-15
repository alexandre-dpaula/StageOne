-- ============================================================================
-- CRIAR TABELA BOOKINGS
-- ============================================================================
-- Tabela para armazenar reservas de ingressos para eventos
-- Diferente de space_bookings que é para reservas de espaço

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamentos
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES tickets_types(id) ON DELETE RESTRICT,
  coupon_id UUID,
  -- Remover foreign key de coupons por enquanto - adicionar quando criar tabela coupons

  -- Dados do cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT NOT NULL,
  customer_phone TEXT,

  -- Quantidade e Preço
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,

  -- Status do Pagamento
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  -- Valores possíveis: PENDING, PAID, OVERDUE, CANCELLED, REFUNDED

  payment_method TEXT NOT NULL,
  -- Valores possíveis: PIX, BOLETO, CREDIT_CARD

  -- Integração com Asaas
  external_payment_id TEXT UNIQUE,
  -- ID da cobrança no Asaas

  -- Timestamps
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  -- Data de expiração da reserva (geralmente 24h após criação)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ticket_type_id ON public.bookings(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_external_payment_id ON public.bookings(external_payment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings(customer_email);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem ver suas próprias reservas
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias reservas
CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role pode fazer tudo (para o webhook do Asaas)
CREATE POLICY "Service role can do everything"
  ON public.bookings FOR ALL
  USING (auth.role() = 'service_role');

-- Comentários
COMMENT ON TABLE public.bookings IS 'Reservas de ingressos para eventos com integração Asaas';
COMMENT ON COLUMN public.bookings.external_payment_id IS 'ID da cobrança no Asaas para rastreamento de webhooks';
COMMENT ON COLUMN public.bookings.expires_at IS 'Data de expiração da reserva pendente';
