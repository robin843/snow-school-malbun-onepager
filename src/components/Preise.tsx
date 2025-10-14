import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, MapPin, Award, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import privatBg from "@/assets/privatkurse-bg.jpg";
import gruppenBg from "@/assets/gruppenkurse-bg.jpg";

const Preise = () => {
  const navigate = useNavigate();
  
  return (
    <section id="preise" className="relative py-24 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.08),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 backdrop-blur-sm rounded-md border border-primary/20 animate-fade-in">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wider uppercase">Preise & Tarife</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-fade-in leading-tight" style={{ animationDelay: "0.1s" }}>
            Unsere Angebote
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Professionelle Ski- und Snowboardkurse für alle Niveaus – individuell oder in der Gruppe
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16 max-w-7xl mx-auto">
          {/* PRIVATKURSE */}
          <div className="group relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500" />
            
            <Card className="relative bg-card/80 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 overflow-hidden shadow-2xl h-full">
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              
              {/* Image Header */}
              <div className="relative h-64 overflow-hidden">
                <img src={privatBg} alt="Privatkurse" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/40 to-primary/90" />
              </div>
              
              <CardHeader className="relative pb-6 pt-6 px-8 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 text-primary-foreground">
                <div className="relative flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center ring-2 ring-white/30 shadow-2xl">
                    <User className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-black text-white mb-2 tracking-tight">
                      Privatkurse
                    </CardTitle>
                    <CardDescription className="text-white/95 text-base leading-relaxed font-medium">
                      Individueller Unterricht für schnellen Fortschritt
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-6">
                {/* Tarife */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h4 className="font-bold text-sm uppercase tracking-wider text-primary">Tarife pro Stunde</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { zeit: "09:00-10:00 & 12:00-14:00", chf: "75", eur: "79" },
                      { zeit: "10:00-12:00 & 14:00-16:00", chf: "85", eur: "90" },
                    ].map((tarif, idx) => (
                      <div key={idx} className="group/item relative overflow-hidden rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 p-4 hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 border border-border/50">
                        <div className="flex justify-between items-center relative z-10">
                          <span className="text-sm font-medium text-foreground">{tarif.zeit}</span>
                          <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-primary">CHF {tarif.chf}.-</span>
                            <span className="text-xs text-muted-foreground font-medium">EUR {tarif.eur}.-</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Extra Person */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-secondary/10 to-secondary/5 p-4 border-2 border-secondary/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-bold text-foreground block">Weitere Person</span>
                          <span className="text-xs text-muted-foreground">max. 4 Personen</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-black text-secondary">CHF 20.-</span>
                          <span className="text-xs text-muted-foreground font-medium">EUR 21.-</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Rabatt */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 p-4 border-2 border-accent/40">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-foreground">ab 4 Lektionen/Tag</span>
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-accent" />
                          <span className="text-xl font-black text-accent">10% Rabatt</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saison Info */}
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h4 className="font-bold text-sm uppercase tracking-wider text-primary">Saisonzeiten</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="font-bold text-xs text-primary mb-1">HOCHSAISON</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">20.12.2025 - 11.01.2026<br/>31.01.2026 - 08.03.2026</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="font-bold text-xs text-foreground mb-1">NEBENSAISON</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">12.01.2026 - 30.01.2026<br/>09.03.2026 - 06.04.2026</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* GRUPPENKURSE */}
          <div className="group relative animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary to-primary rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500" />
            
            <Card className="relative bg-card/80 backdrop-blur-xl border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-500 overflow-hidden shadow-2xl h-full">
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              
              {/* Image Header */}
              <div className="relative h-64 overflow-hidden">
                <img src={gruppenBg} alt="Gruppenkurse" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/40 to-secondary/90" />
              </div>
              
              <CardHeader className="relative pb-6 pt-6 px-8 bg-gradient-to-br from-secondary/90 via-secondary/80 to-secondary/70 text-primary-foreground">
                <div className="relative flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center ring-2 ring-white/30 shadow-2xl">
                    <Users className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-black text-white mb-2 tracking-tight">
                      Gruppenkurse
                    </CardTitle>
                    <CardDescription className="text-white/95 text-base leading-relaxed font-medium">
                      Gemeinsam lernen und Spass haben
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-6">
                {/* Kinder Tarife */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-secondary" />
                    <h4 className="font-bold text-sm uppercase tracking-wider text-secondary">Tarife Kinder</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { tage: "1 Tag", stunden: "1 x 4 Stunden", chf: "150", eur: "158", highlight: false },
                      { tage: "2 Tage", stunden: "2 x 4 Stunden", chf: "200", eur: "210", highlight: false },
                      { tage: "3 Tage", stunden: "3 x 4 Stunden", chf: "245", eur: "258", highlight: false },
                      { tage: "4 Tage", stunden: "4 x 4 Stunden", chf: "285", eur: "300", highlight: false },
                      { tage: "5 Tage", stunden: "5 x 4 Stunden", chf: "320", eur: "336", highlight: true },
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`group/item relative overflow-hidden rounded-xl p-4 transition-all duration-300 border ${
                          item.highlight 
                            ? 'bg-gradient-to-r from-secondary/15 to-secondary/10 border-2 border-secondary/40 ring-2 ring-secondary/20' 
                            : 'bg-gradient-to-r from-muted/50 to-muted/30 hover:from-secondary/5 hover:to-primary/5 border-border/50'
                        }`}
                      >
                        <div className="flex justify-between items-center relative z-10">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-base font-bold ${item.highlight ? 'text-secondary' : 'text-foreground'}`}>
                                {item.tage}
                              </span>
                              {item.highlight && (
                                <span className="text-xs font-bold px-3 py-1 bg-accent rounded-full text-accent-foreground shadow-lg">
                                  Beliebt
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">{item.stunden}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-2xl font-black ${item.highlight ? 'text-secondary' : 'text-primary'}`}>
                              CHF {item.chf}.-
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">EUR {item.eur}.-</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Services */}
                <div className="space-y-3 pt-4">
                  {/* Mittagsbetreuung */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-5 border-2 border-primary/30">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <h4 className="font-bold text-sm text-foreground">Mittagsbetreuung</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">inkl. Verpflegung (12:00-14:00 Uhr)</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-medium text-foreground">pro Tag/Kind</span>
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-black text-primary">CHF 30.-</span>
                          <span className="text-xs text-muted-foreground font-medium">EUR 32.-</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Erwachsene */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-muted to-muted/50 p-5 border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-foreground mb-1">Erwachsene Gruppenkurse</h4>
                        <p className="text-sm text-muted-foreground">Gerne erstellen wir Ihnen ein Angebot</p>
                      </div>
                      <Button variant="outline" size="sm" className="font-bold">
                        Anfragen
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* INFO SECTION */}
        <div className="max-w-6xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <Card className="relative bg-card/60 backdrop-blur-2xl border-2 border-primary/20 overflow-hidden shadow-2xl">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
            
            <CardHeader className="pt-10 pb-6 px-8 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Wichtige Informationen
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Treffpunkte */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b-2 border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <h4 className="font-black text-base uppercase tracking-wider text-primary">Treffpunkte</h4>
                  </div>
                  <ul className="space-y-4">
                    <li className="group relative pl-6 py-3 rounded-lg hover:bg-primary/5 transition-colors duration-300">
                      <div className="absolute left-0 top-3 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div>
                        <strong className="text-foreground font-bold block mb-1">Totale Anfänger</strong>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Einteilung Montag 10:00 Uhr auf dem Sammelplatz der Schneesportschule gegenüber dem Hotel Gorfion
                        </p>
                      </div>
                    </li>
                    <li className="group relative pl-6 py-3 rounded-lg hover:bg-secondary/5 transition-colors duration-300">
                      <div className="absolute left-0 top-3 w-4 h-4 rounded-full bg-secondary/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                      </div>
                      <div>
                        <strong className="text-foreground font-bold block mb-1">Leicht Fortgeschrittene bis Könner</strong>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Einteilung Montag 10:00 Uhr im Malbipark
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                {/* Gut zu wissen */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b-2 border-secondary/20">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <h4 className="font-black text-base uppercase tracking-wider text-secondary">Gut zu wissen</h4>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Montag bis Freitag: 10:00-12:00 & 14:00-16:00 Uhr",
                      "Ganztägige Gruppenkurse (Ski) verfügbar",
                      "Einstieg für totale Anfänger nur Montag möglich",
                      "Liftkarte nicht im Kurs inbegriffen",
                      "Klassengrösse: 5 bis maximal 13 Kinder",
                      "Versicherung ist Sache des Teilnehmers"
                    ].map((info, idx) => (
                      <li key={idx} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-primary to-secondary mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground leading-relaxed">{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-2xl opacity-30 animate-pulse" />
            <Button 
              size="lg" 
              className="relative font-black text-lg px-12 py-7 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/buchung")}
            >
              Kurs jetzt buchen
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Alle Preise inkl. MwSt.
            </span>
            <span className="hidden md:block text-border">•</span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Start: Einzellektion 55 Min., Doppellektion 115 Min.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Preise;
