import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, MountainSnow, Camera, CloudSun } from "lucide-react";
import wappen from "@/assets/wappen-malbun.jpg";

const externalLinks = [
  { label: "Facebook", icon: Facebook, url: "https://www.facebook.com/profile.php?id=100077315170645" },
  { label: "Instagram", icon: Instagram, url: "https://www.instagram.com/schneesportschule_malbun/" },
  { label: "Bergbahnen", icon: MountainSnow, url: "https://www.bergbahnen.li" },
  { label: "Webcams", icon: Camera, url: "https://www.bergbahnen.li/meta/webcams" },
  { label: "Wetter", icon: CloudSun, url: "https://www.bergbahnen.li/meta/webcams#weather-forecast" },
];

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={wappen} alt="Wappen" className="h-16 w-16 object-contain bg-white rounded-full p-2" />
              <h3 className="font-bold text-lg">Schneesportschule Malbun</h3>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Ihre traditionsreiche Skischule in Liechtenstein seit vielen Jahren.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Kurse</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#kurse" className="hover:text-accent transition-colors">
                  Privatkurse
                </a>
              </li>
              <li>
                <a href="#kurse" className="hover:text-accent transition-colors">
                  Gruppenkurse
                </a>
              </li>
              <li>
                <a href="#kurse" className="hover:text-accent transition-colors">
                  Samstagskurse
                </a>
              </li>
              <li>
                <a href="#kurse" className="hover:text-accent transition-colors">
                  Snowboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Über uns</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#team" className="hover:text-accent transition-colors">
                  Unser Team
                </a>
              </li>
              <li>
                <a href="#jobs" className="hover:text-accent transition-colors">
                  Jobs
                </a>
              </li>
              <li>
                <a href="#kontakt" className="hover:text-accent transition-colors">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Informationen</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  AGB
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/datenschutz" className="hover:text-accent transition-colors">
                  Datenschutz
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Impressum
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20 mb-8" />

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          {externalLinks.map((l) => {
            const Icon = l.icon;
            return (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-sm font-medium"
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{l.label}</span>
              </a>
            );
          })}
        </div>

        <div className="text-center text-sm text-primary-foreground/80">
          <p>
            © {new Date().getFullYear()} Schneesportschule Malbun AG. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
