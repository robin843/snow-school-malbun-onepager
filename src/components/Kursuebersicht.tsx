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
import BrushHeading from "@/components/BrushHeading";
import { useNavigate } from "react-router-dom";
import { useYetiProducts, type YetiProduct } from "@/hooks/useYetiProducts";
import { productCardData } from "@/lib/productCardData";
import { PRIVATE_LESSON_INFO } from "@/lib/privateLessonInfo";
import { privateFurtherTariffCount, tariffToggleVisible, visibleTariffCount } from "@/lib/tariffDisplay";
import { privateTariffView, type PrivateTariffView } from "@/lib/privateTimeTariffs";

type Discipline = "ski" | "snowboard" | "other";
type Audience = "kids" | "adults";
type Flag = "beliebt" | "empfohlen";

type TariffRow = {
  label: string;
  sub?: string;
  group?: string;
  chf: string;
  currency: string;
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
  flag?: Flag;
  meta: { icon: React.ReactNode; label: string }[];
  requirement?: string;
  tariffs?: TariffRow[];
  privateTariffs?: PrivateTariffView | null;
  currency?: string;
  notes?: string[];
  bookable: boolean;
  type: "private" | "group" | "other";
};

const cardIcon = (key: YetiProduct["icon_key"]): React.ReactNode => {
  const icons = { user: User, users: Users, baby: Baby, calendar: Calendar,
    snowflake: Snowflake, trophy: Trophy, sparkles: Sparkles };
  const Icon = icons[key ?? "snowflake"] ?? Snowflake;
  return <Icon className="w-6 h-6 text-foreground" />;
};
const metaIcon = (key: YetiProduct["meta"][number]["icon"]): React.ReactNode => {
  const icons = { calendar: Calendar, clock: Clock, users: Users, map: MapPin };
  const Icon = icons[key] ?? Info;
  return <Icon className="w-4 h-4" />;
};

/** Presentation only: offers, prices and UUIDs are supplied by YETI. */
const productToCourse = (p: YetiProduct): Course => {
  const data = productCardData(p);
  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    discipline: p.discipline,
    audiences: p.audience === "kids" ? ["kids"] : p.audience === "adults" ? ["adults"] : ["kids", "adults"],
    icon: cardIcon(p.icon_key),
    flag: p.badge ?? undefined,
    meta: data.meta.map((m) => ({ icon: metaIcon(m.icon), label: m.label })),
    requirement: p.requirement ?? undefined,
    tariffs: data.tariffs.length ? data.tariffs : undefined,
    privateTariffs: p.type === "private" ? privateTariffView(p) : null,
    currency: p.currency,
    notes: p.notes,
    bookable: data.bookable,
    type: p.type === "private" ? "private" : p.type.startsWith("group") ? "group" : "other",
  };
};
// Jede Produktgruppe hat ihre eigene Farbe: Ski = Eisblau, Snowboard = Rosé
const groupHeaderMap = {
  ski: "bg-gradient-to-br from-ice-blue to-ice-blue/70 text-ice-blue-foreground",
  snowboard: "bg-gradient-to-br from-blush to-blush/70 text-blush-foreground",
  other: "bg-gradient-to-br from-muted to-muted/70 text-foreground",
} as const;

