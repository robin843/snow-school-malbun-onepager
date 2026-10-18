import type { YetiProduct } from "../hooks/useYetiProducts";
import { isTimeDependentDuration } from "./privateTimeTariffs.ts";

export interface ProductTariff {
  label: string;
  group?: string;
  chf: string;
  currency: string;
}

const positive = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;
const text = (s: unknown): s is string => typeof s === "string" && s.trim().length > 0;

const weekdays = ["montags", "dienstags", "mittwochs", "donnerstags", "freitags", "samstags", "sonntags"];
const clockTime = (s: unknown): s is string => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const exactDate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s)
  && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;

const dmy = (d: string) => d.split("-").reverse().join(".");

/** All-or-nothing: any malformed or unordered series falls back to the previous display. One line per series. */
function seriesLines(series: unknown): string[] {
  if (!Array.isArray(series) || series.length === 0) return [];
  let prevSeq = -Infinity, prevEnd = "";
  const valid = series.every((s) => {
    if (!s || typeof s !== "object") return false;
    const { sequence, start_date, end_date, dates, max_selected_days } = s as Record<string, unknown>;
    if (!Number.isInteger(sequence) || (sequence as number) <= prevSeq) return false;
    if (!exactDate(start_date) || !exactDate(end_date) || start_date > end_date || start_date <= prevEnd) return false;
    if (dates != null && !(Array.isArray(dates) && dates.every((d) => exactDate(d) && d >= start_date && d <= end_date))) return false;
    if (max_selected_days != null && !(Number.isInteger(max_selected_days) && (max_selected_days as number) > 0)) return false;
    prevSeq = sequence as number; prevEnd = end_date;
    return true;
  });
  if (!valid) return [];
  const list = series as NonNullable<NonNullable<YetiProduct["public_offering"]>["series"]>;
  return list.map((s, i) => {
    const name = text(s.label) ? s.label.trim() : `Kurs ${i + 1}`;
    if (s.start_date === s.end_date) return `${name}: ${dmy(s.start_date)}`;
    const sameYear = s.start_date.slice(0, 4) === s.end_date.slice(0, 4);
    const start = sameYear ? dmy(s.start_date).slice(0, 6) : dmy(s.start_date);
    return `${name}: ${start}–${dmy(s.end_date)}`;
  });
}

function offeringMetadata(offering: YetiProduct["public_offering"], dayBookable: boolean): YetiProduct["meta"] {
  if (!offering || typeof offering !== "object") return [];
  const lines = seriesLines(offering.series);
  let schedule = "";
  if (lines.length === 0 && text(offering.display_schedule_text)) schedule = offering.display_schedule_text.trim();
  if (lines.length === 0 && !schedule && offering.schedule_kind === "weekly") {
    const days = offering.weekdays;
    if (Array.isArray(days) && days.length > 0 && days.every((d) => Number.isInteger(d) && d >= 1 && d <= 7)) {
      schedule = `Immer ${[...new Set(days)].map((d) => weekdays[d - 1]).join(" / ")}`;
    }
  } else if (lines.length === 0 && !schedule && Array.isArray(offering.dates) && offering.dates.length > 0 && offering.dates.every(exactDate)) {
    schedule = offering.dates.map((d) => d.split("-").reverse().join(".")).join(" / ");
  }
  const rows: YetiProduct["meta"] = lines.length > 0
    ? [...lines, ...(dayBookable ? ["Auch tageweise buchbar"] : [])].map((label) => ({ icon: "calendar" as const, label }))
    : schedule ? [{ icon: "calendar", label: schedule }] : [];
  const blocks = offering.time_blocks;
  if (Array.isArray(blocks) && blocks.length >= 1 && blocks.length <= 2
    && blocks.every((b) => b && clockTime(b.start) && clockTime(b.end) && b.start < b.end)) {
    rows.push({ icon: "clock", label: `${blocks.map((b) => `${b.start}–${b.end}`).join(" / ")} Uhr` });
  }
  return rows;
}

