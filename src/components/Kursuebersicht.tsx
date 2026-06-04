import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Snowflake,
  Baby,
  Calendar,
  MapPin,
  Clock,
  Info,
  User,
  Users,
  Award,
  Trophy,
  Sparkles,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Discipline = "ski" | "snowboard";
type Audience = "kids" | "adults";
type Flag = "beliebt" | "empfohlen";

type TariffRow = {
  label: string;
  sub?: string;
  chf: string;
  flag?: Flag;
  highlight?: boolean;
};

type Course = {
  id: string;
  title: string;
  subtitle: string;
  discipline: Discipline;
  audiences: Audience[];
  icon: React.ReactNode;
  accent: "primary" | "secondary" | "accent";
  flag?: Flag;
  meta: { icon: React.ReactNode; label: string }[];
  requirement?: string;
  tariffs?: TariffRow[];
  notes?: string[];
};

const privatTariffsSki: TariffRow[] = [
  { label: "Einzellektion 09:00–10:00", sub: "55 Min.", chf: "75", flag: "empfohlen" },
  { label: "Einzellektion 12:00–13:00", sub: "55 Min.", chf: "75" },
  { label: "Einzellektion 13:00–14:00", sub: "55 Min.", chf: "75" },
  { label: "Zusatzperson Einzellektion", chf: "20" },
  { label: "Doppellektion 10:00–12:00", sub: "115 Min.", chf: "190" },
  { label: "Doppellektion 12:00–14:00", sub: "115 Min.", chf: "150", flag: "empfohlen" },
  { label: "Doppellektion 14:00–16:00", sub: "115 Min.", chf: "170" },
  { label: "Zusatzperson Doppellektion", chf: "40" },
];

