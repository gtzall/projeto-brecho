import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { Trash2, ShoppingBag, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { QrCodePix } from "qrcode-pix";
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
  const [qrBase64, setQrBase64] = useState("");
  const [copied, setCopied] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);

  const { data: settings } = useQuery({
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
    if (!showCheckout || !settings?.pix_key || totalPrice <= 0) return;
    const key = settings.pix_key.trim();
    const name = (settings.pix_name || "Garimpário").trim();
    const city = (settings.pix_city || "SAO PAULO").trim();
    if (!key) return;
    
    console.log("Gerando PIX com:", { key, name, city, value: totalPrice });
    
    try {
      const qr = QrCodePix({
        version: "01",
        key,
        name,
        city,
        transactionId: `GARIM-${Date.now()}`.slice(0, 25),
        value: totalPrice,
      });
      const payload = qr.payload();
      console.log("Payload PIX gerado:", payload);
      setPixPayload(payload);
      setPixError(null);
      qr.base64().then((base64: string) => {
        console.log("QR Code gerado com sucesso");
        setQrBase64(base64);
      }).catch((err: any) => {
        console.error("Erro ao gerar QR base64:", err);
        setPixError("Erro ao gerar QR Code");
      });
    } catch (err: any) {
      console.error("Erro na geração PIX:", err);
      setPixPayload("");
      setQrBase64("");
      setPixError(err?.message || "Erro ao gerar código PIX. Verifique a configuração.");
    }
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
    setQrBase64("");
    setPixError(null);
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
            <DialogTitle className="font-display text-lg sm:text-xl">Pagamento via PIX</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            <p className="font-body text-sm text-muted-foreground">
              Escaneie o QR Code ou copie o código PIX para pagar.
            </p>
            <p className="font-display text-lg sm:text-xl font-bold">
              Total: R$ {totalPrice.toFixed(2).replace(".", ",")}
            </p>
            {settings?.pix_key ? (
              <>
                {pixError && (
                  <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded">
                    <p className="font-body text-sm">{pixError}</p>
                  </div>
                )}
                {qrBase64 && (
                  <div className="flex justify-center p-3 sm:p-4 bg-muted rounded-lg">
                    <img src={qrBase64} alt="QR Code PIX" className="w-40 h-40 sm:w-48 sm:h-48" />
                  </div>
                )}
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Código PIX</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={pixPayload || "Gerando código..."}
                      className="flex-1 px-3 py-2 bg-muted border border-border font-body text-xs sm:text-sm truncate rounded"
                    />
                    <button
                      onClick={copyPixCode}
                      disabled={!pixPayload}
                      className="bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/90 transition-colors flex-shrink-0 disabled:opacity-50"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  Após o pagamento, o pedido será processado.
                </p>
              </>
            ) : (
              <p className="font-body text-sm text-muted-foreground">
                Configuração PIX pendente. Contate o administrador.
              </p>
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
