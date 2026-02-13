-- =====================================================
-- CORREÇÃO PARA LOGIN DE CONTAS EXISTENTES
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. FORÇAR CONFIRMAÇÃO DE TODOS OS USUÁRIOS (incluindo existentes)
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;

-- 2. LIMPAR TODAS AS SESSÕES (força novo login)
DELETE FROM auth.sessions;

-- 3. LIMPAR REFRESH TOKENS
DELETE FROM auth.refresh_tokens;

-- 4. VERIFICAR QUANTOS USUÁRIOS FICARAM NÃO CONFIRMADOS
SELECT COUNT(*) as usuarios_nao_confirmados FROM auth.users WHERE email_confirmed_at IS NULL;

-- 5. LISTAR TODOS OS USUÁRIOS (para verificação)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'NÃO CONFIRMADO'
        ELSE 'CONFIRMADO'
    END as status
FROM auth.users 
ORDER BY created_at DESC;
