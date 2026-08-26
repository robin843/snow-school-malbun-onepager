import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface YetiSlot {
  start: string;
  end: string;
  free_instructors: number;
}

export interface YetiDay {
  date: string;
  fully_booked: boolean;
  is_saturday: boolean;
  is_weekday: boolean;
  weekday: number;
  slots: YetiSlot[];
}

interface Params {
  productId?: string;
  productType: "private" | "group";
  sport: "ski" | "snowboard";
  durationMinutes?: number;
  participantCount: number;
  from: string;
  to: string;
  enabled?: boolean;
}

/** Verfügbarkeit aus YETI für einen Zeitraum (Anzeige-Zeitzone Europe/Zurich). */
export const useYetiAvailability = ({
  productId,
  productType,
  sport,
  durationMinutes,
  participantCount,
  from,
  to,
  enabled = true,
}: Params) => {
  const [days, setDays] = useState<YetiDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!enabled || !from || !to) return;
    // Defensiver Schutz: Ungültige Bereiche nie an die Edge Function senden.
    // Die Seite kann während eines Monatswechsels kurz Zwischenwerte rendern.
    if (to < from) {
      setDays([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("yeti-availability", {
          body: {
            product_id: productId || undefined,
            product_type: productType,
            sport,
            from,
            to,
            duration_minutes: durationMinutes,
            participant_count: participantCount,
          },
        });
        if (fnError) throw fnError;
        if (cancelled) return;
        const list: YetiDay[] = Array.isArray(data?.days) ? data.days : [];
        setDays(list);
        if (data?.error) setError("Verfügbarkeit konnte nicht geladen werden.");
      } catch (err) {
        console.error("yeti-availability failed:", err);
        if (!cancelled) {
          setDays([]);
          setError("Verfügbarkeit konnte nicht geladen werden.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, productType, sport, durationMinutes, participantCount, from, to, enabled, reloadKey]);

  const byDate = useMemo(() => {
    const map: Record<string, YetiDay> = {};
    for (const d of days) map[d.date] = d;
    return map;
  }, [days]);

  return { days, byDate, loading, error, refetch };
};

export const dayHasCapacity = (day: YetiDay | undefined) =>
  Boolean(day && !day.fully_booked && day.slots.some((s) => s.free_instructors > 0));
