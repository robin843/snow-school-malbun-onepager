import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, MapPin } from "lucide-react";

const Preise = () => {
  return (
    <section id="preise" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block transform -rotate-1 bg-primary px-6 py-3 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Unsere Preise
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ski- und Snowboardkurse für alle Niveaus und Bedürfnisse
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
          {/* PRIVATKURSE */}
          <Card className="hover:shadow-xl transition-all duration-300 animate-fade-in border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-primary to-secondary text-primary-foreground pb-8">
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                <User className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Privatkurse</CardTitle>
              <CardDescription className="text-base text-white/90">
                Ob die ersten Schwünge im Schnee, das Erlernen einer neuen Technik oder die Perfektionierung des eigenen Könnens
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-bold text-sm text-muted-foreground mb-3">TARIFE (1 PERSON)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">09:00-10:00 & 12:00-14:00 Uhr</span>
                      <div className="text-right">
                        <span className="font-bold text-primary block">CHF 75.-</span>
                        <span className="text-xs text-muted-foreground">EUR 79.-</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">10:00-12:00 & 14:00-16:00 Uhr</span>
                      <div className="text-right">
                        <span className="font-bold text-primary block">CHF 85.-</span>
                        <span className="text-xs text-muted-foreground">EUR 90.-</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Weitere Person (max. 4)</span>
                      <div className="text-right">
                        <span className="font-bold text-primary block">CHF 20.-</span>
                        <span className="text-xs text-muted-foreground">EUR 21.-</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">ab 4 Lektionen/Tag</span>
                      <span className="font-bold text-accent">10% Rabatt</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-3 rounded-lg text-xs">
                  <p className="font-semibold mb-1">Hochsaison:</p>
                  <p className="text-muted-foreground">20.12.2025 - 11.01.2026 & 31.01.2026 - 08.03.2026</p>
                  <p className="font-semibold mt-2 mb-1">Nebensaison:</p>
                  <p className="text-muted-foreground">12.01.2026 - 30.01.2026 & 09.03.2026 - 06.04.2026</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GRUPPENKURSE */}
          <Card className="hover:shadow-xl transition-all duration-300 animate-fade-in border-0 overflow-hidden" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="bg-gradient-to-br from-secondary to-primary text-primary-foreground pb-8">
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                <Users className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Gruppenkurse</CardTitle>
              <CardDescription className="text-base text-white/90">
                Eine abwechslungsreiche Unterrichtsgestaltung steigert die Kinder auf spielerische Weise ihr Niveau
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-bold text-sm text-muted-foreground mb-3">TARIFE (KINDER)</h4>
                  <div className="space-y-2">
                    {[
                      { tage: "1 Tag", stunden: "1 x 4 Stunden", chf: "150.-", eur: "158.-" },
                      { tage: "2 Tage", stunden: "2 x 4 Stunden", chf: "200.-", eur: "210.-" },
                      { tage: "3 Tage", stunden: "3 x 4 Stunden", chf: "245.-", eur: "258.-" },
                      { tage: "4 Tage", stunden: "4 x 4 Stunden", chf: "285.-", eur: "300.-" },
                      { tage: "5 Tage", stunden: "5 x 4 Stunden", chf: "320.-", eur: "336.-" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-2 border-b border-border last:border-0">
                        <div>
                          <span className="font-medium text-sm block">{item.tage}</span>
                          <span className="text-xs text-muted-foreground">{item.stunden}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-primary block">CHF {item.chf}</span>
                          <span className="text-xs text-muted-foreground">EUR {item.eur}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-secondary/10 p-3 rounded-lg">
                  <h4 className="font-bold text-sm mb-2">Mittagsbetreuung</h4>
                  <p className="text-xs text-muted-foreground mb-2">inkl. Verpflegung (12:00 bis 14:00 Uhr)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">pro Tag/Kind</span>
                    <div className="text-right">
                      <span className="font-bold text-primary block">CHF 30.-</span>
                      <span className="text-xs text-muted-foreground">EUR 32.-</span>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 p-3 rounded-lg">
                  <h4 className="font-bold text-sm">Erwachsene</h4>
                  <p className="text-sm text-muted-foreground">Auf Anfrage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* INFO SECTION */}
        <Card className="max-w-4xl mx-auto mb-8 bg-background/80 backdrop-blur-sm border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Wichtige Informationen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-primary mb-3">Treffpunkte</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <div>
                      <strong>Totale Anfänger:</strong> Einteilung Montag 10:00 Uhr auf dem Sammelplatz der Schneesportschule gegenüber dem Hotel Gorfion
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <div>
                      <strong>Leicht Fortgeschrittene bis Könner:</strong> Einteilung Montag 10:00 Uhr im Malbipark
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-primary mb-3">Gut zu wissen</h4>
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
          <Button size="lg" className="font-bold text-lg px-10 py-6 shadow-lg">
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
