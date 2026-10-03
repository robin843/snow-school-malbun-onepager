import type { Discipline } from "./contract.ts";

/**
 * Private lessons in the family flow, bound to the existing authoritative sources:
 *  - catalog: `yeti-products` (YETI get-website-products) → private products with `private_rates`
 *  - availability: `yeti-availability` (YETI get-availability) → days[].slots[{start,end,free_instructors}]
 * Group courses have no capacity gate; private lessons ALWAYS need a secured free instructor slot and an exact
 * source tariff for (duration, persons). Prices shown are informational; only the server quote is binding.
 */

export interface PrivateRate { duration_minutes: number; persons: number; price: number }
export interface PrivateProduct {
  id: string; name: string; discipline: Discipline; min_age: number | null; max_age: number | null;
  currency: string; private_rates: PrivateRate[];
}
export interface AvailabilitySlot { start: string; end: string; free_instructors: number }
export interface AvailabilityDay { date: string; slots: AvailabilitySlot[] }
/** `duration_minutes` is a UI hint only; the payload sends date/time_start/time_end. */
export interface PrivateItem { date: string; time_start: string; time_end: string; duration_minutes?: number }
export interface FamilyPrivateChoice { kind: "private"; participant_refs: string[]; product_id: string; items: PrivateItem[] }

