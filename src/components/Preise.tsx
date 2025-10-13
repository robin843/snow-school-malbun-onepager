import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Preise = () => {
  const navigate = useNavigate();
  
  return (
    <section id="preise" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Unsere Kurse
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Ski- und Snowboardkurse für alle Niveaus – individuell oder in der Gruppe
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* PRIVATKURSE */}
          <Card className="border hover:shadow-lg transition-shadow">
            <CardHeader className="bg-primary text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Privatkurse</CardTitle>
                  <CardDescription className="text-white/90">
                    Individueller Unterricht
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">Tarife pro Stunde</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">09:00-10:00 & 12:00-14:00</span>
                    <div className="text-right">
                      <span className="font-bold block">CHF 75.-</span>
                      <span className="text-xs text-muted-foreground">EUR 79.-</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">10:00-12:00 & 14:00-16:00</span>
                    <div className="text-right">
                      <span className="font-bold block">CHF 85.-</span>
                      <span className="text-xs text-muted-foreground">EUR 90.-</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Weitere Person (max. 4)</span>
                  <div className="text-right">
                    <span className="font-bold">CHF 20.-</span>
                    <span className="text-xs text-muted-foreground ml-2">EUR 21.-</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>ab 4 Lektionen/Tag</span>
                  <span className="font-bold text-accent">10% Rabatt</span>
                </div>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg text-xs space-y-2">
                <div>
                  <span className="font-semibold">Hochsaison:</span>
                  <p className="text-muted-foreground">20.12.2025 - 11.01.2026 & 31.01.2026 - 08.03.2026</p>
                </div>
                <div>
                  <span className="font-semibold">Nebensaison:</span>
                  <p className="text-muted-foreground">12.01.2026 - 30.01.2026 & 09.03.2026 - 06.04.2026</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GRUPPENKURSE */}
          <Card className="border hover:shadow-lg transition-shadow">
            <CardHeader className="bg-secondary text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Gruppenkurse</CardTitle>
                  <CardDescription className="text-white/90">
                    Gemeinsam lernen
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">Tarife Kinder</h4>
                <div className="space-y-2">
                  {[
                    { tage: "1 Tag", stunden: "1 x 4 Stunden", chf: "150.-", eur: "158.-" },
                    { tage: "2 Tage", stunden: "2 x 4 Stunden", chf: "200.-", eur: "210.-" },
                    { tage: "3 Tage", stunden: "3 x 4 Stunden", chf: "245.-", eur: "258.-" },
                    { tage: "4 Tage", stunden: "4 x 4 Stunden", chf: "285.-", eur: "300.-" },
                    { tage: "5 Tage", stunden: "5 x 4 Stunden", chf: "320.-", eur: "336.-" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <span className="font-semibold text-sm block">{item.tage}</span>
                        <span className="text-xs text-muted-foreground">{item.stunden}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block">CHF {item.chf}</span>
                        <span className="text-xs text-muted-foreground">EUR {item.eur}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="bg-muted/30 p-3 rounded-lg mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-sm block">Mittagsbetreuung</span>
                      <span className="text-xs text-muted-foreground">inkl. Verpflegung (12:00-14:00 Uhr)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">CHF 30.-</span>
                      <span className="text-xs text-muted-foreground ml-2">EUR 32.-</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="font-semibold">Erwachsene:</span>
                  <span className="text-muted-foreground ml-2">Auf Anfrage</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* INFO SECTION */}
        <Card className="mb-12 border">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-2xl font-bold">Wichtige Informationen</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold mb-3">Treffpunkte</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <strong>Totale Anfänger:</strong>
                    <p className="text-muted-foreground mt-1">
                      Einteilung Montag 10:00 Uhr auf dem Sammelplatz der Schneesportschule gegenüber dem Hotel Gorfion
                    </p>
                  </li>
                  <li>
                    <strong>Leicht Fortgeschrittene bis Könner:</strong>
                    <p className="text-muted-foreground mt-1">
                      Einteilung Montag 10:00 Uhr im Malbipark
                    </p>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-3">Gut zu wissen</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Montag bis Freitag: 10:00-12:00 & 14:00-16:00 Uhr</li>
                  <li>• Ganztägige Gruppenkurse (Ski) verfügbar</li>
                  <li>• Einstieg für totale Anfänger nur Montag möglich</li>
                  <li>• Liftkarte nicht im Kurs inbegriffen</li>
                  <li>• Klassengrösse: 5 bis maximal 13 Kinder</li>
                  <li>• Versicherung ist Sache des Teilnehmers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            size="lg" 
            className="font-semibold px-8"
            onClick={() => navigate("/buchung")}
          >
            Kurs jetzt buchen
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Alle Preise inkl. MwSt. • Start: Einzellektion 55 Min., Doppellektion 115 Min.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Preise;
