-- ============================================================================
-- ADD FCM TOKEN COLUMN TO USERS TABLE
-- ============================================================================
--
-- Este script adiciona a coluna fcm_token à tabela users para armazenar
-- os tokens do Firebase Cloud Messaging (Push Notifications)
--
-- Execute este script no Supabase SQL Editor:
-- https://app.supabase.com/project/YOUR_PROJECT/sql
-- ============================================================================

-- Adicionar coluna fcm_token (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'fcm_token'
  ) THEN
    ALTER TABLE public.users
    ADD COLUMN fcm_token TEXT;

    RAISE NOTICE 'Coluna fcm_token adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna fcm_token já existe.';
  END IF;
END $$;

-- Criar índice para busca rápida de tokens
CREATE INDEX IF NOT EXISTS idx_users_fcm_token
ON public.users(fcm_token)
WHERE fcm_token IS NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.users.fcm_token IS 'Token do Firebase Cloud Messaging para envio de push notifications';

-- Verificar se foi criada corretamente
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'fcm_token';
