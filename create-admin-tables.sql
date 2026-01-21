-- ============================================================================
-- TABELA DE ADMINISTRADORES
-- Sistema de controle de acesso administrativo
-- ============================================================================

-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- admin, super_admin
  permissions JSONB DEFAULT '{"dashboard": true, "events": true, "users": true, "bookings": true, "coupons": true, "reports": true}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = user_uuid
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar last_login
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_last_login();

-- ============================================================================
-- TABELA DE LOGS DE AÇÕES ADMINISTRATIVAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', 'export'
  entity_type TEXT NOT NULL, -- 'event', 'user', 'booking', 'coupon', etc
  entity_id UUID,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_entity ON admin_activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_activity_logs(created_at DESC);

-- ============================================================================
-- VIEWS PARA RELATÓRIOS
-- ============================================================================

-- View de métricas gerais do sistema
CREATE OR REPLACE VIEW admin_system_metrics AS
SELECT
  (SELECT COUNT(*) FROM events WHERE is_published = true) as total_events_published,
  (SELECT COUNT(*) FROM events) as total_events,
  (SELECT COUNT(DISTINCT user_id) FROM bookings) as total_users_with_bookings,
  (SELECT COUNT(*) FROM bookings WHERE payment_status = 'PAID') as total_bookings_confirmed,
  (SELECT COUNT(*) FROM tickets WHERE status = 'PAID') as total_active_tickets,
  (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE payment_status = 'PAID') as total_revenue;

-- View de receita por evento
CREATE OR REPLACE VIEW admin_revenue_by_event AS
SELECT
  e.id,
  e.title,
  e.category,
  COUNT(DISTINCT b.id) as total_bookings,
  COALESCE(SUM(b.quantity), 0) as total_tickets_sold,
  COALESCE(SUM(b.total_price), 0) as gross_revenue,
  e.created_at,
  e.start_datetime
FROM events e
LEFT JOIN tickets_types tt ON e.id = tt.event_id
LEFT JOIN bookings b ON tt.id = b.ticket_type_id AND b.payment_status = 'PAID'
GROUP BY e.id, e.title, e.category, e.created_at, e.start_datetime;

-- View de receita mensal
CREATE OR REPLACE VIEW admin_monthly_revenue AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_bookings,
  COALESCE(SUM(total_price), 0) as gross_revenue,
  COALESCE(SUM(quantity), 0) as total_tickets
FROM bookings
WHERE payment_status = 'PAID'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- View de top eventos
CREATE OR REPLACE VIEW admin_top_events AS
SELECT
  e.id,
  e.title,
  e.category,
  COUNT(DISTINCT b.id) as bookings_count,
  COALESCE(SUM(b.quantity), 0) as tickets_sold,
  COALESCE(SUM(b.total_price), 0) as total_revenue,
  e.start_datetime
FROM events e
LEFT JOIN tickets_types tt ON e.id = tt.event_id
LEFT JOIN bookings b ON tt.id = b.ticket_type_id AND b.payment_status = 'PAID'
WHERE e.is_published = true
GROUP BY e.id, e.title, e.category, e.start_datetime
ORDER BY total_revenue DESC
LIMIT 10;

-- ============================================================================
-- RLS POLICIES PARA ADMINS
-- ============================================================================

-- Habilitar RLS na tabela de admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem ver todos os outros admins
CREATE POLICY "Admins can view all admins"
  ON admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.is_active = true
    )
  );

-- Policy: Super admins podem gerenciar admins
CREATE POLICY "Super admins can manage admins"
  ON admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.role = 'super_admin'
      AND a.is_active = true
    )
  );

-- Policy: Admins podem ver seus próprios logs
CREATE POLICY "Admins can view activity logs"
  ON admin_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.is_active = true
    )
  );

-- Policy: Admins podem criar logs
CREATE POLICY "Admins can create activity logs"
  ON admin_activity_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.is_active = true
    )
  );

-- ============================================================================
-- FUNÇÃO PARA BUSCAR MÉTRICAS DO DASHBOARD
-- ============================================================================

CREATE OR REPLACE FUNCTION get_admin_dashboard_metrics(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_metrics JSON;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Default para últimos 30 dias se não especificado
  v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end_date := COALESCE(p_end_date, CURRENT_DATE);

  SELECT json_build_object(
    'overview', json_build_object(
      'total_events', (SELECT COUNT(*) FROM events WHERE is_published = true),
      'total_bookings', (SELECT COUNT(*) FROM bookings WHERE payment_status = 'PAID'),
      'total_users', (SELECT COUNT(DISTINCT user_id) FROM bookings),
      'total_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE payment_status = 'PAID')
    ),
    'period', json_build_object(
      'start_date', v_start_date,
      'end_date', v_end_date,
      'bookings', (
        SELECT COUNT(*) FROM bookings
        WHERE payment_status = 'PAID'
        AND DATE(created_at) BETWEEN v_start_date AND v_end_date
      ),
      'revenue', (
        SELECT COALESCE(SUM(total_price), 0) FROM bookings
        WHERE payment_status = 'PAID'
        AND DATE(created_at) BETWEEN v_start_date AND v_end_date
      )
    ),
    'top_categories', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          e.category,
          COUNT(DISTINCT b.id) as bookings,
          COALESCE(SUM(b.total_price), 0) as revenue
        FROM events e
        LEFT JOIN tickets_types tt ON e.id = tt.event_id
        LEFT JOIN bookings b ON tt.id = b.ticket_type_id AND b.payment_status = 'PAID'
        GROUP BY e.category
        ORDER BY revenue DESC
        LIMIT 5
      ) t
    ),
    'recent_bookings', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          b.id,
          b.total_price,
          b.payment_status,
          b.created_at,
          e.title as event_title
        FROM bookings b
        JOIN tickets_types tt ON b.ticket_type_id = tt.id
        JOIN events e ON tt.event_id = e.id
        ORDER BY b.created_at DESC
        LIMIT 10
      ) t
    )
  ) INTO v_metrics;

  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
