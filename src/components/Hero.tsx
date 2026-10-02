import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useYetiProducts } from "@/hooks/useYetiProducts";
import VoiceBot from "@/components/VoiceBot";
import BrushHeading from "@/components/BrushHeading";
import heroVillage from "@/assets/hero-village.jpg";
import heroPanorama from "@/assets/hero-panorama.jpg";
import heroChildren from "@/assets/hero-children.jpg";
import heroInstructor from "@/assets/hero-instructor.jpg";
import heroTeaching from "@/assets/hero-teaching.jpg";
import heroChairlift from "@/assets/hero-chairlift.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { bookable } = useYetiProducts();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const scrollToPreise = () => {
    const element = document.getElementById("kurse");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const heroImages = [
    heroVillage,
    heroPanorama,
    heroChildren,
    heroInstructor,
    heroTeaching,
    heroChairlift,
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [heroImages.length]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
        </div>
      ))}

      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="mb-6 -rotate-2">
          <BrushHeading as="h1" tone="blush" textClassName="text-4xl md:text-6xl lg:text-7xl">
            Die Faszination Wintersport
          </BrushHeading>
        </div>
        <div className="rotate-1">
          <BrushHeading as="p" tone="ice" textClassName="text-xl md:text-2xl lg:text-3xl font-medium">
            Ski- und Snowboardkurse in Malbun
          </BrushHeading>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="text-base md:text-lg px-6 py-3 font-semibold bg-pastel-yellow text-pastel-yellow-foreground hover:bg-pastel-yellow/90 shadow-md hover:shadow-lg transition-shadow" onClick={() => bookable.length ? navigate("/buchung") : scrollToPreise()}>
            {bookable.length ? "Jetzt buchen" : "Kurse ansehen"}
          </Button>
          <Button
            size="lg"
            className="text-base md:text-lg px-6 py-3 font-semibold bg-blush text-blush-foreground hover:bg-blush/90"
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

      <VoiceBot isScrolled={isScrolled} />
    </section>
  );
};

export default Hero;
