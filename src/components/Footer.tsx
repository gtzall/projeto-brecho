import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-display text-2xl font-bold mb-4">Garimpário</h3>
            <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-xs">
              Cada peça conta uma história. Moda sustentável com curadoria, porque o melhor estilo é aquele que já existe.
            </p>
          </div>

          <div>
            <h4 className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-4">Navegação</h4>
            <nav className="flex flex-col gap-2 font-body text-sm">
              <Link to="/" className="text-foreground hover:text-terracotta transition-colors">Início</Link>
              <Link to="/produtos" className="text-foreground hover:text-terracotta transition-colors">Garimpar</Link>
              <Link to="/sobre" className="text-foreground hover:text-terracotta transition-colors">Sobre nós</Link>
              <Link to="/contato" className="text-foreground hover:text-terracotta transition-colors">Contato</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-4">Categorias</h4>
            <nav className="flex flex-col gap-2 font-body text-sm">
              <Link to="/produtos?category=roupas" className="text-foreground hover:text-terracotta transition-colors">Roupas</Link>
              <Link to="/produtos?category=acessorios" className="text-foreground hover:text-terracotta transition-colors">Acessórios</Link>
              <Link to="/produtos?category=calcados" className="text-foreground hover:text-terracotta transition-colors">Calçados</Link>
              <Link to="/produtos?category=bolsas" className="text-foreground hover:text-terracotta transition-colors">Bolsas</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="font-body text-sm text-muted-foreground">
            © 2024 Garimpário. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
