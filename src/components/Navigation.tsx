import { useState, useEffect } from "react";
import { Menu, Facebook, Instagram, MountainSnow, Camera, CloudSun } from "lucide-react";
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

  const externalLinks = [
    { label: "Facebook", icon: Facebook, url: "https://www.facebook.com/schneesportschulemalbun" },
    { label: "Instagram", icon: Instagram, url: "https://www.instagram.com/schneesportschulemalbun" },
    { label: "Bergbahnen", icon: MountainSnow, url: "https://www.bergbahnen.li" },
    { label: "Webcams", icon: Camera, url: "https://www.bergbahnen.li/webcam" },
    { label: "Wetter", icon: CloudSun, url: "https://www.meteoschweiz.admin.ch/#tab=forecast-place&location=Malbun" },
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
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                      Schnellzugriff
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {externalLinks.map((l) => {
                        const Icon = l.icon;
                        return (
                          <a
                            key={l.label}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <Icon size={22} />
                            <span className="text-xs font-medium">{l.label}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
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
