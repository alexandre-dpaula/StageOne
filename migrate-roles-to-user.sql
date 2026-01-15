-- ============================================================================
-- MIGRAÇÃO: Sistema de Roles Simplificado
-- ============================================================================
-- Data: 2025-12-13
-- Objetivo: Simplificar roles de 3 (ADMIN, PALESTRANTE, PARTICIPANTE) para 2 (ADMIN, USER)
-- ============================================================================

-- PASSO 1: Adicionar 'USER' ao enum de roles (sem remover os antigos ainda)
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('ADMIN', 'USER', 'PALESTRANTE', 'PARTICIPANTE'));

-- PASSO 2: Migrar todos PALESTRANTE e PARTICIPANTE para USER
UPDATE users
SET role = 'USER'
WHERE role IN ('PALESTRANTE', 'PARTICIPANTE');

-- PASSO 3: Opcional - Remover roles antigos do constraint (executar só após confirmar que tudo funciona)
-- ALTER TABLE users
-- DROP CONSTRAINT IF EXISTS users_role_check;
--
-- ALTER TABLE users
-- ADD CONSTRAINT users_role_check
-- CHECK (role IN ('ADMIN', 'USER'));

-- ============================================================================
-- VERIFICAÇÕES
-- ============================================================================

-- Ver distribuição atual de roles
SELECT role, COUNT(*) as total
FROM users
GROUP BY role
ORDER BY role;

-- Ver se algum usuário ficou com role antiga
SELECT id, name, email, role
FROM users
WHERE role NOT IN ('ADMIN', 'USER')
ORDER BY created_at DESC
LIMIT 10;
