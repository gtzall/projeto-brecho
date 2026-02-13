-- ============================================================
-- SQL COMPLETO - APAGA TUDO E RECRIA DO ZERO
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
DROP POLICY IF EXISTS "Produtos visíveis para todos" ON products;
DROP POLICY IF EXISTS "Admin pode gerenciar todos os produtos" ON products;
DROP POLICY IF EXISTS "Categorias visíveis para todos" ON categories;
DROP POLICY IF EXISTS "Apenas admin pode criar categorias" ON categories;
DROP POLICY IF EXISTS "Apenas admin pode deletar categorias" ON categories;
DROP POLICY IF EXISTS "Settings visíveis para todos" ON settings;
DROP POLICY IF EXISTS "Apenas admin pode modificar settings" ON settings;
DROP POLICY IF EXISTS "Users podem ver suas próprias roles" ON user_roles;
DROP POLICY IF EXISTS "Admin pode gerenciar roles" ON user_roles;

-- 2. REMOVER TRIGGER EXISTENTE
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- 3. CRIAR TABELAS (SE NÃO EXISTIREM)

-- Tabela de Categorias (criar primeiro pois é referenciada)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  condition TEXT DEFAULT 'bom',
  size TEXT,
  color TEXT,
  brand TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT false,
  images JSONB,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Configurações (PIX)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Roles/Permissões
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 4. ATIVAR RLS EM TODAS AS TABELAS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 5. FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. TRIGGER PARA PRODUTOS
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. CRIAR POLÍTICAS RLS

-- Produtos
CREATE POLICY "Produtos visíveis para todos" 
  ON products FOR SELECT 
  USING (status = 'available' OR auth.uid() = user_id);

CREATE POLICY "Admin pode gerenciar todos os produtos" 
  ON products FOR ALL 
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- Categorias
CREATE POLICY "Categorias visíveis para todos" 
  ON categories FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode criar categorias" 
  ON categories FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

CREATE POLICY "Apenas admin pode deletar categorias" 
  ON categories FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- Settings
CREATE POLICY "Settings visíveis para todos" 
  ON settings FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode modificar settings" 
  ON settings FOR ALL 
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- User Roles
CREATE POLICY "Users podem ver suas próprias roles" 
  ON user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin pode gerenciar roles" 
  ON user_roles FOR ALL 
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- 8. CATEGORIAS PADRÃO
INSERT INTO categories (name, slug) VALUES
  ('Roupas', 'roupas'),
  ('Acessórios', 'acessorios'),
  ('Calçados', 'calcados'),
  ('Bolsas', 'bolsas'),
  ('Vintage', 'vintage')
ON CONFLICT (slug) DO NOTHING;

-- 9. CONFIGURAR ADMIN (ogustavo.ctt@gmail.com)
-- Garantir que o usuário existe e está confirmado
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'ogustavo.ctt@gmail.com' AND email_confirmed_at IS NULL;

-- Criar role de admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'ogustavo.ctt@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 10. ATUALIZAR PRODUTOS EXISTENTES (se houver)
UPDATE products 
SET status = 'available' 
WHERE status IS NULL;

-- 11. VERIFICAÇÃO FINAL
SELECT 
  'TABELAS CRIADAS' as check_item,
  COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'categories', 'settings', 'user_roles')
UNION ALL
SELECT 
  'POLITICAS CRIADAS' as check_item,
  COUNT(*) 
FROM pg_policies 
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'CATEGORIAS PADRAO' as check_item,
  COUNT(*) 
FROM categories
UNION ALL
SELECT 
  'ADMINS CONFIGURADOS' as check_item,
  COUNT(*) 
FROM user_roles 
WHERE role = 'admin';

SELECT '✅ SISTEMA CONFIGURADO COM SUCESSO!' as status;
