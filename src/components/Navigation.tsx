import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-malbun.jpg";

const Navigation = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const links = [
    { id: "kurse", label: "Kursübersicht" },
    { id: "team", label: "Über uns" },
    { id: "jobs", label: "Jobs" },
    { id: "faq", label: "FAQ" },
    { id: "kontakt", label: "Kontakt" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Schneesportschule Malbun" className="h-12 w-12 object-contain" />
            <span className="font-bold text-lg hidden sm:inline text-primary">
              Schneesportschule Malbun
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button size="lg" className="font-semibold" onClick={() => navigate("/buchung")}>
              Jetzt buchen
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Menü öffnen"
                  className="p-2 rounded-md hover:bg-muted transition-colors text-foreground"
                >
                  <Menu size={28} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px]">
                <SheetHeader>
                  <SheetTitle className="text-primary">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-8">
                  {links.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => scrollToSection(l.id)}
                      className="text-left text-lg font-medium px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {l.label}
                    </button>
                  ))}
                  <Button
                    size="lg"
                    className="mt-6 font-semibold w-full"
                    onClick={() => {
                      setOpen(false);
                      navigate("/buchung");
                    }}
                  >
                    Jetzt buchen
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
