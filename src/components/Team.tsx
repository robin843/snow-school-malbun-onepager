import { useState } from "react";
import BrushHeading from "@/components/BrushHeading";
import teamPhotos from "@/assets/team-photos.jpg";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  useYetiPublicInstructors,
  type PublicInstructor,
} from "@/hooks/useYetiPublicInstructors";

const InstructorCard = ({ instructor }: { instructor: PublicInstructor }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(instructor.portrait_url) && !imageFailed;

  return (
    <Card className="overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[3/4] bg-gradient-to-br from-ice-blue to-blush flex items-center justify-center">
        {showImage ? (
          <img
            src={instructor.portrait_url}
            alt={`Portrait von ${instructor.display_name}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center text-4xl font-bold text-primary">
            {instructor.display_name.charAt(0)}
          </div>
        )}
      </div>
      <div className="bg-ice-blue p-4 text-center">
        <p className="font-bold text-ice-blue-foreground text-lg truncate">
          {instructor.display_name}
        </p>
        {instructor.role_label && (
          <p className="text-ice-blue-foreground/90 text-sm line-clamp-2">
            {instructor.role_label}
          </p>
        )}
        {instructor.teaser && (
          <p className="text-ice-blue-foreground/80 text-xs mt-2 line-clamp-3">
            {instructor.teaser}
          </p>
        )}
      </div>
    </Card>
  );
};


const Team = () => {
  const { team, isLoading } = useYetiPublicInstructors();

  const groupedInstructors: PublicInstructor[][] = [];
  for (let i = 0; i < team.length; i += 8) {
    groupedInstructors.push(team.slice(i, i + 8));
  }


  return (
    <section id="team" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <BrushHeading tone="blush" className="mb-4 rotate-1">Skischulleitung</BrushHeading>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-16">
          <div className="flex justify-center animate-fade-in">
            <img
              src={teamPhotos}
              alt="Christoph und Engelbert Bühler"
              className="rounded-lg shadow-2xl w-full object-cover"
            />
          </div>
          <p className="text-lg leading-relaxed text-foreground text-center md:text-left">
            <span className="font-bold">Christoph Bühler</span> führt heute mit viel Herzblut die Schneesportschule Malbun, die sein Vater Engelbert im Jahr 1986 gegründet und über viele Jahre mit Leidenschaft aufgebaut hat. Die Begeisterung für die Berge und den Schneesport wurde Christoph sozusagen in die Wiege gelegt. Was einst als Familienbetrieb begann, ist bis heute eine Herzensangelegenheit geblieben: Menschen für den Wintersport zu begeistern, Kindern ein strahlendes Lächeln ins Gesicht zu zaubern und unseren Gästen unvergessliche Tage im Schnee zu schenken. Mit viel persönlichem Engagement, Freude und familiärer Herzlichkeit führt Christoph die Tradition weiter und entwickelt unsere Schneesportschule gleichzeitig mit viel Leidenschaft für die Zukunft.
          </p>
        </div>

        <div className="mt-20">
          <div className="text-center mb-12">
            <BrushHeading as="h3" tone="ice" className="mb-4 -rotate-1">Unser Team</BrushHeading>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Über 50 begeisterte Ski- und Snowboardlehrer
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 w-full max-w-6xl mx-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-lg">
                  <div className="aspect-[3/4] bg-muted animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3 mx-auto" />
                  </div>
                </Card>
              ))}
            </div>
          ) : team.length > 0 ? (
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
                      {group.map((instructor, index) => (
                        <InstructorCard key={`${instructor.display_name}-${index}`} instructor={instructor} />
                      ))}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          ) : null}

        </div>
      </div>
    </section>
  );
};

export default Team;
