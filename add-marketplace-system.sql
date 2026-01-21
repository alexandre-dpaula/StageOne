-- ============================================================================
-- SISTEMA DE MARKETPLACE COM STRIPE CONNECT
-- Modelo: Desconto automático dos custos após vendas (Airbnb style)
-- Saque: 48h após o evento
-- Taxa: 3% sobre vendas
-- ============================================================================

-- 1. Adicionar campos de Stripe Connect na tabela users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT, -- ID da conta Stripe Connect
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'NOT_CONNECTED'
  CHECK (stripe_account_status IN ('NOT_CONNECTED', 'PENDING', 'ACTIVE', 'RESTRICTED')),
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_onboarding_url TEXT,
ADD COLUMN IF NOT EXISTS stripe_connected_at TIMESTAMPTZ;

-- 2. Atualizar tabela events com sistema de marketplace
ALTER TABLE public.events
-- Status do evento
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DRAFT'
  CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'CANCELLED', 'COMPLETED')),

-- Aprovação
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,

-- Duração e preços (calculados automaticamente)
ADD COLUMN IF NOT EXISTS event_duration_hours DECIMAL(4,2) NOT NULL DEFAULT 4.00,
ADD COLUMN IF NOT EXISTS room_price DECIMAL(10,2) DEFAULT 0,

-- Adicionais selecionados
ADD COLUMN IF NOT EXISTS has_audiovisual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS audiovisual_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_coffee_break BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS coffee_break_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_coverage BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS coverage_price DECIMAL(10,2) DEFAULT 0,

-- Custos totais
ADD COLUMN IF NOT EXISTS total_service_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee_percentage DECIMAL(5,2) DEFAULT 3.00;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- 3. Tabela de financeiro por evento
CREATE TABLE IF NOT EXISTS public.event_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),

  -- Receitas
  total_ticket_sales DECIMAL(10,2) DEFAULT 0,
  tickets_sold_count INTEGER DEFAULT 0,

  -- Custos fixos (definidos na criação do evento)
  room_cost DECIMAL(10,2) DEFAULT 0,
  audiovisual_cost DECIMAL(10,2) DEFAULT 0,
  coffee_break_cost DECIMAL(10,2) DEFAULT 0,
  coverage_cost DECIMAL(10,2) DEFAULT 0,

  -- Custos variáveis (calculados sobre vendas)
  platform_fee DECIMAL(10,2) DEFAULT 0, -- 3% das vendas
  stripe_processing_fees DECIMAL(10,2) DEFAULT 0, -- ~3.99% + R$0.39 por transação

  total_costs DECIMAL(10,2) DEFAULT 0,

  -- Saldos
  gross_amount DECIMAL(10,2) DEFAULT 0, -- Total bruto das vendas
  net_amount DECIMAL(10,2) DEFAULT 0, -- Líquido após todos os custos
  withdrawn_amount DECIMAL(10,2) DEFAULT 0, -- Já sacado
  available_balance DECIMAL(10,2) DEFAULT 0, -- Disponível para saque

  -- Controle de saque
  can_withdraw BOOLEAN DEFAULT false,
  withdrawal_available_at TIMESTAMPTZ, -- 48h após o evento

  -- Timestamps
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_financials_user_id ON public.event_financials(user_id);
CREATE INDEX IF NOT EXISTS idx_event_financials_can_withdraw ON public.event_financials(can_withdraw);

