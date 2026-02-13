import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";

const Header = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        const isAdminEmail = session.user.email === 'ogustavo.ctt@gmail.com';
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        setIsAdmin(isAdminEmail || !!profileData);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const isAdminEmail = session.user.email === 'ogustavo.ctt@gmail.com';
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .eq("role", "admin")
          .maybeSingle()
          .then(({ data }) => {
            setIsAdmin(isAdminEmail || !!data);
          });
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Banner com texto rolante */}
      <div className="bg-[#f5f0e8] dark:bg-gray-800 text-[#c85a3f] dark:text-terracotta text-xs py-2 overflow-hidden whitespace-nowrap transition-colors duration-300">
        <div className="animate-marquee inline-block">
          <span className="mx-4">COM HISTÓRIA</span>
          <span className="mx-4">•</span>
          <span className="mx-4">MODA SUSTENTÁVEL</span>
          <span className="mx-4">•</span>
          <span className="mx-4">ACHADOS ESPECIAIS</span>
          <span className="mx-4">•</span>
          <span className="mx-4">CURADORIA AUTÊNTICA</span>
          <span className="mx-4">•</span>
          <span className="mx-4">PEÇAS ÚNICAS COM HISTÓRIA</span>
          <span className="mx-4">•</span>
          <span className="mx-4">MODA SUSTENTÁVEL</span>
          <span className="mx-4">•</span>
          <span className="mx-4">ACHADOS ESPECIAIS</span>
          <span className="mx-4">•</span>
          <span className="mx-4">CURADORIA AUTÊNTICA</span>
        </div>
      </div>

      {/* Header Principal */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Garimpário
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm uppercase tracking-wider transition-colors hover:text-[#c85a3f] ${
                  isActive("/") ? "text-[#c85a3f] font-medium" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                Início
              </Link>
              <Link
                to="/produtos"
                className={`text-sm uppercase tracking-wider transition-colors hover:text-[#c85a3f] ${
                  isActive("/produtos") ? "text-[#c85a3f] font-medium" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                Garimpar
              </Link>
              <Link
                to="/sobre"
                className={`text-sm uppercase tracking-wider transition-colors hover:text-[#c85a3f] ${
                  isActive("/sobre") ? "text-[#c85a3f] font-medium" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                Sobre
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* User */}
              {session ? (
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm" className="text-xs">
                        Painel
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <User className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <Link to="/carrinho">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#c85a3f] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden border-t border-gray-200"
              >
                <div className="py-4 space-y-3">
                  <Link to="/" className="block text-sm uppercase tracking-wider" onClick={() => setMobileMenuOpen(false)}>
                    Início
                  </Link>
                  <Link to="/produtos" className="block text-sm uppercase tracking-wider" onClick={() => setMobileMenuOpen(false)}>
                    Garimpar
                  </Link>
                  <Link to="/sobre" className="block text-sm uppercase tracking-wider" onClick={() => setMobileMenuOpen(false)}>
                    Sobre
                  </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
};

export default Header;
