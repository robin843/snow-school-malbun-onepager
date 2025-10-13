import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Preise from "@/components/Preise";
import Team from "@/components/Team";
import Jobs from "@/components/Jobs";
import Kontakt from "@/components/Kontakt";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Preise />
      <Team />
      <Jobs />
      <Kontakt />
      <Footer />
    </div>
  );
};

export default Index;
