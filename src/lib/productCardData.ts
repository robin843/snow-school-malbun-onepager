import type { YetiProduct } from "../hooks/useYetiProducts";

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

/** All-or-nothing: any malformed or unordered series falls back to the previous display. */
function seriesLabel(series: unknown): string {
  if (!Array.isArray(series) || series.length === 0) return "";
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
  if (!valid) return "";
  const list = series as NonNullable<NonNullable<YetiProduct["public_offering"]>["series"]>;
  const parts = list.map((s, i) => {
    const sameYear = s.start_date.slice(0, 4) === s.end_date.slice(0, 4);
    const start = sameYear ? dmy(s.start_date).slice(0, 6) : dmy(s.start_date);
    const name = text(s.label) ? s.label.trim() : `Kurs ${i + 1}`;
    return `${name}: ${start}–${dmy(s.end_date)}`;
  });
  const counts = list.map((s) => (Array.isArray(s.dates) ? s.dates.length : 0));
  const maxes = list.map((s) => s.max_selected_days ?? 0);
  if (counts.every((c) => c > 0 && c === counts[0]) && maxes.every((m) => m > 0 && m === maxes[0] && m <= counts[0])) {
    parts.push(maxes[0] < counts[0] ? `je ${counts[0]} Termine, 1–${maxes[0]} wählbar` : `je ${counts[0]} Termine`);
  }
  return parts.join(" · ");
}

function offeringMetadata(offering: YetiProduct["public_offering"]): YetiProduct["meta"] {
  if (!offering || typeof offering !== "object") return [];
  let schedule = seriesLabel(offering.series);
  if (!schedule && text(offering.display_schedule_text)) schedule = offering.display_schedule_text.trim();
  if (!schedule && offering.schedule_kind === "weekly") {
    const days = offering.weekdays;
    if (Array.isArray(days) && days.length > 0 && days.every((d) => Number.isInteger(d) && d >= 1 && d <= 7)) {
      schedule = `Immer ${[...new Set(days)].map((d) => weekdays[d - 1]).join(" / ")}`;
    }
  } else if (!schedule && Array.isArray(offering.dates) && offering.dates.length > 0 && offering.dates.every(exactDate)) {
    schedule = offering.dates.map((d) => d.split("-").reverse().join(".")).join(" / ");
  }
  const rows: YetiProduct["meta"] = schedule ? [{ icon: "calendar", label: schedule }] : [];
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
        && positive(r.persons) && Number.isInteger(r.persons) && positive(r.price))
      .slice().sort((a, b) => a.persons - b.persons || a.duration_minutes - b.duration_minutes)
      .map((r) => ({
        label: `${r.duration_minutes / 60} ${r.duration_minutes === 60 ? "Stunde" : "Stunden"} · ${r.persons} ${r.persons === 1 ? "Person" : "Personen"}`,
        group: r.duration_minutes === 60 ? "Einzellektion (1 Std.)" : r.duration_minutes === 120 ? "Doppellektion (2 Std.)" : `${r.duration_minutes} Minuten`,
        chf: String(r.price), currency: p.currency,
      }))
    : p.pricing_type === "tiered"
      ? (Array.isArray(p.price_tiers) ? p.price_tiers : [])
        .filter((r) => r && positive(r.day_count) && Number.isInteger(r.day_count) && positive(r.cumulative_price))
        .map((r) => ({ label: `${r.day_count} ${r.day_count === 1 ? "Tag" : "Tage"} · 1 Person`, chf: String(r.cumulative_price), currency: p.currency }))
      : positive(p.price) ? [{ label: positive(p.duration_minutes) ? `${p.duration_minutes} Minuten` : "Preis", chf: String(p.price), currency: p.currency }] : [];

  const meta: YetiProduct["meta"] = (Array.isArray(p.meta) ? p.meta : [])
    .filter((m) => m && ["calendar", "clock", "users", "map"].includes(m.icon) && text(m.label));
  const offeringRows = offeringMetadata(p.public_offering);
  // Replace existing rows of the same kind, including duration, instead of duplicating them.
  for (const row of offeringRows) {
    const index = meta.findIndex((m) => m.icon === row.icon);
    if (index < 0) meta.push(row);
    else {
      meta.splice(index, 1, row);
      for (let i = meta.length - 1; i > index; i--) {
        if (meta[i].icon === row.icon) meta.splice(i, 1);
      }
    }
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
    bookable: p.online_bookable === true,
  };
}

/** Legacy group wizard has no authoritative product-level sales schedule contract yet. */
export function legacyCourseMode(productType: "private" | "group", product?: Pick<YetiProduct, "type">): "private" | null {
  return productType === "private" && product?.type === "private" ? "private" : null;
}