import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_PRODUCTS = [
  { id: "1", title: "Jaqueta Jeans Vintage", price: 89.9, original_price: 180, images: ["/placeholder.svg"], condition: "excelente", categories: { name: "Roupas" } },
  { id: "2", title: "Relógio Seiko Automático", price: 320, original_price: 650, images: ["/placeholder.svg"], condition: "bom", categories: { name: "Acessórios" } },
  { id: "3", title: "Bolsa de Couro Caramelo", price: 150, original_price: 400, images: ["/placeholder.svg"], condition: "excelente", categories: { name: "Acessórios" } },
  { id: "4", title: "Coleção Clarice Lispector", price: 45, original_price: 90, images: ["/placeholder.svg"], condition: "bom", categories: { name: "Livros" } },
  { id: "5", title: "Luminária Art Déco", price: 210, original_price: null, images: ["/placeholder.svg"], condition: "excelente", categories: { name: "Decoração" } },
  { id: "6", title: "Vestido Midi Floral", price: 65, original_price: 120, images: ["/placeholder.svg"], condition: "bom", categories: { name: "Roupas" } },
  { id: "7", title: "Anel Prata 925", price: 78, original_price: 150, images: ["/placeholder.svg"], condition: "novo", categories: { name: "Joias" } },
  { id: "8", title: "Cadeira de Madeira Retrô", price: 280, original_price: 500, images: ["/placeholder.svg"], condition: "bom", categories: { name: "Móveis" } },
  { id: "9", title: "Camisa Hawaiana 70s", price: 55, original_price: 110, images: ["/placeholder.svg"], condition: "bom", categories: { name: "Roupas" } },
  { id: "10", title: "Vaso Cerâmica Artesanal", price: 95, original_price: null, images: ["/placeholder.svg"], condition: "excelente", categories: { name: "Decoração" } },
  { id: "11", title: "Óculos Ray-Ban Vintage", price: 180, original_price: 350, images: ["/placeholder.svg"], condition: "excelente", categories: { name: "Acessórios" } },
  { id: "12", title: "Saia Lápis Preta", price: 75, original_price: 150, images: ["/placeholder.svg"], condition: "excelente", categories: { name: "Roupas" } },
];

const Products = () => {
  const [isDark, setIsDark] = useState(false);
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const { data: products = PLACEHOLDER_PRODUCTS, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || PLACEHOLDER_PRODUCTS;
    },
  });

  const filteredProducts = category
    ? products.filter((product: any) => 
        product.categories?.name?.toLowerCase() === category.toLowerCase()
      )
    : products;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando produtos...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-background text-foreground'
    }`}>
      <Header />
      <main className="container mx-auto px-4 py-20">
        {/* Theme Toggle */}
        <div className="fixed top-20 right-4 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className={`rounded-full p-2 ${
              isDark 
                ? 'border-gray-700 text-yellow-400 hover:bg-gray-800' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : "Nossos Produtos"}
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Peças únicas com história e alma. Curamos com amor para você encontrar seu tesouro.
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
