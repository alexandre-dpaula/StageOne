-- ============================================================================
-- Fix events table schema
-- Adiciona coluna cover_image e corrige nome da tabela tickets_types
-- ============================================================================

-- 1. Adicionar coluna cover_image se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE public.events ADD COLUMN cover_image TEXT;
    COMMENT ON COLUMN public.events.cover_image IS 'URL da imagem de capa do evento (1024x768px recomendado)';
  END IF;
END $$;

-- 2. Copiar dados de banner_url para cover_image se existirem
UPDATE public.events
SET cover_image = banner_url
WHERE cover_image IS NULL AND banner_url IS NOT NULL;

-- 3. Verificar se a tabela tickets_types existe (e não ticket_types)
-- Caso exista ticket_types sem o 's', renomear para tickets_types
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'ticket_types'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'tickets_types'
  ) THEN
    ALTER TABLE public.ticket_types RENAME TO tickets_types;
  END IF;
END $$;

COMMENT ON TABLE public.tickets_types IS 'Tipos de ingressos/lotes para eventos';
