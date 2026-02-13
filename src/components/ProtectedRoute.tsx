import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ adminOnly = false }) => {
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: isAdminRole, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ['isAdmin', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      // Verifica se é o email de admin
      if (session.user.email === 'ogustavo.ctt@gmail.com') return true;
      
      // Verifica na tabela profiles
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();
      return !!data;
    },
    enabled: !!session?.user?.id,
  });

  if (isLoading || isLoadingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && !isAdminRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
