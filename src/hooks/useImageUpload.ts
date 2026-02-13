import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('O arquivo deve ser uma imagem');
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return null;
      }

      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload com progresso simulado
      const { data, error } = await supabase.storage
        .from('product_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      setProgress(100);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product_images')
        .getPublicUrl(filePath);

      toast.success('Imagem enviada com sucesso!');
      return publicUrl;

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar imagem: ' + error.message);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) {
        urls.push(url);
      }
    }

    return urls;
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extrair o nome do arquivo da URL
      const fileName = url.split('/').pop();
      if (!fileName) return false;

      const { error } = await supabase.storage
        .from('product_images')
        .remove([fileName]);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    uploading,
    progress
  };
}
