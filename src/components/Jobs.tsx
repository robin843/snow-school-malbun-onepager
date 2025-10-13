import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Heart, Mountain } from "lucide-react";

const Jobs = () => {
  const benefits = [
    {
      icon: Mountain,
      title: "Arbeiten in den Bergen",
      description: "Jeden Tag umgeben von atemberaubender Natur",
    },
    {
      icon: Heart,
      title: "Familiäres Team",
      description: "Teil einer Leidenschaft vereinten Gemeinschaft",
    },
    {
      icon: Briefcase,
      title: "Karrieremöglichkeiten",
      description: "Weiterbildung und Entwicklung garantiert",
    },
  ];

  return (
    <section id="jobs" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block transform -rotate-1 bg-accent px-6 py-3 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-accent-foreground">
              Werde Teil unseres Teams
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Teile deine Leidenschaft für den Wintersport mit unseren Gästen
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="text-center border-2 hover:shadow-lg transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{benefit.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-background rounded-2xl shadow-xl p-8 md:p-12">
          <div className="transform rotate-1 bg-primary/10 p-1 inline-block mb-6">
            <h3 className="text-2xl font-bold text-primary px-4 py-2">
              Offene Stellen
            </h3>
          </div>
          <div className="space-y-6 text-foreground">
            <div>
              <h4 className="text-xl font-semibold mb-2">Ski- und Snowboardlehrer (m/w/d)</h4>
              <p className="text-muted-foreground mb-3">
                Wir suchen motivierte und qualifizierte Instruktoren für die kommende Wintersaison.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Anerkannte Skilehrer- oder Snowboardlehrer-Ausbildung</li>
                <li>Freude am Umgang mit Menschen aller Altersgruppen</li>
                <li>Deutschkenntnisse erforderlich, weitere Sprachen von Vorteil</li>
                <li>Teamfähigkeit und Zuverlässigkeit</li>
              </ul>
            </div>

            <div className="pt-6 border-t border-border">
              <h4 className="text-xl font-semibold mb-2">Praktikum in der Skischule</h4>
              <p className="text-muted-foreground">
                Sammle wertvolle Erfahrungen in unserem Team und erhalte Einblicke in den Alltag
                einer Schneesportschule.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" className="font-bold text-lg px-8 py-6">
              Bewerbung senden
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Jobs;
