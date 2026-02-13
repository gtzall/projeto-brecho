import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  category_id?: string;
  condition?: string;
  size?: string;
  color?: string;
  brand?: string;
  images: string[];
  status: string;
  featured: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Buscar produtos iniciais
    fetchProducts();

    // Inscrever para atualizações em tempo real
    const subscription = supabase
      .channel('products_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Mudança detectada:', payload);
          fetchProducts(); // Recarregar produtos quando houver mudanças
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('products')
        .insert([{ ...product, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Produto adicionado com sucesso!');
      return data;
    } catch (err: any) {
      toast.error('Erro ao adicionar produto: ' + err.message);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Produto atualizado com sucesso!');
      return data;
    } catch (err: any) {
      toast.error('Erro ao atualizar produto: ' + err.message);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Produto removido com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao remover produto: ' + err.message);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  };
}
