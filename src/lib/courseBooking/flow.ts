import type { CourseOption, CompleteRequest, ReserveResponse, CompleteResponse } from "./contract.ts";
import type { CourseBookingClient } from "./client.ts";
import { CourseBookingError } from "./client.ts";
import {
  buildReserveRequest, fingerprint, includedParticipants, validateFamily,
  type FamilyGroupChoice, type FamilyParticipant,
} from "./logic.ts";

/** Recovery identity, persisted (tab-scoped) so retry/reload never creates a blind second booking. */
export interface FlowState {
  fp: string | null;
  key: string | null;
  reservation: ReserveResponse | null;
  completeAttempted: boolean;
  /** Last reserve outcome unknown (timeout/5xx): only an identical retry is allowed. */
  reservePending: boolean;
  invoice: CompleteResponse | null;
}
export interface FlowStore { load(): FlowState | null; save(s: FlowState | null): void }
export const memoryStore = (): FlowStore => { let v: FlowState | null = null; return { load: () => v && structuredClone(v), save: (s) => { v = s && structuredClone(s); } }; };
export const sessionStore = (name = "family-booking-flow-v1"): FlowStore => ({
  load: () => { try { return JSON.parse(sessionStorage.getItem(name) ?? "null"); } catch { return null; } },
  save: (s) => { if (s) sessionStorage.setItem(name, JSON.stringify(s)); else sessionStorage.removeItem(name); },
});

const empty = (): FlowState => ({ fp: null, key: null, reservation: null, completeAttempted: false, reservePending: false, invoice: null });

/** Framework-free controller: one reservation, one server total, one invoice. */
export class FamilyBookingFlow {
  private s: FlowState;
  private client: CourseBookingClient;
  private store: FlowStore;
  private gen: () => string;

  constructor(client: CourseBookingClient, opts: { store?: FlowStore; genKey?: () => string } = {}) {
    this.client = client;
    this.store = opts.store ?? memoryStore();
    this.gen = opts.genKey ?? (() => crypto.randomUUID());
    this.s = this.store.load() ?? empty();
  }
  get reservation() { return this.s.reservation; }
  get invoice() { return this.s.invoice; }
  /** A completion was sent but its outcome is unknown → only retry complete (idempotent), never re-reserve. */
  get completionPending() { return this.s.completeAttempted && !this.s.invoice; }
  get idempotencyKey() { return this.s.key; }
  get reservePending() { return this.s.reservePending; }
  private persist() { this.store.save(this.s); }

  validate(options: CourseOption[], participants: FamilyParticipant[], choices: FamilyGroupChoice[]) {
    return validateFamily(options, participants, choices);
  }

  /** Identical payload reuses key (safe retry after network loss); changed payload cancels the old hold first. */
  async reserve(options: CourseOption[], participants: FamilyParticipant[], choices: FamilyGroupChoice[]) {
    if (this.s.invoice || this.s.completeAttempted) throw new Error("completion_pending");
    const errs = this.validate(options, participants, choices);
    if (errs.length) throw Object.assign(new Error("invalid_selection"), { errors: errs });
    const draft = buildReserveRequest(participants, choices, "");
    const fp = fingerprint(draft);
    if (this.s.reservation && this.s.fp === fp) return this.s.reservation;
    if (this.s.reservePending && this.s.fp !== fp) throw new Error("reserve_pending_retry");
    if (this.s.reservation) await this.abandon(); // throws if cancel not confirmed
    if (this.s.fp !== fp || !this.s.key) { this.s.fp = fp; this.s.key = this.gen(); }
    this.s.reservePending = true;
    this.persist(); // key survives timeouts/reloads
    draft.reservation.idempotency_key = this.s.key;
    try {
      this.s.reservation = await this.client.reserve(draft);
      this.s.reservePending = false;
    } catch (e) {
      // Definitive rejection (4xx / malformed 200): nothing held, payload may change. Unknown outcome: keep pending.
      if (e instanceof CourseBookingError && !e.unknownOutcome) this.s.reservePending = false;
      this.persist();
      throw e;
    }
    this.persist();
    return this.s.reservation;
  }

  /** Retry-safe: re-sends the same ticket/token; the server returns the existing confirmation. */
  async complete(customer: CompleteRequest["customer"], participants: FamilyParticipant[]) {
    if (this.s.invoice) return this.s.invoice;
    if (!this.s.reservation) throw new Error("no_reservation");
    this.s.completeAttempted = true;
    this.persist();
    const invoice = await this.client.complete({
      ticket_id: this.s.reservation.ticket_id,
      reservation_token: this.s.reservation.reservation_token,
      payment_method: "invoice",
      customer,
      participants: includedParticipants(participants).map(({ ref, first_name, last_name, birth_date, discipline, skill_level }) =>
        ({ ref, first_name: first_name.trim(), last_name: last_name.trim(), birth_date, discipline, skill_level })),
    });
    this.s = { ...empty(), invoice };
    this.persist();
    return invoice;
  }

  /** Intentional abandonment. Only on confirmed cancel is the hold dropped and a fresh key forced. */
  async abandon(keepalive = false) {
    if (!this.s.reservation || this.s.invoice) return;
    if (this.s.completeAttempted) throw new Error("completion_pending");
    const r = this.s.reservation;
    try {
      await this.client.cancel(r.ticket_id, r.reservation_token, keepalive);
    } catch (e) {
      throw e instanceof CourseBookingError ? e : new CourseBookingError("cancel_failed");
    }
    this.s = empty(); // fresh key even for an unchanged payload
    this.persist();
  }

  /** After the invoice is shown: drop all local state. */
  reset() { this.s = empty(); this.store.save(null); }
}
