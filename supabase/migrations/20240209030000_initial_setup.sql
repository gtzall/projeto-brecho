-- Criar usuário administrador
INSERT INTO auth.users (id, instance_id, email, email_confirmed_at, encrypted_password, 
  email_change, email_change_confirm_status, recovery_token, recovery_sent_at, 
  last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
  confirmation_token, email_change_token_new, email_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'ogustavo.ctt@gmail.com',
  NOW(),
  '$2a$10$Jc25sG88YsUZY.2g0p0RFOqP9F42d3rE8hXtHgKjZz4LJZJ5N6zXK', -- senha: gt125436
  '',
  0,
  '',
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "ogustavo.ctt@gmail.com"}',
  NOW(),
  NOW(),
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Garantir que o usuário tenha permissão de administrador
INSERT INTO user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Criar configurações iniciais do PIX se não existirem
INSERT INTO settings (key, value) 
VALUES 
  ('pix_key', ''),
  ('pix_name', 'Garimpário'),
  ('pix_city', 'SAO PAULO')
ON CONFLICT (key) DO NOTHING;

-- Atualizar políticas de segurança para permitir upload de imagens
CREATE OR REPLACE POLICY "Enable read access for authenticated users" ON storage.objects 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE OR REPLACE POLICY "Enable insert for authenticated users only" ON storage.objects 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Criar bucket para upload de imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;
