import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Snowflake, Baby, Calendar, MapPin, Clock, Info } from "lucide-react";

type Tarif = { label: string; chf: string; eur: string; sub?: string };

const PrivateTariffs: Tarif[] = [
  { label: "Einzellektion 09–10 / 12–13 / 13–14", chf: "75", eur: "83", sub: "55 Min." },
  { label: "Zusatzperson Einzellektion", chf: "20", eur: "23" },
  { label: "Doppellektion 10–12", chf: "190", eur: "208", sub: "115 Min." },
  { label: "Doppellektion 12–14", chf: "150", eur: "164", sub: "115 Min." },
  { label: "Doppellektion 14–16", chf: "170", eur: "186", sub: "115 Min." },
  { label: "Zusatzperson Doppellektion", chf: "40", eur: "45" },
];

const GroupKidsTariffs: Tarif[] = [
  { label: "1 Tag", chf: "150", eur: "165" },
  { label: "2 Tage", chf: "200", eur: "220" },
  { label: "3 Tage", chf: "245", eur: "268" },
  { label: "4 Tage", chf: "285", eur: "312" },
  { label: "5 Tage", chf: "320", eur: "350" },
];

const SnowboardGroup: Tarif[] = [
  { label: "1 halber Tag (2 Std.)", chf: "90", eur: "99" },
  { label: "2 halbe Tage", chf: "140", eur: "154" },
  { label: "3 halbe Tage", chf: "180", eur: "197" },
  { label: "4 halbe Tage", chf: "210", eur: "230" },
  { label: "5 halbe Tage", chf: "230", eur: "252" },
];

const WindelWedel: Tarif[] = [
  { label: "1 Tag (2 Std.)", chf: "70", eur: "77" },
  { label: "2 Tage (2 × 2 Std.)", chf: "110", eur: "121" },
  { label: "3 Tage (3 × 2 Std.)", chf: "140", eur: "154" },
];

type CourseCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tariffs: Tarif[];
  meta: { icon: React.ReactNode; label: string; value: string }[];
  notes: string[];
  accent: "primary" | "secondary" | "accent";
};

const accentMap = {
  primary: "from-primary/90 to-primary/70 border-primary/30",
  secondary: "from-secondary/90 to-secondary/70 border-secondary/30",
  accent: "from-accent/90 to-accent/70 border-accent/30",
};

