/**
 * Display-only projection of Core's optional private time-window tariffs.
 * Assumed contract (pending Core): product.public_private_time_tariffs =
 *   [{ duration_minutes, start_time "HH:MM", end_time "HH:MM", amount_chf, is_office_exception }]
 * and optional product.public_private_price_conditions =
 *   { additional_person?: [{ duration_minutes, amount_chf }], daily_discount?: { min_lessons, percent } }.
 * Every number shown comes from these fields; nothing here authorizes or prices a booking.
 */
export interface PrivateTimeTariff {
  duration_minutes: number;
  start_time: string;
  end_time: string;
  amount_chf: number;
  is_office_exception: boolean;
}
export interface PrivatePriceConditions {
  additional_person?: { duration_minutes: number; amount_chf: number }[] | null;
  daily_discount?: { min_lessons: number; percent: number } | null;
}

const clock = (s: unknown): s is string => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const mins = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
const pos = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;
const posInt = (n: unknown): n is number => pos(n) && Number.isInteger(n);

export function validTimeTariffs(raw: unknown): PrivateTimeTariff[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is PrivateTimeTariff => !!t && typeof t === "object"
    && posInt(t.duration_minutes) && clock(t.start_time) && clock(t.end_time)
    && mins(t.end_time) - mins(t.start_time) === t.duration_minutes
    && pos(t.amount_chf) && typeof t.is_office_exception === "boolean")
    .slice().sort((a, b) => a.duration_minutes - b.duration_minutes
      || Number(a.is_office_exception) - Number(b.is_office_exception) || a.start_time.localeCompare(b.start_time));
}

const range = (xs: number[]) => {
  const lo = Math.min(...xs), hi = Math.max(...xs);
  return lo === hi ? `CHF ${lo}` : `CHF ${lo}–${hi}`;
};

export interface PrivateTariffView {
  summary: { label: string; value: string }[];
  groups: { label: string; rows: { time: string; chf: string }[] }[];
  footnotes: string[];
}

/** Returns null when Core supplies no valid time tariffs (UI then shows "auf Anfrage"). */
export function privateTariffView(p: { public_private_time_tariffs?: unknown; public_private_price_conditions?: unknown }): PrivateTariffView | null {
  const all = validTimeTariffs(p.public_private_time_tariffs);
  if (all.length === 0) return null;
  const regular = all.filter((t) => !t.is_office_exception);
  const office = all.filter((t) => t.is_office_exception);
  const singles = regular.filter((t) => t.duration_minutes === 60).map((t) => t.amount_chf);
  const doubles = regular.filter((t) => t.duration_minutes === 120).map((t) => t.amount_chf);
  const summary = [];
  if (singles.length) summary.push({ label: "Einzellektion 60 Min.", value: `ab CHF ${Math.min(...singles)}` });
  if (doubles.length) summary.push({ label: "Doppellektion 120 Min.", value: range(doubles) });
  const row = (t: PrivateTimeTariff) => ({ time: `${t.start_time}–${t.end_time}`, chf: String(t.amount_chf) });
  const groups = [
    { label: "Einzellektionen (60 Min.)", rows: regular.filter((t) => t.duration_minutes === 60).map(row) },
    { label: "Doppellektionen (120 Min.)", rows: regular.filter((t) => t.duration_minutes === 120).map(row) },
    { label: "Weitere Zeitfenster", rows: regular.filter((t) => t.duration_minutes !== 60 && t.duration_minutes !== 120).map(row) },
    { label: "Einzelstunde im Doppelstundenblock (nur nach Absprache mit dem Skischulbüro)", rows: office.map(row) },
  ].filter((g) => g.rows.length > 0);
  return { summary, groups, footnotes: priceConditionNotes(p.public_private_price_conditions) };
}

export function priceConditionNotes(raw: unknown): string[] {
  if (!raw || typeof raw !== "object") return [];
  const c = raw as PrivatePriceConditions;
  const notes: string[] = [];
  const extra = Array.isArray(c.additional_person)
    ? c.additional_person.filter((a) => a && posInt(a.duration_minutes) && pos(a.amount_chf))
      .slice().sort((a, b) => a.duration_minutes - b.duration_minutes) : [];
  if (extra.length) notes.push(`Zusatzperson ${extra.map((a) => `${a.duration_minutes} Min. CHF ${a.amount_chf}`).join(", ")}`);
  const d = c.daily_discount;
  if (d && posInt(d.min_lessons) && pos(d.percent) && d.percent < 100) notes.push(`ab ${d.min_lessons} Lektionen am Tag ${d.percent} % Rabatt`);
  return notes.length ? [notes.join("; ")] : [];
}

/** Generic 60/120-minute private_rates are time-dependent in reality and must not be shown as flat prices. */
export const isTimeDependentDuration = (minutes: number) => minutes === 60 || minutes === 120;
