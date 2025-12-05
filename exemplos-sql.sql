-- ============================================================================
-- EXEMPLOS SQL ÚTEIS - STAGEONE
-- ============================================================================

-- ============================================================================
-- 1. CRIAR USUÁRIO ADMIN
-- ============================================================================

-- Primeiro cadastre-se na aplicação, depois execute:
UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'seu@email.com';

-- ============================================================================
-- 2. CRIAR EVENTO COMPLETO
-- ============================================================================

-- 2.1. Criar o evento principal
INSERT INTO public.events (
  slug,
  title,
  subtitle,
  description,
  category,
  target_audience,
  included_items,
  location_name,
  address,
  google_maps_url,
  layout,
  capacity,
  start_datetime,
  end_datetime,
  mode,
  banner_url,
  created_by,
  is_published
) VALUES (
  'imersao-video-reels-2025',
  'Imersão Vídeo Reels',
  'Domine a arte dos vídeos curtos',
  'Uma imersão completa sobre criação de conteúdo para Reels, TikTok e Shorts. Aprenda técnicas profissionais de gravação, edição e estratégias de viralização.',
  'MÍDIA',
  'Criadores de conteúdo, empreendedores digitais, profissionais de marketing',
  '["Certificado de participação", "Coffee break", "Material em PDF", "Acesso a grupo VIP", "Kit de criação"]',
  'Sala de Treinamentos M2 Studio',
  'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  'https://maps.google.com/?q=Av+Paulista+1000+São+Paulo',
  'AUDITORIO',
  80,
  '2025-02-20 09:00:00+00',
  '2025-02-20 18:00:00+00',
  'PRESENCIAL',
  NULL,
  'SEU-USER-ID-AQUI', -- Substitua pelo seu user.id
  true
);

-- 2.2. Adicionar módulos do evento
INSERT INTO public.event_modules (event_id, title, description, hours, order_index)
SELECT
  id,
  'Fundamentos da Criação de Conteúdo',
  'Entenda o algoritmo e o que faz um vídeo viralizar',
  2.5,
  0
FROM public.events WHERE slug = 'imersao-video-reels-2025';

INSERT INTO public.event_modules (event_id, title, description, hours, order_index)
SELECT
  id,
  'Técnicas de Gravação e Iluminação',
  'Como gravar vídeos profissionais com celular',
  2,
  1
FROM public.events WHERE slug = 'imersao-video-reels-2025';

INSERT INTO public.event_modules (event_id, title, description, hours, order_index)
SELECT
  id,
  'Edição e Pós-Produção',
  'Ferramentas e técnicas de edição que convertem',
  2,
  2
FROM public.events WHERE slug = 'imersao-video-reels-2025';

INSERT INTO public.event_modules (event_id, title, description, hours, order_index)
SELECT
  id,
  'Estratégias de Publicação e Análise',
  'Quando publicar, como analisar e otimizar seus resultados',
  1.5,
  3
FROM public.events WHERE slug = 'imersao-video-reels-2025';

-- 2.3. Criar tipos de ingressos
INSERT INTO public.tickets_types (event_id, name, description, price, total_quantity, sale_start, sale_end, is_active)
SELECT
  id,
  'Lote 1 - Super Early Bird',
  'Primeiras 20 vagas com desconto especial',
  197.00,
  20,
  NOW(),
  '2025-02-01 23:59:59+00',
  true
FROM public.events WHERE slug = 'imersao-video-reels-2025';

INSERT INTO public.tickets_types (event_id, name, description, price, total_quantity, sale_start, sale_end, is_active)
SELECT
  id,
  'Lote 2 - Early Bird',
  'Vagas com desconto até 10 dias antes',
  297.00,
  30,
  NOW(),
  '2025-02-10 23:59:59+00',
  true
FROM public.events WHERE slug = 'imersao-video-reels-2025';

INSERT INTO public.tickets_types (event_id, name, description, price, total_quantity, sale_start, sale_end, is_active)
SELECT
  id,
  'Lote 3 - Regular',
  'Últimas vagas disponíveis',
  397.00,
  30,
  NOW(),
  '2025-02-20 08:00:00+00',
  true
FROM public.events WHERE slug = 'imersao-video-reels-2025';

-- ============================================================================
-- 3. CRIAR MAIS EVENTOS DE EXEMPLO
-- ============================================================================

-- Workshop de Liderança
INSERT INTO public.events (slug, title, subtitle, description, category, target_audience, included_items, location_name, address, capacity, start_datetime, end_datetime, mode, created_by, is_published)
VALUES (
  'workshop-lideranca-equipes',
  'Workshop: Liderança de Equipes',
  'Desenvolva suas habilidades de liderança',
  'Workshop intensivo sobre liderança moderna, gestão de pessoas e desenvolvimento de equipes de alta performance.',
  'LIDERANÇA',
  'Gestores, líderes de equipe, coordenadores e supervisores',
  '["Certificado", "Material didático", "Coffee break", "Networking"]',
  'Sala M2 Studio',
  'Av. Paulista, 1000 - São Paulo - SP',
  40,
  '2025-03-10 08:00:00+00',
  '2025-03-10 17:00:00+00',
  'PRESENCIAL',
  'SEU-USER-ID-AQUI',
  true
);

