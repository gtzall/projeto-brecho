import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        navigate('/auth');
      }
    };

    getProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast.success('Você saiu da sua conta');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Botão retornar ao brecho */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Retornar ao brechó
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Minha Conta</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sair
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Informações da Conta</h2>
            <p className="text-gray-600">Email: {user.email}</p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium">Meus Pedidos</h3>
            <p className="text-sm text-gray-500 mt-1">Acompanhe seus pedidos recentes</p>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-center text-gray-500">Nenhum pedido encontrado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
