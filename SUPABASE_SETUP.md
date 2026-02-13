# RECRIAÇÃO DO PROJETO SUPABASE - PASSO A PASSO

## 1. CRIAR NOVO PROJETO NO SUPABASE

1. Acesse: https://supabase.com/dashboard
2. Clique em "New Project"
3. Escolha sua organização
4. Configure:
   - **Name:** brecho (ou nome que preferir)
   - **Database Password:** (crie uma senha forte e guarde)
   - **Region:** (escolha a mais próxima, ex: São Paulo)
   - **Pricing Plan:** Free tier
5. Clique em "Create new project"
6. Aguarde a criação (pode levar 2-3 minutos)

## 2. CONFIGURAR BANCO DE DADOS

1. No painel do novo projeto, vá em **SQL Editor** (menu lateral)
2. Clique em **+ New query**
3. Cole todo o conteúdo do arquivo: `supabase/migrations/20260209070000_recreate_database.sql`
4. Clique em **Run** (botão verde no canto superior direito)

## 3. CONFIGURAR STORAGE (BUCKET DE IMAGENS)

1. Vá em **Storage** no menu lateral
2. Clique em **New bucket**
3. Nome: `product-images`
4. Marque: **Public bucket** (para imagens serem acessíveis publicamente)
5. Clique em **Create bucket**

### Configurar políticas do bucket:
1. Dentro do bucket `product-images`, vá na aba **Policies**
2. Clique em **New policy**
3. Selecione **For custom access control**
4. Crie estas 3 políticas:

**Política 1 - SELECT (visualizar):**
- Name: `Public can view images`
- Allowed operation: `SELECT`
- Policy definition: `true`

**Política 2 - INSERT (upload):**
- Name: `Admins can upload`
- Allowed operation: `INSERT`
- Policy definition: `auth.uid() in (select user_id from user_roles where role = 'admin')`

**Política 3 - DELETE (remover):**
- Name: `Admins can delete`
- Allowed operation: `DELETE`
- Policy definition: `auth.uid() in (select user_id from user_roles where role = 'admin')`

## 4. CONFIGURAR EMAIL TEMPLATE

1. Vá em **Authentication** > **Templates** > **Confirm signup**
2. Altere:
   - **Sender Name:** `brecho`
   - **Subject:** `Vamos garimpar! verifique seu email para continuar`
   
3. Cole este HTML em **HTML Body**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vamos garimpar!</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo h1 { font-family: 'Georgia', serif; color: #c75a2e; font-size: 32px; margin: 0; }
    .content { text-align: center; }
    .content h2 { color: #333333; font-size: 24px; margin-bottom: 20px; }
    .content p { color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background-color: #c75a2e; color: #ffffff !important; text-decoration: none; padding: 15px 40px; border-radius: 4px; font-size: 16px; font-weight: bold; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; }
    .footer p { color: #999999; font-size: 14px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>Vamos garimpar!</h1>
    </div>
    <div class="content">
      <h2>Bem-vindo ao brechó!</h2>
      <p>Obrigado por se cadastrar. Verifique seu e-mail para continuar e aproveitar os melhores achados.</p>
      <a href="{{ .ConfirmationURL }}" class="button">Confirmar meu e-mail</a>
    </div>
    <div class="footer">
      <p>© 2026 brecho</p>
    </div>
  </div>
</body>
</html>
```

4. Cole este texto em **Text Body**:
```
Vamos garimpar! verifique seu email para continuar.

Obrigado por se cadastrar no brecho!

Verifique seu e-mail para continuar: {{ .ConfirmationURL }}

© 2026 brecho
```

5. Clique em **Save**

## 5. ATUALIZAR CREDENCIAIS NO PROJETO

1. No Supabase, vá em **Project Settings** > **API**
2. Copie:
   - **Project URL**
   - **anon public** (chave pública)

3. No arquivo `.env.local` do seu projeto (crie se não existir):

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

4. Reinicie o servidor local: `npm run dev`

## 6. CRIAR ADMIN INICIAL

1. Acesse seu site local: http://localhost:8080
2. Vá em **Minha Conta** > **Sair** (se estiver logado)
3. Clique em **Criar conta**
4. Cadastre-se com:
   - **Email:** `ogustavo.ctt@gmail.com`
   - **Senha:** `gt125436`
5. Confirme o email (verifique sua caixa de entrada)
6. Faça login - você será automaticamente admin!

## ✅ PRONTO!

Seu projeto está recriado com:
- ✅ Banco de dados completo
- ✅ Storage para imagens
- ✅ Email template configurado
- ✅ Admin configurado
- ✅ Todas as tabelas e políticas de segurança

**Arquivo SQL criado:** `supabase/migrations/20260209070000_recreate_database.sql`
