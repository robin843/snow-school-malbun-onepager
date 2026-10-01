import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { useYetiProducts } from "@/hooks/useYetiProducts";

const FAQ = () => {
  const { products, bookable, loading, error } = useYetiProducts();
  const courseNames = products.map((p) => p.name);
  const meetingPoints = [...new Set(products.flatMap((p) => p.meta
    .filter((m) => m.icon === "map").map((m) => m.label)))];
  const faqs = [
    {
      q: "Welche Kurse bietet ihr aktuell an?",
      a: loading ? "Die Kurse werden geladen…" : error ? "Die Kursangebote sind derzeit nicht verfügbar." :
        courseNames.length ? courseNames.join(", ") : "Für die aktuelle Saison sind noch keine aktiven Produkte freigegeben.",
    },
    {
      q: "Wo finde ich die aktuellen Kurspreise?",
      a: "Die gültigen Produktpreise stehen bei den einzelnen Kurskarten. Für eine konkrete Reservierung bestätigt YETI den Gesamtpreis vor dem Abschluss.",
    },
    {
      q: "Wo sind die Treffpunkte?",
      a: meetingPoints.length ? meetingPoints.join("; ") :
        "Der Treffpunkt wird beim jeweiligen Kurs bekannt gegeben, sobald er feststeht.",
    },
    {
      q: "Kann ich online buchen?",
      a: bookable.length ? "Ja. Bei online buchbaren Kursen führt «Jetzt buchen» direkt zum richtigen YETI-Produkt." :
        "Die Online-Buchung dieser Saison ist noch nicht freigegeben. Kurse und Preise kannst du hier bereits ansehen, sobald sie in YETI aktiv sind.",
    },
  ];
  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-background to-blush/25">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 backdrop-blur-sm rounded-md border border-primary/20">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wider uppercase">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
            Häufige Fragen
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Antworten auf die wichtigsten Fragen rund um unsere Ski- und Snowboardkurse
          </p>
        </div>
        <div className="max-w-3xl mx-auto bg-blush/35 backdrop-blur-xl border-2 border-blush rounded-lg p-6 md:p-8 shadow-xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:text-primary">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
