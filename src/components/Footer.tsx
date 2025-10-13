import { Separator } from "@/components/ui/separator";
import wappen from "@/assets/wappen-malbun.jpg";

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
                <a href="#preise" className="hover:text-accent transition-colors">
                  Privatkurse
                </a>
              </li>
              <li>
                <a href="#preise" className="hover:text-accent transition-colors">
                  Gruppenkurse
                </a>
              </li>
              <li>
                <a href="#preise" className="hover:text-accent transition-colors">
                  Samstagskurse
                </a>
              </li>
              <li>
                <a href="#preise" className="hover:text-accent transition-colors">
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
                <a href="#" className="hover:text-accent transition-colors">
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
