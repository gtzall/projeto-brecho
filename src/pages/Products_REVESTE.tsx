// =====================================================
// PRODUTOS REVESTE - CARDS CLICÁVEIS LUXO
// Substitua o conteúdo do Products.tsx
// =====================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Heart, ShoppingCart, Eye, Star, Crown, Sparkles, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  condition: string;
  size?: string;
  color?: string;
  brand?: string;
  category_id: string;
  images: string[];
  featured: boolean;
  status: string;
  created_at: string;
  categories: {
    name: string;
    slug: string;
  };
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [isDark, setIsDark] = useState(false);
  const { addItem } = useCart();

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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
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
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "created_at") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] || "/placeholder.svg",
      quantity: 1
    });
    toast.success("Produto adicionado ao carrinho!");
  };

  const handleWhatsApp = (product: Product) => {
    const message = `Olá! Tenho interesse no produto: ${product.title}\n\nPreço: R$ ${product.price.toFixed(2)}\n\nPodemos conversar sobre?`;
    const whatsappUrl = `https://wa.me/5511967311629?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando coleção...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-all ${
        isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Nossa Coleção
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Peças únicas com histórias para contar
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 w-full sm:w-64 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-white' : ''
                  }`}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className={`w-full sm:w-48 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <SelectValue placeholder="Categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className={`w-full sm:w-48 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Mais recentes</SelectItem>
                  <SelectItem value="price_low">Menor preço</SelectItem>
                  <SelectItem value="price_high">Maior preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Search className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Nenhum produto encontrado
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Tente ajustar seus filtros ou busca
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:bg-white transition-all hover:scale-110"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <Link to={`/produto/${product.id}`}>
                      <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:bg-white transition-all hover:scale-110">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>

                  {/* Featured Badge */}
                  {product.featured && (
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center space-x-1 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        <Crown className="w-3 h-3" />
                        <span>Destaque</span>
                      </div>
                    </div>
                  )}

                  {/* Condition Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.condition === 'novo' 
                        ? 'bg-green-500 text-white'
                        : product.condition === 'excelente'
                        ? 'bg-blue-500 text-white'
                        : product.condition === 'bom'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {product.condition}
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="mb-2">
                    <h3 className={`font-semibold text-lg mb-1 line-clamp-1 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {product.title}
                    </h3>
                    <p className={`text-sm line-clamp-2 mb-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xl font-bold text-purple-600">
                        {formatPrice(product.price)}
                      </div>
                      {product.original_price && product.original_price > product.price && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(product.original_price)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center text-sm font-medium"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Carrinho
                    </button>
                    
                    <button
                      onClick={() => handleWhatsApp(product)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center text-sm font-medium"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
