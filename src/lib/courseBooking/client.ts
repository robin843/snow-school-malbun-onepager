import type { CourseBookingAction, CompleteRequest, ReserveRequest } from "./contract.ts";
import { parseComplete, parseOptions, parseReserve } from "./logic.ts";

/** Disabled by default: core course-booking API is not deployed yet. */
export const FAMILY_BOOKING_ENABLED = import.meta.env?.VITE_FAMILY_BOOKING_ENABLED === "true";

export type Transport = (body: CourseBookingAction, opts?: { keepalive?: boolean }) => Promise<{ status: number; json: unknown }>;

/** `status` undefined = network/timeout: outcome unknown, caller must keep its recovery identity. */
export class CourseBookingError extends Error {
  status?: number;
  body?: unknown;
  constructor(code: string, status?: number, body?: unknown) { super(code); this.status = status; this.body = body; }
  /** Server error code (e.g. "reservation_released"), retained through the proxy. */
  get code(): string | undefined {
    const b = this.body as { code?: unknown } | null | undefined;
    return b && typeof b === "object" && typeof b.code === "string" ? b.code : undefined;
  }
  get retryable(): boolean | undefined {
    const b = this.body as { retryable?: unknown } | null | undefined;
    return b && typeof b === "object" && typeof b.retryable === "boolean" ? b.retryable : undefined;
  }
  /** The hold behind this identity is gone (released/expired): never reuse its key/token. */
  get released() { return this.code === "reservation_released"; }
  get unknownOutcome() { return this.retryable !== false && (this.status === undefined || this.status >= 500); }
}

/** Calls our server proxy; the YETI API key never reaches the browser. */
export const proxyTransport: Transport = async (body, opts) => {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/course-booking-proxy`, {
    method: "POST",
    keepalive: opts?.keepalive,
    signal: AbortSignal.timeout(30_000),
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
};

export function createCourseBookingClient(t: Transport = proxyTransport) {
  const send = async (code: string, body: CourseBookingAction, opts?: { keepalive?: boolean }) => {
    let r: { status: number; json: unknown };
    try { r = await t(body, opts); } catch { throw new CourseBookingError(code); }
    if (r.status < 200 || r.status >= 300) throw new CourseBookingError(code, r.status, r.json);
    return r.json;
  };
  const parsed = <T>(code: string, fn: (j: unknown) => T, j: unknown) => {
    try { return fn(j); } catch { throw new CourseBookingError(code, 200, j); }
  };
  return {
    async options(from: string, to: string) {
      return parsed("options_unavailable", parseOptions, await send("options_unavailable", { action: "options", from, to }));
    },
    async reserve(req: ReserveRequest) {
      return parsed("reserve_failed", parseReserve, await send("reserve_failed", { action: "reserve", ...req }));
    },
    async complete(req: CompleteRequest) {
      return parsed("complete_failed", parseComplete, await send("complete_failed", { action: "complete", ...req }));
    },
    /** Throws unless the server confirms; callers must not treat a failure as cancelled. */
    async cancel(ticket_id: string, reservation_token: string, keepalive = false) {
      await send("cancel_failed", { action: "cancel", ticket_id, reservation_token }, { keepalive });
    },
  };
}
export type CourseBookingClient = ReturnType<typeof createCourseBookingClient>;
