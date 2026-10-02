import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BrushHeading from "@/components/BrushHeading";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Kontakt = () => {
  return (
    <section id="kontakt" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <BrushHeading tone="ice" className="mb-4 rotate-1">Kontakt & Standort</BrushHeading>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Wir freuen uns auf Ihre Anfrage
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 rounded-lg max-w-md mx-auto md:max-w-none w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center md:text-left">Kontaktinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Adresse</h3>
                  <p className="text-muted-foreground">
                    Schneesportschule Malbun AG<br />
                    Malbun<br />
                    9497 Triesenberg<br />
                    Liechtenstein
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Telefon</h3>
                  <a
                    href="tel:+4232639770"
                    className="text-primary hover:underline"
                  >
                    +423 263 97 70
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">E-Mail</h3>
                  <a
                    href="mailto:info@schneesportschule.li"
                    className="text-primary hover:underline"
                  >
                    info@schneesportschule.li
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Bürozeiten</h3>
                  <p className="text-muted-foreground">
                    Montag – Sonntag<br />
                    09:00 – 12:00 und 13:00 – 16:00 Uhr
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 rounded-lg max-w-md mx-auto md:max-w-none w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center md:text-left">Unser Standort</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg overflow-hidden h-[400px]">
                <iframe
                  src="https://www.google.com/maps/d/embed?mid=1D0f2WKwU3o-UrNpJM3kVtVJur8s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Standort Schneesportschule Malbun"
                ></iframe>
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Malbun - Der perfekte Wintersportort für Familien
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Kontakt;
