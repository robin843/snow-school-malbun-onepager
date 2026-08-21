import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo-malbun.jpg";
import Sponsoren from "@/components/Sponsoren";

const AGB = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src={logo} alt="Schneesportschule Malbun" className="h-10 w-10 object-contain" />
              <span className="font-bold text-primary hidden sm:inline">Schneesportschule Malbun</span>
            </button>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft size={16} />
              Zurück
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-secondary px-5 py-2.5 rounded-lg mb-4">
            <FileText className="w-5 h-5 text-secondary-foreground" />
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-foreground">Allgemeine Geschäftsbedingungen</h1>
          </div>
          <p className="text-muted-foreground">Stand: Mai 2024</p>
        </div>

        <Card className="border-2 rounded-lg shadow-sm">
          <CardContent className="p-6 md:p-10 space-y-8 text-foreground/90 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Allgemeine Geschäftsbedingungen und Geltungsbereich</h2>
              <p>
                Soweit nicht ausdrücklich Gegenteiliges vereinbart wird, gelten die vorliegenden AGB für sämtliche Geschäfte zwischen der Schneesportschule Malbun AG (nachfolgend SSSM genannt) und ihren Gästen. Zweck des Unternehmens ist der Betrieb einer Schneesportschule. Dies umfasst insbesondere Dienstleistungen, wie das Erteilen von Unterricht in den Fertigkeiten und Kenntnissen des Schneesports und Outdooraktivitäten, ohne Garantie eines bestimmten Ausbildungserfolges, sowie das Führen und Begleiten beim Wintersport. Die Ski-, Snowboard- und Langlauflehrer werden nachfolgend als „Schneesportlehrperson" bezeichnet.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Buchung</h2>
              <p>
                Durch die Anmeldung anerkennt der Gast die AGB als integrierender Bestandteil des Vertrages zwischen ihm und der SSSM. Eine Anmeldung ist für sämtliche Angebote der SSSM obligatorisch. Buchungen können schriftlich, telefonisch, elektronisch oder persönlich bei der SSSM oder anderen Verkaufsstellen, welche die Angebote der SSSM verkaufen, entgegengenommen werden. Allfällige Wünsche und Anliegen betreffend Essgewohnheiten, medizinische Prophylaxen etc. sind der Schneesportlehrperson direkt und rechtzeitig vor Aktivitätsbeginn (mindestens 24 Stunden im Voraus) mitzuteilen, sodass diese die notwendigen Massnahmen treffen kann.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Preis</h2>
              <p>
                Die angegebenen Preise verstehen sich in Schweizer Franken (CHF) und sind pro Person kalkuliert. Bei Bezahlung in Euro (EUR) oder anderen Fremdwährungen wird der entsprechende Tageskurs des Dienstleisters angewandt. Sofern im detaillierten Angebotsbeschrieb nicht anderweitig vermerkt, beinhaltet der Preis die Kosten für den Unterricht, den Kurs oder die Tour. Die Preise sind somit grundsätzlich exklusive persönlicher Verpflegung, Mietmaterial, sowie Kosten für den Transport zum/auf den Berg (Bergbahnen, Taxi oder öffentliche Verkehrsmittel sind somit nicht im Preis inbegriffen). Allfällige Preisänderungen bleiben vorbehalten. Die Unterrichtspreise sind mehrwertsteuerfrei.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Zahlungsbedingungen</h2>
              <p>
                Die Gesamtsumme der vereinbarten Leistung wird vor Aktivitätsbeginn fällig. Ist der Kurs vor Kursbeginn nicht bezahlt, kann ein Beginn des Unterrichts durch die Schneesportlehrperson in Absprache mit der Geschäftsleitung abgelehnt werden. Als Barzahlungsmittel gilt der Schweizer Franken (CHF) und der Euro (EUR). Bei Bezahlung in Euro (EUR) oder anderen Fremdwährungen wird der entsprechende Tageskurs des Dienstleisters angewandt. Das Wechselgeld in bar wird ausschliesslich in Schweizer Franken (CHF) zurückbezahlt. Wir akzeptieren alle gängigen Kreditkarten (MasterCard, American Express, Visa, Maestro, Postcard und Twint). Für nichtbezahlte Rechnungen werden maximal drei Mahnungen ausgestellt. Für diese Mahnungen werden Verzugszinsen von 5% (pro Jahr) sowie pro Mahnung eine Mahngebühr von CHF 20.00 erhoben.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Kreditkartenzahlung bei Onlinebuchung</h2>
              <p>
                Kreditkartenzahlungen von Onlinebuchungen zugunsten der SSSM werden von der M-SOFT SA, Lyron 10, 1978 Lens, Schweiz ("M-SOFT"), eingezogen. Die Zahlung wird durch Virtual Terminal Saferpay (Worldwide) durchgeführt. M-SOFT wird als M-SOFT oder BOOKING-CORNER.COM LENS auf Ihrer Kreditkartenabrechnung erscheinen. Die Domain, in der Sie Ihre Zahlung eingeben und bearbeiten, ist Eigentum von M-SOFT und wird von M-SOFT betrieben. Für sämtliche Anfragen betreffend Kreditkartenzahlung und Rückbuchung hat sich der Kunde direkt per Mail an info@booking-corner.com zu wenden.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Stornierung, Annullation oder Auftragsänderung durch den Kunden</h2>
              <p>
                Die Absage von Reservationen hat spätestens 24 Stunden vor Aktivitätsbeginn telefonisch (+4232639770) oder schriftlich per E-Mail (info@schneesportschule.li) oder per WhatsApp (+4232639770) zu erfolgen. Mit Aktivitätsbeginn versteht sich immer der erste Tag der gebuchten Leistung. Für Stornierungen bis 24 Stunden vor Kursbeginn sind lediglich Bearbeitungskosten von CHF 10.00 zu entrichten. Bei späteren Absagen durch den Gast wird der volle Tarif gemäss Buchung verrechnet. Bei kurzfristigen Buchungen innerhalb 24 Stunden kann eine Stornierung nicht mehr entgegengenommen werden und somit ist der volle Tarif zu bezahlen. Jede angebrochene Lektion bzw. jeder angebrochene Gruppenkurs wird voll verrechnet, auch wenn der Kurs vorzeitig beendet werden muss. Wenn Sie ihren Unterricht absagen müssen, können Sie einen Ersatzgast benennen. Tritt ein Ersatzgast in den Vertrag ein, so haften Sie und er gemeinsam (solidarisch) für die Bezahlung des gesamten Unterrichts.
              </p>
              <p className="mt-3 font-semibold">Es besteht kein Anspruch auf Rückerstattung, wenn:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>die Aktivität aufgrund Verspätung oder Nichterscheinen des Gastes nicht durchgeführt werden kann.</li>
                <li>der Gast eine Aktivität erst nach deren geplanten Beginn antritt oder diese vor ihrem Ende verlässt.</li>
                <li>der Gast bei mehrtägigen Buchungen (auch bei Kinderklassenunterricht) einzelne (Halb-)Tage nicht in Anspruch nimmt.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Stornierung, Annullation oder Auftragsänderung bei Krankheit oder Unfall</h2>
              <p>
                Bei Krankheit oder Unfall wird ein Teil der Zahlung nur durch Vorweisung eines ärztlichen Zeugnisses zurückerstattet. Dieses Zeugnis muss am Tag des gebuchten Kurses oder früher ausgestellt sein. In einem solchen Fall muss die Absage vor Aktivitätsbeginn schriftlich per E-Mail (info@schneesportschule.li) oder per WhatsApp (+4232639770) erfolgen. Für Stornierungen bis 24 Stunden vor Kursbeginn sind somit bei Krankheit oder Unfall Bearbeitungskosten von CHF 10.00 zu entrichten. Bei Stornierungen wegen Krankheit oder Unfall, die nach 24 Stunden vor Kursbeginn getätigt werden, belaufen sich die Stornierungskosten auf 50% des Kurspreises des entsprechenden Tages. Wird dies nicht vor Kursbeginn gemeldet und von uns bestätigt, so wird der volle Preis fällig. Die Stornierung wegen Krankheit oder Unfall sowie der Erhalt des ärztlichen Zeugnisses müssen zwingend von uns bestätigt werden, sonst gilt die Stornierung als nicht erhalten.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Annullation oder Auftragsänderung durch die SSSM vor Aktivitätsbeginn</h2>
              <p>
                Die SSSM behält sich das Recht vor, nach Vertragsschluss das Programm oder einzelne Leistungen auch kurzfristig abzuändern oder abzusagen, wenn Natur- und/oder Wetterverhältnisse oder sonstige unvorhersehbare Umstände (höhere Gewalt, behördliche Massnahmen Sicherheits- oder andere Risiken) dies erfordern. Die Rückerstattung erfolgt in Form einer Gutschrift.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Programmänderung oder Abbruch der Aktivität nach Aktivitätsbeginn oder innert 24 Stunden vorher</h2>
              <p>
                Die SSSM behält sich vor, das Aktivitätsprogramm oder einzelne vereinbarte Leistungen zu ändern, wenn es äussere Umstände (z.B. höhere Gewalt, Wetter- und Naturverhältnisse, behördliche Massnahmen oder Sicherheitsrisiken) erfordern.
              </p>
              <p className="mt-3 font-semibold">Bei folgenden Ereignissen werden dem Gast die geleisteten Zahlungen abzüglich der bereits gemachten Aufwendungen zurück erstattet:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Schliessung von touristischen Leistungsträgern wie zum Beispiel Bergbahnen, Züge, Hotels oder Restaurants durch behördliche Massnahmen (z.B. Pandemie).</li>
              </ul>
              <p className="mt-3 font-semibold">Es besteht kein Anspruch auf Rückerstattung bei:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Schliessung von touristischen Dienstleistungserbringern wie zum Beispiel Bergbahnen, öffentlicher Verkehr (Zug, Bus etc.), Hotels, Restaurants und Geschäfte für Mietmaterial durch Wetter- oder Naturverhältnissen (z.B. offizielle Unwetterwarnungen).</li>
                <li>Krankheit oder Unfall (nur teilweise) oder anderweitiger Verhinderung des Gastes.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Unterricht allgemein</h2>
              <p>
                Die SSSM empfiehlt allen Kursteilnehmern einen Helm zu tragen. Für Kinder unter 18 Jahren ist das Tragen eines Helms Pflicht. Bitte beachten Sie dass die Anwesenheit der Eltern die Kinder ablenken kann und somit der Unterricht gestört wird. Achten Sie zudem darauf, dass die Kinder dem Wetter entsprechend gekleidet sind. Im Rahmen des Möglichen spricht die Schneesportlehrperson dieselbe Sprache wie die Kinder ihrer Gruppe.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Gruppenunterricht</h2>
              <p>
                Die Tickets der Gruppenkurse sind nicht übertragbar und müssen physisch (also ausgedruckt) der Schneesportlehrperson abgegeben werden. Diese Kursbestätigung kann bei einer Onlinereservierung zu Hause gedruckt oder auf dem Skischulbüro abgeholt werden. Die Schneesportlehrperson ist ausdrücklich darauf hingewiesen, Kinder ohne ausgedruckte Bestätigung nicht mitzunehmen. Der Klassenunterricht findet grundsätzlich ab fünf Kinder pro Stärkeklasse statt und das Maximum beträgt 13 Teilehmer. Bei weniger Kindern behält sich die SSSM vor, kurzfristig Klassen mit unterschiedlichen Niveaus zusammen zu legen, Kurse zu kürzen oder zu annullieren. Bei Gruppenkursen ist die Schneesportlehrperson nicht verpflichtet, auf zu spät eintreffende Teilnehmer zu warten. Am wöchentlichen Abschluss-Skirennen in der Gruppe kann ab 3 Tagen Kursbesuch teilgenommen werden.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Teilnahmebedingungen</h2>
              <p>
                Eine gute Gesundheit ist bei allen Aktivitäten Voraussetzung. Der Teilnehmer verpflichtet sich die SSSM über allfällige gesundheitliche Probleme in Kenntnis zu setzen. Der Kunde verpflichtet sich den Anweisungen der Schneesportlehrperson strikte zu folgen. Werden diese Teilnahmebedingungen von einem Gast nicht erfüllt oder befolgt er die Anweisungen nicht, behaltet sich die SSSM vor, ihn von der Aktivität auszuschliessen. Erfolgt ein Ausschluss, hat der Kunde keinen Anspruch auf eine Rückerstattung.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Haftung</h2>
              <p>
                Für Unfälle während des Unterrichts und den Wettkämpfen bzw. allfällige Haftungsansprüche im Zusammenhang mit den Leistungen der SSSM wird von der SSSM jede Haftung ausdrücklich ausgeschlossen. Allfällige (Schadenersatz-)Ansprüche wegen Fehlern in Abbildungen, Preisen und Texten sind ausdrücklich ausgeschlossen.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Versicherung</h2>
              <p>
                Die Versicherung (Kranken- und Unfallversicherung inkl. Sportunfälle etc.) ist Sache des Gastes. Der Abschluss einer Annullationskosten- und Rücktransportversicherung wird empfohlen.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Beanstandungen</h2>
              <p>
                Beanstandungen oder allfällige erlittene Schäden sind der SSSM spätestens vier Wochen nach Beendigung der Aktivität schriftlich auf dem Postweg oder per E-Mail (info@schneesportschule.li) mitzuteilen. Bei späterer Geltendmachung einer Forderung verfallen sämtliche Ansprüche.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Datenschutz</h2>
              <p>
                Die SSSM behält sich das Recht vor, Bildmaterial sämtlicher erbrachter Leistungen für Marketingzwecke zu verwenden. Die Einwilligung für die Nutzung und Weitergabe der Daten und Bilder können Sie jederzeit widerrufen, indem Sie uns eine entsprechende Nachricht an info@schneesportschule.li senden. Die für die Geschäftsabwicklung notwendigen Daten werden selbstverständlich vertraulich behandelt.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Gerichtsstand</h2>
              <p>
                Erfüllungsort ist der Hauptsitz der SSSM in Triesenberg. Ausschliesslicher Gerichtsstand ist Vaduz. Anwendbar ist Liechtensteiner Recht.
              </p>
              <p className="mt-3 text-muted-foreground">Triesenberg, im Mai 2024</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Kontakt</h2>
              <p className="mb-4">
                Bei Fragen zu unseren Allgemeinen Geschäftsbedingungen kontaktieren Sie uns bitte unter:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Schneesportschule Malbun AG</p>
                    <p>Rotenbodenstrasse 17, 9497 Triesenberg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="mailto:info@schneesportschule.li" className="text-primary hover:underline">
                    info@schneesportschule.li
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="tel:+4232639770" className="text-primary hover:underline">
                    +423 263 97 70
                  </a>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>

      <Sponsoren />
    </div>
  );
};

export default AGB;
