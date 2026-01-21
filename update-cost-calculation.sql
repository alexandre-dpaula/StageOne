-- ============================================================================
-- ATUALIZAÇÃO: Sistema de preços por hora
-- Menos de 4h: R$ 150/h
-- 4h ou mais: R$ 120/h
-- Mínimo: 3 horas
-- ============================================================================

-- Atualizar função para calcular preços com base na duração
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
  v_price_per_hour_under_4h DECIMAL := 150; -- R$ 150/h para menos de 4h
  v_price_per_hour_4h_plus DECIMAL := 120;  -- R$ 120/h para 4h ou mais
  v_base_audiovisual DECIMAL := 100;
  v_base_coffee DECIMAL := 150;
  v_base_coverage DECIMAL := 250;
  v_additional_per_hour DECIMAL := 12.5;

  v_room DECIMAL;
  v_audio DECIMAL := 0;
  v_coffee DECIMAL := 0;
  v_cover DECIMAL := 0;
  v_price_per_hour DECIMAL;
BEGIN
  -- Determinar preço por hora baseado na duração
  IF p_duration_hours < v_base_hours THEN
    v_price_per_hour := v_price_per_hour_under_4h; -- R$ 150/h
  ELSE
    v_price_per_hour := v_price_per_hour_4h_plus;  -- R$ 120/h
  END IF;

  -- Calcular preço da sala (mínimo 3h)
  v_room := GREATEST(p_duration_hours, 3) * v_price_per_hour;

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
