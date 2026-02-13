import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  condition: string;
  category?: string;
  index?: number;
}

const conditionLabels: Record<string, string> = {
  novo: "Novo",
  excelente: "Excelente",
  bom: "Bom",
  usado: "Usado",
};

const ProductCard = ({ id, title, price, originalPrice, image, condition, category, index = 0 }: ProductCardProps) => {
  const { addItem } = useCart();
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/produto/${id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-3">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />

          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-body font-bold uppercase tracking-wider px-2 py-1">
              -{discount}%
            </span>
          )}

          <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-body uppercase tracking-wider px-2 py-1">
            {conditionLabels[condition] || condition}
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({ id, title, price, image });
            }}
            className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-primary text-primary-foreground p-2 sm:p-2.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-y-2 sm:group-hover:translate-y-0 hover:bg-terracotta-dark active:scale-95 shadow-lg sm:shadow-none"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </Link>

      <div className="space-y-1">
        {category && (
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{category}</p>
        )}
        <Link to={`/produto/${id}`}>
          <h3 className="font-display text-base font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-semibold text-foreground">
            R$ {price.toFixed(2).replace(".", ",")}
          </span>
          {originalPrice && (
            <span className="font-body text-xs text-muted-foreground line-through">
              R$ {originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
