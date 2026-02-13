import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: any;
  payment_method: string;
  payment_status: string;
  pix_qr_code?: string;
  pix_copy_paste?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: {
    id: string;
    title: string;
    price: number;
    images: string[];
  };
}

export function useCart() {
  const [loading, setLoading] = useState(false);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Faça login para adicionar ao carrinho');
        return null;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: productId,
          quantity
        }, { onConflict: 'user_id,product_id' })
        .select()
        .single();

      if (error) throw error;
      toast.success('Adicionado ao carrinho!');
      return data;
    } catch (err: any) {
      toast.error('Erro ao adicionar ao carrinho: ' + err.message);
      return null;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Removido do carrinho');
    } catch (err: any) {
      toast.error('Erro ao remover: ' + err.message);
    }
  };

  const getCartItems = async (): Promise<CartItem[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(id, title, price, images)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar carrinho:', err);
      return [];
    }
  };

  const createOrder = async (totalAmount: number, shippingAddress: any): Promise<Order | null> => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          payment_method: 'pix',
          payment_status: 'pending',
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Gerar dados do PIX (simulado)
      const pixData = generatePixData(order.id, totalAmount);
      
      // Atualizar pedido com dados do PIX
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          pix_qr_code: pixData.qrCode,
          pix_copy_paste: pixData.copyPaste
        })
        .eq('id', order.id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Pedido criado! Aguardando pagamento PIX');
      return updatedOrder;
    } catch (err: any) {
      toast.error('Erro ao criar pedido: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar dados do PIX (simulada)
  const generatePixData = (orderId: string, amount: number) => {
    const transactionId = Math.random().toString(36).substring(7).toUpperCase();
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PIX${orderId}${transactionId}`;
    
    // Código copia e cola simulado (formato simplificado)
    const copyPaste = `00020126580014BR.GOV.PIX0119ogustavo.ctt@gmail.com52040000530398654${String(Math.round(amount * 100)).padStart(10, '0')}5802BR5913GARIMPARIO6009SAO PAULO${transactionId}`;
    
    return { qrCode, copyPaste };
  };

  const copyPixCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código PIX copiado!');
  };

  return {
    addToCart,
    removeFromCart,
    getCartItems,
    createOrder,
    copyPixCode,
    loading
  };
}
