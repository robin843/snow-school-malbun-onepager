import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, Calendar } from "lucide-react";

const Preise = () => {
  const kurse = [
    {
      icon: User,
      title: "Privatkurse",
      description: "Individueller Unterricht für maximalen Lernerfolg",
      preise: [
        { dauer: "1 Stunde", preis: "CHF 85.-" },
        { dauer: "2 Stunden", preis: "CHF 160.-" },
        { dauer: "3 Stunden", preis: "CHF 230.-" },
        { dauer: "Ganztag (6h)", preis: "CHF 450.-" },
      ],
    },
    {
      icon: Users,
      title: "Gruppenkurse",
      description: "Lernen in der Gruppe macht Spass",
      preise: [
        { dauer: "5 Tage (Mo-Fr)", preis: "CHF 250.-" },
        { dauer: "3 Tage", preis: "CHF 165.-" },
        { dauer: "1 Tag", preis: "CHF 65.-" },
        { dauer: "Halbtag", preis: "CHF 45.-" },
      ],
    },
    {
      icon: Calendar,
      title: "Samstagskurse",
      description: "Perfekt für Wochenendbesucher",
      preise: [
        { dauer: "Vormittag", preis: "CHF 55.-" },
        { dauer: "Nachmittag", preis: "CHF 55.-" },
        { dauer: "Ganztag", preis: "CHF 95.-" },
        { dauer: "4 Samstage", preis: "CHF 185.-" },
      ],
    },
  ];

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

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {kurse.map((kurs, index) => (
            <Card
              key={index}
              className="hover:shadow-xl transition-shadow duration-300 animate-fade-in border-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <kurs.icon className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">{kurs.title}</CardTitle>
                <CardDescription className="text-base">{kurs.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {kurs.preise.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center pb-2 border-b border-border last:border-0"
                    >
                      <span className="text-muted-foreground">{item.dauer}</span>
                      <span className="font-bold text-primary">{item.preis}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="font-bold text-lg px-10 py-6 shadow-lg">
            Kurs jetzt buchen
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Alle Preise inkl. MwSt. • Spezielle Gruppenrabatte verfügbar
          </p>
        </div>
      </div>
    </section>
  );
};

export default Preise;
