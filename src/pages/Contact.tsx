import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  const [isDark, setIsDark] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulação de envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Mensagem enviada com sucesso! Entraremos em contato.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100'
    }`}>
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Entre em Contato
            </h1>
            <p className={`text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Tem alguma dúvida ou quer conversar sobre nossos produtos? Estamos aqui para ajudar!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Informações de Contato */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className={`p-8 rounded-2xl ${
                isDark 
                  ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700' 
                  : 'bg-white/80 backdrop-blur-sm border border-orange-200'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Informações de Contato
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${
                    isDark ? 'bg-orange-500/20' : 'bg-orange-100'
                  }`}>
                    <Phone className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      WhatsApp
                    </h3>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      11 96731-1629
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${
                    isDark ? 'bg-orange-500/20' : 'bg-orange-100'
                  }`}>
                    <Mail className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Email
                    </h3>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      contato@garimpario.com.br
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${
                    isDark ? 'bg-orange-500/20' : 'bg-orange-100'
                  }`}>
                    <MapPin className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Horário
                    </h3>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      Seg-Sex: 9h-18h<br />
                      Sábado: 9h-14h
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Formulário de Contato */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <form onSubmit={handleSubmit} className={`p-8 rounded-2xl ${
                isDark 
                  ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700' 
                  : 'bg-white/80 backdrop-blur-sm border border-orange-200'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Envie sua Mensagem
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Nome
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Seu nome completo"
                      className={`${
                        isDark 
                          ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400' 
                          : 'bg-white/50 border-orange-200 text-gray-900 placeholder:text-gray-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="seu@email.com"
                      className={`${
                        isDark 
                          ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400' 
                          : 'bg-white/50 border-orange-200 text-gray-900 placeholder:text-gray-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Mensagem
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Digite sua mensagem aqui..."
                      className={`${
                        isDark 
                          ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400' 
                          : 'bg-white/50 border-orange-200 text-gray-900 placeholder:text-gray-500'
                      }`}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 text-lg font-medium transition-all ${
                      isDark
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                        : 'bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Mensagem
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