const CourseCard = ({ icon, title, subtitle, tariffs, meta, notes, accent }: CourseCardProps) => (
  <Card className="relative bg-card/80 backdrop-blur-xl border-2 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
    <CardHeader className={`bg-gradient-to-br ${accentMap[accent]} text-white p-6`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center ring-2 ring-white/30">
          {icon}
        </div>
        <div>
          <CardTitle className="text-2xl font-black text-white">{title}</CardTitle>
          <CardDescription className="text-white/90 font-medium mt-1">{subtitle}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-6 space-y-5">
      <div className="space-y-2">
        {tariffs.map((t, i) => (
          <div key={i} className="flex justify-between items-center gap-4 p-3 rounded-lg bg-muted/40 border border-border/50">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">{t.label}</div>
              {t.sub && <div className="text-xs text-muted-foreground">{t.sub}</div>}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-black text-primary">CHF {t.chf}.-</div>
              <div className="text-xs text-muted-foreground">EUR {t.eur}.-</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 pt-2 border-t border-border">
        {meta.map((m, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">{m.icon}</span>
            <div>
              <div className="font-semibold text-foreground">{m.label}</div>
              <div className="text-muted-foreground text-xs">{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      {notes.length > 0 && (
        <ul className="space-y-1 pt-2 border-t border-border">
          {notes.map((n, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

const Kurse = () => {
  return (
    <section id="kurse" className="py-24 bg-gradient-to-b from-muted/30 via-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-secondary/10 backdrop-blur-sm rounded-md border border-secondary/20">
            <Snowflake className="w-5 h-5 text-secondary" />
            <span className="text-sm font-semibold text-secondary tracking-wider uppercase">Kursübersicht 2026/27</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
            Alle Kursangebote
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Detaillierte Übersicht zu Tarifen, Zeiten, Treffpunkten und Bedingungen
          </p>
        </div>

        <Tabs defaultValue="ski" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-10">
            <TabsTrigger value="ski">Ski</TabsTrigger>
            <TabsTrigger value="snowboard">Snowboard</TabsTrigger>
            <TabsTrigger value="kids">Kinder</TabsTrigger>
          </TabsList>

          <TabsContent value="ski" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <CourseCard
                accent="primary"
                icon={<Snowflake className="w-6 h-6 text-white" />}
                title="Ski-Privatkurse"
                subtitle="Individuell für Erwachsene & Kinder"
                tariffs={PrivateTariffs}
                meta={[
                  { icon: <Clock className="w-4 h-4" />, label: "Verfügbarkeit", value: "Täglich 09:00–16:00" },
                  { icon: <MapPin className="w-4 h-4" />, label: "Treffpunkte", value: "Gorfion / Malbipark / Täli" },
                ]}
                notes={[
                  "Max. 5 Personen pro Kurs",
                  "Ab 4 Lektionen/Tag: 10 % Rabatt",
                  "Liftkarte & Ausrüstung nicht inkl.",
                ]}
              />
              <CourseCard
                accent="secondary"
                icon={<Snowflake className="w-6 h-6 text-white" />}
                title="Ski-Gruppenkurse"
                subtitle="Kinderkurse nach Swiss Snow League"
                tariffs={GroupKidsTariffs}
                meta={[
                  { icon: <Clock className="w-4 h-4" />, label: "Zeiten", value: "Mo–Fr, 10–12 & 14–16 Uhr" },
                  { icon: <MapPin className="w-4 h-4" />, label: "Treffpunkt", value: "Hotel Gorfion / Malbipark" },
                ]}
                notes={[
                  "Nur ganztägige Kurse",
                  "Anfänger-Einstieg nur Mo möglich",
                  "Klassengrösse 5–13 Kinder",
                  "Mittagsbetreuung: CHF 30 / EUR 33 pro Tag",
                ]}
              />
              <CourseCard
                accent="accent"
                icon={<Calendar className="w-6 h-6 text-white" />}
                title="Ski-Samstagskurse"
                subtitle="5 Samstage für Kinder ab 4 Jahren"
                tariffs={GroupKidsTariffs}
                meta={[
                  { icon: <Calendar className="w-4 h-4" />, label: "Kurs 1", value: "09.01.–06.02.2027" },
                  { icon: <Calendar className="w-4 h-4" />, label: "Kurs 2", value: "20.02.–20.03.2027" },
                ]}
                notes={[
                  "10–12 & 14–16 Uhr",
                  "Anfänger-Einstieg nur am 1. Samstag",
                  "Klassengrösse 5–13 Kinder",
                  "Liftkarte & Ausrüstung nicht inkl.",
                ]}
              />
              <CourseCard
                accent="primary"
                icon={<Baby className="w-6 h-6 text-white" />}
                title="Windel-Wedel-Kurs"
                subtitle="Eltern-Kind-Skikurs für 2–4 Jährige"
                tariffs={WindelWedel}
                meta={[
                  { icon: <Clock className="w-4 h-4" />, label: "Zeiten", value: "Mo–Mi, 10:00–12:00" },
                  { icon: <MapPin className="w-4 h-4" />, label: "Treffpunkt", value: "Hotel Gorfion" },
                ]}
                notes={[
                  "Ideal für 3-Jährige",
                  "Im Kinderland / Malbipark mit Karussell & Teppichlift",
                  "Eltern dürfen gerne dabei sein",
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="snowboard" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <CourseCard
                accent="primary"
                icon={<Snowflake className="w-6 h-6 text-white" />}
                title="Snowboard-Privatkurse"
                subtitle="Einsteiger bis Fortgeschrittene"
                tariffs={PrivateTariffs}
                meta={[
                  { icon: <Clock className="w-4 h-4" />, label: "Verfügbarkeit", value: "Täglich 09:00–16:00" },
                  { icon: <MapPin className="w-4 h-4" />, label: "Treffpunkte", value: "Gorfion / Malbipark / Täli" },
                ]}
                notes={[
                  "Max. 5 Personen pro Kurs",
                  "Ab 4 Lektionen/Tag: 10 % Rabatt",
                  "Tricks & Styles auf Anfrage",
                ]}
              />
              <CourseCard
                accent="secondary"
                icon={<Snowflake className="w-6 h-6 text-white" />}
                title="Snowboard-Gruppenkurse"
                subtitle="Halbtägige Kurse für Kinder"
                tariffs={SnowboardGroup}
                meta={[
                  { icon: <Clock className="w-4 h-4" />, label: "Zeiten", value: "Mo–So, 14:00–16:00" },
                  { icon: <MapPin className="w-4 h-4" />, label: "Treffpunkt", value: "Hotel Gorfion" },
                ]}
                notes={[
                  "Klassengrösse 3–10 Kinder",
                  "Für >2 Std. → Privatsnowboardlehrer",
                  "Erwachsenenkurse auf Anfrage",
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="kids" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <CourseCard
                accent="primary"
                icon={<Baby className="w-6 h-6 text-white" />}
                title="Windel-Wedel-Kurs"
                subtitle="2–4 Jahre, mit Eltern"
                tariffs={WindelWedel}
                meta={[
                  { icon: <Clock className="w-4 h-4" />, label: "Zeiten", value: "Mo–Mi, 10:00–12:00" },
                  { icon: <MapPin className="w-4 h-4" />, label: "Treffpunkt", value: "Hotel Gorfion" },
                ]}
                notes={["Kinderland mit Karussell & Teppichlift", "Ideal für 3-Jährige"]}
              />
              <CourseCard
                accent="secondary"
                icon={<Snowflake className="w-6 h-6 text-white" />}
                title="Ski-Gruppenkurse Kinder"
                subtitle="Ab 4 Jahren, Swiss Snow League"
                tariffs={GroupKidsTariffs}
                meta={[
                  { icon: <Clock className="w-4 h-4" />, label: "Zeiten", value: "Mo–Fr, 10–12 & 14–16" },
                  { icon: <MapPin className="w-4 h-4" />, label: "Treffpunkt", value: "Hotel Gorfion / Malbipark" },
                ]}
                notes={["Klassengrösse 5–13 Kinder", "Mittagsbetreuung möglich"]}
              />
              <CourseCard
                accent="accent"
                icon={<Calendar className="w-6 h-6 text-white" />}
                title="Samstagskurse"
                subtitle="5 Samstage – spielerisch lernen"
                tariffs={GroupKidsTariffs}
                meta={[
                  { icon: <Calendar className="w-4 h-4" />, label: "Kurs 1", value: "09.01.–06.02.2027" },
                  { icon: <Calendar className="w-4 h-4" />, label: "Kurs 2", value: "20.02.–20.03.2027" },
                ]}
                notes={["Ab 4 Jahren", "Anfänger nur am 1. Samstag"]}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Treffpunkte & Kurszeiten */}
        <div className="max-w-6xl mx-auto mt-16">
          <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black">Treffpunkte & Kurszeiten</CardTitle>
                  <CardDescription>Alle Sammelplätze auf einen Blick</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Windel-Wedel (3-Jährige)",
                    time: "Mo–Mi, 10:00–12:00",
                    place: "Start Mo 10:00 beim Hotel Gorfion",
                  },
                  {
                    title: "Anfänger – Snow Kids Village (ab 4 J.)",
                    time: "Mo–Fr, 10–12 & 14–16 Uhr",
                    place: "Nur ganze Tage, Start Mo 10:00 Hotel Gorfion",
                  },
                  {
                    title: "Fortgeschrittene – ab Blue Prince (ab 4 J.)",
                    time: "Mo–Fr, 10–12 & 14–16 Uhr",
                    place: "Start Mo 10:00 Malbipark, Rückkehr 12:00 Gorfion",
                  },
                  {
                    title: "Privatunterricht",
                    time: "Täglich 09:00–16:00 (Start jede volle Stunde)",
                    place: "Empfohlen 12–14 Uhr (geringere Liftauslastung)",
                  },
                ].map((it, i) => (
                  <div key={i} className="p-5 rounded-xl bg-muted/40 border border-border hover:border-primary/40 transition-colors">
                    <h4 className="font-bold text-foreground mb-2">{it.title}</h4>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{it.time}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                      <span>{it.place}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Hinweis:</strong> Liftkarte und Ausrüstung sind bei keinem
                  Kurs inkludiert. Mögliche Treffpunkte: Hotel Gorfion, Malbipark, Kasse Sesselbahn Täli Talstation.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Kurse;
