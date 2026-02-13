-- ============================================================
-- CONFIGURAÇÃO COMPLETA DO SUPABASE PARA ADMIN GARIMPÁRIO
-- Execute este SQL no SQL Editor do Supabase
-- ============================================================

-- 1. TABELA DE PRODUTOS
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

-- 2. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE CONFIGURAÇÕES (PIX)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELA DE ROLES/PERMISÕES
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 5. ENABLE RLS EM TODAS AS TABELAS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS RLS PARA PRODUTOS
CREATE POLICY "Produtos visíveis para todos" 
  ON products FOR SELECT 
  USING (status = 'available' OR auth.uid() = user_id);

CREATE POLICY "Admin pode gerenciar todos os produtos" 
  ON products FOR ALL 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- 7. POLÍTICAS RLS PARA CATEGORIAS
CREATE POLICY "Categorias visíveis para todos" 
  ON categories FOR SELECT 
  USING (true);

CREATE POLICY "Apenas admin pode criar categorias" 
  ON categories FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

CREATE POLICY "Apenas admin pode deletar categorias" 
  ON categories FOR DELETE 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- 8. POLÍTICAS RLS PARA SETTINGS
CREATE POLICY "Settings visíveis para todos" 
  ON settings FOR SELECT 
  USING (true);

CREATE POLICY "Apenas admin pode modificar settings" 
  ON settings FOR ALL 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- 9. POLÍTICAS RLS PARA USER_ROLES
CREATE POLICY "Users podem ver suas próprias roles" 
  ON user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin pode gerenciar roles" 
  ON user_roles FOR ALL 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- 10. FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. TRIGGER PARA PRODUTOS
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. CATEGORIAS PADRÃO
INSERT INTO categories (name, slug) VALUES
  ('Roupas', 'roupas'),
  ('Acessórios', 'acessorios'),
  ('Calçados', 'calcados'),
  ('Bolsas', 'bolsas'),
  ('Vintage', 'vintage')
ON CONFLICT (slug) DO NOTHING;

-- 13. CONFIGURAR ADMIN INICIAL (ogustavo.ctt@gmail.com)
-- NOTA: Este comando deve ser executado após o usuário fazer login pela primeira vez
-- ou você pode inserir manualmente o UUID do usuário

-- 14. PERMISSÕES PARA STORAGE (IMAGENS)
-- Criar bucket se não existir (fazer pelo dashboard do Supabase em Storage)
-- As políticas de storage devem ser configuradas no dashboard:
-- 1. Vá em Storage → Policies
-- 2. Crie uma policy para "product-images" bucket:
--    - Name: "Public Read"
--    - Operation: SELECT
--    - Target: public
--    - Allowed operation: true
-- 3. Crie outra policy:
--    - Name: "Admin Upload"
--    - Operation: INSERT
--    - Target: authenticated
--    - Allowed operation: auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')

-- ============================================================
-- INSTRUÇÕES PARA CONFIGURAR O BUCKET DE IMAGENS:
-- ============================================================
-- 1. No Dashboard do Supabase, vá em "Storage" no menu lateral
-- 2. Clique em "New bucket"
-- 3. Nome: product-images
-- 4. Marque "Public bucket"
-- 5. Clique em "Create bucket"
-- 6. Depois clique no bucket criado → Policies
-- 7. Crie as políticas conforme descrito acima (seção 14)
-- ============================================================

-- Verificação final
SELECT 'Tabelas criadas com sucesso!' as status;
