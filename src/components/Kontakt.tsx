import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Kontakt = () => {
  return (
    <section id="kontakt" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block transform rotate-1 bg-secondary px-6 py-3 mb-4 rounded-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground">
              Kontakt & Standort
            </h2>
          </div>
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
                    href="tel:+4232633177"
                    className="text-primary hover:underline"
                  >
                    +423 263 31 77
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
                    href="mailto:info@skischule-malbun.li"
                    className="text-primary hover:underline"
                  >
                    info@skischule-malbun.li
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
                    Montag - Freitag: 08:00 - 17:00<br />
                    Samstag: 08:00 - 12:00<br />
                    Sonntag: Geschlossen
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
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2711.8474936926646!2d9.608775776622827!3d47.10026897116344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479b20f8f8f8f8f9%3A0x8f8f8f8f8f8f8f8f!2sMalbun%2C%209497%20Triesenberg%2C%20Liechtenstein!5e0!3m2!1sde!2sch!4v1234567890123!5m2!1sde!2sch"
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
