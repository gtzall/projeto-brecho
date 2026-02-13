-- =====================================================
-- SOLUÇÃO PARA SUPABASE CLOUD (SEM auth.config)
-- =====================================================

-- 1. FORÇAR CONFIRMAÇÃO DE USUÁRIOS EXISTENTES
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- 2. LIMPAR CACHE DE SESSÕES
DELETE FROM auth.sessions;

-- 3. CRIAR TRIGGER PARA AUTO-CONFIRMAR NOVOS USUÁRIOS
CREATE OR REPLACE FUNCTION auto_confirm_new_users()
RETURNS trigger AS $$
BEGIN
    NEW.email_confirmed_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. APLICAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION auto_confirm_new_users();

-- 5. VERIFICAÇÃO
SELECT COUNT(*) as unconfirmed_users FROM auth.users WHERE email_confirmed_at IS NULL;

-- =====================================================
-- IMPORTANTE: CONFIGURE NO DASHBOARD DO SUPABASE
-- =====================================================
-- 
-- Vá em: Authentication > Settings > Confirm email
-- Desative a opção "Confirm email"
-- 
-- =====================================================