const courses: Course[] = [
  // Privatkurse — Ski
  {
    id: "privat-ski",
    title: "Privatkurs Ski",
    subtitle: "Individuell für Erwachsene & Kinder",
    discipline: "ski",
    audiences: ["kids", "adults"],
    icon: <User className="w-6 h-6 text-white" />,
    accent: "primary",
    meta: [
      { icon: <Clock className="w-4 h-4" />, label: "Täglich, stündlicher Start" },
      { icon: <MapPin className="w-4 h-4" />, label: "Gorfion / Malbipark / Täli" },
    ],
    tariffs: privatTariffsSki,
    notes: ["Max. 5 Personen pro Kurs", "Liftkarte & Ausrüstung nicht inkl."],
  },
  // Privatkurse — Snowboard
  {
    id: "privat-snowboard",
    title: "Privatkurs Snowboard",
    subtitle: "Individuell für Erwachsene & Kinder",
    discipline: "snowboard",
    audiences: ["kids", "adults"],
    icon: <User className="w-6 h-6 text-white" />,
    accent: "primary",
    meta: [
      { icon: <Clock className="w-4 h-4" />, label: "Täglich, stündlicher Start" },
      { icon: <MapPin className="w-4 h-4" />, label: "Gorfion / Malbipark / Täli" },
    ],
    tariffs: privatTariffsSki,
    notes: ["Max. 5 Personen pro Kurs", "Tricks & Styles auf Anfrage"],
  },
  // Ski Kinder Gruppen
  {
    id: "windel-wedel",
    title: "Windel-Wedel-Kurs",
    subtitle: "Spielerischer Einstieg für die Kleinsten",
    discipline: "ski",
    audiences: ["kids"],
    icon: <Baby className="w-6 h-6 text-white" />,
    accent: "accent",
    flag: "beliebt",
    meta: [
      { icon: <Users className="w-4 h-4" />, label: "Kinder 2–3 Jahre" },
      { icon: <Calendar className="w-4 h-4" />, label: "Mo–Mi, jede Woche" },
      { icon: <Clock className="w-4 h-4" />, label: "10:00–12:00 Uhr" },
      { icon: <MapPin className="w-4 h-4" />, label: "Hotel Gorfion" },
    ],
    notes: ["Kinderland mit Karussell & Teppichlift", "Eltern dürfen gerne dabei sein"],
  },
  {
    id: "ganztages-kinder",
    title: "Ganztageskurs Kinder",
    subtitle: "Ski-Gruppenkurs nach Swiss Snow League",
    discipline: "ski",
    audiences: ["kids"],
    icon: <Snowflake className="w-6 h-6 text-white" />,
    accent: "secondary",
    flag: "beliebt",
    meta: [
      { icon: <Users className="w-4 h-4" />, label: "Ab 4 Jahren" },
      { icon: <Calendar className="w-4 h-4" />, label: "Mo–Fr, jede Woche" },
      { icon: <Clock className="w-4 h-4" />, label: "10:00–12:00 & 14:00–16:00" },
      { icon: <MapPin className="w-4 h-4" />, label: "Gorfion / Malbipark" },
    ],
    notes: ["Klassengrösse 5–13 Kinder", "Mittagsbetreuung optional", "Anfänger-Einstieg nur Mo"],
  },
  {
    id: "samstagskurse",
    title: "Samstagskurse Kinder",
    subtitle: "5 Samstage pro Saison",
    discipline: "ski",
    audiences: ["kids"],
    icon: <Calendar className="w-6 h-6 text-white" />,
    accent: "accent",
    meta: [
      { icon: <Users className="w-4 h-4" />, label: "Ab 4 Jahren" },
      { icon: <Calendar className="w-4 h-4" />, label: "2x 5 Samstage pro Saison" },
      { icon: <Clock className="w-4 h-4" />, label: "10:00–12:00 & 14:00–16:00" },
    ],
    notes: ["Anfänger-Einstieg nur am 1. Samstag"],
  },
  {
    id: "carving-mittwoch",
    title: "Carvingkurs Erwachsene",
    subtitle: "Mittwochs gemischt – Männer & Frauen",
    discipline: "ski",
    audiences: ["adults"],
    icon: <Trophy className="w-6 h-6 text-white" />,
    accent: "primary",
    flag: "beliebt",
    meta: [
      { icon: <Calendar className="w-4 h-4" />, label: "Jeden Mittwoch" },
      { icon: <Clock className="w-4 h-4" />, label: "14:00–16:00 Uhr" },
      { icon: <Users className="w-4 h-4" />, label: "Gemischt" },
    ],
    requirement: "Sicheres paralleles Skifahren auf roter Piste",
  },
  {
    id: "carving-ladies",
    title: "Carvingkurs Ladies Only",
    subtitle: "Nur für Frauen – Sonntags",
    discipline: "ski",
    audiences: ["adults"],
    icon: <Sparkles className="w-6 h-6 text-white" />,
    accent: "secondary",
    flag: "empfohlen",
    meta: [
      { icon: <Calendar className="w-4 h-4" />, label: "Jeden Sonntag" },
      { icon: <Clock className="w-4 h-4" />, label: "14:00–16:00 Uhr" },
      { icon: <Users className="w-4 h-4" />, label: "Nur Frauen" },
    ],
    requirement: "Sicheres paralleles Skifahren auf roter Piste",
  },
  // Snowboard Gruppen
  {
    id: "snowboard-anfaenger",
    title: "Snowboard Anfängerkurs",
    subtitle: "Kinder, Jugendliche & Erwachsene",
    discipline: "snowboard",
    audiences: ["kids", "adults"],
    icon: <Snowflake className="w-6 h-6 text-white" />,
    accent: "secondary",
    flag: "beliebt",
    meta: [
      { icon: <Calendar className="w-4 h-4" />, label: "Mo–Fr, jede Woche" },
      { icon: <Clock className="w-4 h-4" />, label: "14:00–16:00 Uhr" },
      { icon: <Users className="w-4 h-4" />, label: "Gemischte Altersgruppe" },
    ],
    notes: ["Klassengrösse 3–10 Personen"],
  },
  {
    id: "snowboard-fortgeschritten",
    title: "Snowboard Fortgeschrittenenkurs",
    subtitle: "Sonntags für Geübte",
    discipline: "snowboard",
    audiences: ["kids", "adults"],
    icon: <Trophy className="w-6 h-6 text-white" />,
    accent: "primary",
    flag: "empfohlen",
    meta: [
      { icon: <Calendar className="w-4 h-4" />, label: "Jeden Sonntag" },
      { icon: <Clock className="w-4 h-4" />, label: "14:00–16:00 Uhr" },
    ],
    requirement: "Sicheres Fahren auf blauer Piste",
  },
];

const accentMap = {
  primary: "from-primary/90 to-primary/70",
  secondary: "from-secondary/90 to-secondary/70",
  accent: "from-accent/90 to-accent/70",
} as const;

