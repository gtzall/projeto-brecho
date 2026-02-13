import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CART_STORAGE_KEY = "garimpario-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadLocalCart);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load cart from Supabase when logged in
  const fetchCart = async (uid: string) => {
    const { data, error } = await supabase
      .from("cart_items")
      .select("product_id, quantity, products(id, title, price, images)")
      .eq("user_id", uid);
    if (error) return;
    
    const cartItems: CartItem[] = (data || [])
      .filter((r: any) => r?.products)
      .map((r: any) => ({
        id: r.products.id,
        title: r.products.title,
        price: Number(r.products.price),
        image: r.products.images?.[0] || "/placeholder.svg",
        quantity: r.quantity || 1,
      }));
    setItems(cartItems);
  };

  // Initial load and realtime subscription
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Load initial cart
    fetchCart(userId);
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel(`cart_${userId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${userId}` },
        () => {
          fetchCart(userId); // Reload cart on any change
        }
      )
      .subscribe();

    setIsLoading(false);

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  // Merge local cart with Supabase when logging in
  useEffect(() => {
    if (!userId) return;
    
    const mergeCart = async () => {
      const local = loadLocalCart();
      if (local.length > 0) {
        for (const localItem of local) {
          await supabase.from("cart_items").upsert(
            { user_id: userId, product_id: localItem.id, quantity: localItem.quantity },
            { onConflict: "user_id,product_id" }
          );
        }
        localStorage.removeItem(CART_STORAGE_KEY);
        fetchCart(userId);
      }
    };
    mergeCart();
  }, [userId]);

  const addItem = async (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev;
      const next = [...prev, { ...item, quantity: 1 }];
      if (!userId) saveLocalCart(next);
      return next;
    });
    if (userId) {
      await supabase.from("cart_items").upsert(
        { user_id: userId, product_id: item.id, quantity: 1 },
        { onConflict: "user_id,product_id" }
      );
    }
  };

  const removeItem = async (id: string) => {
    if (userId) {
      await supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", id);
    }
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      if (!userId) saveLocalCart(next);
      return next;
    });
  };

  const clearCart = async () => {
    if (userId) {
      await supabase.from("cart_items").delete().eq("user_id", userId);
    }
    setItems([]);
    if (!userId) localStorage.removeItem(CART_STORAGE_KEY);
  };

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice, isLoading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
