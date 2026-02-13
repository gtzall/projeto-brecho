-- Sistema completo de tabelas e anúncios para o Garimpário
-- Executar no SQL Editor do Supabase

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- 3. Tabela de Produtos (melhorada)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    condition TEXT NOT NULL DEFAULT 'good', -- new, excellent, good, fair
    brand TEXT,
    material TEXT,
    era TEXT, -- vintage, modern, contemporary
    stock_quantity INTEGER DEFAULT 1,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    whatsapp_number TEXT DEFAULT '11 96731-1629',
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 4. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    total_amount DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    customer_info JSONB NOT NULL DEFAULT '{}',
    shipping_address JSONB,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Configurações do Site
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    type TEXT DEFAULT 'text', -- text, number, boolean, json
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Analytics
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL, -- view, click, purchase, search
    resource_type TEXT, -- product, category, page
    resource_id UUID,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Inserir dados iniciais de categorias
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Roupas', 'roupas', 'Peças de vestuário vintage e contemporâneas', 1),
('Acessórios', 'acessorios', 'Bolsas, cintos, lenços e outros acessórios', 2),
('Calçados', 'calcados', 'Sapatos, sandálias, botas e tênis vintage', 3),
('Bolsas', 'bolsas', 'Bolsas e carteiras de todos os estilos', 4)
ON CONFLICT (slug) DO NOTHING;

-- 8. Inserir produtos de exemplo
INSERT INTO products (
    title, slug, description, price, original_price, category_id, 
    images, sizes, colors, condition, brand, material, era, stock_quantity, is_featured
) VALUES
(
    'Vestido Floral Vintage',
    'vestido-floral-vintage',
    'Lindo vestido floral dos anos 70, em perfeito estado. Padrão exclusivo e tecido de algodão.',
    189.90,
    249.90,
    (SELECT id FROM categories WHERE slug = 'roupas'),
    ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'],
    ARRAY['P', 'M', 'G'],
    ARRAY['Floral', 'Multicolorido'],
    'excellent',
    'Vintage Brasil',
    'Algodão',
    'vintage',
    1,
    true
),
(
    'Bolsa Couro Legítima',
    'bolsa-couro-legitima',
    'Bolsa de couro legítimo em excelente conservação. Espaçoso e elegante.',
    289.90,
    389.90,
    (SELECT id FROM categories WHERE slug = 'bolsas'),
    ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
    ARRAY['Único'],
    ARRAY['Marrom', 'Preto'],
    'excellent',
    'Artessanal',
    'Couro',
    'contemporary',
    1,
    true
),
(
    'Tênis Retro Anos 80',
    'tenis-retro-anos-80',
    'Tênis clássico dos anos 80, raro e em ótimo estado. Peça para colecionadores.',
    159.90,
    199.90,
    (SELECT id FROM categories WHERE slug = 'calcados'),
    ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'],
    ARRAY['38', '39', '40', '41'],
    ARRAY['Branco', 'Azul'],
    'good',
    'Nike Vintage',
    'Couro e Tecido',
    'vintage',
    1,
    false
)
ON CONFLICT (slug) DO NOTHING;

-- 9. Inserir configurações do site
INSERT INTO site_settings (key, value, description, type) VALUES
('site_name', 'Garimpário', 'Nome do site', 'text'),
('site_description', 'Cada peça conta uma história. Moda sustentável com curadoria.', 'Descrição do site', 'text'),
('whatsapp_number', '11 96731-1629', 'Número de WhatsApp para contato', 'text'),
('email_contact', 'contato@garimpario.com.br', 'Email de contato', 'text'),
('social_instagram', '@garimpario', 'Instagram', 'text'),
('social_facebook', 'garimpario', 'Facebook', 'text'),
('shipping_cost', '15.00', 'Custo do frete padrão', 'number'),
('free_shipping_threshold', '200.00', 'Valor mínimo para frete grátis', 'number'),
('maintenance_mode', 'false', 'Modo de manutenção', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- 10. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Políticas RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Políticas para Categories
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para Products
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para Orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para Site Settings
CREATE POLICY "Site settings are viewable by everyone" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON site_settings
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para Analytics
CREATE POLICY "Users can insert analytics" ON analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics" ON analytics
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 12. Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- 13. Funções úteis
CREATE OR REPLACE FUNCTION increment_product_views(product_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products 
    SET views = views + 1 
    WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_featured_products(limit_count INTEGER DEFAULT 8)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    price DECIMAL,
    original_price DECIMAL,
    images TEXT[],
    category_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.slug,
        p.price,
        p.original_price,
        p.images,
        c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true AND p.is_featured = true
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 14. Verificação final
SELECT 
    'Categorias' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 
    'Produtos' as table_name, COUNT(*) as count FROM products WHERE is_active = true
UNION ALL
SELECT 
    'Pedidos' as table_name, COUNT(*) as count FROM orders
UNION ALL
SELECT 
    'Configurações' as table_name, COUNT(*) as count FROM site_settings;

RAISE NOTICE 'Sistema de tabelas e anúncios criado com sucesso!';
RAISE NOTICE 'Execute o SQL_ADMIN_FINAL.sql para configurar o usuário admin';