const FlagBadge = ({ flag }: { flag: Flag }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-accent text-accent-foreground shadow-lg ring-2 ring-accent/30">
    {flag === "beliebt" ? <Star className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
    {flag === "beliebt" ? "Beliebt" : "Empfohlen"}
  </span>
);

const CourseCardView = ({ course, onBook }: { course: Course; onBook: () => void }) => (
  <div className="group relative animate-fade-in">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
    <Card className="relative h-full flex flex-col bg-card/90 backdrop-blur-xl border-2 border-border hover:border-primary/40 transition-all duration-500 overflow-hidden shadow-xl rounded-lg">
      <CardHeader className={`relative p-6 bg-gradient-to-br ${accentMap[course.accent]} text-white`}>
        {course.flag && (
          <div className="absolute top-4 right-4">
            <FlagBadge flag={course.flag} />
          </div>
        )}
        <div className="flex items-start gap-3 pr-20">
          <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-lg flex items-center justify-center ring-2 ring-white/30 flex-shrink-0">
            {course.icon}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-xl md:text-2xl font-black text-white leading-tight">
              {course.title}
            </CardTitle>
            <p className="text-white/90 text-sm font-medium mt-1">{course.subtitle}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex flex-col flex-1 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {course.meta.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-foreground">
              <span className="text-primary flex-shrink-0">{m.icon}</span>
              <span className="font-medium">{m.label}</span>
            </div>
          ))}
        </div>

        {course.requirement && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/10 border border-secondary/30">
            <Info className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-secondary uppercase tracking-wider">Voraussetzung: </span>
              <span className="text-foreground">{course.requirement}</span>
            </div>
          </div>
        )}

        {course.tariffs && (
          <div className="space-y-1.5 pt-1">
            {course.tariffs.map((t, i) => (
              <div
                key={i}
                className={`flex justify-between items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                  t.flag
                    ? "bg-accent/10 border-accent/40"
                    : "bg-muted/40 border-border/50 hover:bg-muted/60"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{t.label}</span>
                    {t.flag && <FlagBadge flag={t.flag} />}
                  </div>
                  {t.sub && <div className="text-xs text-muted-foreground">{t.sub}</div>}
                </div>
                <div className="text-base font-black text-primary flex-shrink-0">CHF {t.chf}.-</div>
              </div>
            ))}
          </div>
        )}

        {course.notes && course.notes.length > 0 && (
          <ul className="space-y-1 pt-2 border-t border-border">
            {course.notes.map((n, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-3 mt-auto">
          <Button
            onClick={onBook}
            className="w-full font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all"
          >
            Jetzt buchen
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const mainFilters = [
  { id: "all" as const, label: "Alle" },
  { id: "ski" as const, label: "Ski" },
  { id: "snowboard" as const, label: "Snowboard" },
];

const subFilters = [
  { id: "all" as const, label: "Alle" },
  { id: "kids" as const, label: "Kinder" },
  { id: "adults" as const, label: "Erwachsene" },
];

type MainFilter = "all" | Discipline;
type SubFilter = "all" | Audience;

// Swiss Snow League Levels
const skiLevels = [
  {
    group: "Swiss Snow Kids Village",
    color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-300",
    items: ["Swiss Snow Kids Village (grün)"],
  },
  {
    group: "Blue League",
    color: "bg-blue-500/15 text-blue-700 border-blue-500/40 dark:text-blue-300",
    items: ["Blue Prince & Princess", "Blue King & Queen", "Blue Star"],
  },
  {
    group: "Red League",
    color: "bg-red-500/15 text-red-700 border-red-500/40 dark:text-red-300",
    items: ["Red Prince & Princess", "Red King & Queen", "Red Star"],
  },
  {
    group: "Swiss Snow Academy",
    color: "bg-foreground/10 text-foreground border-foreground/40",
    highlight: true,
    items: [
      "Black Academy Rookie",
      "Black Academy Freestyle",
      "Black Academy Freeride",
      "Black Academy Race",
    ],
  },
];

const snowboardLevels = [
  {
    group: "Swiss Snow Kids Village",
    color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-300",
    items: ["Swiss Snow Kids Village (grün)"],
  },
  {
    group: "Blue League",
    color: "bg-blue-500/15 text-blue-700 border-blue-500/40 dark:text-blue-300",
    items: ["Blue Prince & Princess", "Blue King & Queen", "Blue Star"],
  },
  {
    group: "Swiss Snow Academy",
    color: "bg-foreground/10 text-foreground border-foreground/40",
    highlight: true,
    items: [
      "Red Academy Freestyle",
      "Red Academy Turns",
      "Academy Freestyle",
      "Academy Freeride",
      "Academy Turns",
    ],
  },
];

const Kursuebersicht = () => {
  const navigate = useNavigate();
  const [main, setMain] = useState<MainFilter>("all");
  const [sub, setSub] = useState<SubFilter>("all");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (main === "all") return true;
      if (c.discipline !== main) return false;
      if (sub === "all") return true;
      return c.audiences.includes(sub);
    });
  }, [main, sub]);

  const handleBook = (course?: Course) => {
    if (!course) {
      navigate("/buchung");
      return;
    }
    const productType = course.id.startsWith("privat") ? "private" : "group";
    const params = new URLSearchParams({
      type: productType,
      sport: course.discipline,
      course: course.id,
    });
    navigate(`/buchung?${params.toString()}`);
  };

  return (
    <section id="kurse" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.08),transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-5">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 backdrop-blur-sm rounded-md border border-primary/20 animate-fade-in">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wider uppercase">
              Kurse & Tarife
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
            Kursübersicht
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ski- und Snowboardkurse nach Swiss Snow League – wähle Disziplin und Zielgruppe
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-3xl mx-auto mb-10 space-y-3">
          {/* Main filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:justify-center md:mx-0 md:px-0">
            {mainFilters.map((f) => {
              const active = main === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setMain(f.id);
                    setSub("all");
                  }}
                  className={`flex-shrink-0 px-6 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 border-2 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                      : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Sub filter */}
          {main !== "all" && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:justify-center md:mx-0 md:px-0 animate-fade-in">
              {subFilters.map((f) => {
                const active = sub === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSub(f.id)}
                    className={`flex-shrink-0 px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 border ${
                      active
                        ? "bg-secondary text-secondary-foreground border-secondary shadow-md"
                        : "bg-card text-muted-foreground border-border hover:border-secondary/40 hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cards grid */}
        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filtered.map((c) => (
              <CourseCardView key={c.id} course={c} onBook={() => handleBook(c)} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            Keine Kurse für diese Auswahl gefunden.
          </div>
        )}

        {/* Info / Treffpunkte */}
        <div className="max-w-6xl mx-auto mt-16">
          <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-xl overflow-hidden rounded-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black">Treffpunkte & Hinweise</CardTitle>
                  <p className="text-sm text-muted-foreground">Alles Wichtige für deinen Kursstart</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { t: "Windel-Wedel (2–3 J.)", v: "Start Mo 10:00 beim Hotel Gorfion" },
                  { t: "Anfänger Kids Village (ab 4 J.)", v: "Start Mo 10:00 Hotel Gorfion" },
                  { t: "Fortgeschrittene ab Blue Prince", v: "Start Mo 10:00 Malbipark, Rückkehr 12:00 Gorfion" },
                  { t: "Privatunterricht", v: "Empfohlen 12–14 Uhr (geringere Liftauslastung)" },
                ].map((it, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-muted/40 border border-border hover:border-primary/40 transition-colors"
                  >
                    <h4 className="font-bold text-foreground mb-1">{it.t}</h4>
                    <p className="text-sm text-muted-foreground">{it.v}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Hinweis:</strong> Liftkarte und Ausrüstung sind
                  bei keinem Kurs inkludiert. Alle Preise inkl. MwSt.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Swiss Snow League Levels */}
        <div id="levels" className="max-w-7xl mx-auto mt-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-secondary/10 backdrop-blur-sm rounded-md border border-secondary/20 mb-4">
              <Trophy className="w-5 h-5 text-secondary" />
              <span className="text-sm font-semibold text-secondary tracking-wider uppercase">
                Swiss Snow League
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
              Unsere Levels
            </h3>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Vom ersten Schritt im Kids Village bis zur Academy – klar strukturierte Levels für jeden Fortschritt.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {[
              { title: "Ski Levels", icon: <Snowflake className="w-6 h-6 text-white" />, levels: skiLevels },
              { title: "Snowboard Levels", icon: <Snowflake className="w-6 h-6 text-white" />, levels: snowboardLevels },
            ].map((block, idx) => (
              <Card key={idx} className="bg-card/90 backdrop-blur-xl border-2 border-border shadow-xl overflow-hidden rounded-lg">
                <CardHeader className={`bg-gradient-to-br ${idx === 0 ? "from-primary/90 to-primary/70" : "from-secondary/90 to-secondary/70"} text-white`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center ring-2 ring-white/30">
                      {block.icon}
                    </div>
                    <CardTitle className="text-2xl font-black text-white">{block.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {block.levels.map((lvl, i) => (
                    <div key={i} className={lvl.highlight ? "p-4 rounded-lg bg-gradient-to-br from-muted/60 to-muted/30 border-2 border-foreground/20" : ""}>
                      <div className="flex items-center gap-2 mb-3">
                        {lvl.highlight && <Trophy className="w-4 h-4 text-foreground" />}
                        <h4 className="font-black text-sm uppercase tracking-wider text-foreground">
                          {lvl.group}
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {lvl.items.map((item, j) => (
                          <Badge
                            key={j}
                            variant="outline"
                            className={`text-xs font-semibold py-1.5 px-3 ${lvl.color}`}
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur-2xl opacity-30 animate-pulse" />
            <Button
              size="lg"
              onClick={() => handleBook()}
              className="relative font-black text-lg px-12 py-7 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
            >
              Kurs jetzt buchen
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Kursuebersicht;