const FlagBadge = ({ flag }: { flag: Flag }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-accent text-accent-foreground shadow-lg ring-2 ring-accent/30">
    {flag === "beliebt" ? <Star className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
    {flag === "beliebt" ? "Beliebt" : "Empfohlen"}
  </span>
);

const CourseCardView = ({ course, onBook }: { course: Course; onBook: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const allTariffs = course.tariffs ?? [];
  const isPrivate = course.type === "private";
  const shownTariffs = allTariffs.slice(
    0,
    isPrivate
      ? privateFurtherTariffCount(allTariffs.length, expanded)
      : visibleTariffCount(allTariffs.length, expanded),
  );
  return (
  <div data-product-id={course.id} className="group relative animate-fade-in h-full">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
    <Card className="relative h-full flex flex-col bg-card/90 backdrop-blur-xl border-2 border-border hover:border-primary/40 transition-all duration-500 overflow-hidden shadow-xl rounded-lg">
      <CardHeader className={`relative px-5 py-4 min-h-[6.5rem] justify-center bg-gradient-to-br ${groupHeaderMap[course.discipline]}`}>
        {course.flag && (
          <div className="absolute top-4 right-4">
            <FlagBadge flag={course.flag} />
          </div>
        )}
        <div className={`flex flex-col items-center text-center gap-3 sm:flex-row sm:items-center sm:text-left ${course.flag ? "sm:pr-20" : ""}`}>
          <div className="w-11 h-11 bg-white/60 backdrop-blur-md rounded-lg flex items-center justify-center ring-2 ring-foreground/10 flex-shrink-0">
            {course.icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg md:text-xl font-black text-foreground leading-snug break-words hyphens-auto" lang="de">
              <span className="min-w-0">{course.title}</span>
            </CardTitle>
            <p className="text-foreground/75 text-xs md:text-sm font-medium mt-0.5">{course.subtitle}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex flex-col flex-1 space-y-4">
        <div className="grid grid-cols-1 gap-2 min-h-[6rem] content-start justify-items-center sm:justify-items-start">
          {course.meta.map((m, i) => (
            <div key={i} className="flex items-start gap-2 max-w-full text-sm text-foreground text-center sm:text-left">
              <span className="text-primary flex-shrink-0 mt-0.5">{m.icon}</span>
              <span className="font-medium min-w-0 break-words">{m.label}</span>
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



        {course.type === "private" && (
          <div className="space-y-1.5" data-testid="private-time-summary">
            {course.privateTariffs ? course.privateTariffs.summary.map((s) => (
              <div key={s.label} className="flex justify-between items-center gap-3 p-2.5 pl-3 rounded-lg border bg-muted/40 border-border/50">
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
                <span className="text-base font-black text-primary flex-shrink-0">{s.value}.-</span>
              </div>
            )) : (
              <p className="p-2.5 rounded-lg border border-border/50 bg-muted/40 text-sm font-semibold text-foreground">Preise nach Zeitfenster auf Anfrage</p>
            )}
          </div>
        )}

        {course.type === "private" && (
          <details className="group/info rounded-lg border border-border/60 bg-muted/30 text-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-bold text-primary">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" aria-hidden="true" />{course.privateTariffs ? "Alle Zeiten & Tarife" : PRIVATE_LESSON_INFO.heading}</span>
              <span aria-hidden="true" className="transition-transform group-open/info:rotate-180">▾</span>
            </summary>
            <div className="space-y-2 px-3 pb-3 text-xs text-foreground">
              {course.privateTariffs ? course.privateTariffs.groups.map((g) => (
                <div key={g.label}>
                  <div className="font-bold">{g.label}</div>
                  <ul>
                    {g.rows.map((r) => (
                      <li key={r.label} className="flex justify-between gap-3 text-muted-foreground">
                        <span>{r.label}</span><span className="font-bold text-foreground">{course.currency} {r.chf}.-</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )) : [PRIVATE_LESSON_INFO.single, PRIVATE_LESSON_INFO.double].map((g) => (
                <div key={g.label}>
                  <div className="font-bold">{g.label}</div>
                  <div className="text-muted-foreground">{g.windows.join(" · ")} Uhr</div>
                </div>
              ))}
              <ul className="space-y-1 pt-1 border-t border-border/60">
                {(PRIVATE_LESSON_INFO.notes as readonly string[] as string[])
                  .filter((n) => !(course.privateTariffs?.footnotes.length && n.startsWith("Zusätzliche Personen")))
                  .concat(course.privateTariffs?.footnotes ?? [])
                  .map((n) => <li key={n} className="text-muted-foreground">{n}</li>)}
              </ul>
            </div>
          </details>
        )}

        {allTariffs.length > 0 && (
          <div className={`space-y-1.5 pt-1 ${isPrivate ? "" : "min-h-[10.5rem]"}`}>
            {shownTariffs.map((t, i) => (
              <div key={i}>
              {t.group && t.group !== shownTariffs[i - 1]?.group && (
                <div className={`text-xs font-black uppercase tracking-wider text-foreground/80 pb-1 ${i > 0 ? "mt-4 pt-3 border-t-2 border-dashed border-border" : ""}`}>
                  {t.group}
                </div>
              )}
              <div
                className={`relative flex justify-between items-center gap-3 p-2.5 pl-3 rounded-lg border transition-colors ${
                  t.flag
                    ? "bg-accent/5 border-accent/40 border-l-4 border-l-accent"
                    : "bg-muted/40 border-border/50 hover:bg-muted/60"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{t.label}</span>
                    {t.flag && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-accent/20 text-accent-foreground/90 ring-1 ring-accent/40">
                        <Sparkles className="w-2.5 h-2.5" />
                        Tipp
                      </span>
                    )}
                  </div>
                  {t.sub && <div className="text-xs text-muted-foreground">{t.sub}</div>}
                </div>
                <div className="text-base font-black text-primary flex-shrink-0">{t.currency} {t.chf}.-</div>
              </div>
              </div>
            ))}
            {(isPrivate || tariffToggleVisible(allTariffs.length)) && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full text-xs font-bold text-primary hover:underline pt-1"
              >
                {expanded
                  ? "Weniger anzeigen"
                  : isPrivate
                    ? "Weitere Dauertarife anzeigen"
                    : `Alle ${allTariffs.length} Tarife anzeigen`}
              </button>
            )}
          </div>
        )}

        {course.notes && course.notes.length > 0 && (
          <ul className="space-y-1 pt-2 border-t border-border">
            {course.notes.map((n, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground justify-center sm:justify-start text-center sm:text-left">
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-3 mt-auto">
          <Button
            onClick={onBook}
            disabled={!course.bookable}
            className="w-full font-bold bg-pastel-yellow text-pastel-yellow-foreground hover:bg-pastel-yellow/90 shadow-lg hover:shadow-xl transition-all"
          >
            {course.bookable ? "Jetzt buchen" : "Online noch nicht buchbar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
  );
};

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

// Swiss Snow League Levels (each inner array = one line of badges)
type LevelGroup = { group: string; color: string; rows: string[][] };
const kidsColor = "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-300";
const blueColor = "bg-blue-500/15 text-blue-700 border-blue-500/40 dark:text-blue-300";
const redColor = "bg-red-500/15 text-red-700 border-red-500/40 dark:text-red-300";
const academyColor = "bg-foreground/10 text-foreground border-foreground/40";
const kidsVillage: LevelGroup = { group: "Swiss Snow Kids Village", color: kidsColor, rows: [["Swiss Snow Kids Village"]] };
const blueLeague: LevelGroup = { group: "Blue League", color: blueColor, rows: [["Blue Prince & Princess", "Blue King & Queen", "Blue Star"]] };

const skiLevels: LevelGroup[] = [
  kidsVillage,
  blueLeague,
  { group: "Red League", color: redColor, rows: [["Red Prince & Princess", "Red King & Queen", "Red Star"]] },
  { group: "Swiss Snow Academy", color: academyColor, rows: [["Academy Rookie"], ["Freestyle", "Freeride", "Race"]] },
];

const snowboardLevels: LevelGroup[] = [
  kidsVillage,
  blueLeague,
  { group: "Red Academy", color: redColor, rows: [["Freestyle", "Turns"]] },
  { group: "Swiss Snow Academy", color: academyColor, rows: [["Freestyle", "Freeride", "Turns"]] },
];

const Kursuebersicht = () => {
  const navigate = useNavigate();
  const [main, setMain] = useState<MainFilter>("all");
  const [sub, setSub] = useState<SubFilter>("all");
  const { products, bookable, loading, error } = useYetiProducts();

  const filtered = useMemo(() => {
    const disciplineOrder: Record<Discipline, number> = { ski: 0, snowboard: 1, other: 2 };
    const typeOrder: Record<Course["type"], number> = { group: 0, private: 1, other: 2 };
    const audienceOrder = (c: Course) =>
      c.audiences.length > 1 ? 2 : c.audiences[0] === "kids" ? 0 : 1;
    return products.map(productToCourse).filter((c) => {
      if (main === "all") return true;
      if (c.discipline !== main) return false;
      if (sub === "all") return true;
      return c.audiences.includes(sub);
    }).sort((a, b) =>
      disciplineOrder[a.discipline] - disciplineOrder[b.discipline] ||
      typeOrder[a.type] - typeOrder[b.type] ||
      audienceOrder(a) - audienceOrder(b) ||
      a.title.localeCompare(b.title, "de")
    );
  }, [products, main, sub]);

  const handleBook = (course?: Course) => {
    if (!course) {
      navigate("/buchung");
      return;
    }
    if (!course.bookable || course.type === "other") return;
    const params = new URLSearchParams({
      type: course.type,
      sport: course.discipline,
      product: course.id,
    });
    navigate(`/buchung?${params.toString()}`);
  };

  return (
    <section id="kurse" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-ice-blue/25 to-pastel-yellow/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.08),transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-5">
          <BrushHeading tone="blush" className="-rotate-1">Kursübersicht</BrushHeading>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ski- und Snowboardkurse nach Swiss Snow League – wähle Disziplin und Zielgruppe. Die
            Zeit kannst du dann direkt im Buchungsformular auswählen.
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-3xl mx-auto mb-10 space-y-3">
          {/* Main filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:justify-center md:mx-0 md:px-0">
            {(products.some((p) => p.discipline === "other")
              ? [...mainFilters, { id: "other" as const, label: "Weitere" }] : mainFilters).map((f) => {
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
                      ? f.id === "ski"
                        ? "bg-ice-blue text-ice-blue-foreground border-ice-blue shadow-lg scale-105"
                        : f.id === "snowboard"
                          ? "bg-blush text-blush-foreground border-blush shadow-lg scale-105"
                          : "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
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
        {loading ? (
          <div className="text-center text-muted-foreground py-16">Kurse werden geladen…</div>
        ) : error ? (
          <div className="text-center text-destructive py-16" role="alert">Kurse konnten nicht geladen werden. Bitte versuche es später erneut.</div>
        ) : filtered.length > 0 ? (
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


        {/* Swiss Snow League Levels */}
        <div id="levels" className="max-w-7xl mx-auto mt-16">
          <div className="text-center mb-10">
            <BrushHeading as="h3" tone="ice" className="rotate-1">Unsere Levels</BrushHeading>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Vom ersten Schritt im Kids Village bis zur Academy – klar strukturierte Levels für jeden Fortschritt.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {[
              { key: "ski" as const, title: "Ski Levels", icon: <Snowflake className="w-6 h-6 text-foreground" />, levels: skiLevels },
              { key: "snowboard" as const, title: "Snowboard Levels", icon: <Snowflake className="w-6 h-6 text-foreground" />, levels: snowboardLevels },
            ].map((block) => (
              <Card key={block.key} className="bg-card/90 backdrop-blur-xl border-2 border-border shadow-xl overflow-hidden rounded-lg">
                <CardHeader className={`bg-gradient-to-br ${groupHeaderMap[block.key]}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/60 rounded-lg flex items-center justify-center ring-2 ring-foreground/10">
                      {block.icon}
                    </div>
                    <CardTitle className="text-2xl font-black text-foreground">{block.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {block.levels.map((lvl, i) => (
                    <div key={i}>
                      <h4 className="font-black text-sm uppercase tracking-wider text-foreground mb-3">{lvl.group}</h4>
                      <div className="space-y-2">
                        {lvl.rows.map((row, r) => (
                          <div key={r} className="flex flex-wrap gap-2">
                            {row.map((item) => (
                              <Badge key={item} variant="outline" className={`text-xs font-semibold py-1.5 px-3 ${lvl.color}`}>
                                {item}
                              </Badge>
                            ))}
                          </div>
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
            <div className="absolute inset-0 bg-pastel-yellow rounded-lg blur-2xl opacity-30 animate-pulse" />
            <Button
              size="lg"
              onClick={() => handleBook()}
              disabled={bookable.length === 0}
              className="relative font-black text-lg px-12 py-7 bg-pastel-yellow text-pastel-yellow-foreground hover:bg-pastel-yellow/90 shadow-2xl transition-all duration-300 hover:scale-105"
            >
              {bookable.length ? "Kurs jetzt buchen" : "Online noch nicht buchbar"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Kursuebersicht;
