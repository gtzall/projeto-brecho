// =====================================================
// HEADER REVESTE - BRAND NOVO LUXO
// Substitua o conteúdo do Header.tsx
// =====================================================

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Moon, Sun, Menu, X, Sparkles, Crown } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const Header = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle()
          .then(({ data }) => setIsAdmin(!!data));
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Verificar preferência de tema
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
    <header className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-all duration-300 ${
      isDark 
        ? 'bg-gray-900/90 border-gray-800 text-white' 
        : 'bg-white/90 border-gray-200 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group transition-transform hover:scale-105"
          >
            <div className="relative">
              <Crown className={`h-8 w-8 transition-colors ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-pulse" />
            </div>
            <div>
              <h1 className={`text-xl font-bold bg-gradient-to-r ${
                isDark 
                  ? 'from-purple-400 to-pink-400' 
                  : 'from-purple-600 to-pink-600'
              } bg-clip-text text-transparent`}>
                REVESTE
              </h1>
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Onde roupas ganham nova alma
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`transition-colors hover:text-purple-500 ${
                isActive("/") ? "text-purple-500 font-semibold" : ""
              }`}
            >
              Início
            </Link>
            <Link
              to="/produtos"
              className={`transition-colors hover:text-purple-500 ${
                isActive("/produtos") ? "text-purple-500 font-semibold" : ""
              }`}
            >
              Coleção
            </Link>
            <Link
              to="/sobre"
              className={`transition-colors hover:text-purple-500 ${
                isActive("/sobre") ? "text-purple-500 font-semibold" : ""
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
              className={`p-2 rounded-full transition-all ${
                isDark 
                  ? 'hover:bg-gray-800 text-yellow-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Cart */}
            <Link to="/carrinho">
              <Button
                variant="ghost"
                size="sm"
                className={`relative p-2 rounded-full transition-all ${
                  isDark 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {session ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition-all ${
                        isDark ? 'border-purple-400 text-purple-400 hover:bg-purple-400' : ''
                      }`}
                    >
                      Painel
                    </Button>
                  </Link>
                )}
                <Link to="/minha-conta">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-2 rounded-full transition-all ${
                      isDark 
                        ? 'hover:bg-gray-800 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className={`transition-all ${
                    isDark 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all">
                  Entrar
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className={`md:hidden p-2 rounded-full ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className={`md:hidden py-4 border-t transition-all ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`transition-colors hover:text-purple-500 ${
                  isActive("/") ? "text-purple-500 font-semibold" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                to="/produtos"
                className={`transition-colors hover:text-purple-500 ${
                  isActive("/produtos") ? "text-purple-500 font-semibold" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Coleção
              </Link>
              <Link
                to="/sobre"
                className={`transition-colors hover:text-purple-500 ${
                  isActive("/sobre") ? "text-purple-500 font-semibold" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