-- Treinamento para Jovens
INSERT INTO public.events (slug, title, subtitle, description, category, target_audience, included_items, location_name, address, capacity, start_datetime, end_datetime, mode, created_by, is_published)
VALUES (
  'jovens-empreendedores-2025',
  'Jovens Empreendedores',
  'Seu primeiro negócio começa aqui',
  'Programa especial para jovens que querem empreender. Aprenda a validar ideias, criar MVP e conseguir seus primeiros clientes.',
  'JUVENTUDE',
  'Jovens de 16 a 25 anos com espírito empreendedor',
  '["Certificado", "Mentoria em grupo", "Material completo", "Networking", "Acesso a comunidade"]',
  'Sala M2 Studio',
  'Av. Paulista, 1000 - São Paulo - SP',
  60,
  '2025-04-05 09:00:00+00',
  '2025-04-06 18:00:00+00',
  'PRESENCIAL',
  'SEU-USER-ID-AQUI',
  true
);

-- ============================================================================
-- 4. CONSULTAS ÚTEIS
-- ============================================================================

-- Ver todos os eventos
SELECT id, slug, title, category, is_published, start_datetime
FROM public.events
ORDER BY created_at DESC;

-- Ver todos os tipos de ingresso de um evento
SELECT e.title, tt.name, tt.price, tt.sold_quantity, tt.total_quantity
FROM public.tickets_types tt
JOIN public.events e ON e.id = tt.event_id
WHERE e.slug = 'seu-evento-slug';

-- Ver todos os participantes de um evento
SELECT
  t.buyer_name,
  t.buyer_email,
  t.buyer_phone,
  tt.name as ticket_type,
  t.status,
  t.checked_in_at,
  t.purchased_at
FROM public.tickets t
JOIN public.events e ON e.id = t.event_id
JOIN public.tickets_types tt ON tt.id = t.ticket_type_id
WHERE e.slug = 'seu-evento-slug'
ORDER BY t.purchased_at DESC;

-- Ver estatísticas de um evento
SELECT
  e.title,
  e.capacity,
  COUNT(t.id) as total_tickets,
  COUNT(CASE WHEN t.status = 'PAID' THEN 1 END) as paid_tickets,
  COUNT(CASE WHEN t.checked_in_at IS NOT NULL THEN 1 END) as checked_in
FROM public.events e
LEFT JOIN public.tickets t ON t.event_id = e.id
WHERE e.slug = 'seu-evento-slug'
GROUP BY e.id, e.title, e.capacity;

-- Ver últimas vendas
SELECT
  e.title,
  t.buyer_name,
  t.buyer_email,
  tt.name as ticket_type,
  tt.price,
  t.purchased_at
FROM public.tickets t
JOIN public.events e ON e.id = t.event_id
JOIN public.tickets_types tt ON tt.id = t.ticket_type_id
ORDER BY t.purchased_at DESC
LIMIT 10;

-- ============================================================================
-- 5. OPERAÇÕES ADMINISTRATIVAS
-- ============================================================================

-- Tornar usuário palestrante
UPDATE public.users
SET role = 'PALESTRANTE'
WHERE email = 'palestrante@email.com';

-- Publicar/despublicar evento
UPDATE public.events
SET is_published = true
WHERE slug = 'seu-evento-slug';

-- Adicionar banner a um evento
UPDATE public.events
SET banner_url = 'https://exemplo.com/imagem-banner.jpg'
WHERE slug = 'seu-evento-slug';

-- Cancelar ticket
UPDATE public.tickets
SET status = 'CANCELLED'
WHERE id = 'ticket-id-aqui';

-- Resetar check-in (caso necessário)
UPDATE public.tickets
SET checked_in_at = NULL, status = 'PAID'
WHERE id = 'ticket-id-aqui';

-- ============================================================================
-- 6. LIMPEZA E MANUTENÇÃO
-- ============================================================================

-- Deletar todos os tickets de teste
DELETE FROM public.tickets
WHERE buyer_email LIKE '%@test.com';

-- Deletar evento e tudo relacionado (CASCADE)
DELETE FROM public.events
WHERE slug = 'evento-de-teste';

-- Ver usuários por role
SELECT role, COUNT(*) as total
FROM public.users
GROUP BY role;

-- ============================================================================
-- 7. BACKUP DE DADOS
-- ============================================================================

-- Exportar todos os participantes de um evento
COPY (
  SELECT
    t.buyer_name as "Nome",
    t.buyer_email as "E-mail",
    t.buyer_phone as "WhatsApp",
    tt.name as "Tipo de Ingresso",
    t.status as "Status",
    CASE WHEN t.checked_in_at IS NOT NULL THEN 'Sim' ELSE 'Não' END as "Check-in",
    t.purchased_at as "Data de Compra"
  FROM public.tickets t
  JOIN public.events e ON e.id = t.event_id
  JOIN public.tickets_types tt ON tt.id = t.ticket_type_id
  WHERE e.slug = 'seu-evento-slug'
  ORDER BY t.purchased_at DESC
) TO '/tmp/participantes.csv' WITH CSV HEADER;

-- ============================================================================
-- NOTA: Lembre-se de substituir:
-- - 'SEU-USER-ID-AQUI' pelo seu ID de usuário (uuid da tabela users)
-- - 'seu-evento-slug' pelo slug real do evento
-- - Datas e horários conforme necessário
-- ============================================================================
