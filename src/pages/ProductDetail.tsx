import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const conditionLabels: Record<string, string> = {
  novo: "Novo",
  excelente: "Excelente",
  bom: "Bom estado",
  usado: "Usado",
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse font-display text-2xl text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl mb-4">Produto não encontrado</h1>
          <Link to="/produtos" className="font-body text-sm text-primary uppercase tracking-wider">
            ← Voltar aos achados
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link to="/produtos" className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground mb-8 uppercase tracking-wider">
          <ArrowLeft size={14} /> Voltar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square bg-muted overflow-hidden"
          >
            <img
              src={product.images?.[0] || "/placeholder.svg"}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            {product.categories?.name && (
              <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3">
                {product.categories.name}
              </p>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl font-bold text-foreground">
                R$ {Number(product.price).toFixed(2).replace(".", ",")}
              </span>
              {product.original_price && (
                <>
                  <span className="font-body text-lg text-muted-foreground line-through">
                    R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
                  </span>
                  <span className="font-body text-xs bg-primary text-primary-foreground px-2 py-1 uppercase tracking-wider">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <span className="px-3 py-1.5 border border-border text-xs font-body uppercase tracking-wider">
                {conditionLabels[product.condition] || product.condition}
              </span>
              {product.size && (
                <span className="px-3 py-1.5 border border-border text-xs font-body uppercase tracking-wider">
                  Tam: {product.size}
                </span>
              )}
              {product.brand && (
                <span className="px-3 py-1.5 border border-border text-xs font-body uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
              {product.color && (
                <span className="px-3 py-1.5 border border-border text-xs font-body uppercase tracking-wider">
                  {product.color}
                </span>
              )}
            </div>

            {product.description && (
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            <button
              onClick={() =>
                addItem({
                  id: product.id,
                  title: product.title,
                  price: Number(product.price),
                  image: product.images?.[0] || "/placeholder.svg",
                })
              }
              className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 font-body text-sm uppercase tracking-widest hover:bg-terracotta-dark transition-colors w-full lg:w-auto"
            >
              <ShoppingBag size={18} />
              Adicionar ao carrinho
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
