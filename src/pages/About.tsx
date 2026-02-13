import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
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

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-background text-foreground'
    }`}>
      <Header />
      
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

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-terracotta mb-4">Nossa história</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">
              O garimpo é um <span className="italic">ato de amor</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg max-w-none"
          >
            <p className="font-body text-lg leading-relaxed text-muted-foreground mb-6">
              Nascemos da paixão por encontrar beleza no que já existe. Cada peça em nosso acervo 
              foi cuidadosamente selecionada, não apenas por sua qualidade estética, mas pela 
              história que carrega.
            </p>

            <p className="font-body text-lg leading-relaxed text-muted-foreground mb-6">
              Acreditamos que moda circular é mais do que uma tendência – é uma revolução 
              silenciosa contra o consumismo desenfreado. Ao dar nova vida a peças vintage e 
              seminovas, celebramos o ato de preservar memórias e reduzir o impacto ambiental.
            </p>

            <p className="font-body text-lg leading-relaxed text-muted-foreground mb-8">
              Cada garimpo é uma aventura, cada peça um tesouro esperando por seu novo guardião. 
              Seja bem-vindo a este universo onde o passado se encontra com o presente, 
              criando um futuro mais consciente e estiloso.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">♻️</span>
                </div>
                <h3 className="font-semibold mb-2">Sustentável</h3>
                <p className="text-sm text-muted-foreground">
                  Moda que respeita o planeta e as gerações futuras
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="font-semibold mb-2">Curado com amor</h3>
                <p className="text-sm text-muted-foreground">
                  Cada peça selecionada com critério e cuidado
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📜</span>
                </div>
                <h3 className="font-semibold mb-2">Histórias únicas</h3>
                <p className="text-sm text-muted-foreground">
                  Peças com alma e memória para contar
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
