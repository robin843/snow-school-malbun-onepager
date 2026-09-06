import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PublicInstructor {
  display_name: string;
  role_label?: string;
  teaser?: string;
  portrait_url?: string;
}

interface CacheEntry {
  at: number;
  team: PublicInstructor[];
}

/** Aligned with the 5 minute proxy cache. */
const STALE_MS = 5 * 60_000;
let memoryCache: CacheEntry | null = null;

const isInstructor = (value: unknown): value is PublicInstructor => {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.display_name === "string" && v.display_name.trim().length > 0;
};


export const useYetiPublicInstructors = () => {
  const fresh = memoryCache && Date.now() - memoryCache.at < STALE_MS ? memoryCache : null;
  const [team, setTeam] = useState<PublicInstructor[]>(fresh?.team ?? []);
  const [isLoading, setIsLoading] = useState(!fresh);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    if (memoryCache && Date.now() - memoryCache.at < STALE_MS) {
      setTeam(memoryCache.team);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("yeti-public-instructors", {
          method: "GET",
        });
        if (error) throw error;

        const list = Array.isArray(data?.team) ? data.team.filter(isInstructor) : [];
        if (data?.error) {
          if (!cancelled) {
            setTeam([]);
            setIsUnavailable(true);
          }
          return;
        }
        memoryCache = { at: Date.now(), team: list };
        if (!cancelled) {
          setTeam(list);
          setIsUnavailable(false);
        }
      } catch {
        if (!cancelled) {
          setTeam([]);
          setIsUnavailable(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { team, isLoading, isUnavailable };
};
