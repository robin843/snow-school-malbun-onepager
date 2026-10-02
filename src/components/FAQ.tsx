import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import BrushHeading from "@/components/BrushHeading";
import type { ReactNode } from "react";

type Faq = { q: string; a: ReactNode };

const sections: { title: string; items: Faq[] }[] = [
  {
    title: "Ausrüstung und Liftkarte",
    items: [
      {
        q: "Ist die Liftkarte im Unterrichtspreis enthalten?",
        a: (
          <>
            Nein, eine Liftkarte für die Lifte der Bergbahnen Malbun ist nicht im Unterrichtspreis enthalten. Diese kann bei der Talstation Sareis und Täli bezogen werden (während der Hauptsaison auch in der Schneeflucht). Für Anfänger im Kinderland und Malbi-Park werden keine Liftkarten benötigt. Kinder bis 6 Jahren fahren bei den Bergbahnen gratis, brauchen jedoch trotzdem eine Liftkarte, welche man an genannten Stationen gegen ein Depot von 5 CHF erhält. Für weitere Preisinformationen (
            <a href="https://www.bergbahnen.li" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.bergbahnen.li</a>)
          </>
        ),
      },
      {
        q: "Welche Ausrüstung wird benötigt und ist diese im Unterrichtspreis inbegriffen?",
        a: "Für den Unterricht werden winterfeste Kleidung (Schneehose und -jacke), Ski-/Snowboardschuhe, Ski/Snowboard, evtl. Stöcke UND ein Helm, sowie Handschuhe benötigt. Helm und Handschuhe sind immer obligatorisch zu tragen! Wir empfehlen je nach Wetter die Kleidung anzupassen (dicke/dünne Handschuhe, Schal/Sturmhaube, Skibrille, ...). Im Unterrichtspreis ist keine Ausrüstung enthalten und kann auch nicht bei uns gemietet werden. Gegenüber dem Büro der Schneesportschule befindet sich das Sportgeschäft Malbun Sport, bei welchem sämtliche Ausrüstung ausgeliehen werden kann.",
      },
      {
        q: "Braucht mein Kind Skistöcke?",
        a: "Wir empfehlen Stöcke ab dem Niveau des Blauen Stars/Roten Prinzen. In Absprache mit dem Skilehrer können diese schon ab dem Blauen König eingesetzt werden. Das Fahren mit Stöcken stellt für die Kinder eine zusätzliche koordinative Herausforderung dar. Verfügen diese bereits über ein gutes Fahrniveau, fällt ihnen das Fahren mit Stöcken leichter.",
      },
    ],
  },
  {
    title: "Gruppen-, Samstags-, Windelwedelkurs",
    items: [
      {
        q: "Kann der Gruppenunterricht an jedem Wochentag (Mo-So) besucht werden?",
        a: "Nein, der Gruppenunterricht findet von Montag bis Freitag täglich von 10-12 Uhr und von 14-16 Uhr statt. Der Windel-Wedel-Kurs findet von Montag bis Mittwoch von 10-12 Uhr statt. Wir empfehlen den gesamten Kurs zu besuchen, um ein maximales Lernergebnis zu erzielen und nachträgliche Gruppenumteilungen zu vermeiden.",
      },
      {
        q: "Ist es möglich den Gruppenunterricht zu pausieren oder später anzufangen?",
        a: "Ja, dies ist jedoch nur bei fahrenden Gruppen möglich (nicht bei Anfängern). Pausiert werden kann nach Absprache mit dem Büro und dem Lehrer maximal ein Tag lang. Wird ein halber Tag pausiert, kann dies nicht im Preis berücksichtigt werden. Wird ein Tag pausiert, ist es möglich, dass das Kind aufgrund des verpassten Lernfortschritts am darauffolgenden Tag in eine schwächere Gruppe wechseln muss. Stösst ein Kind erst dienstags oder mittwochs hinzu, empfehlen wir eine Privatstunde davor, um das Niveau des Kindes einschätzen zu können. Damit vermeiden wir eine mehrfache Umteilung des Kindes in verschiedene Gruppen.",
      },
      {
        q: "Ist es möglich nur einen Halbtagesgruppenkurs zu besuchen?",
        a: "Nein, ein Halbtageskurs ist nicht möglich, um den Niveauunterschied in der Gruppe möglichst gering zu halten. Die Kinder lernen stetig Neues. Setzt ein Kind einen halben Tag aus, ist es möglich, dass es in den kommenden Tagen nicht mehr mithalten kann. Der Windel-Wedel-Kurs ist jedoch nur halbtags und nur für 3-jährige Kinder zu buchen.",
      },
      {
        q: "Wie funktioniert das Vorfahren?",
        a: "Beim Gruppenunterricht und den Samstagskursen gibt es am ersten Tag für alle bereits fahrenden Kinder ein Vorfahren. Das Vorfahren findet um 9:30 Uhr im Malbi-Park statt. Alle Kinder müssen sich dort am Tellerlift anstellen, mit diesem nach oben fahren und dann die Piste so gut sie können hinunterfahren. Die unten wartenden Skilehrer werden die Kinder nach deren Können in die Gruppen einteilen. Für einen reibungslosen Ablauf bitten wir die Eltern darum am Malbi Gebäude oder hinter den Gruppen zu warten und nicht zwischen den Gruppen und den Schneesportlehrern. Das Vorfahren kann je nach Anzahl der Gruppen bis zu 30 Minuten dauern. Der Treffpunkt Malbi-Park gilt nur am ersten Tag am Morgen. Die Kurse enden und starten sonst immer am Sammelpunkt gegenüber des Hotels Gorfion.",
      },
      {
        q: "Was muss ich mit den Tickets der Schneesportschule machen?",
        a: "Nur Kinder im Gruppen-, Samstags- und Windelwedelkurs benötigen ein Ticket der Schneesportschule. Dabei handelt es sich um ein Papier, auf welchem die Telefonnummer der Eltern, Name des Kindes, etc. steht. Dieses Ticket muss in jedem Fall zu Beginn des Kurses beim Schneesportlehrer abgegeben werden (am besten dem Kind mitgeben). Bei online gebuchten Kursen soll die ausgedruckte Zahlungs- bzw. Kursbestätigung mitgebracht werden (Onlinebestätigung auf dem Handy reicht nicht).",
      },
      {
        q: "Müssen die Eltern beim Windel-Wedel-Kurs dabei sein?",
        a: "Ja, der Windel-Wedel-Kurs ist ein Eltern-Kind-Kurs. Aus diesem Grund muss an allen drei Tagen ein Elternteil oder eine Bezugsperson des Kindes anwesend sein.",
      },
      {
        q: "Benötigt die Bezugsperson im Windel-Wedel-Kurs eine Skiausrüstung?",
        a: "Nein, wir empfehlen lediglich winterfeste Kleidung (Schneehose und -schuhe). Skischuhe und Ski werden nur für das Kind benötigt.",
      },
    ],
  },
  {
    title: "Treffpunkte",
    items: [
      {
        q: "Ist der Start- und Endtreffpunkt eines Kurses immer der gleiche?",
        a: "Ja, bei Gruppenkursen ist dies immer der Sammelpunkt der Schneesportschule gegenüber des Hotels Gorfion. Bei Privatstunden ist der Start- und Endtreffpunkt grundsätzlich auch derselbe. Kann aber individuell mit dem Schneesportlehrer vereinbart werden. Bei dem Treffpunkt Täli Kasse muss die Stunde 10 min früher beendet werden, da unsere Schneesportlehrer für ihre Folgeunterrichtsstunden zurück zum Treffpunkt Sammelplatz müssen.",
      },
      {
        q: "Kann an den Treffpunkten geparkt werden?",
        a: "Am Sammelplatz und am Malbipark gibt es keine direkten Parkmöglichkeiten. Bei der Täli Kasse kann innerhalb von 15 min be- und entladen werden und bei der Schneeflucht gibt es ganztägige Parkplätze. Im Skigebiet gibt es neben der kostenpflichtigen Parkgarage auch noch viele weitere gratis Parkmöglichkeiten.",
      },
    ],
  },
  {
    title: "Sonstiges",
    items: [
      {
        q: "Wie sind die Stornobedingungen?",
        a: "Wird die Stunde bis 16:00 Uhr am Vortag abgesagt, entstehen keine zusätzlichen Gebühren und der volle Preis wird rückerstattet. Bei kurzfristiger Absage wird der volle Preis verrechnet, da der Skilehrer nicht anderweitig gebucht werden kann. Falls vom Gast selbst eine Ersatzperson ähnlichen Niveaus für die bereits gebuchte Stunde gefunden wird, entstehen keine zusätzlichen Kosten und die Stunde kann normal wahrgenommen werden. Wir bitten dabei um Verständnis, da unsere Schneesportlehrer teilweise einen langen Anreiseweg haben.",
      },
      {
        q: "Ist der Schneesportunterricht für Kinder oder Erwachsene ausgerichtet?",
        a: "Der Grossteil unserer Gäste sind Kinder. Unsere Schneesportlehrer sind jedoch für den Unterricht mit Kindern und Erwachsenen ausgebildet.",
      },
      {
        q: "Gibt es ein Skirennen?",
        a: (
          <>
            <p>Ja, jeden Freitag findet für die Gruppenkurse ein Skirennen statt. Die Gruppen fahren morgens zu Beginn des Kurses das Skirennen auf der Piste 1. Gruppen, die montags im Kinderland begonnen haben, fahren das Rennen im Malbipark. Eltern und Angehörige der Kinder können das Skirennen vom Pistenrand beobachten und die Kinder anfeuern. Die Siegerehrung findet um 15:45 Uhr am Sammelplatz der Schneesportschule Malbun statt. Wir bitten die Eltern von hinter der Absperrung zuzusehen.</p>
            <p className="mt-2">Das Rennen des Samstagskurses findet jeweils am letzten Samstag zu den gleichen Zeiten wie beim Gruppenunterricht statt.</p>
            <p className="mt-2">Beim Windel-Wedel-Kurs treten die Kinder mittwochs im Skirennen gegeneinander an.</p>
          </>
        ),
      },
      {
        q: "Welche Sprachen sprechen die Schneesportlehrer?",
        a: (
          <>
            <p>Unsere Schneesportlehrer sprechen Dialekt, Hochdeutsch und Englisch. Nach Verfügbarkeit sprechen einige aber auch Französisch, Italienisch, Spanisch, Niederländisch, Russisch, Portugiesisch, Tschechisch und Chinesisch.</p>
            <p className="mt-2">Die Gruppenkurse werden grundsätzlich auf Schweizerdeutsch bzw. Standarddeutsch unterrichtet. Der Grossteil unserer Schneesportlehrer spricht ausserdem Englisch. Werden Schneesportlehrer mit besonderen Sprachkenntnissen benötigt, muss dies frühzeitig im Büro der Schneesportschule angefragt werden.</p>
          </>
        ),
      },
    ],
  },
];

const FAQ = () => (
  <section id="faq" className="py-20 bg-gradient-to-b from-background to-blush/25">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12 space-y-4">
        <BrushHeading tone="blush" className="-rotate-1">Häufige Fragen</BrushHeading>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Antworten auf die wichtigsten Fragen rund um unsere Ski- und Snowboardkurse
        </p>
      </div>
      <div className="max-w-3xl mx-auto bg-blush/35 border-2 border-blush rounded-lg p-6 md:p-8 shadow-xl space-y-8">
        {sections.map((s, si) => (
          <div key={s.title}>
            <h3 className="font-black text-sm uppercase tracking-wider text-foreground mb-2">{s.title}</h3>
            <Accordion type="single" collapsible className="w-full">
              {s.items.map((f, i) => (
                <AccordionItem key={i} value={`${si}-${i}`}>
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:text-primary">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FAQ;
