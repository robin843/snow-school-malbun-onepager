/**
 * Display-only projection of Core's staff-verified private time-window tariffs (contract v1):
 *   product.public_private_time_tariffs = { version: 1, purpose: "display_information_only", currency: "CHF",
 *     base_persons: 1, windows: [{ start, end, duration_minutes, amount_chf, extra_person_chf,
 *     classification: "standard" | "office_exception", window_kind: "exact" | "within" }] }
 *   product.public_private_tariff_rules = { version: 1, extra_person_basis: "per_window",
 *     discount: { percent, threshold, unit: "lessons" | "minutes", scope }, affects_operational_pricing: false }
 * Every number shown comes from these fields; nothing here authorizes, quotes or prices a booking.
 */
export interface PrivateTimeWindow {
  start: string;
  end: string;
  duration_minutes: number;
  amount_chf: number;
  extra_person_chf?: number | null;
  classification: "standard" | "office_exception";
  window_kind: "exact" | "within";
}
export interface PublicPrivateTimeTariffs {
  version: 1;
  purpose: "display_information_only";
  currency: "CHF";
  base_persons: 1;
  windows: PrivateTimeWindow[];
}
export interface PublicPrivateTariffRules {
  version: 1;
  extra_person_basis: "per_window";
  discount?: { percent: number; threshold: number; unit: "lessons" | "minutes"; scope?: string } | null;
  affects_operational_pricing: false;
}

const clock = (s: unknown): s is string => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const mins = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
const pos = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;
const posInt = (n: unknown): n is number => pos(n) && Number.isInteger(n);

function validWindow(w: unknown): w is PrivateTimeWindow {
  if (!w || typeof w !== "object") return false;
  const x = w as Record<string, unknown>;
  if (!clock(x.start) || !clock(x.end) || !posInt(x.duration_minutes) || !pos(x.amount_chf)) return false;
  if (x.extra_person_chf != null && !pos(x.extra_person_chf)) return false;
  const span = mins(x.end) - mins(x.start);
  if (x.classification === "standard" && x.window_kind === "exact") return span === x.duration_minutes;
  if (x.classification === "office_exception" && x.window_kind === "within") return span >= x.duration_minutes;
  return false;
}

/** All-or-nothing: any contract mismatch yields [] so the UI falls back to "auf Anfrage". */
export function validTimeWindows(raw: unknown): PrivateTimeWindow[] {
  if (!raw || typeof raw !== "object") return [];
  const c = raw as Record<string, unknown>;
  if (c.version !== 1 || c.purpose !== "display_information_only" || c.currency !== "CHF" || c.base_persons !== 1) return [];
  if (!Array.isArray(c.windows) || c.windows.length === 0 || !c.windows.every(validWindow)) return [];
  return (c.windows as PrivateTimeWindow[]).slice().sort((a, b) =>
    Number(a.classification === "office_exception") - Number(b.classification === "office_exception")
    || a.duration_minutes - b.duration_minutes || a.start.localeCompare(b.start));
}

const durLabel = (m: number) => (m === 60 ? "eine Stunde" : `${m} Min.`);

export interface PrivateTariffView {
  summary: { label: string; value: string }[];
  groups: { label: string; rows: { label: string; chf: string }[] }[];
  footnotes: string[];
}

export function privateTariffView(p: { public_private_time_tariffs?: unknown; public_private_tariff_rules?: unknown }): PrivateTariffView | null {
  const all = validTimeWindows(p.public_private_time_tariffs);
  if (all.length === 0) return null;
  const standard = all.filter((w) => w.classification === "standard");
  const office = all.filter((w) => w.classification === "office_exception");
  const amounts = (d: number) => standard.filter((w) => w.duration_minutes === d).map((w) => w.amount_chf);
  const singles = amounts(60), doubles = amounts(120);
  const summary: PrivateTariffView["summary"] = [];
  if (singles.length) summary.push({ label: "Einzellektion 60 Min.", value: `ab CHF ${Math.min(...singles)}` });
  if (doubles.length) {
    const lo = Math.min(...doubles), hi = Math.max(...doubles);
    summary.push({ label: "Doppellektion 120 Min.", value: lo === hi ? `CHF ${lo}` : `CHF ${lo}–${hi}` });
  }
  const row = (w: PrivateTimeWindow) => ({ label: `${w.start}–${w.end} Uhr`, chf: String(w.amount_chf) });
  // Office exceptions: one row per duration+amount listing all envelopes; never rendered as span-length lessons.
  const officeRows = [...new Set(office.map((w) => `${w.duration_minutes}|${w.amount_chf}`))].map((key) => {
    const [d, a] = key.split("|").map(Number);
    const env = office.filter((w) => w.duration_minutes === d && w.amount_chf === a).map((w) => `${w.start}–${w.end}`);
    return { label: `Innerhalb ${env.join(" / ")} Uhr, ${durLabel(d)}`, chf: String(a) };
  });
  const groups = [
    { label: "Einzellektionen (60 Min.)", rows: standard.filter((w) => w.duration_minutes === 60).map(row) },
    { label: "Doppellektionen (120 Min.)", rows: standard.filter((w) => w.duration_minutes === 120).map(row) },
    { label: "Weitere Zeitfenster", rows: standard.filter((w) => w.duration_minutes !== 60 && w.duration_minutes !== 120).map(row) },
    { label: "Ausnahme nach Absprache mit dem Skischulbüro", rows: officeRows },
  ].filter((g) => g.rows.length > 0);
  return { summary, groups, footnotes: footnotes(standard, p.public_private_tariff_rules) };
}

function footnotes(standard: PrivateTimeWindow[], rawRules: unknown): string[] {
  const parts: string[] = [];
  // One extra-person value per duration, only when every standard window of that duration agrees.
  const extras = [...new Set(standard.map((w) => w.duration_minutes))].flatMap((d) => {
    const vals = [...new Set(standard.filter((w) => w.duration_minutes === d).map((w) => w.extra_person_chf ?? null))];
    return vals.length === 1 && pos(vals[0]) ? [`${d} Min. CHF ${vals[0]}`] : [];
  });
  if (extras.length) parts.push(`Zusatzperson ${extras.join(", ")}`);
  const r = rawRules && typeof rawRules === "object" ? rawRules as Record<string, unknown> : null;
  if (r && r.version === 1 && r.extra_person_basis === "per_window" && r.affects_operational_pricing === false
    && r.discount && typeof r.discount === "object") {
    const d = r.discount as Record<string, unknown>;
    if (d.unit === "lessons" && posInt(d.threshold) && pos(d.percent) && (d.percent as number) < 100) {
      const day = typeof d.scope === "string" && /day|tag/i.test(d.scope) ? " am Tag" : "";
      parts.push(`ab ${d.threshold} Lektionen${day} ${d.percent} % Rabatt`);
    }
  }
  return parts.length ? [parts.join("; ")] : [];
}

/** Generic 60/120-minute private_rates are time-dependent in reality and must not be shown as flat prices. */
export const isTimeDependentDuration = (minutes: number) => minutes === 60 || minutes === 120;
