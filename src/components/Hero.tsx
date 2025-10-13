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
    <section className="relative h-screen flex items-end overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
      </div>

      {/* Red Button Top Right */}
      <div className="absolute top-24 right-8 z-20 animate-fade-in">
        <Button 
          size="lg"
          className="bg-destructive hover:bg-destructive/90 text-white font-bold px-6 py-6 shadow-xl"
          onClick={() => navigate("/buchung")}
        >
          Lass dich 24/7 Beraten
        </Button>
      </div>

      <div className="relative z-10 w-full pb-12">
        <div className="container mx-auto px-4">
          <div className="relative flex items-end">
            {/* Snowlie Bottom Left */}
            <div className="hidden md:block w-48 lg:w-64 mr-8 animate-fade-in">
              <img 
                src={snowlie} 
                alt="Snowlie" 
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>

            {/* Angled Text Boxes */}
            <div className="flex-1 space-y-4 mb-8">
              {/* Main Title Box - White */}
              <div className="bg-white transform -skew-y-2 shadow-2xl inline-block">
                <div className="transform skew-y-2 px-8 py-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
                    Skischule Malbun
                  </h1>
                </div>
              </div>

              {/* Subtitle Box - White */}
              <div className="bg-white transform -skew-y-2 shadow-2xl inline-block">
                <div className="transform skew-y-2 px-8 py-4">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                    Mit Freude auf der Piste
                  </h2>
                </div>
              </div>

              {/* Season Info Box - Blue */}
              <div className="bg-primary transform -skew-y-2 shadow-2xl inline-block">
                <div className="transform skew-y-2 px-8 py-3">
                  <p className="text-xl md:text-2xl font-semibold text-white">
                    Kurse & Wintererlebnisse 26/27
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToPreise}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce cursor-pointer z-20"
        aria-label="Scroll down"
      >
        <ChevronDown size={40} />
      </button>
    </section>
  );
};

export default Hero;
