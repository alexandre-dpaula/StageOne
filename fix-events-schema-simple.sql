-- ============================================================================
-- Script 1: Adicionar coluna cover_image na tabela events
-- Execute este primeiro
-- ============================================================================

-- Adicionar coluna cover_image
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Copiar dados existentes de banner_url para cover_image
UPDATE public.events
SET cover_image = banner_url
WHERE cover_image IS NULL AND banner_url IS NOT NULL;
