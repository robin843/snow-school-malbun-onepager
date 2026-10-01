export interface PricedProduct {
  type: string;
  pricing_type: string;
  online_bookable: boolean;
  price_tiers: { day_count: number; cumulative_price: number }[];
  private_rates: { duration_minutes: number; persons: number; price: number }[];
}

/** Cards can be visible without allowing web bookings. */
export const isOnlineBookable = (p: PricedProduct): boolean => {
  if (!p.online_bookable) return false;
  if (p.type === "private") return p.private_rates.length > 0;
  return p.type.startsWith("group") && p.price_tiers.length > 0;
};

/** Informational preview only; YETI's server quote wins at reservation. */
export const computeProductTotal = (
  product: PricedProduct | undefined,
  opts: { days: number; hoursPerDay: number; participants: number },
): number => {
  if (!product || !isOnlineBookable(product)) return 0;
  const days = Math.floor(opts.days);
  const persons = Math.floor(opts.participants);
  if (days < 1 || days > (product.type === "private" ? 30 : 5) || persons < 1 || persons > 5) return 0;
  if (product.type === "private") {
    const duration = Math.round(opts.hoursPerDay * 60);
    const exact = product.private_rates.find((r) => r.duration_minutes === duration && r.persons === persons);
    return exact ? exact.price * days : 0;
  }
  if (product.pricing_type === "tiered") {
    const exact = product.price_tiers.find((r) => r.day_count === days);
    return exact ? exact.cumulative_price * persons : 0;
  }
  return 0; // Never extrapolate missing tiers or fall back to the old 75/85 per hour.
};
