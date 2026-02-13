// =====================================================
// AUTENTICAÇÃO SEM VERIFICAÇÃO DE EMAIL - VERSÃO CORRIGIDA
// Substitua todo o conteúdo do Auth.tsx por este código
// =====================================================

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const passwordSchema = z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(128);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkUserRoleAndRedirect(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRoleAndRedirect = async (session: any) => {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleData) {
      navigate("/admin");
    } else {
      navigate("/minha-conta");
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      toast.success("Você saiu da sua conta");
      navigate("/auth");
    } catch (error: any) {
      console.error("Erro ao sair:", error);
      toast.error("Ocorreu um erro ao sair da conta");
    }
  };

  const forceConfirmEmail = async (userEmail: string) => {
    try {
      // Tentar usar RPC se disponível
      const { data, error } = await supabase.rpc('bypass_email_verification', { 
        user_email: userEmail, 
        user_password: password 
      });
      
      if (!error && data) {
        return true;
      }
    } catch (rpcError: any) {
      console.log("RPC não disponível, usando método alternativo");
    }
    
    // Método alternativo: signup para forçar ativação
    try {
      const { error: signupError } = await supabase.auth.signUp({
        email: userEmail,
        password: password,
        options: { 
          emailRedirectTo: `${window.location.origin}/minha-conta`,
          data: { full_name: userEmail.split('@')[0] }
        }
      });
      
      return !signupError;
    } catch (signupError: any) {
      console.log("Signup também falhou");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      setLoading(false);
      return;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Tentativa de login
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        // Se login falhou por email não confirmado
        if (error && (error.message.includes("Email not confirmed") || error.message.includes("email_confirmed_at"))) {
          console.log("Tentando forçar confirmação de email...");
          
          // Forçar confirmação
          const confirmSuccess = await forceConfirmEmail(email);
          
          if (confirmSuccess) {
            // Limpar sessão e tentar novamente
            await supabase.auth.signOut();
            
            // Esperar um pouco e tentar login novamente
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const retryResult = await supabase.auth.signInWithPassword({ email, password });
            
            if (retryResult.data?.user) {
              const { data: roleData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", retryResult.data.user.id)
                .eq("role", "admin")
                .maybeSingle();
              
              const isAdmin = roleData !== null;
              toast.success("Login realizado com sucesso!");
              
              if (isAdmin) {
                navigate("/admin");
              } else {
                navigate("/minha-conta");
              }
              return;
            }
          }
        }
        
        // Se login falhou completamente
        if (!data?.user) {
          if (error?.message.includes("Invalid login credentials")) {
            toast.error("E-mail ou senha incorretos");
          } else if (error) {
            toast.error(error.message);
          } else {
            toast.error("Erro desconhecido ao fazer login");
          }
          setLoading(false);
          return;
        }
        
        // Login bem-sucedido normal
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        const isAdmin = roleData !== null;
        toast.success("Login realizado com sucesso!");
        
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/minha-conta");
        }
      } else {
        // Signup com login automático
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: `${window.location.origin}/minha-conta`,
            data: {
              full_name: email.split('@')[0],
            }
          },
        });
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este e-mail já está cadastrado");
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }
        
        // Forçar confirmação do novo usuário
        await forceConfirmEmail(email);
        
        // Login automático
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (!loginError && data.user) {
          toast.success("Conta criada e login realizado com sucesso!");
          
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .eq("role", "admin")
            .maybeSingle();
          
          const isAdmin = roleData !== null;
          
          if (isAdmin) {
            navigate("/admin");
          } else {
            navigate("/minha-conta");
          }
        } else {
          toast.success("Conta criada! Faça login para continuar.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error("Erro na autenticação:", error);
      toast.error(error.message || "Ocorreu um erro ao processar sua solicitação");
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-terracotta/10 to-terracotta/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Você já está logado!
            </h2>
            <p className="text-gray-600 mb-6">
              Deseja sair da sua conta?
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleSignOut}
                className="w-full bg-terracotta hover:bg-terracotta-dark"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sair da Conta
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Voltar ao Site
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-terracotta/10 to-terracotta/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft size={16} className="mr-2" />
            Voltar ao site
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "Entrar" : "Criar Conta"}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? "Bem-vindo de volta! Faça login na sua conta." 
              : "Crie sua conta para começar a garimpar."
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-terracotta hover:bg-terracotta-dark"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? "Entrando..." : "Criando conta..."}
              </>
            ) : (
              isLogin ? "Entrar" : "Criar Conta"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-terracotta hover:text-terracotta-dark font-semibold"
            >
              {isLogin ? "Criar conta" : "Fazer login"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
