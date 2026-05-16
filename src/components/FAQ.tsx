import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Wann ist Hoch- und Nebensaison in der Saison 2026/27?",
    a: "Hochsaison: 19.12.2026–10.01.2027 und 23.01.2027–07.03.2027. Nebensaison: 11.01.2027–22.01.2027 und 08.03.2027–05.04.2027.",
  },
  {
    q: "Wie lange dauert eine Lektion?",
    a: "Eine Einzellektion dauert 55 Minuten, eine Doppellektion 115 Minuten.",
  },
  {
    q: "Wie viele Personen sind im Privatunterricht möglich?",
    a: "Privatunterricht ist für maximal 5 Personen buchbar. Für jede weitere Person fallen Zusatzkosten an (Einzel CHF 20, Doppel CHF 40).",
  },
  {
    q: "Gibt es einen Rabatt bei mehreren Lektionen?",
    a: "Ja, ab 4 Lektionen pro Tag erhalten Sie im Privatunterricht 10 % Rabatt.",
  },
  {
    q: "Wie gross sind die Gruppen?",
    a: "Ski-Gruppenkurse: mindestens 5 bis maximal 13 Kinder. Snowboard-Gruppenkurse: mindestens 3 bis maximal 10 Kinder.",
  },
  {
    q: "Sind Liftkarte und Ausrüstung im Kurspreis enthalten?",
    a: "Nein. Liftkarte und Ausrüstung sind in keinem unserer Kurse inkludiert und müssen separat besorgt werden.",
  },
  {
    q: "Wo sind die Treffpunkte?",
    a: "Hotel Gorfion (Sammelplatz gegenüber), Malbipark sowie Kasse Sesselbahn Täli Talstation – je nach Kursart und Niveau.",
  },
  {
    q: "Ab welchem Alter ist der Windel-Wedel-Kurs geeignet?",
    a: "Der Eltern-Kind-Skikurs ist für Kinder von 2 bis 4 Jahren konzipiert, besonders ideal für 3-Jährige.",
  },
  {
    q: "Wann kann man bei Gruppenkursen einsteigen?",
    a: "Totale Anfänger starten ausschliesslich am Montag um 10:00 Uhr. Leicht Fortgeschrittene bis Könner können jederzeit unter der Woche einsteigen.",
  },
  {
    q: "Gibt es eine Mittagsbetreuung?",
    a: "Ja, von 12:00–14:00 Uhr inkl. Verpflegung für CHF 30 / EUR 33 pro Kind und Tag.",
  },
  {
    q: "Werden angebrochene Tage voll verrechnet?",
    a: "Ja, jeder angebrochene Tag im Gruppenkurs wird als ganzer Tag berechnet.",
  },
  {
    q: "Können Erwachsene auch Gruppenkurse besuchen?",
    a: "Gruppenkurse für Erwachsene bieten wir gerne auf Anfrage an – kontaktieren Sie uns für ein individuelles Angebot.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-background to-muted/30">
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

        <div className="max-w-3xl mx-auto bg-card/80 backdrop-blur-xl border-2 border-primary/15 rounded-2xl p-6 md:p-8 shadow-xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:text-primary">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
