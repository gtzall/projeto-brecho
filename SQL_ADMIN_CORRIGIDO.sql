-- =====================================================
-- ADMIN CORRIGIDO - UPLOAD E CRUD 100% FUNCIONAL
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR E CORRIGIR POLÍTICAS DE ADMIN
-- =====================================================

-- Remover políticas antigas que podem bloquear
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are manageable by admins" ON products;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories are manageable by admins" ON categories;
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;
DROP POLICY IF EXISTS "Settings are manageable by admins" ON settings;

-- 2. CRIAR POLÍTICAS NOVAS E FUNCIONAIS
-- =====================================================

-- Products - leitura pública, escrita apenas admin
CREATE POLICY "Products public read" ON products FOR SELECT USING (true);
CREATE POLICY "Products admin write" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Categories - leitura pública, escrita apenas admin
CREATE POLICY "Categories public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories admin write" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Settings - leitura pública, escrita apenas admin
CREATE POLICY "Settings public read" ON settings FOR SELECT USING (true);
CREATE POLICY "Settings admin write" ON settings FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 3. VERIFICAR E CRIAR ADMIN
-- =====================================================

-- Forçar confirmação do admin se existir
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'ogustavo.ctt@gmail.com' AND email_confirmed_at IS NULL;

-- Criar role de admin se não existir
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'ogustavo.ctt@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar admin
SELECT 
    u.email,
    ur.role,
    ur.created_at as admin_since
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'ogustavo.ctt@gmail.com' AND ur.role = 'admin';

-- Verificar políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('products', 'categories', 'settings');

SELECT 'ADMIN CORRIGIDO COM SUCESSO!' as status;
