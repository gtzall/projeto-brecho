-- Configurar template de email de confirmação no Supabase Auth
-- Este script deve ser executado no SQL Editor do Supabase

-- Nota: Os templates de email do Supabase Auth são configurados via painel ou API
-- Aqui está a configuração recomendada para o projeto Garimpário

/*
No painel do Supabase, vá para:
Authentication > Templates > Confirm signup

Configure o template com:

Sender Name: brecho
Subject: Vamos garimpar! verifique seu email para continuar

HTML Body:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vamos garimpar!</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      font-family: 'Georgia', serif;
      color: #c75a2e;
      font-size: 32px;
      margin: 0;
    }
    .content {
      text-align: center;
    }
    .content h2 {
      color: #333333;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      color: #666666;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background-color: #c75a2e;
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
    }
    .button:hover {
      background-color: #a84825;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
    }
    .footer p {
      color: #999999;
      font-size: 14px;
      margin: 0;
    }
    .verification-code {
      background-color: #f8f8f8;
      border: 2px dashed #c75a2e;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      font-size: 32px;
      font-weight: bold;
      color: #333333;
      letter-spacing: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>Vamos garimpar!</h1>
    </div>
    <div class="content">
      <h2>Bem-vindo ao Garimpário!</h2>
      <p>Obrigado por se cadastrar. Verifique seu e-mail para continuar e aproveitar os melhores achados vintage.</p>
      
      <a href="{{ .ConfirmationURL }}" class="button">Confirmar meu e-mail</a>
      
      <div style="margin-top: 30px;">
        <p style="font-size: 14px; color: #999999;">
          Se o botão não funcionar, copie e cole este link no seu navegador:<br>
          <a href="{{ .ConfirmationURL }}" style="color: #c75a2e; word-break: break-all;">{{ .ConfirmationURL }}</a>
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Garimpário. Todos os direitos reservados.</p>
      <p style="margin-top: 10px; font-size: 12px;">Se você não solicitou este cadastro, ignore este e-mail.</p>
    </div>
  </div>
</body>
</html>
```

Text Body (para clientes de email que não suportam HTML):
```
Vamos garimpar! verifique seu email para continuar.

Obrigado por se cadastrar no brecho!

Verifique seu e-mail para continuar: {{ .ConfirmationURL }}

Se você não solicitou este cadastro, ignore este e-mail.

© 2026 brecho
```
*/

-- Configurações adicionais recomendadas via SQL:

-- Desabilitar confirmação de email automática (se necessário)
-- UPDATE auth.config SET enable_confirmations = true;

-- Configurar URL do site para redirects
-- Isso deve ser configurado no painel: Authentication > URL Configuration
-- Site URL: https://seu-dominio.com
-- Redirect URLs: https://seu-dominio.com/auth/callback

-- Nota: Para alterar os templates de email programaticamente, 
-- você precisa usar a API do Supabase ou o painel de administração.
-- As migrações SQL não podem alterar diretamente os templates de email.
