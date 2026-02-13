-- Torna ogustavo.ctt@gmail.com admin ao se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    IF NEW.email = 'ogustavo.ctt@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin');
    END IF;
    RETURN NEW;
END;
$$;

-- Tabela de configurações (chave PIX, nome, cidade)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.settings
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin para usuário existente (se já se cadastrou antes desta migração)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'ogustavo.ctt@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Valores padrão para PIX
INSERT INTO public.settings (key, value) VALUES
    ('pix_key', ''),
    ('pix_name', 'Garimpário'),
    ('pix_city', 'SAO PAULO')
ON CONFLICT (key) DO NOTHING;

-- Tabela cart_items para carrinho persistido (sincronização entre dispositivos)
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, product_id)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Habilitar Realtime para sincronização entre dispositivos
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
