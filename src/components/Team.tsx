import wappen from "@/assets/wappen-malbun.jpg";

const Team = () => {
  return (
    <section id="team" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block transform rotate-1 bg-secondary px-6 py-3 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground">
              Unser Team
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Erfahrene und zertifizierte Skilehrer mit Leidenschaft für den Wintersport
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="animate-slide-in">
            <div className="transform -rotate-2 bg-primary/10 p-1 inline-block mb-6">
              <h3 className="text-2xl font-bold text-primary px-4 py-2">
                Skischulleitung
              </h3>
            </div>
            <div className="space-y-4 text-foreground">
              <p className="text-lg leading-relaxed">
                <span className="font-bold text-primary">Engelbert Bühler</span> leitet gemeinsam
                mit seiner Frau und seinem Sohn Engelbert unsere traditionsreiche Schneesportschule.
              </p>
              <p className="leading-relaxed">
                Seine Leidenschaft zu den Bergen und dem Wintersport übertrug sich bereits auf einen
                Grossteil seiner Kindheit und Jugend im Bergdorf Triesenberg. Auch heute fördert
                Engelbert als erfahrener Schneesportlehrer noch persönlich um die Anliegen seiner
                Gäste und stellt ein Höchstmass an Professionalität, Qualität und Sicherheit im
                täglichen Familienbetrieb sicher.
              </p>
              <div className="transform rotate-1 bg-secondary/10 p-1 inline-block mt-6">
                <p className="text-lg font-semibold text-secondary px-4 py-2">
                  "Strahlende und glückliche Gäste sind unsere grösste Motivation"
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 transform rotate-3 rounded-2xl"></div>
              <img
                src={wappen}
                alt="Schweizer Skischule Malbun Wappen"
                className="relative rounded-2xl shadow-2xl w-80 h-80 object-contain bg-background p-8"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 text-center bg-muted/50 rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="transform -rotate-1 bg-accent/90 px-6 py-2 inline-block mb-4">
            <h3 className="text-xl font-bold text-accent-foreground">
              Christoph Bühler
            </h3>
          </div>
          <p className="text-lg leading-relaxed text-foreground">
            Der zertifizierte Skischulleiter und Snowboardcoach und sein engagiertes Team begeistern
            mit ihrer Motivation aus den strahlenden und lächelnden Gesichtern seiner Gäste. Als
            stolzer Nachfolger freut er sich deshalb jeden Tag aufs Neue, seine Leidenschaft zu
            teilen.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Team;
