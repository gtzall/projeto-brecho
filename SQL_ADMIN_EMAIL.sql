-- =====================================================
-- APENAS CONFIGURAÇÃO DE ADMIN E EMAIL
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. FORÇAR CONFIRMAÇÃO DE TODOS OS USUÁRIOS
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- 2. LIMPAR SESSÕES
DELETE FROM auth.sessions;

-- 3. CRIAR TRIGGER PARA AUTO-CONFIRMAR NOVOS USUÁRIOS
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

-- 4. CRIAR ADMIN ESPECÍFICO
-- Forçar confirmação do admin (se existir)
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'ogustavo.ctt@gmail.com' AND email_confirmed_at IS NULL;

-- Criar role de admin (se o usuário existir)
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'ogustavo.ctt@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. VERIFICAÇÃO
SELECT COUNT(*) as usuarios_confirmados FROM auth.users WHERE email_confirmed_at IS NOT NULL;
SELECT COUNT(*) as admins_criados FROM user_roles WHERE role = 'admin';
