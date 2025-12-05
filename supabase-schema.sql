-- ============================================================================
-- STAGEONE - PLATAFORMA DE EVENTOS E TREINAMENTOS
-- Schema do Banco de Dados (Supabase/Postgres)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'PARTICIPANTE' CHECK (role IN ('ADMIN', 'PALESTRANTE', 'PARTICIPANTE')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for faster role queries
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  target_audience TEXT,
  total_hours DECIMAL(5,2) DEFAULT 0,
  included_items JSONB DEFAULT '[]'::jsonb,

  -- Location
  location_name TEXT NOT NULL,
  address TEXT NOT NULL,
  google_maps_url TEXT,
  layout TEXT CHECK (layout IN ('AUDITORIO', 'U', 'ILHAS', 'TEATRO', 'CIRCULAR')),
  capacity INTEGER NOT NULL DEFAULT 50,

  -- Dates
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Mode
  mode TEXT NOT NULL DEFAULT 'PRESENCIAL' CHECK (mode IN ('PRESENCIAL', 'ONLINE', 'HIBRIDO')),

  -- Media
  banner_url TEXT,

  -- Meta
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_start_datetime ON public.events(start_datetime);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_is_published ON public.events(is_published);

-- ============================================================================
-- EVENT MODULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.event_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hours DECIMAL(4,2) NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index
CREATE INDEX idx_event_modules_event_id ON public.event_modules(event_id);
CREATE INDEX idx_event_modules_order ON public.event_modules(event_id, order_index);

-- ============================================================================
-- TICKETS TYPES TABLE (Lotes/Tipos de Ingressos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tickets_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  sale_start TIMESTAMP WITH TIME ZONE,
  sale_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  CONSTRAINT check_sold_quantity CHECK (sold_quantity <= total_quantity)
);

-- Index
CREATE INDEX idx_tickets_types_event_id ON public.tickets_types(event_id);
CREATE INDEX idx_tickets_types_is_active ON public.tickets_types(is_active);

-- ============================================================================
-- TICKETS TABLE (Ingressos Comprados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  ticket_type_id UUID NOT NULL REFERENCES public.tickets_types(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,

  -- Buyer info
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,

  -- QR Code and Status
  qr_code_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'CANCELLED', 'USED')),

  -- Timestamps
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checkout_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_tickets_qr_code_token ON public.tickets(qr_code_token);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_ticket_type_id ON public.tickets(ticket_type_id);

-- ============================================================================
-- EVENT MATERIALS TABLE (Materiais pós-evento)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.event_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  external_url TEXT,
  visible_from TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index
CREATE INDEX idx_event_materials_event_id ON public.event_materials(event_id);
CREATE INDEX idx_event_materials_visible_from ON public.event_materials(visible_from);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update total_hours in events when modules change
CREATE OR REPLACE FUNCTION update_event_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.events
  SET total_hours = (
    SELECT COALESCE(SUM(hours), 0)
    FROM public.event_modules
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
  )
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update total_hours
CREATE TRIGGER update_total_hours_on_module_change
  AFTER INSERT OR UPDATE OR DELETE ON public.event_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_event_total_hours();

-- Function to update sold_quantity when ticket is created/updated
CREATE OR REPLACE FUNCTION update_ticket_type_sold_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'PAID' THEN
    UPDATE public.tickets_types
    SET sold_quantity = sold_quantity + 1
    WHERE id = NEW.ticket_type_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'PAID' AND NEW.status = 'PAID' THEN
    UPDATE public.tickets_types
    SET sold_quantity = sold_quantity + 1
    WHERE id = NEW.ticket_type_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'PAID' AND NEW.status = 'CANCELLED' THEN
    UPDATE public.tickets_types
    SET sold_quantity = sold_quantity - 1
    WHERE id = NEW.ticket_type_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update sold_quantity
CREATE TRIGGER update_sold_quantity_on_ticket_change
  AFTER INSERT OR UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_type_sold_quantity();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_materials ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Events policies (public can view published, creators can manage own)
CREATE POLICY "Anyone can view published events" ON public.events
  FOR SELECT USING (is_published = true OR auth.uid() = created_by);

CREATE POLICY "Admins and palestrantes can create events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'PALESTRANTE')
    )
  );

CREATE POLICY "Creators and admins can update events" ON public.events
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Event modules policies (inherit from events)
CREATE POLICY "Anyone can view modules of accessible events" ON public.event_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_modules.event_id
      AND (is_published = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Event creators can manage modules" ON public.event_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_modules.event_id
      AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'))
    )
  );

-- Tickets types policies
CREATE POLICY "Anyone can view active ticket types for published events" ON public.tickets_types
  FOR SELECT USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM public.events WHERE id = tickets_types.event_id AND is_published = true)
  );

CREATE POLICY "Event creators can manage ticket types" ON public.tickets_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = tickets_types.event_id
      AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'))
    )
  );

-- Tickets policies
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Event creators and admins can view event tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = tickets.event_id
      AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'))
    )
  );

CREATE POLICY "Authenticated users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Event creators and admins can update tickets" ON public.tickets
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = tickets.event_id
      AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'))
    )
  );

-- Event materials policies
CREATE POLICY "Ticket holders can view materials when visible" ON public.event_materials
  FOR SELECT USING (
    (visible_from IS NULL OR visible_from <= NOW()) AND
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE event_id = event_materials.event_id
      AND user_id = auth.uid()
      AND status IN ('PAID', 'USED')
    )
  );

CREATE POLICY "Event creators can manage materials" ON public.event_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_materials.event_id
      AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'))
    )
  );

-- ============================================================================
-- SEED DATA (Optional - Usuário admin inicial)
-- ============================================================================
-- Após criar um usuário no Supabase Auth, execute:
-- INSERT INTO public.users (id, name, email, role)
-- VALUES ('uuid-do-usuario-auth', 'Admin', 'admin@stageone.com', 'ADMIN');
