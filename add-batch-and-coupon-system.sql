-- ============================================================================
-- MIGRATION: Sistema de Lotes Automáticos e Cupons de Desconto
-- Data: 13/12/2025
-- ============================================================================

-- ============================================================================
-- 1. ADICIONAR CAMPOS DE LOTE AO TICKET_TYPES
-- ============================================================================

-- Adicionar campos para controle de lotes automáticos
ALTER TABLE tickets_types ADD COLUMN IF NOT EXISTS batch_number INTEGER DEFAULT 1;
ALTER TABLE tickets_types ADD COLUMN IF NOT EXISTS auto_advance_by_date BOOLEAN DEFAULT false;
ALTER TABLE tickets_types ADD COLUMN IF NOT EXISTS auto_advance_by_quantity BOOLEAN DEFAULT false;
ALTER TABLE tickets_types ADD COLUMN IF NOT EXISTS quantity_threshold INTEGER;
ALTER TABLE tickets_types ADD COLUMN IF NOT EXISTS next_batch_price DECIMAL(10,2);
ALTER TABLE tickets_types ADD COLUMN IF NOT EXISTS next_batch_date TIMESTAMP WITH TIME ZONE;

-- Comentários para documentação
COMMENT ON COLUMN tickets_types.batch_number IS 'Número do lote atual (1º lote, 2º lote, etc)';
COMMENT ON COLUMN tickets_types.auto_advance_by_date IS 'Se true, avança para próximo lote automaticamente na data especificada';
COMMENT ON COLUMN tickets_types.auto_advance_by_quantity IS 'Se true, avança para próximo lote quando atingir quantidade vendida';
COMMENT ON COLUMN tickets_types.quantity_threshold IS 'Quantidade de vendas que dispara mudança de lote';
COMMENT ON COLUMN tickets_types.next_batch_price IS 'Preço do próximo lote (quando mudar)';
COMMENT ON COLUMN tickets_types.next_batch_date IS 'Data para mudança automática de lote';

-- ============================================================================
-- 2. CRIAR TABELA DE CUPONS DE DESCONTO
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Código do cupom (único, case-insensitive)
  code VARCHAR(50) UNIQUE NOT NULL,

  -- Tipo de desconto
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
  discount_value DECIMAL(10,2) NOT NULL,

  -- Limite de desconto (para % pode ter valor máximo)
  max_discount_amount DECIMAL(10,2),

  -- Validade
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,

  -- Limites de uso
  usage_limit INTEGER, -- null = ilimitado
  usage_count INTEGER DEFAULT 0,
  usage_limit_per_user INTEGER DEFAULT 1,

  -- Aplicabilidade
  event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- null = todos os eventos
  ticket_type_id UUID REFERENCES tickets_types(id) ON DELETE CASCADE, -- null = todos os tipos
  minimum_purchase_amount DECIMAL(10,2),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Tracking (UTM-like)
  tracking_source VARCHAR(100), -- ex: "instagram", "email_campaign", "affiliate_john"

  -- Criado por (admin)
  created_by UUID REFERENCES users(id),

  -- Metadata
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(LOWER(code));
CREATE INDEX IF NOT EXISTS idx_coupons_event_id ON coupons(event_id);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

COMMENT ON TABLE coupons IS 'Cupons de desconto para eventos e ingressos';
COMMENT ON COLUMN coupons.code IS 'Código promocional (ex: PROMO10, BLACKFRIDAY)';
COMMENT ON COLUMN coupons.discount_type IS 'PERCENTAGE (ex: 10%) ou FIXED_AMOUNT (ex: R$ 50)';
COMMENT ON COLUMN coupons.discount_value IS 'Valor do desconto (10 para 10% ou 50 para R$ 50)';
COMMENT ON COLUMN coupons.tracking_source IS 'Origem do cupom para analytics';

-- ============================================================================
-- 3. CRIAR TABELA DE USO DE CUPONS (HISTÓRICO)
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Valores aplicados
  original_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,

  -- Metadata
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_ticket_id ON coupon_usages(ticket_id);

COMMENT ON TABLE coupon_usages IS 'Histórico de uso de cupons de desconto';

