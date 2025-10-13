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

        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-gradient-to-br from-primary to-secondary text-white border-0 shadow-xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl md:text-3xl">Skilehrer/in (Voll- und/oder Teilzeit)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-white/90 leading-relaxed">
                Du bist sportlich, gerne draussen und hast Freude am Umgang mit Kindern. Mit deiner offenen Art und guten Deutschkenntnissen passt du gut ins Team. Eine Ausbildung ab Kids Instructor bringst du mit - oder bist bereit, sie während der Saison zu absolvieren.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary to-primary text-white border-0 shadow-xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl md:text-3xl">Kinderbetreuer/in auf Ski (Teilzeit)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-white/90 leading-relaxed">
                Du bist flexibel, gerne draussen und hast Grundkenntnisse im Skifahren. Der Umgang mit Menschen, besonders Kindern, macht dir Freude. Du sprichst gut Deutsch und bist bereit, an einem internen Ausbildungskurs teilzunehmen.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent to-primary text-white border-0 shadow-xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl md:text-3xl">Büroangestellte/r (Voll- und/oder Teilzeit)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-white/90 leading-relaxed">
                Du hast eine kaufmännische Ausbildung oder vergleichbare Erfahrung und arbeitest strukturiert sowie selbständig. Mit MS-Office kennst du dich aus, sprichst Deutsch und Englisch und hast Freude am Kundenkontakt. Teamarbeit liegt dir - idealerweise bist du für mehrere Saisons verfügbar.
              </p>
            </CardContent>
          </Card>

          <div className="text-center pt-8">
            <Button size="lg" className="font-bold text-lg px-10 py-6 bg-destructive hover:bg-destructive/90 text-white shadow-lg">
              Noch Fragen / Bewerben
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Jobs;
