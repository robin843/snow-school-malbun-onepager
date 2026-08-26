import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface YetiPriceTier {
  day_count: number;
  cumulative_price: number;
  product_id: string;
}

export interface YetiProduct {
  id: string;
  name: string;
  description: string | null;
  type: string;
  pricing_type: "hourly" | "tiered" | "fixed" | "flat" | string;
  price: number;
  price_tiers: YetiPriceTier[];
  duration_minutes: number | null;
  min_age: number | null;
  max_age: number | null;
  currency: string;
  vat_rate: number | null;
  sort_order: number;
}

/** Products that are not customer-bookable courses. */
const INTERNAL_TYPES = ["office_shift", "lunch"];

const isBookable = (p: YetiProduct) => {
  if (INTERNAL_TYPES.includes(p.type)) return false;
  if (p.pricing_type === "tiered") return p.price_tiers.length > 0;
  return p.price > 0;
};

/** Total price for a product, computed from YETI pricing data. */
export const computeProductTotal = (
  product: YetiProduct | undefined,
  opts: { days: number; hoursPerDay: number; participants: number },
): number => {
  if (!product) return 0;
  const days = Math.max(1, opts.days);
  const participants = Math.max(1, opts.participants);

  if (product.pricing_type === "hourly") {
    return Math.round(product.price * opts.hoursPerDay * days * 100) / 100;
  }

  if (product.pricing_type === "tiered") {
    const tiers = [...product.price_tiers].sort((a, b) => a.day_count - b.day_count);
    if (tiers.length === 0) return 0;
    const match = tiers.filter((t) => t.day_count <= days).pop() ?? tiers[0];
    const extra = Math.max(0, days - match.day_count);
    const lastStep =
      tiers.length > 1
        ? tiers[tiers.length - 1].cumulative_price - tiers[tiers.length - 2].cumulative_price
        : match.cumulative_price;
    return (match.cumulative_price + extra * lastStep) * participants;
  }

  return product.price * participants;
};

export const useYetiProducts = () => {
  const [products, setProducts] = useState<YetiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("yeti-products", {
          method: "GET",
        });
        if (fnError) throw fnError;
        const list: YetiProduct[] = Array.isArray(data?.products) ? data.products : [];
        if (!cancelled) setProducts(list);
      } catch (err) {
        console.error("yeti-products failed:", err);
        if (!cancelled) setError("Kurse konnten nicht geladen werden.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bookable = useMemo(
    () =>
      products
        .filter(isBookable)
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [products],
  );

  const privateProducts = useMemo(() => bookable.filter((p) => p.type === "private"), [bookable]);
  const groupProducts = useMemo(
    () => bookable.filter((p) => p.type.startsWith("group")),
    [bookable],
  );

  return { products, bookable, privateProducts, groupProducts, loading, error };
};
