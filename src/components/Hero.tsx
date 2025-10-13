import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-malbun.jpg";
import snowlie from "@/assets/snowlie.png";

const Hero = () => {
  const navigate = useNavigate();
  
  const scrollToPreise = () => {
    const element = document.getElementById("preise");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-primary/40" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="text-white">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Deine Skischule in Malbun
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light">
              Ski- und Snowboardkurse für alle Altersgruppen und Könnerstufen
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 font-semibold" 
              onClick={() => navigate("/buchung")}
            >
              Jetzt buchen
            </Button>
          </div>

          {/* Snowlie Mascot */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
              <img 
                src={snowlie} 
                alt="Snowlie - Unser Maskottchen" 
                className="relative h-96 w-auto object-contain drop-shadow-2xl animate-fade-in"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToPreise}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce cursor-pointer"
        aria-label="Scroll down"
      >
        <ChevronDown size={40} />
      </button>
    </section>
  );
};

export default Hero;
