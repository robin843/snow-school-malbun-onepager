import wappen from "@/assets/wappen-malbun.jpg";
import teamPhotos from "@/assets/team-photos.jpg";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";


const Team = () => {
  const instructors = [
    "Christoph", "Engelbert", "Heiner", "Peter",
    "Lara", "Mia", "Claudia", "Barbara",
    "Cindy", "Daniel", "David", "Dominique",
    "Gina", "Graeme", "Heidi", "Ivan",
    "Katharina", "Klaus", "Leila", "Lena H.",
    "Lena K.", "Lino", "Lio", "Lisa",
    "Luca", "Luis", "Lukas", "Luzi",
    "Max", "Maxi", "Melanie", "Mikka",
    "Miriam", "Nasti", "Nele", "Nicola",
    "Nicolaj", "Olivia", "Otto", "Patrizia",
    "Paula", "Sarah", "Serena", "Simona",
    "Susanne", "Theresa", "Thomas", "Tim",
    "Toni", "Valerie", "Yves"
  ];

  const groupedInstructors = [];
  for (let i = 0; i < instructors.length; i += 8) {
    groupedInstructors.push(instructors.slice(i, i + 8));
  }

  return (
    <section id="team" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block transform rotate-1 bg-secondary px-6 py-3 mb-4 rounded-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground">
              Über uns
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Erfahrene und zertifizierte Skilehrer mit Leidenschaft für den Wintersport
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto mb-16">
          <div className="flex justify-center animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 transform -rotate-2 rounded-lg"></div>
              <img
                src={teamPhotos}
                alt="Christoph und Engelbert Bühler"
                className="relative rounded-lg shadow-2xl w-full object-cover"
              />
            </div>
          </div>

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
              <div className="transform rotate-1 bg-secondary/10 p-1 inline-block mt-6 rounded-lg">
                <p className="text-lg font-semibold text-secondary px-4 py-2">
                  "Strahlende und glückliche Gäste sind unsere grösste Motivation"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center mb-12">
            <div className="inline-block transform -rotate-1 bg-primary px-6 py-3 mb-4 rounded-lg">
              <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Unser Team
              </h3>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Über 50 begeisterte Ski- und Snowboardlehrer
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {groupedInstructors.map((group, groupIndex) => (
                <CarouselItem key={groupIndex}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4">
                    {group.map((name, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center text-4xl font-bold text-primary">
                            {name.charAt(0)}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-primary to-secondary p-4 text-center">
                          <p className="font-bold text-white text-lg">{name}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Team;
