import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isOnlineBookable } from "@/lib/publicProductPricing";
export { computeProductTotal } from "@/lib/publicProductPricing";

export interface YetiPriceTier {
  day_count: number;
  cumulative_price: number;
}

export interface YetiProduct {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  type: string;
  discipline: "ski" | "snowboard" | "other";
  audience: "kids" | "adults" | "mixed" | null;
  icon_key: "user" | "users" | "baby" | "calendar" | "snowflake" | "trophy" | "sparkles" | null;
  badge: "beliebt" | "empfohlen" | null;
  requirement: string | null;
  meta: { icon: "calendar" | "clock" | "users" | "map"; label: string }[];
  notes: string[];
  pricing_type: "hourly" | "tiered" | "fixed" | "flat" | string;
  price: number;
  price_tiers: YetiPriceTier[];
  private_rates: { duration_minutes: number; persons: number; price: number }[];
  duration_minutes: number | null;
  min_age: number | null;
  max_age: number | null;
  currency: string;
  sort_order: number;
  online_bookable: boolean;
}

let catalogRequest: Promise<YetiProduct[]> | null = null;
let catalogRequestedAt = 0;

const loadCatalog = (): Promise<YetiProduct[]> => {
  if (!catalogRequest || Date.now() - catalogRequestedAt > 60_000) {
    catalogRequestedAt = Date.now();
    catalogRequest = supabase.functions.invoke("yeti-products", { method: "GET" })
      .then(({ data, error }) => {
        if (error) throw error;
        if (!Array.isArray(data?.products)) throw new Error("Invalid YETI website catalog");
        return data.products as YetiProduct[];
      }).catch((error: unknown) => {
        catalogRequest = null; // Retry after a transient outage on the next visit.
        throw error;
      });
  }
  return catalogRequest;
};

export const useYetiProducts = () => {
  const [products, setProducts] = useState<YetiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await loadCatalog();
        if (!cancelled) setProducts(list);
      } catch (err) {
        console.error("yeti-products failed:", err);
        if (!cancelled) setError("Kurse konnten nicht geladen werden.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const bookable = useMemo(() =>
    products.filter(isOnlineBookable)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
  [products]);
  const privateProducts = useMemo(() => bookable.filter((p) => p.type === "private"), [bookable]);
  const groupProducts = useMemo(() => bookable.filter((p) => p.type.startsWith("group")), [bookable]);

  return { products, bookable, privateProducts, groupProducts, loading, error };
};
