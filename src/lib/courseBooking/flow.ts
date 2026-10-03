import type { CourseOption, CompleteRequest, ReserveResponse, CompleteResponse } from "./contract.ts";
import type { CourseBookingClient } from "./client.ts";
import {
  IdempotencyKeeper, buildReserveRequest, fingerprint, validateChoice, validateParticipant,
  type FamilyGroupChoice, type FamilyParticipant,
} from "./logic.ts";

/** Framework-free controller for the family booking: one reservation, one server total, one invoice. */
export class FamilyBookingFlow {
  reservation: ReserveResponse | null = null;
  invoice: CompleteResponse | null = null;
  private reservedFp: string | null = null;
  private keys: IdempotencyKeeper;

  constructor(private client: CourseBookingClient, genKey?: () => string) {
    this.keys = new IdempotencyKeeper(genKey);
  }

  validate(options: CourseOption[], participants: FamilyParticipant[], choices: FamilyGroupChoice[]): string[] {
    const errs: string[] = [];
    if (!choices.length) errs.push("Bitte mindestens einen Kurs wählen");
    for (const p of participants) { const e = validateParticipant(p); if (e) errs.push(`${p.first_name || p.ref}: ${e}`); }
    for (const c of choices) {
      const o = options.find((x) => x.period_key === c.period_key && x.product_id === c.product_id);
      const e = validateChoice(o, c, participants.find((p) => p.ref === c.participant_ref));
      if (e) errs.push(`${c.participant_ref}: ${e}`);
    }
    return errs;
  }

  /** Reserves; an identical retry reuses the key. A changed payload cancels the old hold first. */
  async reserve(options: CourseOption[], participants: FamilyParticipant[], choices: FamilyGroupChoice[]) {
    const errs = this.validate(options, participants, choices);
    if (errs.length) throw Object.assign(new Error("invalid_selection"), { errors: errs });
    const draft = buildReserveRequest(participants, choices, "");
    const fp = fingerprint(draft);
    if (this.reservation && this.reservedFp === fp) return this.reservation;
    if (this.reservation) await this.abandon();
    draft.reservation.idempotency_key = this.keys.keyFor(fp);
    this.reservation = await this.client.reserve(draft);
    this.reservedFp = fp;
    return this.reservation;
  }

  async complete(customer: CompleteRequest["customer"], participants: FamilyParticipant[]) {
    if (this.invoice) return this.invoice; // never a second invoice
    if (!this.reservation) throw new Error("no_reservation");
    const req = buildReserveRequest(participants, [], "");
    void req;
    this.invoice = await this.client.complete({
      ticket_id: this.reservation.ticket_id,
      reservation_token: this.reservation.reservation_token,
      payment_method: "invoice",
      customer,
      participants: participants.map(({ ref, first_name, last_name, birth_date, discipline, skill_level }) =>
        ({ ref, first_name, last_name, birth_date, discipline, skill_level })),
    });
    return this.invoice;
  }

  /** Intentional abandonment (back to edit, leave page). No-op after invoice. */
  async abandon(keepalive = false) {
    if (!this.reservation || this.invoice) return;
    const r = this.reservation;
    this.reservation = null;
    this.reservedFp = null;
    await this.client.cancel(r.ticket_id, r.reservation_token, keepalive);
  }
}
