// =====================================================
// FOOTER REVESTE - CONTATO E INFO
// Substitua o conteúdo do Footer.tsx
// =====================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Sparkles, Crown, Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  const [isDark, setIsDark] = useState(false);

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

  return (
    <footer className={`relative overflow-hidden transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 text-white'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative">
                <Crown className="h-8 w-8 text-yellow-400" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">REVESTE</h3>
                <p className="text-purple-200 text-sm">Onde roupas ganham nova alma</p>
              </div>
            </div>
            
            <p className="text-purple-100 mb-6 leading-relaxed">
              Transformamos peças que não nos servem mais em tesouros para quem realmente precisa. 
              Moda circular com propósito e amor.
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-purple-200">
                <Phone className="w-4 h-4" />
                <span className="text-sm">11 96731-1629</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Menu</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link 
                  to="/produtos" 
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Coleção
                </Link>
              </li>
              <li>
                <Link 
                  to="/sobre" 
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Sobre
                </Link>
              </li>
              <li>
                <Link 
                  to="/carrinho" 
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Carrinho
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Categorias</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/produtos?category=roupas" 
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Roupas
                </Link>
              </li>
              <li>
                <Link 
                  to="/produtos?category=acessorios" 
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Acessórios
                </Link>
              </li>
              <li>
                <Link 
                  to="/produtos?category=calcados" 
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Calçados
                </Link>
              </li>
              <li>
                <Link 
                  to="/produtos?category=bolsas" 
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Bolsas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-purple-800/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-purple-200 text-sm">
                Feito com amor e propósito
              </span>
            </div>
            
            <div className="text-purple-200 text-sm">
              © 2024 REVESTE. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
