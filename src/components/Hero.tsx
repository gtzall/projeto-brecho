import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image - Foto de roupas dobradas */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1920&q=80')`,
        }}
      />
      
      {/* Overlay com suporte a dark mode */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/85 transition-colors duration-500" />

      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta/10 dark:bg-terracotta/20 rounded-full mb-6"
          >
            <Sparkles className="h-4 w-4 text-terracotta" />
            <span className="text-xs uppercase tracking-[0.2em] text-terracotta font-medium">
              Moda Circular com Propósito
            </span>
          </motion.div>

          {/* NOVO TÍTULO */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] mb-6"
          >
            Descubra peças únicas com
            <span className="block italic text-terracotta mt-2">história para contar</span>
          </motion.h1>

          {/* NOVO SUBTÍTULO */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-body text-base md:text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-lg leading-relaxed"
          >
            Cada roupa no Garimpário tem uma história. Encontre peças selecionadas com carinho, 
            preços justos e faça parte da revolução da moda consciente.
          </motion.p>

          {/* BOTÕES MELHORADOS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/produtos">
              <Button 
                size="lg"
                className="group bg-terracotta hover:bg-terracotta-dark text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl shadow-terracotta/30 transition-all duration-300 text-sm tracking-wide"
              >
                <span className="flex items-center gap-2">
                  Explorar Peças
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>

            <Link to="/sobre">
              <Button 
                size="lg"
                variant="outline" 
                className="border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 px-8 py-6 rounded-full transition-all duration-300 text-sm tracking-wide"
              >
                Conheça Nossa História
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
