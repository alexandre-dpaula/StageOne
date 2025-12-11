-- ============================================================================
-- Criar bucket de armazenamento para imagens de eventos
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Criar bucket 'event-images' com acesso público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  1048576, -- 1MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar política de leitura pública
CREATE POLICY "Public Access for event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- 3. Criar política de upload para usuários autenticados
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- 4. Criar política de atualização para usuários autenticados
CREATE POLICY "Authenticated users can update event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');

-- 5. Criar política de deleção para usuários autenticados
CREATE POLICY "Authenticated users can delete event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'event-images';
