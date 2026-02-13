import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import ValueProps from "@/components/ValueProps";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <CategorySection />
        <FeaturedProducts />
        <ValueProps />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
