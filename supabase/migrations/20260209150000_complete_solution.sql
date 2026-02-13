-- =====================================================
-- SOLUÇÃO DEFINITIVA - BYPASS COMPLETO DE VERIFICAÇÃO DE EMAIL
-- Execute em ordem no SQL Editor do Supabase
-- =====================================================

-- 1. REMOVER TODAS AS CONFIGURAÇÕES DE EMAIL EXISTENTES
DELETE FROM auth.config WHERE key LIKE '%mail%';
DELETE FROM auth.config WHERE key LIKE '%smtp%';
DELETE FROM auth.config WHERE key LIKE '%email%';
DELETE FROM auth.config WHERE key LIKE '%confirm%';

-- 2. CONFIGURAR AMBIENTE SEM VERIFICAÇÃO
INSERT INTO auth.config (key, value) VALUES 
    ('confirm_email', 'false'),
    ('disable_signup', 'false'),
    ('site_url', 'http://localhost:8080'),
    ('external_url', 'http://localhost:8080')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. FORÇAR CONFIRMAÇÃO DE TODOS OS USUÁRIOS EXISTENTES
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- 4. LIMPAR CACHE COMPLETO
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;

-- 5. CRIAR TRIGGER PARA AUTO-CONFIRMAR NOVOS USUÁRIOS
CREATE OR REPLACE FUNCTION auto_confirm_new_users()
RETURNS trigger AS $$
BEGIN
    NEW.email_confirmed_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. APLICAR TRIGGER (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION auto_confirm_new_users();

-- 7. CRIAR FUNÇÃO PARA BYPASS DE LOGIN
CREATE OR REPLACE FUNCTION bypass_email_verification(user_email TEXT, user_password TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    result JSON;
BEGIN
    -- Buscar usuário
    SELECT * INTO user_record FROM auth.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'User not found');
    END IF;
    
    -- Forçar confirmação se necessário
    IF user_record.email_confirmed_at IS NULL THEN
        UPDATE auth.users SET email_confirmed_at = now() WHERE id = user_record.id;
    END IF;
    
    -- Retornar sucesso
    RETURN json_build_object('success', true, 'user_id', user_record.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. VERIFICAÇÃO FINAL
SELECT key, value FROM auth.config WHERE key IN ('confirm_email', 'disable_signup');
SELECT COUNT(*) as unconfirmed_users FROM auth.users WHERE email_confirmed_at IS NULL;

-- =====================================================
-- FIM - SISTEMA 100% SEM VERIFICAÇÃO DE EMAIL
-- =====================================================
