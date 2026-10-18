import type { YetiProduct } from "../hooks/useYetiProducts";

export interface ProductTariff {
  label: string;
  group?: string;
  chf: string;
  currency: string;
}

const positive = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;
const text = (s: unknown): s is string => typeof s === "string" && s.trim().length > 0;

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