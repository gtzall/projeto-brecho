import { motion } from "framer-motion";
import { Recycle, Heart, Sparkles, ShieldCheck } from "lucide-react";

const props = [
  { icon: Recycle, title: "Moda Circular", desc: "Cada peça reusada é um ato de amor ao planeta" },
  { icon: Heart, title: "Curadoria Manual", desc: "Selecionamos à mão, peça por peça" },
  { icon: Sparkles, title: "Peças Únicas", desc: "Raridades que você não encontra em lugar nenhum" },
  { icon: ShieldCheck, title: "Qualidade Garantida", desc: "Inspecionamos tudo antes de disponibilizar" },
];

const ValueProps = () => {
  return (
    <section className="py-20 border-t border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {props.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <prop.icon size={32} strokeWidth={1.2} className="mx-auto mb-4 text-primary" />
              <h3 className="font-display text-lg font-semibold mb-2">{prop.title}</h3>
              <p className="font-body text-sm text-muted-foreground">{prop.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
