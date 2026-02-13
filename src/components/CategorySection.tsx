import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shirt, Watch, BookOpen, Lamp, Gem, Armchair, Package } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

// Mapeamento de ícones por slug
const iconMap: Record<string, React.ElementType> = {
  roupas: Shirt,
  acessorios: Watch,
  livros: BookOpen,
  decoracao: Lamp,
  joias: Gem,
  moveis: Armchair,
};

const CategorySection = () => {
  const queryClient = useQueryClient();

  // Buscar categorias do Supabase
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Realtime subscription para atualizar em tempo real
  useEffect(() => {
    const channel = supabase
      .channel('categories-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          console.log('Categoria alterada no site:', payload);
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fallback para categorias padrão se estiver carregando ou vazio
  const displayCategories = categories?.length ? categories : [
    { name: "Roupas", slug: "roupas" },
    { name: "Acessórios", slug: "acessorios" },
    { name: "Livros", slug: "livros" },
    { name: "Decoração", slug: "decoracao" },
    { name: "Joias", slug: "joias" },
  ];

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3">Explore</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Categorias</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((cat, i) => {
            const IconComponent = iconMap[cat.slug] || Package;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  to={`/produtos?categoria=${cat.slug}`}
                  className="flex flex-col items-center gap-3 p-6 border border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                >
                  <IconComponent
                    size={28}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                    strokeWidth={1.5}
                  />
                  <span className="font-body text-xs uppercase tracking-widest text-foreground">{cat.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
