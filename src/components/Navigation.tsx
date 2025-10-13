import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-malbun.jpg";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Schneesportschule Malbun" className="h-12 w-12 object-contain" />
            <span className={`font-bold text-lg hidden sm:inline transition-colors ${
              isScrolled ? "text-primary" : "text-white"
            }`}>
              Schneesportschule Malbun
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("preise")}
              className={`hover:text-accent transition-colors font-medium ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              Preise
            </button>
            <button
              onClick={() => scrollToSection("team")}
              className={`hover:text-accent transition-colors font-medium ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              Über uns
            </button>
            <button
              onClick={() => scrollToSection("jobs")}
              className={`hover:text-accent transition-colors font-medium ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              Jobs
            </button>
            <button
              onClick={() => scrollToSection("kontakt")}
              className={`hover:text-accent transition-colors font-medium ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              Kontakt
            </button>
            <Button size="lg" className="font-semibold">
              Jetzt buchen
            </Button>
          </div>

          <button
            className={`md:hidden transition-colors ${
              isScrolled ? "text-foreground" : "text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("preise")}
              className="text-foreground hover:text-primary transition-colors font-medium text-left"
            >
              Preise
            </button>
            <button
              onClick={() => scrollToSection("team")}
              className="text-foreground hover:text-primary transition-colors font-medium text-left"
            >
              Über uns
            </button>
            <button
              onClick={() => scrollToSection("jobs")}
              className="text-foreground hover:text-primary transition-colors font-medium text-left"
            >
              Jobs
            </button>
            <button
              onClick={() => scrollToSection("kontakt")}
              className="text-foreground hover:text-primary transition-colors font-medium text-left"
            >
              Kontakt
            </button>
            <Button size="lg" className="font-semibold w-full">
              Jetzt buchen
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
