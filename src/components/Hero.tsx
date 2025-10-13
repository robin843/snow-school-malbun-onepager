import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-malbun.jpg";

const Hero = () => {
  const navigate = useNavigate();
  
  const scrollToPreise = () => {
    const element = document.getElementById("preise");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-background/80" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="inline-block mb-6 transform -rotate-2 bg-primary/90 px-8 py-4 backdrop-blur-sm">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground">
            Die Faszination Wintersport
          </h1>
        </div>
        <div className="inline-block transform rotate-1 bg-secondary/90 px-6 py-3 backdrop-blur-sm">
          <p className="text-xl md:text-2xl lg:text-3xl text-secondary-foreground font-medium">
            Ski- und Snowboardkurse in Malbun
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="text-lg px-8 py-6 font-bold shadow-lg hover:shadow-xl transition-shadow" onClick={() => navigate("/buchung")}>
            Jetzt buchen
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 font-semibold bg-background/80 backdrop-blur-sm border-2 hover:bg-background"
            onClick={scrollToPreise}
          >
            Preise ansehen
          </Button>
        </div>
      </div>

      <button
        onClick={scrollToPreise}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground animate-bounce cursor-pointer bg-primary/20 rounded-full p-3 backdrop-blur-sm hover:bg-primary/30 transition-colors"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};

export default Hero;
