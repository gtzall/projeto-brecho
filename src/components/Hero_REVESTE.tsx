// =====================================================
// HERO REVESTE - EXPERIÊNCIA LUXO
// Substitua o conteúdo do Hero.tsx
// =====================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Crown, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
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
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 transition-all ${
              isDark 
                ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' 
                : 'bg-purple-100 text-purple-700 border border-purple-200'
            }`}
          >
            <Crown className="w-4 h-4 mr-2" />
            Moda Circular com Propósito
            <Sparkles className="w-4 h-4 ml-2" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className={`block mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
              isDark 
                ? 'from-purple-400 via-pink-400 to-purple-400' 
                : 'from-purple-600 via-pink-600 to-purple-600'
            }`}>
              REVESTE
            </span>
            <span className={`block text-3xl md:text-5xl font-light ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Onde roupas ganham nova alma
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Histórias que vestem, destinos que transformam
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/produtos">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Explorar Coleção
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link to="/sobre">
              <Button
                variant="outline"
                size="lg"
                className={`group px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 ${
                  isDark 
                    ? 'border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white' 
                    : 'border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                }`}
              >
                Nossa História
                <Heart className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          >
            <div className={`text-center p-6 rounded-2xl transition-all ${
              isDark 
                ? 'bg-purple-900/20 border border-purple-800/50' 
                : 'bg-white/60 border border-purple-200/50 backdrop-blur-sm'
            }`}>
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDark ? 'bg-purple-800/50' : 'bg-purple-100'
              }`}>
                <Star className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Qualidade Excepcional
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Peças selecionadas com cuidado e amor
              </p>
            </div>

            <div className={`text-center p-6 rounded-2xl transition-all ${
              isDark 
                ? 'bg-purple-900/20 border border-purple-800/50' 
                : 'bg-white/60 border border-purple-200/50 backdrop-blur-sm'
            }`}>
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDark ? 'bg-purple-800/50' : 'bg-purple-100'
              }`}>
                <Heart className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Sustentabilidade
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Moda circular que transforma o mundo
              </p>
            </div>

            <div className={`text-center p-6 rounded-2xl transition-all ${
              isDark 
                ? 'bg-purple-900/20 border border-purple-800/50' 
                : 'bg-white/60 border border-purple-200/50 backdrop-blur-sm'
            }`}>
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDark ? 'bg-purple-800/50' : 'bg-purple-100'
              }`}>
                <Sparkles className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Histórias Únicas
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Cada peça conta uma história especial
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-6 h-10 border-2 rounded-full flex justify-center ${
            isDark ? 'border-purple-400' : 'border-purple-600'
          }`}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-1 h-3 rounded-full mt-2 ${
              isDark ? 'bg-purple-400' : 'bg-purple-600'
            }`}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
