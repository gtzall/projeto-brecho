-- =====================================================
-- SQL LIMPO E CORRIGIDO - EXECUTE APENAS ESTE
-- =====================================================

-- 1. LIMPAR CONFIGURAÇÕES DE EMAIL
DELETE FROM auth.config WHERE key LIKE '%mail%';
DELETE FROM auth.config WHERE key LIKE '%smtp%';
DELETE FROM auth.config WHERE key LIKE '%email%';
DELETE FROM auth.config WHERE key LIKE '%confirm%';

-- 2. CONFIGURAR SEM VERIFICAÇÃO
INSERT INTO auth.config (key, value) VALUES 
    ('confirm_email', 'false'),
    ('disable_signup', 'false'),
    ('site_url', 'http://localhost:8080')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. FORÇAR CONFIRMAÇÃO DE USUÁRIOS
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- 4. LIMPAR CACHE
DELETE FROM auth.sessions;

-- 5. CRIAR TRIGGER AUTO-CONFIRM
CREATE OR REPLACE FUNCTION auto_confirm_new_users()
RETURNS trigger AS $$
BEGIN
    NEW.email_confirmed_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION auto_confirm_new_users();

-- 6. VERIFICAÇÃO
SELECT key, value FROM auth.config WHERE key IN ('confirm_email', 'disable_signup');
