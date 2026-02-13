// =====================================================
// SOBRE REVESTE - HISTÓRIA EMOCIONANTE
// Substitua o conteúdo do About.tsx
// =====================================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Crown, Star, Users, Globe, Recycle } from "lucide-react";

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

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100'
    }`}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 transition-all ${
              isDark 
                ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' 
                : 'bg-purple-100 text-purple-700 border border-purple-200'
            }`}>
              <Heart className="w-4 h-4 mr-2" />
              Nossa História
              <Sparkles className="w-4 h-4 ml-2" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className={`block mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
                isDark 
                  ? 'from-purple-400 via-pink-400 to-purple-400' 
                  : 'from-purple-600 via-pink-600 to-purple-600'
              }`}>
                REVESTE
              </span>
              <span className={`block text-3xl md:text-4xl font-light ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Do meu armário para o seu coração
              </span>
            </h1>

            <p className={`text-xl md:text-2xl mb-12 leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Acredito que cada peça de roupa carrega uma história. 
              Aqui no REVESTE, dou nova vida a peças que não me servem mais, 
              transformando-as em tesouros para quem realmente precisa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${
        isDark ? 'bg-gray-800/50' : 'bg-white/60 backdrop-blur-sm'
      }`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Mais que moda, uma revolução
            </h2>
            <p className={`text-lg max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Nasci da necessidade de transformar o que era inútil para mim em algo valioso para outros. 
              Cada peça selecionada passa por um processo de cura e renascimento, 
              pronta para contar novas histórias em novos armários.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className={`text-center p-8 rounded-2xl transition-all ${
                isDark 
                  ? 'bg-purple-900/20 border border-purple-800/50' 
                  : 'bg-white/60 border border-purple-200/50 backdrop-blur-sm'
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-purple-800/50' : 'bg-purple-100'
              }`}>
                <Heart className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Amor pela Moda
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Cada peça é escolhida com carinho, pensando em quem vai usá-la e nas histórias que viverá juntas.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className={`text-center p-8 rounded-2xl transition-all ${
                isDark 
                  ? 'bg-purple-900/20 border border-purple-800/50' 
                  : 'bg-white/60 border border-purple-200/50 backdrop-blur-sm'
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-purple-800/50' : 'bg-purple-100'
              }`}>
                <Recycle className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Sustentabilidade
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Moda circular que transforma o mundo, uma peça de cada vez. Reduzimos desperdício, criamos valor.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              className={`text-center p-8 rounded-2xl transition-all ${
                isDark 
                  ? 'bg-purple-900/20 border border-purple-800/50' 
                  : 'bg-white/60 border border-purple-200/50 backdrop-blur-sm'
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-purple-800/50' : 'bg-purple-100'
              }`}>
                <Users className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Comunidade
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Construímos uma rede de pessoas que acreditam que moda pode ser consciente e acessível.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${
        isDark ? 'bg-gray-900/50' : 'bg-purple-50/50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Nossos Valores
            </h2>
            <p className={`text-lg max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Guiados por propósito e paixão, transformamos moda em movimento.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className={`p-8 rounded-2xl transition-all ${
                isDark 
                  ? 'bg-purple-900/20 border border-purple-800/50' 
                  : 'bg-white/60 border border-purple-200/50 backdrop-blur-sm'
              }`}
            >
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  isDark ? 'bg-purple-800/50' : 'bg-purple-100'
                }`}>
                  <Crown className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Qualidade Primeiro
                </h3>
              </div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Cada peça passa por rigorosa seleção e cuidados especiais. 
                Acreditamos que moda circular não significa abrir mão da qualidade.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className={`p-8 rounded-2xl transition-all ${
                isDark 
                  ? 'bg-purple-900/20 border border-purple-800/50' 
                  : 'bg-white/60 border border-purple-200/50 backdrop-blur-sm'
              }`}
            >
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  isDark ? 'bg-purple-800/50' : 'bg-purple-100'
                }`}>
                  <Globe className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Impacto Global
                </h3>
              </div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Cada peça vendida é um passo em direção a um mundo mais sustentável. 
                Juntos, estamos mudando a indústria da moda.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${
        isDark ? 'bg-gray-800/50' : 'bg-white/60 backdrop-blur-sm'
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Vamos conversar?
            </h2>
            <p className={`text-lg mb-8 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Se você tem uma peça especial que gostaria de doar ou está buscando algo único, 
              estou aqui para ajudar nessa jornada de transformação.
            </p>
            
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-medium transition-all ${
              isDark 
                ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' 
                : 'bg-purple-100 text-purple-700 border border-purple-200'
            }`}>
              <Star className="w-5 h-5 mr-2" />
              WhatsApp: 11 96731-1629
              <Star className="w-5 h-5 ml-2" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 text-center ${
        isDark ? 'bg-gradient-to-r from-purple-900 to-pink-900' : 'bg-gradient-to-r from-purple-600 to-pink-600'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronta para transformar seu guarda-roupa?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Junte-se a nós nessa revolução da moda circular. 
            Cada peça conta, cada história importa.
          </p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all transform hover:scale-105">
            Explorar Coleção
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