-- ============================================================================
-- 4. CRIAR TABELA DE CERTIFICADOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamentos
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Dados do certificado
  participant_name VARCHAR(255) NOT NULL,
  event_title VARCHAR(500) NOT NULL,
  event_hours DECIMAL(5,2) NOT NULL,
  completion_date DATE NOT NULL,

  -- Token único para validação
  validation_token VARCHAR(100) UNIQUE NOT NULL,

  -- Template usado
  template_id UUID REFERENCES certificate_templates(id) ON DELETE SET NULL,

  -- URL do PDF gerado (Supabase Storage)
  pdf_url TEXT,

  -- Status
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  validated_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_certificates_event_id ON certificates(event_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_ticket_id ON certificates(ticket_id);
CREATE INDEX IF NOT EXISTS idx_certificates_validation_token ON certificates(validation_token);

COMMENT ON TABLE certificates IS 'Certificados de participação em eventos';
COMMENT ON COLUMN certificates.validation_token IS 'Token único para validação pública do certificado';

-- ============================================================================
-- 5. CRIAR TABELA DE TEMPLATES DE CERTIFICADOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Nome do template
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Evento específico ou global
  event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- null = template global

  -- Design do template (JSON com configurações)
  template_config JSONB NOT NULL DEFAULT '{
    "background_color": "#FFFFFF",
    "primary_color": "#C4F82A",
    "font_family": "Inter",
    "logo_url": null,
    "background_image_url": null,
    "layout": "modern",
    "show_qr_code": true,
    "show_logo": true,
    "text_sections": {
      "title": "CERTIFICADO DE PARTICIPAÇÃO",
      "participant_prefix": "Certificamos que",
      "event_prefix": "participou do evento",
      "hours_text": "com carga horária de",
      "completion_prefix": "realizado em"
    }
  }'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Criado por
  created_by UUID REFERENCES users(id),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_certificate_templates_event_id ON certificate_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_certificate_templates_is_default ON certificate_templates(is_default);

COMMENT ON TABLE certificate_templates IS 'Templates customizáveis para certificados';
COMMENT ON COLUMN certificate_templates.template_config IS 'Configuração visual do template em JSON';

-- ============================================================================
-- 6. ADICIONAR CAMPO DE CUPOM À TABELA TICKETS
-- ============================================================================

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS final_price DECIMAL(10,2);

CREATE INDEX IF NOT EXISTS idx_tickets_coupon_id ON tickets(coupon_id);

COMMENT ON COLUMN tickets.coupon_id IS 'Cupom aplicado na compra (se houver)';
COMMENT ON COLUMN tickets.original_price IS 'Preço original antes do desconto';
COMMENT ON COLUMN tickets.discount_amount IS 'Valor do desconto aplicado';
COMMENT ON COLUMN tickets.final_price IS 'Preço final pago';