-- 4. Tabela de saques via Stripe Connect
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id),
  user_id UUID NOT NULL REFERENCES public.users(id),

  amount DECIMAL(10,2) NOT NULL,

  -- Stripe Connect
  stripe_transfer_id TEXT, -- ID da transferência no Stripe
  stripe_account_id TEXT NOT NULL, -- Conta destino do criador

  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  failure_code TEXT,
  failure_message TEXT,

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_event_id ON public.withdrawals(event_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- 5. Habilitar RLS
ALTER TABLE public.event_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para event_financials
DROP POLICY IF EXISTS "Users can view their own financials" ON public.event_financials;
DROP POLICY IF EXISTS "System can manage financials" ON public.event_financials;

CREATE POLICY "Users can view their own financials"
  ON public.event_financials
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

CREATE POLICY "System can manage financials"
  ON public.event_financials
  FOR ALL
  TO authenticated
  USING (true);

-- Políticas RLS para withdrawals
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users can request withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Admins can manage withdrawals" ON public.withdrawals;

CREATE POLICY "Users can view their own withdrawals"
  ON public.withdrawals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

CREATE POLICY "Users can request withdrawals"
  ON public.withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage withdrawals"
  ON public.withdrawals
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- ============================================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================================

-- 6. Função para calcular preços automaticamente
CREATE OR REPLACE FUNCTION calculate_event_costs(
  p_duration_hours DECIMAL,
  p_has_audiovisual BOOLEAN DEFAULT false,
  p_has_coffee_break BOOLEAN DEFAULT false,
  p_has_coverage BOOLEAN DEFAULT false
)
RETURNS TABLE(
  room_price DECIMAL,
  audiovisual_price DECIMAL,
  coffee_break_price DECIMAL,
  coverage_price DECIMAL,
  total_service_cost DECIMAL
) AS $$
DECLARE
  v_base_hours DECIMAL := 4;
  v_price_per_hour DECIMAL := 100;
  v_base_audiovisual DECIMAL := 100;
  v_base_coffee DECIMAL := 150;
  v_base_coverage DECIMAL := 250;
  v_additional_per_hour DECIMAL := 12.5;

  v_room DECIMAL;
  v_audio DECIMAL := 0;
  v_coffee DECIMAL := 0;
  v_cover DECIMAL := 0;
BEGIN
  -- Calcular preço da sala (R$ 100/hora, mínimo 4h)
  v_room := GREATEST(p_duration_hours, v_base_hours) * v_price_per_hour;

  -- Calcular adicionais com escala proporcional
  IF p_has_audiovisual THEN
    v_audio := v_base_audiovisual + (GREATEST(p_duration_hours - v_base_hours, 0) * v_additional_per_hour);
  END IF;

  IF p_has_coffee_break THEN
    v_coffee := v_base_coffee + (GREATEST(p_duration_hours - v_base_hours, 0) * v_additional_per_hour);
  END IF;

  IF p_has_coverage THEN
    v_cover := v_base_coverage + (GREATEST(p_duration_hours - v_base_hours, 0) * v_additional_per_hour);
  END IF;

  RETURN QUERY SELECT
    ROUND(v_room, 2),
    ROUND(v_audio, 2),
    ROUND(v_coffee, 2),
    ROUND(v_cover, 2),
    ROUND(v_room + v_audio + v_coffee + v_cover, 2);
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para atualizar custos do evento automaticamente
CREATE OR REPLACE FUNCTION update_event_costs()
RETURNS TRIGGER AS $$
DECLARE
  v_costs RECORD;
BEGIN
  -- Calcular custos automaticamente
  SELECT * INTO v_costs
  FROM calculate_event_costs(
    NEW.event_duration_hours,
    NEW.has_audiovisual,
    NEW.has_coffee_break,
    NEW.has_coverage
  );

  NEW.room_price := v_costs.room_price;
  NEW.audiovisual_price := v_costs.audiovisual_price;
  NEW.coffee_break_price := v_costs.coffee_break_price;
  NEW.coverage_price := v_costs.coverage_price;
  NEW.total_service_cost := v_costs.total_service_cost;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_event_costs ON public.events;
CREATE TRIGGER trigger_update_event_costs
  BEFORE INSERT OR UPDATE OF event_duration_hours, has_audiovisual, has_coffee_break, has_coverage
  ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_event_costs();

-- 8. Função para atualizar financeiro do evento quando há venda
CREATE OR REPLACE FUNCTION update_event_financials_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_event RECORD;
  v_total_sales DECIMAL;
  v_tickets_count INTEGER;
  v_platform_fee DECIMAL;
  v_stripe_fees DECIMAL;
  v_total_costs DECIMAL;
  v_net_amount DECIMAL;
BEGIN
  -- Apenas processar quando pagamento é confirmado
  IF (TG_OP = 'INSERT' AND NEW.payment_status = 'PAID') OR
     (TG_OP = 'UPDATE' AND OLD.payment_status != 'PAID' AND NEW.payment_status = 'PAID') THEN

    -- Buscar informações do evento
    SELECT
      e.id,
      e.created_by,
      e.room_price,
      e.audiovisual_price,
      e.coffee_break_price,
      e.coverage_price,
      e.total_service_cost,
      e.platform_fee_percentage
    INTO v_event
    FROM events e
    WHERE e.id = NEW.event_id;

    -- Calcular totais de vendas
    SELECT
      COALESCE(SUM(b.total_price), 0),
      COUNT(*)
    INTO v_total_sales, v_tickets_count
    FROM bookings b
    WHERE b.event_id = NEW.event_id AND b.payment_status = 'PAID';

    -- Calcular taxas
    v_platform_fee := v_total_sales * (v_event.platform_fee_percentage / 100);
    v_stripe_fees := (v_total_sales * 0.0399) + (v_tickets_count * 0.39); -- 3.99% + R$0.39 por transação

    -- Total de custos
    v_total_costs := v_event.total_service_cost + v_platform_fee + v_stripe_fees;

    -- Líquido
    v_net_amount := v_total_sales - v_total_costs;

    -- Inserir ou atualizar event_financials
    INSERT INTO event_financials (
      event_id,
      user_id,
      total_ticket_sales,
      tickets_sold_count,
      room_cost,
      audiovisual_cost,
      coffee_break_cost,
      coverage_cost,
      platform_fee,
      stripe_processing_fees,
      total_costs,
      gross_amount,
      net_amount,
      available_balance,
      last_calculated_at
    ) VALUES (
      NEW.event_id,
      v_event.created_by,
      v_total_sales,
      v_tickets_count,
      v_event.room_price,
      v_event.audiovisual_price,
      v_event.coffee_break_price,
      v_event.coverage_price,
      v_platform_fee,
      v_stripe_fees,
      v_total_costs,
      v_total_sales,
      v_net_amount,
      v_net_amount,
      NOW()
    )
    ON CONFLICT (event_id) DO UPDATE SET
      total_ticket_sales = EXCLUDED.total_ticket_sales,
      tickets_sold_count = EXCLUDED.tickets_sold_count,
      platform_fee = EXCLUDED.platform_fee,
      stripe_processing_fees = EXCLUDED.stripe_processing_fees,
      total_costs = EXCLUDED.total_costs,
      gross_amount = EXCLUDED.gross_amount,
      net_amount = EXCLUDED.net_amount,
      available_balance = EXCLUDED.net_amount - event_financials.withdrawn_amount,
      last_calculated_at = NOW(),
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_financials_on_sale ON public.bookings;
CREATE TRIGGER trigger_update_financials_on_sale
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_event_financials_on_sale();

-- 9. Trigger para habilitar saque 48h após o evento
CREATE OR REPLACE FUNCTION enable_withdrawal_after_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando evento é marcado como COMPLETED
  IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
    UPDATE event_financials
    SET
      can_withdraw = true,
      withdrawal_available_at = NEW.end_datetime + INTERVAL '48 hours',
      updated_at = NOW()
    WHERE event_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enable_withdrawal ON public.events;
CREATE TRIGGER trigger_enable_withdrawal
  AFTER UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION enable_withdrawal_after_event();

-- 10. Função para processar saque e atualizar saldo
CREATE OR REPLACE FUNCTION process_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando saque é completado com sucesso
  IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
    UPDATE event_financials
    SET
      withdrawn_amount = withdrawn_amount + NEW.amount,
      available_balance = available_balance - NEW.amount,
      updated_at = NOW()
    WHERE event_id = NEW.event_id;
  END IF;

  -- Se saque falhar ou for cancelado, devolver o valor
  IF NEW.status IN ('FAILED', 'CANCELLED') AND OLD.status NOT IN ('FAILED', 'CANCELLED') THEN
    -- Não precisa fazer nada, o available_balance já está correto
    NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_process_withdrawal ON public.withdrawals;
CREATE TRIGGER trigger_process_withdrawal
  AFTER UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION process_withdrawal();

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View para dashboard financeiro dos criadores
CREATE OR REPLACE VIEW creator_financial_summary AS
SELECT
  u.id as user_id,
  u.name as creator_name,
  u.email as creator_email,
  COUNT(DISTINCT e.id) as total_events,
  COUNT(DISTINCT CASE WHEN e.status = 'PUBLISHED' THEN e.id END) as active_events,
  COALESCE(SUM(ef.total_ticket_sales), 0) as total_revenue,
  COALESCE(SUM(ef.total_costs), 0) as total_costs,
  COALESCE(SUM(ef.net_amount), 0) as total_net,
  COALESCE(SUM(ef.withdrawn_amount), 0) as total_withdrawn,
  COALESCE(SUM(ef.available_balance), 0) as total_available
FROM users u
LEFT JOIN events e ON e.created_by = u.id
LEFT JOIN event_financials ef ON ef.event_id = e.id
GROUP BY u.id, u.name, u.email;

-- View para eventos pendentes de aprovação (para admin)
CREATE OR REPLACE VIEW pending_approval_events AS
SELECT
  e.*,
  u.name as creator_name,
  u.email as creator_email,
  COUNT(tt.id) as ticket_types_count,
  SUM(tt.total_quantity) as total_tickets_available
FROM events e
INNER JOIN users u ON u.id = e.created_by
LEFT JOIN tickets_types tt ON tt.event_id = e.id
WHERE e.status = 'PENDING_APPROVAL'
GROUP BY e.id, u.name, u.email
ORDER BY e.created_at DESC;
