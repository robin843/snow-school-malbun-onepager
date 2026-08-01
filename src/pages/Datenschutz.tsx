import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo-malbun.jpg";

const Datenschutz = () => {
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
            <Shield className="w-5 h-5 text-secondary-foreground" />
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-foreground">Datenschutz</h1>
          </div>
          <p className="text-muted-foreground">Stand: 1. August 2026</p>
        </div>

        <Card className="border-2 rounded-lg shadow-sm">
          <CardContent className="p-6 md:p-10 space-y-8 text-foreground/90 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Einleitung</h2>
              <p>
                Wir nehmen den Schutz der Daten der Nutzer unserer Website und/oder unseres Mobile-App sehr ernst und verpflichten uns, die Informationen, die Nutzer uns in Verbindung mit der Nutzung unserer Website und/oder unseres Mobile-App zur Verfügung stellen, zu schützen. Des Weiteren verpflichten wir uns, Ihre Daten gemäß anwendbarem Recht zu schützen und zu verwenden.
              </p>
              <p className="mt-3">
                Diese Datenschutzrichtlinie erläutert unsere Praktiken in Bezug auf die Erfassung, Verwendung und Offenlegung Ihrer Daten durch die Nutzung unserer digitalen Assets, wenn Sie über Ihre Geräte auf die Dienste zugreifen.
              </p>
              <p className="mt-3">
                Lesen Sie die Datenschutzrichtlinie bitte sorgfältig durch und stellen Sie sicher, dass Sie unsere Praktiken in Bezug auf Ihre Daten vollumfänglich verstehen, bevor Sie unsere Dienste verwenden. Mit der Nutzung unserer Dienste erkennen Sie die Bedingungen dieser Datenschutzrichtlinie an.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Welche Daten erfassen wir?</h2>
              <p className="mb-3">Nachstehend erhalten Sie einen Überblick über die Daten, die wir erfassen können:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Nicht personenbezogene Daten:</strong> Nicht identifizierte und nicht identifizierbare Informationen, die Sie während des Registrierungsprozesses bereitstellen oder die über die Nutzung unserer Dienste gesammelt werden. Diese lassen keine Rückschlüsse darauf zu, von wem sie erfasst wurden.
                </li>
                <li>
                  <strong>Personenbezogene Daten:</strong> Individuell identifizierbare Informationen, über die man Sie identifizieren kann oder mit vertretbarem Aufwand identifizieren könnte. Dazu können Namen, E-Mail-Adressen, Adressen, Telefonnummern, IP-Adressen und mehr gehören.
                </li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Wie sammeln wir Daten?</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Wir erfassen Daten bei der Nutzung unserer Dienste (Nutzung, Sitzungen und dazugehörige Informationen).</li>
                <li>Wir erfassen Daten, die Sie uns selbst zur Verfügung stellen, z. B. bei direktem Kontakt über einen Kommunikationskanal.</li>
                <li>Wir können Daten aus Drittquellen erfassen.</li>
                <li>Wir erfassen Daten, die Sie uns zur Verfügung stellen, wenn Sie sich über einen Drittanbieter wie Facebook oder Google bei unseren Diensten anmelden.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Warum erfassen wir diese Daten?</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Um unsere Dienste zur Verfügung zu stellen und zu betreiben.</li>
                <li>Um unsere Dienste zu entwickeln, anzupassen und zu verbessern.</li>
                <li>Um auf Ihr Feedback, Ihre Anfragen und Wünsche zu reagieren und Hilfe anzubieten.</li>
                <li>Um Anforderungs- und Nutzungsmuster zu analysieren.</li>
                <li>Für interne, statistische und Recherchezwecke.</li>
                <li>Um unsere Möglichkeiten zur Datensicherheit und Betrugsprävention zu verbessern.</li>
                <li>Um Verstöße zu untersuchen und unsere Bedingungen und Richtlinien durchzusetzen.</li>
                <li>Um Ihnen Aktualisierungen, Nachrichten, Werbematerial und sonstige Informationen im Zusammenhang mit unseren Diensten zu übermitteln.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">An wen geben wir diese Daten weiter?</h2>
              <p>
                Wir können Ihre Daten an unsere Dienstleister weitergeben, um unsere Dienste zu betreiben (z. B. Speicherung von Daten über Hosting-Dienste Dritter, Bereitstellung technischer Unterstützung usw.).
              </p>
              <p className="mt-3">
                Wir können Ihre Daten auch unter folgenden Umständen offenlegen: (i) um rechtswidrige Aktivitäten oder sonstiges Fehlverhalten zu untersuchen, aufzudecken, zu verhindern oder dagegen vorzugehen; (ii) um unsere Rechte auf Verteidigung zu begründen oder auszuüben; (iii) um unsere Rechte, unser Eigentum oder unsere persönliche Sicherheit sowie die Sicherheit unserer Nutzer oder der Öffentlichkeit zu schützen; (iv) im Falle eines Kontrollwechsels bei uns oder bei einem unserer verbundenen Unternehmen; (v) um Ihre Daten mittels befugter Drittanbieter zu erfassen, vorzuhalten und/oder zu verwalten; (vi) um mit Drittanbietern gemeinsam an der Verbesserung Ihres Nutzererlebnisses zu arbeiten.
              </p>
              <p className="mt-3">
                Bitte beachten Sie, dass unsere Dienste soziale Interaktionen ermöglichen können. Alle Inhalte oder Daten, die Sie in diesen Bereichen zur Verfügung stellen, können von anderen Personen gelesen, erfasst und verwendet werden.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Cookies und ähnliche Technologien</h2>
              <p>
                Wenn Sie unsere Dienste besuchen oder darauf zugreifen, autorisieren wir Dritte dazu, Webbeacons, Cookies, Pixel Tags, Skripte sowie andere Technologien und Analysedienste („Tracking-Technologien“) einzusetzen. Diese Tracking-Technologien können es Dritten ermöglichen, Ihre Daten automatisch zu erfassen, um das Navigationserlebnis auf unseren digitalen Assets zu verbessern, deren Performance zu optimieren und ein maßgeschneidertes Nutzererlebnis zu gewährleisten, sowie zu Zwecken der Sicherheit und der Betrugsprävention.
              </p>
              <p className="mt-3">
                Ohne Ihre Zustimmung werden wir Ihre E-Mail-Adresse oder andere personenbezogene Daten nicht an Werbeunternehmen oder Werbenetzwerke weitergeben.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Wo speichern wir die Daten?</h2>
              <p className="mb-3">
                <strong>Nicht personenbezogene Daten:</strong> Unsere Unternehmen sowie unsere vertrauenswürdigen Partner und Dienstanbieter sind auf der ganzen Welt ansässig. Zu den in dieser Datenschutzrichtlinie erläuterten Zwecken speichern und verarbeiten wir alle nicht personenbezogenen Daten, die wir erfassen, in unterschiedlichen Rechtsordnungen.
              </p>
              <p>
                <strong>Personenbezogene Daten:</strong> Personenbezogene Daten können in den Vereinigten Staaten, in Irland, Südkorea, Taiwan, Israel und soweit für die ordnungsgemäße Bereitstellung unserer Dienste und/oder gesetzlich vorgeschrieben in anderen Rechtsordnungen gepflegt, verarbeitet und gespeichert werden.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Wie lange werden die Daten vorgehalten?</h2>
              <p>
                Wir bewahren die erfassten Daten so lange auf, wie es für die Bereitstellung unserer Dienste, zur Einhaltung unserer gesetzlichen und vertraglichen Verpflichtungen gegenüber Ihnen, zur Beilegung von Streitigkeiten und zur Durchsetzung unserer Vereinbarungen erforderlich ist. Wir können unrichtige oder unvollständige Daten jederzeit nach eigenem Ermessen berichtigen, ergänzen oder löschen.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Wie schützen wir die Daten?</h2>
              <p>
                Der Hosting-Dienst für unsere digitalen Assets stellt uns die Online-Plattform zur Verfügung, über die wir Ihnen unsere Dienste anbieten können. Ihre Daten können über die Datenspeicherung, Datenbanken und allgemeine Anwendungen unseres Hosting-Anbieters gespeichert werden. Er speichert Ihre Daten auf sicheren Servern hinter einer Firewall und bietet sicheren HTTPS-Zugriff auf die meisten Bereiche seiner Dienste.
              </p>
              <p className="mt-3">
                Alle von uns und unserem Hosting-Anbieter angebotenen Zahlungsmöglichkeiten halten die Vorschriften des PCI-DSS (Datensicherheitsstandard der Kreditkartenindustrie) ein. PCI-DSS-Anforderungen helfen, den sicheren Umgang mit Kreditkartendaten durch unseren Shop und die Dienstanbieter zu gewährleisten.
              </p>
              <p className="mt-3">
                Ungeachtet der von uns ergriffenen Maßnahmen können und werden wir keinen absoluten Schutz und keine absolute Sicherheit der Daten garantieren. Da E-Mail und Instant Messaging nicht als sichere Kommunikationsformen gelten, bitten wir Sie, keine vertraulichen Informationen über diese Kanäle weiterzugeben.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Minderjährige</h2>
              <p>
                Die Dienste sind nicht für Nutzer bestimmt, die noch nicht die gesetzliche Volljährigkeit erreicht haben. Wir werden wissentlich keine Daten von Kindern erfassen. Wenn Sie noch nicht volljährig sind, sollten Sie die Dienste nicht herunterladen oder nutzen und uns keine Informationen zur Verfügung stellen.
              </p>
              <p className="mt-3">
                Wir behalten uns das Recht vor, jederzeit einen Altersnachweis zu verlangen. Sollten Sie Grund zu der Annahme haben, dass ein Minderjähriger Daten an uns weitergegeben hat, nehmen Sie bitte Kontakt zu uns auf.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Ihre Rechte</h2>
              <p className="mb-3">Als EU-Ansässiger können Sie:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>eine Bestätigung darüber verlangen, ob personenbezogene Daten verarbeitet werden, die Sie betreffen, oder nicht, und Zugriff auf Ihre gespeicherten personenbezogenen Daten sowie auf bestimmte Zusatzinformationen anfordern;</li>
                <li>den Erhalt von personenbezogenen Daten, die Sie uns bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesbaren Format verlangen;</li>
                <li>die Berichtigung Ihrer personenbezogenen Daten verlangen, die bei uns gespeichert sind;</li>
                <li>die Löschung Ihrer personenbezogenen Daten verlangen;</li>
                <li>der Verarbeitung Ihrer personenbezogenen Daten durch uns widersprechen;</li>
                <li>die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten verlangen;</li>
                <li>eine Beschwerde bei einer Aufsichtsbehörde einreichen.</li>
              </ul>
              <p className="mt-3">
                Bitte beachten Sie jedoch, dass diese Rechte nicht uneingeschränkt gültig sind und unseren eigenen berechtigten Interessen und regulatorischen Anforderungen unterliegen können.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Aktualisierungen oder Änderungen der Datenschutzrichtlinie</h2>
              <p>
                Wir können diese Datenschutzrichtlinie nach eigenem Ermessen von Zeit zu Zeit überarbeiten, die auf der Website veröffentlichte Version ist immer aktuell (siehe Angabe zum „Stand“). Wir bitten Sie, diese Datenschutzrichtlinie regelmäßig auf Änderungen zu überprüfen. Bei wesentlichen Änderungen werden wir einen Hinweis dazu auf unserer Website veröffentlichen. Wenn Sie die Dienste nach erfolgter Benachrichtigung über Änderungen weiter nutzen, gilt dies als Ihre Zustimmung zu den Änderungen.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Kontakt</h2>
              <p className="mb-4">
                Wenn Sie allgemeine Fragen zu den Diensten oder den von uns über Sie erfassten Daten und deren Verwendung haben, kontaktieren Sie uns bitte unter:
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
                  <a href="tel:+4232633177" className="text-primary hover:underline">
                    +423 263 31 77
                  </a>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Ausschlussklausel</h2>
              <p>
                Die hier enthaltenen Informationen ersetzen keine Rechtsberatung und Sie sollten sich nicht allein darauf stützen. Spezifische Anforderungen in Bezug auf Rechtsbegriffe und Richtlinien können sich von Bundesstaat zu Bundesstaat und/oder von Rechtssystem zu Rechtssystem unterscheiden. Um sicherzustellen, dass Sie Ihren gesetzlichen Verpflichtungen vollumfänglich entsprechen, empfehlen wir Ihnen ausdrücklich, sich professionell beraten zu lassen, um besser nachvollziehen zu können, welche Anforderungen für Sie speziell gelten.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Datenschutz;
