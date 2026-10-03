import type { CourseBookingAction, CompleteRequest, ReserveRequest } from "./contract.ts";
import { parseComplete, parseOptions, parseReserve } from "./logic.ts";

/** Disabled by default: core course-booking API is not deployed yet. */
export const FAMILY_BOOKING_ENABLED = import.meta.env?.VITE_FAMILY_BOOKING_ENABLED === "true";

export type Transport = (body: CourseBookingAction, opts?: { keepalive?: boolean }) => Promise<{ status: number; json: unknown }>;

/** Calls our server proxy; the YETI API key never reaches the browser. */
export const proxyTransport: Transport = async (body, opts) => {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/course-booking-proxy`, {
    method: "POST",
    keepalive: opts?.keepalive,
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
};

const ok = (r: { status: number }) => r.status >= 200 && r.status < 300;

export function createCourseBookingClient(t: Transport = proxyTransport) {
  return {
    async options(from: string, to: string) {
      const r = await t({ action: "options", from, to });
      if (!ok(r)) throw new Error("options_unavailable");
      return parseOptions(r.json);
    },
    async reserve(req: ReserveRequest) {
      const r = await t({ action: "reserve", ...req });
      if (!ok(r)) throw Object.assign(new Error("reserve_failed"), { status: r.status, body: r.json });
      return parseReserve(r.json);
    },
    async complete(req: CompleteRequest) {
      const r = await t({ action: "complete", ...req });
      if (!ok(r)) throw new Error("complete_failed");
      return parseComplete(r.json);
    },
    async cancel(ticket_id: string, reservation_token: string, keepalive = false) {
      await t({ action: "cancel", ticket_id, reservation_token }, { keepalive }).catch(() => undefined);
    },
  };
}
export type CourseBookingClient = ReturnType<typeof createCourseBookingClient>;
