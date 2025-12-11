-- ============================================================================
-- Script 2: Criar bucket de storage para imagens
-- Execute este depois do Script 1
-- ============================================================================

-- Criar bucket 'event-images' com acesso público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso (execute uma por vez se der erro)

-- Política 1: Leitura pública
CREATE POLICY IF NOT EXISTS "Public read access for event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Política 2: Upload para autenticados
CREATE POLICY IF NOT EXISTS "Authenticated upload for event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- Política 3: Update para autenticados
CREATE POLICY IF NOT EXISTS "Authenticated update for event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');

-- Política 4: Delete para autenticados
CREATE POLICY IF NOT EXISTS "Authenticated delete for event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');