-- ============================================================================
-- 7. CRIAR FUNÇÃO PARA VALIDAR E APLICAR CUPOM
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_and_apply_coupon(
  p_coupon_code VARCHAR,
  p_ticket_type_id UUID,
  p_user_id UUID,
  p_ticket_price DECIMAL
)
RETURNS TABLE(
  is_valid BOOLEAN,
  discount_amount DECIMAL,
  final_price DECIMAL,
  coupon_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_user_usage_count INTEGER;
  v_discount DECIMAL;
BEGIN
  -- Buscar cupom (case-insensitive)
  SELECT * INTO v_coupon
  FROM coupons
  WHERE LOWER(code) = LOWER(p_coupon_code)
  AND is_active = true
  LIMIT 1;

  -- Cupom não encontrado
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL, p_ticket_price, NULL::UUID, 'Cupom não encontrado ou inativo';
    RETURN;
  END IF;

  -- Verificar validade de data
  IF v_coupon.valid_from > NOW() THEN
    RETURN QUERY SELECT false, 0::DECIMAL, p_ticket_price, NULL::UUID, 'Cupom ainda não está válido';
    RETURN;
  END IF;

  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < NOW() THEN
    RETURN QUERY SELECT false, 0::DECIMAL, p_ticket_price, NULL::UUID, 'Cupom expirado';
    RETURN;
  END IF;

  -- Verificar limite de uso total
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT false, 0::DECIMAL, p_ticket_price, NULL::UUID, 'Cupom atingiu limite de uso';
    RETURN;
  END IF;

  -- Verificar limite de uso por usuário
  SELECT COUNT(*) INTO v_user_usage_count
  FROM coupon_usages
  WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

  IF v_coupon.usage_limit_per_user IS NOT NULL AND v_user_usage_count >= v_coupon.usage_limit_per_user THEN
    RETURN QUERY SELECT false, 0::DECIMAL, p_ticket_price, NULL::UUID, 'Você já usou este cupom o máximo de vezes permitido';
    RETURN;
  END IF;

  -- Verificar aplicabilidade ao ticket_type
  IF v_coupon.ticket_type_id IS NOT NULL AND v_coupon.ticket_type_id != p_ticket_type_id THEN
    RETURN QUERY SELECT false, 0::DECIMAL, p_ticket_price, NULL::UUID, 'Cupom não aplicável a este tipo de ingresso';
    RETURN;
  END IF;

  -- Verificar valor mínimo de compra
  IF v_coupon.minimum_purchase_amount IS NOT NULL AND p_ticket_price < v_coupon.minimum_purchase_amount THEN
    RETURN QUERY SELECT false, 0::DECIMAL, p_ticket_price, NULL::UUID, 'Valor mínimo de compra não atingido';
    RETURN;
  END IF;

  -- Calcular desconto
  IF v_coupon.discount_type = 'PERCENTAGE' THEN
    v_discount := (p_ticket_price * v_coupon.discount_value / 100);
    -- Aplicar limite máximo de desconto se houver
    IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
      v_discount := v_coupon.max_discount_amount;
    END IF;
  ELSE -- FIXED_AMOUNT
    v_discount := v_coupon.discount_value;
  END IF;

  -- Garantir que desconto não seja maior que o preço
  IF v_discount > p_ticket_price THEN
    v_discount := p_ticket_price;
  END IF;

  -- Retornar resultado válido
  RETURN QUERY SELECT
    true,
    v_discount,
    (p_ticket_price - v_discount)::DECIMAL,
    v_coupon.id,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_and_apply_coupon IS 'Valida cupom e calcula desconto aplicável';

-- ============================================================================
-- 8. CRIAR TRIGGER PARA ATUALIZAR usage_count DO CUPOM
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = NEW.coupon_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_coupon_usage
AFTER INSERT ON coupon_usages
FOR EACH ROW
EXECUTE FUNCTION increment_coupon_usage();

-- ============================================================================
-- 9. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================================================

-- Coupons: Admin pode tudo, users podem apenas ler cupons ativos
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to coupons"
ON coupons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

CREATE POLICY "Users can view active coupons"
ON coupons FOR SELECT
TO authenticated
USING (is_active = true);

-- Coupon Usages: Users podem ver seus próprios usos
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon usages"
ON coupon_usages FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin full access to coupon usages"
ON coupon_usages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

-- Certificates: Users podem ver seus próprios certificados
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
ON certificates FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin full access to certificates"
ON certificates FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

-- Certificate Templates: Todos podem ler, apenas admin pode modificar
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view certificate templates"
ON certificate_templates FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admin full access to certificate templates"
ON certificate_templates FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

-- ============================================================================
-- 10. CRIAR TEMPLATE PADRÃO DE CERTIFICADO
-- ============================================================================

INSERT INTO certificate_templates (name, description, is_default, template_config)
VALUES (
  'StageOne Moderno',
  'Template padrão do StageOne com design moderno e minimalista',
  true,
  '{
    "background_color": "#0A0A0B",
    "primary_color": "#C4F82A",
    "accent_color": "#4169E1",
    "font_family": "Inter",
    "logo_url": null,
    "background_image_url": null,
    "layout": "modern",
    "show_qr_code": true,
    "show_logo": true,
    "show_border": true,
    "border_style": "neon",
    "text_sections": {
      "title": "CERTIFICADO DE PARTICIPAÇÃO",
      "participant_prefix": "Certificamos que",
      "event_prefix": "participou do evento",
      "hours_text": "com carga horária de",
      "completion_prefix": "realizado em",
      "footer": "StageOne™ - Plataforma de Eventos"
    },
    "signature_sections": [
      {
        "name": "Organizador do Evento",
        "title": "Coordenação"
      }
    ]
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Verificar tabelas criadas
SELECT
  'MIGRATION COMPLETED' as status,
  COUNT(*) FILTER (WHERE table_name = 'coupons') as coupons_table,
  COUNT(*) FILTER (WHERE table_name = 'coupon_usages') as coupon_usages_table,
  COUNT(*) FILTER (WHERE table_name = 'certificates') as certificates_table,
  COUNT(*) FILTER (WHERE table_name = 'certificate_templates') as templates_table
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('coupons', 'coupon_usages', 'certificates', 'certificate_templates');