/** Same start/end grid as the existing private booking UI (Buchung.tsx PRIVATE_TIME_MATRIX). */
export const PRIVATE_TIME_MATRIX: Record<string, string[]> = {
  "09:00": ["10:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
  "10:00": ["12:00", "13:00", "14:00", "15:00", "16:00"],
  "12:00": ["13:00", "14:00", "15:00", "16:00"],
  "13:00": ["14:00", "16:00"],
  "14:00": ["16:00"],
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
export const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export function isValidISODate(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}
const nullableAge = (v: unknown) => v === null || v === undefined || (isNum(v) && v >= 0);
const validRate = (r: unknown): r is PrivateRate =>
  isObj(r) && Number.isInteger(r.duration_minutes) && (r.duration_minutes as number) > 0 &&
  Number.isInteger(r.persons) && (r.persons as number) >= 1 && isNum(r.price) && r.price > 0;

/** Only active, online-bookable, linked private products with a valid tariff matrix; never Carving. */
export function parsePrivateCatalog(json: unknown): PrivateProduct[] {
  if (!isObj(json) || !Array.isArray(json.products)) throw new Error("invalid_catalog");
  return json.products.flatMap((p): PrivateProduct[] => {
    if (!isObj(p) || p.type !== "private" || p.online_bookable !== true || !isStr(p.id) || !isStr(p.name)) return [];
    if (p.discipline !== "ski" && p.discipline !== "snowboard") return [];
    if (/carving/i.test(`${p.name} ${p.title ?? ""}`)) return [];
    if (!nullableAge(p.min_age) || !nullableAge(p.max_age)) return [];
    if (!Array.isArray(p.private_rates) || !p.private_rates.every(validRate) || !p.private_rates.length) return [];
    const keys = p.private_rates.map((r) => `${(r as PrivateRate).duration_minutes}|${(r as PrivateRate).persons}`);
    if (new Set(keys).size !== keys.length) return []; // ambiguous tariff → fail closed
    return [{
      id: p.id, name: p.name, discipline: p.discipline, min_age: (p.min_age as number | null) ?? null,
      max_age: (p.max_age as number | null) ?? null, currency: isStr(p.currency) ? p.currency : "CHF",
      private_rates: p.private_rates as PrivateRate[],
    }];
  });
}

/** Strict availability parse; an `error` field or malformed data fails closed (throws). */
export function parseAvailability(json: unknown): AvailabilityDay[] {
  if (!isObj(json) || json.error || !Array.isArray(json.days)) throw new Error("availability_unavailable");
  return json.days.map((d) => {
    if (!isObj(d) || !isValidISODate(d.date) || !Array.isArray(d.slots)) throw new Error("availability_unavailable");
    const slots = d.slots.map((s) => {
      if (!isObj(s) || typeof s.start !== "string" || typeof s.end !== "string" || !TIME.test(s.start) || !TIME.test(s.end) || !isNum(s.free_instructors)) {
        throw new Error("availability_unavailable");
      }
      return { start: s.start, end: s.end, free_instructors: s.free_instructors };
    });
    return { date: d.date, slots };
  });
}

/** Exact source tariff for (duration, persons) — no interpolation, no per-person multiplication. */
export const rateFor = (p: PrivateProduct, durationMinutes: number, persons: number) =>
  p.private_rates.find((r) => r.duration_minutes === durationMinutes && r.persons === persons) ?? null;

export const durationsFor = (p: PrivateProduct, persons: number) =>
  [...new Set(p.private_rates.filter((r) => r.persons === persons).map((r) => r.duration_minutes))].sort((a, b) => a - b);

/** Start/end pairs from the website grid whose length has an exact tariff. */
export function timeOptions(p: PrivateProduct, persons: number, durationMinutes: number): PrivateItem["time_start"][] {
  if (!rateFor(p, durationMinutes, persons)) return [];
  return Object.entries(PRIVATE_TIME_MATRIX)
    .filter(([s, ends]) => ends.some((e) => toMin(e) - toMin(s) === durationMinutes))
    .map(([s]) => s);
}
export const endFor = (start: string, durationMinutes: number) => {
  const m = toMin(start) + durationMinutes;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** A slot with ≥1 free instructor must cover the whole requested time. */
export function slotAvailable(days: AvailabilityDay[] | undefined, item: PrivateItem): boolean {
  const day = days?.find((d) => d.date === item.date);
  if (!day) return false;
  return day.slots.some((s) => s.free_instructors >= 1 && toMin(s.start) <= toMin(item.time_start) && toMin(s.end) >= toMin(item.time_end));
}

/** Key under which availability for a product/persons/duration combination is cached by the caller. */
export const availabilityKey = (productId: string, persons: number, durationMinutes: number) => `${productId}|${persons}|${durationMinutes}`;

export interface PrivateContext {
  products: PrivateProduct[];
  /** availabilityKey → days; missing key = not loaded/failed → fail closed. */
  availability: Record<string, AvailabilityDay[] | undefined>;
}

export function ageOn(birth: string, on: string): number {
  const [by, bm, bd] = birth.split("-").map(Number);
  const [y, m, d] = on.split("-").map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

export function validatePrivateChoice(
  c: FamilyPrivateChoice,
  people: { ref: string; birth_date: string; discipline: Discipline; excluded?: boolean }[],
  ctx: PrivateContext | undefined,
  today = new Date().toISOString().slice(0, 10),
): string | null {
  if (!ctx) return "Privatunterricht derzeit nicht verfügbar";
  const product = ctx.products.find((p) => p.id === c.product_id);
  if (!product) return "Privatkurs nicht online buchbar";
  if (!c.participant_refs.length) return "Bitte Teilnehmende wählen";
  if (new Set(c.participant_refs).size !== c.participant_refs.length) return "Person doppelt gewählt";
  const ps = c.participant_refs.map((r) => people.find((p) => p.ref === r));
  if (ps.some((p) => !p)) return "Unbekannte Person";
  if (ps.some((p) => p!.excluded)) return "Person ist als «nicht buchen» markiert";
  if (ps.some((p) => p!.discipline !== product.discipline)) return "Disziplin passt nicht";
  if (!c.items.length) return "Bitte mindestens einen Termin wählen";
  const seen = new Set<string>();
  for (const it of c.items) {
    if (!isValidISODate(it.date) || it.date < today) return "Ungültiges Datum";
    if (!TIME.test(it.time_start) || !TIME.test(it.time_end) || toMin(it.time_end) <= toMin(it.time_start)) return "Ungültige Zeit";
    const ends = PRIVATE_TIME_MATRIX[it.time_start];
    if (!ends?.includes(it.time_end)) return "Zeit nicht im Angebot";
    const dur = toMin(it.time_end) - toMin(it.time_start);
    if (!rateFor(product, dur, ps.length)) return `Kein Tarif für ${dur / 60} h mit ${ps.length} Person(en)`;
    for (const p of ps) {
      const a = ageOn(p!.birth_date, it.date);
      if ((product.min_age != null && a < product.min_age) || (product.max_age != null && a > product.max_age)) return "Alter passt nicht";
    }
    if (!slotAvailable(ctx.availability[availabilityKey(product.id, ps.length, dur)], it)) return `Termin ${it.date} ${it.time_start} nicht verfügbar`;
    for (const o of c.items) {
      if (o !== it && o.date === it.date && toMin(o.time_start) < toMin(it.time_end) && toMin(it.time_start) < toMin(o.time_end)) return "Termine überschneiden sich";
    }
    const k = `${it.date}|${it.time_start}`;
    if (seen.has(k)) return "Termin doppelt";
    seen.add(k);
  }
  return null;
}

/** Concrete intervals for overlap checks with group courses. */
export const privateIntervals = (c: FamilyPrivateChoice) =>
  c.items.map((it) => ({ date: it.date, s: toMin(it.time_start), e: toMin(it.time_end) }));
