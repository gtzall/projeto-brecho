import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { Trash2, ShoppingBag, Copy, Check, AlertCircle, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { generatePixPayload, PixKeyInfo } from "@/utils/pix";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Cart = () => {
  const { items, removeItem, totalPrice, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [pixPayload, setPixPayload] = useState("");
  const [pixKeyInfo, setPixKeyInfo] = useState<PixKeyInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings-pix"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("key, value");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
      return map;
    },
    enabled: showCheckout && items.length > 0,
  });

  useEffect(() => {
    if (!showCheckout) return;
    
    if (!settings) return;
    
    if (!settings.pix_key) {
      setPixError("Chave PIX não configurada no admin");
      return;
    }
    
    if (totalPrice <= 0) {
      setPixError("Valor inválido");
      return;
    }
    
    const generatePix = () => {
      setIsGenerating(true);
      setPixError(null);
      
      try {
        const key = settings.pix_key.trim();
        const name = (settings.pix_name || "Garimpário").trim();
        const city = (settings.pix_city || "SAO PAULO").trim();
        
        if (!key) {
          setPixError("Chave PIX vazia");
          setIsGenerating(false);
          return;
        }

        // Gerar payload PIX
        const result = generatePixPayload({
          key,
          name,
          city,
          transactionId: `GARIM${Date.now()}`,
          value: totalPrice,
        });
        
        setPixPayload(result.payload);
        setPixKeyInfo(result.keyInfo);
      } catch (err: any) {
        console.error("Erro ao gerar PIX:", err);
        setPixError(err?.message || "Erro ao gerar código PIX");
        setPixPayload("");
        setPixKeyInfo(null);
      } finally {
        setIsGenerating(false);
      }
    };
    
    generatePix();
  }, [showCheckout, settings, totalPrice]);

  const copyPixCode = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
    setPixPayload("");
    setPixKeyInfo(null);
    setPixError(null);
  };

  // Função para formatar a chave PIX para exibição
  const formatKeyForDisplay = (key: string, type: string) => {
    if (type === "cpf" && key.length === 11) {
      return `${key.slice(0, 3)}.${key.slice(3, 6)}.${key.slice(6, 9)}-${key.slice(9)}`;
    }
    if (type === "cnpj" && key.length === 14) {
      return `${key.slice(0, 2)}.${key.slice(2, 5)}.${key.slice(5, 8)}/${key.slice(8, 12)}-${key.slice(12)}`;
    }
    if (type === "phone" && key.length >= 12) {
      const ddi = key.slice(0, 2);
      const ddd = key.slice(2, 4);
      const number = key.slice(4);
      if (number.length === 9) {
        return `+${ddi} (${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
      }
      return `+${ddi} (${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
    }
    return key;
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6 sm:py-12">
        <h1 className="font-display text-2xl sm:text-4xl font-bold mb-6 sm:mb-10">Seu carrinho</h1>

        {items.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <ShoppingBag size={40} className="mx-auto mb-4 text-muted-foreground sm:hidden" strokeWidth={1} />
            <ShoppingBag size={48} className="mx-auto mb-4 text-muted-foreground hidden sm:block" strokeWidth={1} />
            <p className="font-display text-xl sm:text-2xl text-muted-foreground mb-6">Seu carrinho está vazio</p>
            <Link
              to="/produtos"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-4 font-body text-sm uppercase tracking-widest hover:bg-terracotta-dark transition-colors"
            >
              Continuar garimpando
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-border"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover bg-muted flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm sm:text-base font-medium line-clamp-2">{item.title}</h3>
                    <p className="font-body text-sm text-foreground font-semibold mt-1">
                      R$ {item.price.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors self-start p-1 -mr-1"
                    aria-label="Remover item"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="border border-border p-4 sm:p-6 h-fit lg:sticky lg:top-24">
              <h2 className="font-display text-lg sm:text-xl font-bold mb-4 sm:mb-6">Resumo</h2>
              <div className="space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} {items.length === 1 ? "item" : "itens"})</span>
                  <span className="font-semibold">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-body">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-primary text-primary-foreground px-6 sm:px-8 py-4 font-body text-sm uppercase tracking-widest hover:bg-terracotta-dark transition-colors mb-3 active:scale-[0.98]"
              >
                Pagar com PIX
              </button>
              <button
                onClick={clearCart}
                className="w-full border border-border text-muted-foreground px-6 sm:px-8 py-3 font-body text-xs uppercase tracking-widest hover:border-foreground hover:text-foreground transition-colors active:scale-[0.98]"
              >
                Limpar carrinho
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />

      <Dialog open={showCheckout} onOpenChange={(o) => !o && handleCloseCheckout()}>
        <DialogContent className="max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
              <CreditCard size={20} />
              Pagamento via PIX
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            <p className="font-display text-lg sm:text-xl font-bold text-center">
              Total: R$ {totalPrice.toFixed(2).replace(".", ",")}
            </p>
            
            {settingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="font-body text-sm text-muted-foreground">Carregando...</p>
              </div>
            ) : isGenerating ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="font-body text-sm text-muted-foreground">Gerando código PIX...</p>
              </div>
            ) : pixError ? (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body text-sm font-medium">{pixError}</p>
                  </div>
                </div>
              </div>
            ) : pixPayload && pixKeyInfo ? (
              <>
                {/* Informações da chave PIX */}
                <div className="bg-muted border border-border rounded-lg p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Chave PIX Configurada
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                      {pixKeyInfo.typeLabel}
                    </span>
                  </div>
                  <p className="font-body text-sm font-mono break-all">
                    {formatKeyForDisplay(pixKeyInfo.value, pixKeyInfo.type)}
                  </p>
                </div>

                {/* Código PIX */}
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                    Código PIX (copia e cola)
                  </label>
                  <textarea
                    readOnly
                    value={pixPayload}
                    rows={5}
                    className="w-full px-3 py-2 bg-muted border border-border font-body text-xs rounded resize-none"
                  />
                  <button
                    onClick={copyPixCode}
                    className="w-full mt-3 bg-primary text-primary-foreground px-4 py-3 rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? "Copiado!" : "Copiar código PIX"}
                  </button>
                </div>

                <p className="font-body text-xs text-muted-foreground text-center">
                  Abra o app do seu banco, escolha "Pix Copia e Cola" e cole o código acima.
                </p>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body text-sm font-medium">Configuração PIX pendente</p>
                    <p className="font-body text-xs mt-1">Contate o administrador.</p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => { handleCloseCheckout(); clearCart(); }}
              className="w-full border border-border font-body text-xs uppercase tracking-widest py-3 hover:bg-muted transition-colors rounded"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;
