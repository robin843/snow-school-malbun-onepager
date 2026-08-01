import { HeartHandshake } from "lucide-react";

const sponsors = [
  { name: "AXALO", subtitle: "Kompetenz aus einer Hand" },
  { name: "HEIDEGGER", subtitle: "Schweizer Qualität" },
  { name: "GOLDTEST OF SWITZERLAND", subtitle: "Seit 1997" },
  { name: "KAYAK", subtitle: "Featured on" },
];

const Sponsoren = () => {
  return (
    <section id="sponsoren" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-md border border-primary/20">
            <HeartHandshake className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wider uppercase">Partner & Sponsoren</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Unterstützt von starken Partnern
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {sponsors.map((s) => (
            <div
              key={s.name}
              className="flex flex-col items-center justify-center text-center p-6 bg-card border-2 border-primary/10 rounded-lg hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <span className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">
                {s.name}
              </span>
              {s.subtitle && (
                <span className="text-xs md:text-sm text-muted-foreground mt-1">
                  {s.subtitle}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsoren;