/** Factual card data only: no product-name interpretation, local catalog or price calculation. */
export function productCardData(p: YetiProduct) {
  const tariffs: ProductTariff[] = !text(p.currency) ? [] : p.type === "private"
    ? (Array.isArray(p.private_rates) ? p.private_rates : [])
      .filter((r) => r && positive(r.duration_minutes) && Number.isInteger(r.duration_minutes)
        && !isTimeDependentDuration(r.duration_minutes)
        && positive(r.persons) && Number.isInteger(r.persons) && positive(r.price))
      .slice().sort((a, b) => a.duration_minutes - b.duration_minutes || a.persons - b.persons)
      .map((r) => ({
        label: `${r.duration_minutes / 60} Stunden · ${r.persons} ${r.persons === 1 ? "Person" : "Personen"}`,
        group: "Weitere Dauertarife",
        chf: String(r.price), currency: p.currency,
      }))
    : p.pricing_type === "tiered"
      ? (Array.isArray(p.price_tiers) ? p.price_tiers : [])
        .filter((r) => r && positive(r.day_count) && Number.isInteger(r.day_count) && positive(r.cumulative_price))
        .map((r) => ({ label: `${r.day_count} ${r.day_count === 1 ? "Tag" : "Tage"} · 1 Person`, chf: String(r.cumulative_price), currency: p.currency }))
      : positive(p.price) ? [{ label: positive(p.duration_minutes) ? `${p.duration_minutes} Minuten` : "Preis", chf: String(p.price), currency: p.currency }] : [];

  const meta: YetiProduct["meta"] = (Array.isArray(p.meta) ? p.meta : [])
    .filter((m) => m && ["calendar", "clock", "users", "map"].includes(m.icon) && text(m.label));
  // A Core 1-day price tier is the only grounded signal for "Auch tageweise buchbar".
  const dayBookable = p.pricing_type === "tiered" && Array.isArray(p.price_tiers)
    && p.price_tiers.some((t) => t && t.day_count === 1 && positive(t.cumulative_price));
  const offeringRows = offeringMetadata(p.public_offering, dayBookable);
  // Replace existing rows of the same kind, including duration, instead of duplicating them.
  for (const icon of new Set(offeringRows.map((r) => r.icon))) {
    const rows = offeringRows.filter((r) => r.icon === icon);
    const index = meta.findIndex((m) => m.icon === icon);
    const kept = meta.filter((m) => m.icon !== icon);
    const at = index < 0 ? kept.length : meta.slice(0, index).filter((m) => m.icon !== icon).length;
    kept.splice(at, 0, ...rows);
    meta.splice(0, meta.length, ...kept);
  }
  const audience = p.audience === "kids" ? "Kinder" : p.audience === "adults" ? "Erwachsene" : p.audience === "mixed" ? "Kinder und Erwachsene" : "";
  const validAge = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0;
  const min = validAge(p.min_age) ? p.min_age : null;
  const max = validAge(p.max_age) ? p.max_age : null;
  const ages = min !== null && max !== null && max >= min ? `${min}–${max} Jahre`
    : min !== null && max === null ? `ab ${min} Jahren` : min === null && max !== null ? `bis ${max} Jahre` : "";
  if (!meta.some((m) => m.icon === "users") && (audience || ages)) {
    meta.push({ icon: "users", label: [audience, ages].filter(Boolean).join(" · ") });
  }
  if (!meta.some((m) => m.icon === "clock") && positive(p.duration_minutes)) {
    meta.push({ icon: "clock", label: `${p.duration_minutes} Minuten` });
  }
  return {
    id: p.id,
    title: text(p.title) ? p.title : text(p.name) ? p.name : "",
    subtitle: text(p.subtitle) ? p.subtitle : "",
    meta, tariffs,
    lunchInfo: isFullDayGroup(p) ? LUNCH_INFO : null,
    bookable: p.online_bookable === true,
  };
}

/** Display-only add-on note (Ivo, 2026-10-18); never part of a tariff or checkout. */
export const LUNCH_INFO = "Mittagessen & Betreuung · CHF 30.– pro Person und Tag · optional buchbar";

/** Full day = group product whose Core time_blocks hold a valid morning block and a separate afternoon block. */
export function isFullDayGroup(p: Pick<YetiProduct, "type" | "public_offering">): boolean {
  if (typeof p.type !== "string" || !p.type.startsWith("group")) return false;
  const blocks = p.public_offering?.time_blocks;
  if (!Array.isArray(blocks) || blocks.length !== 2) return false;
  const [a, b] = blocks;
  if (!a || !b || ![a.start, a.end, b.start, b.end].every(clockTime)) return false;
  return a.start < a.end && a.end < b.start && b.start < b.end && a.end <= "12:30" && b.start >= "12:30";
}

/** Legacy group wizard has no authoritative product-level sales schedule contract yet. */
export function legacyCourseMode(productType: "private" | "group", product?: Pick<YetiProduct, "type">): "private" | null {
  return productType === "private" && product?.type === "private" ? "private" : null;
}