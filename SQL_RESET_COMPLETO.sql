-- =====================================================
-- RESET COMPLETO E RECONSTRUÇÃO - SISTEMA 100%
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. LIMPAR TUDO COMPLETAMENTE
-- =====================================================

-- Remover todas as políticas
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories are manageable by admins" ON categories;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are manageable by admins" ON products;
DROP POLICY IF EXISTS "User roles are viewable by admins" ON user_roles;
DROP POLICY IF EXISTS "User roles are manageable by admins" ON user_roles;
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;
DROP POLICY IF EXISTS "Settings are manageable by admins" ON settings;
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
DROP POLICY IF EXISTS "Enable realtime for admins" ON products;
DROP POLICY IF EXISTS "Enable realtime orders for admins" ON orders;
DROP POLICY IF EXISTS "Enable realtime cart for admins" ON cart_items;
DROP POLICY IF EXISTS "Enable realtime settings for admins" ON settings;

-- Remover todos os triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS product_change_trigger ON products;
DROP TRIGGER IF EXISTS order_change_trigger ON orders;
DROP TRIGGER IF EXISTS cart_change_trigger ON cart_items;

-- Remover funções
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS auto_confirm_new_users();
DROP FUNCTION IF EXISTS notify_product_change();
DROP FUNCTION IF EXISTS notify_order_change();
DROP FUNCTION IF EXISTS notify_cart_change();

-- Limpar dados
DELETE FROM order_items;
DELETE FROM cart_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM user_roles;
DELETE FROM settings;

-- 2. RECRIAR TABELAS LIMPAS
-- =====================================================

-- Tabela de categorias
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de produtos
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    condition TEXT NOT NULL CHECK (condition IN ('novo', 'excelente', 'bom', 'usado')),
    size TEXT,
    color TEXT,
    brand TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    images TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de roles de usuário
CREATE TABLE user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- Tabela de configurações
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de itens do carrinho
CREATE TABLE cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Tabela de pedidos
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    total DECIMAL(10,2) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address JSONB,
    payment_method TEXT DEFAULT 'pix',
    payment_pix_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de itens do pedido
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NULL,
    title TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. HABILITAR RLS
-- =====================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS SIMPLES E FUNCIONAIS
-- =====================================================

-- Categories - público para leitura
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

-- Products - público para leitura
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

-- User roles - apenas admins
CREATE POLICY "Admin only user roles" ON user_roles FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Settings - público para leitura, admin para escrita
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON settings FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Cart items - usuário só vê seus itens
CREATE POLICY "Own cart items" ON cart_items FOR ALL USING (user_id = auth.uid());

-- Orders - usuário vê seus pedidos, admin vê todos
CREATE POLICY "Own orders" ON orders FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Order items - baseado nos pedidos
CREATE POLICY "Based on orders" ON order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND 
    (user_id = auth.uid() OR 
     EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')))
);

-- 5. FUNÇÕES BÁSICAS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. DADOS INICIAIS
-- =====================================================

-- Categorias
INSERT INTO categories (name, slug) VALUES
    ('Roupas', 'roupas'),
    ('Acessórios', 'acessorios'),
    ('Calçados', 'calcados'),
    ('Bolsas', 'bolsas'),
    ('Joias', 'joias'),
    ('Livros', 'livros'),
    ('Decoração', 'decoracao'),
    ('Móveis', 'moveis'),
    ('Eletrônicos', 'eletronicos'),
    ('Outros', 'outros');

-- Configurações PIX
INSERT INTO settings (key, value) VALUES
    ('pix_key', ''),
    ('pix_name', 'Garimpário'),
    ('pix_city', 'SAO PAULO');

-- 7. CONFIGURAÇÃO DE EMAIL SEM VERIFICAÇÃO
-- =====================================================

-- Forçar confirmação de todos os usuários
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- Limpar sessões
DELETE FROM auth.sessions;

-- Trigger para auto-confirmar novos usuários
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

-- 8. CRIAR ADMIN
-- =====================================================

-- Forçar confirmação do admin
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'ogustavo.ctt@gmail.com' AND email_confirmed_at IS NULL;

-- Criar role de admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'ogustavo.ctt@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 9. VERIFICAÇÃO FINAL
-- =====================================================
SELECT 'SISTEMA RESETADO COM SUCESSO!' as status;
SELECT COUNT(*) as categorias FROM categories;
SELECT COUNT(*) as usuarios_confirmados FROM auth.users WHERE email_confirmed_at IS NOT NULL;
SELECT COUNT(*) as admins FROM user_roles WHERE role = 'admin';
