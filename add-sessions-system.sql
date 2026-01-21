-- ============================================================================
-- SISTEMA DE SESSÕES AUTOMÁTICAS
-- ============================================================================

-- Criar tabela de sessões
CREATE TABLE IF NOT EXISTS public.event_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 25,
  current_bookings INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'FULL', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Garantir que não existam sessões duplicadas para o mesmo evento e data
  UNIQUE(event_id, session_date),
  -- Garantir que números de sessão sejam únicos por evento
  UNIQUE(event_id, session_number)
);

-- Adicionar campo de configuração de sessões na tabela events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS enable_sessions BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS session_capacity INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS available_session_dates TIMESTAMPTZ[] DEFAULT '{}';

-- Adicionar campo session_id na tabela bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.event_sessions(id) ON DELETE SET NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_event_sessions_event_id ON public.event_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sessions_status ON public.event_sessions(status);
CREATE INDEX IF NOT EXISTS idx_event_sessions_date ON public.event_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON public.bookings(session_id);

-- Habilitar RLS
ALTER TABLE public.event_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para event_sessions
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view event sessions" ON public.event_sessions;
DROP POLICY IF EXISTS "Event creators can manage sessions" ON public.event_sessions;

-- Qualquer usuário autenticado pode ver sessões
CREATE POLICY "Users can view event sessions"
  ON public.event_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins e criadores do evento podem gerenciar sessões
CREATE POLICY "Event creators can manage sessions"
  ON public.event_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      INNER JOIN public.users u ON u.id = e.created_by
      WHERE e.id = event_sessions.event_id
      AND (u.id = auth.uid() OR u.role = 'ADMIN')
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_event_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_event_sessions_updated_at ON public.event_sessions;
CREATE TRIGGER trigger_update_event_sessions_updated_at
  BEFORE UPDATE ON public.event_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_event_sessions_updated_at();

-- Função para criar próxima sessão automaticamente
CREATE OR REPLACE FUNCTION create_next_session_if_needed()
RETURNS TRIGGER AS $$
DECLARE
  v_event_id UUID;
  v_enable_sessions BOOLEAN;
  v_session_capacity INTEGER;
  v_available_dates TIMESTAMPTZ[];
  v_current_session_number INTEGER;
  v_next_date TIMESTAMPTZ;
  v_next_session_number INTEGER;
BEGIN
  -- Buscar informações do evento
  SELECT e.id, e.enable_sessions, e.session_capacity, e.available_session_dates
  INTO v_event_id, v_enable_sessions, v_session_capacity, v_available_dates
  FROM public.events e
  WHERE e.id = (
    SELECT s.event_id FROM public.event_sessions s WHERE s.id = NEW.session_id
  );

  -- Se sessões não estão habilitadas, não fazer nada
  IF NOT v_enable_sessions THEN
    RETURN NEW;
  END IF;

  -- Buscar sessão atual
  SELECT session_number, current_bookings
  INTO v_current_session_number
  FROM public.event_sessions
  WHERE id = NEW.session_id;

  -- Verificar se a sessão atual atingiu a capacidade máxima
  IF (SELECT current_bookings FROM public.event_sessions WHERE id = NEW.session_id) >= v_session_capacity THEN
    -- Marcar sessão como cheia
    UPDATE public.event_sessions
    SET status = 'FULL'
    WHERE id = NEW.session_id;

    -- Buscar próxima data disponível
    SELECT date
    INTO v_next_date
    FROM unnest(v_available_dates) AS date
    WHERE date > (SELECT session_date FROM public.event_sessions WHERE id = NEW.session_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.event_sessions
      WHERE event_id = v_event_id AND session_date = date
    )
    ORDER BY date ASC
    LIMIT 1;

    -- Se existe próxima data disponível, criar nova sessão
    IF v_next_date IS NOT NULL THEN
      v_next_session_number := v_current_session_number + 1;

      INSERT INTO public.event_sessions (
        event_id,
        session_number,
        session_date,
        max_capacity,
        current_bookings,
        status
      ) VALUES (
        v_event_id,
        v_next_session_number,
        v_next_date,
        v_session_capacity,
        0,
        'AVAILABLE'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar próxima sessão automaticamente após booking
DROP TRIGGER IF EXISTS trigger_create_next_session ON public.bookings;
CREATE TRIGGER trigger_create_next_session
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  WHEN (NEW.session_id IS NOT NULL AND NEW.payment_status = 'PAID')
  EXECUTE FUNCTION create_next_session_if_needed();

-- Função para atualizar contador de bookings na sessão
CREATE OR REPLACE FUNCTION update_session_bookings_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.session_id IS NOT NULL AND NEW.payment_status = 'PAID' THEN
    UPDATE public.event_sessions
    SET current_bookings = current_bookings + 1
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.session_id IS NOT NULL THEN
    IF OLD.payment_status != 'PAID' AND NEW.payment_status = 'PAID' THEN
      -- Pagamento confirmado, incrementar
      UPDATE public.event_sessions
      SET current_bookings = current_bookings + 1
      WHERE id = NEW.session_id;
    ELSIF OLD.payment_status = 'PAID' AND NEW.payment_status IN ('CANCELLED', 'REFUNDED') THEN
      -- Cancelamento, decrementar
      UPDATE public.event_sessions
      SET current_bookings = GREATEST(current_bookings - 1, 0),
          status = CASE
            WHEN current_bookings - 1 < max_capacity THEN 'AVAILABLE'
            ELSE status
          END
      WHERE id = NEW.session_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador
DROP TRIGGER IF EXISTS trigger_update_session_bookings_count ON public.bookings;
CREATE TRIGGER trigger_update_session_bookings_count
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_session_bookings_count();
