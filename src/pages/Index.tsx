import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Preise from "@/components/Preise";
import Kurse from "@/components/Kurse";
import Team from "@/components/Team";
import Jobs from "@/components/Jobs";
import Kontakt from "@/components/Kontakt";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Preise />
      <Kurse />
      <Team />
      <Jobs />
      <Kontakt />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
