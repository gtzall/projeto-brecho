import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeaturedProducts = () => {
  const { data: products } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("status", "available")
        .eq("featured", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  // Não mostra nada se não houver produtos cadastrados no admin
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3">Seleção especial</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Achados da semana</h2>
          </div>
          <Link
            to="/produtos"
            className="hidden md:flex items-center gap-2 font-body text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver tudo <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product: any, i: number) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              originalPrice={product.original_price}
              image={product.images?.[0] || "/placeholder.svg"}
              condition={product.condition}
              category={product.categories?.name}
              index={i}
            />
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link
            to="/produtos"
            className="inline-flex items-center gap-2 font-body text-sm uppercase tracking-wider text-primary"
          >
            Ver todos os achados <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
