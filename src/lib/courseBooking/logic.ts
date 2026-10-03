import type {
  CourseOption, CompleteResponse, Discipline, GroupSelection, OptionsResponse, ReserveRequest, ReserveResponse,
} from "./contract.ts";

/** Group courses have NO capacity gate (owner decision); only source/active/date/age/level/price checks. */

export interface FamilyParticipant {
  ref: string; first_name: string; last_name: string; birth_date: string; discipline: Discipline; skill_level: string;
}
export interface FamilyGroupChoice {
  participant_ref: string; period_key: string; product_id: string; dates: string[]; block?: string;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Strict parse; any malformed option is dropped, a malformed envelope throws (fail closed). */
export function parseOptions(json: unknown): CourseOption[] {
  if (!isObj(json) || json.status !== "success" || !Array.isArray(json.options)) throw new Error("invalid_options");
  return (json as unknown as OptionsResponse).options.filter((o): o is CourseOption =>
    isObj(o) && isStr(o.period_key) && isStr(o.course_id) && isStr(o.course_name) &&
    (o.discipline === "ski" || o.discipline === "snowboard") &&
    Array.isArray(o.teaching_dates) && Array.isArray(o.instances) && Array.isArray(o.tiers) &&
    isNum(o.duration_minutes) && typeof o.bookable === "boolean");
}

/** Only real, linked, bookable, non-Carving options are sellable. */
export function isSellable(o: CourseOption): boolean {
  return o.bookable === true && isStr(o.product_id) && !/carving/i.test(`${o.course_name} ${o.product_name ?? ""}`) &&
    o.tiers.length > 0 && activeDates(o).length > 0;
}

export function activeDates(o: CourseOption): string[] {
  const cancelled = new Set(o.cancelled_dates ?? []);
  return [...new Set(o.teaching_dates)].filter((d) => !cancelled.has(d)).sort();
}

export function ageOn(birth: string, on: string): number {
  const [by, bm, bd] = birth.split("-").map(Number);
  const [y, m, d] = on.split("-").map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

/** 2h options with more than one instance per date require choosing a concrete block; 4h includes all. */
export function blocksForDate(o: CourseOption, date: string) {
  return o.instances.filter((i) => i.date === date).sort((a, b) => a.time_start.localeCompare(b.time_start));
}
export function requiresBlock(o: CourseOption): boolean {
  return o.duration_minutes <= 120 && activeDates(o).some((d) => blocksForDate(o, d).length > 1);
}

export function eligibleOptions(options: CourseOption[], p: FamilyParticipant): CourseOption[] {
  return options.filter((o) => {
    if (!isSellable(o) || o.discipline !== p.discipline) return false;
    if (o.skill_level_id && o.skill_level_id !== p.skill_level) return false;
    const first = activeDates(o)[0];
    if (!p.birth_date || !first) return false;
    const age = ageOn(p.birth_date, first);
    if (o.age_min != null && age < o.age_min) return false;
    if (o.age_max != null && age > o.age_max) return false;
    return true;
  });
}

/** Exact tier only; never extrapolate. Informational — the server quote is binding. */
export function previewPrice(o: CourseOption, days: number): number | null {
  const t = o.tiers.find((x) => x.day_count === days);
  return t ? t.price : null;
}

export function validateChoice(o: CourseOption | undefined, c: FamilyGroupChoice, p: FamilyParticipant | undefined): string | null {
  if (!o || !p) return "Kurs nicht mehr verfügbar";
  if (!eligibleOptions([o], p).length) return "Kurs passt nicht zu Alter/Level/Disziplin";
  if (o.product_id !== c.product_id) return "Kurs nicht verknüpft";
  if (!c.dates.length) return "Bitte mindestens einen Tag wählen";
  const ok = new Set(activeDates(o));
  if (c.dates.some((d) => !ok.has(d))) return "Ungültiges Datum";
  if (previewPrice(o, c.dates.length) == null) return "Für diese Anzahl Tage gibt es keinen Tarif";
  if (requiresBlock(o)) {
    if (!c.block) return "Bitte Zeitblock wählen";
    if (c.dates.some((d) => !blocksForDate(o, d).some((i) => i.time_start === c.block))) return "Zeitblock nicht an allen Tagen";
  } else if (c.block) return "Zeitblock nicht zulässig";
  return null;
}

export function validateParticipant(p: FamilyParticipant): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.birth_date)) return "Geburtsdatum fehlt";
  if (!p.skill_level) return "Level fehlt";
  return null;
}

export function buildReserveRequest(
  participants: FamilyParticipant[], choices: FamilyGroupChoice[], idempotencyKey: string,
): ReserveRequest {
  const used = new Set(choices.map((c) => c.participant_ref));
  return {
    reservation: {
      idempotency_key: idempotencyKey,
      source: "website",
      participants: participants.filter((p) => used.has(p.ref)).map(({ ref, birth_date, discipline, skill_level }) =>
        ({ ref, birth_date, discipline, skill_level })),
      selections: choices.map((c): GroupSelection => ({
        kind: "group", participant_ref: c.participant_ref, period_key: c.period_key, product_id: c.product_id,
        dates: [...c.dates].sort(), ...(c.block ? { block: c.block } : {}),
      })),
    },
  };
}

/** Canonical fingerprint of the reservation payload without the key. */
export function fingerprint(req: ReserveRequest): string {
  const { idempotency_key: _k, ...rest } = req.reservation;
  return JSON.stringify(rest);
}

/** Same payload → same key (safe retry); changed payload → fresh key. */
export class IdempotencyKeeper {
  private last: { fp: string; key: string } | null = null;
  constructor(private gen: () => string = () => crypto.randomUUID()) {}
  keyFor(fp: string): string {
    if (this.last?.fp === fp) return this.last.key;
    this.last = { fp, key: this.gen() };
    return this.last.key;
  }
}

export function parseReserve(json: unknown): ReserveResponse {
  if (!isObj(json) || !isStr(json.ticket_id) || !isStr(json.reservation_token) || !isNum(json.total_amount) || !isStr(json.currency)) {
    throw new Error("reserve_failed");
  }
  return json as unknown as ReserveResponse;
}
export function parseComplete(json: unknown): CompleteResponse {
  if (!isObj(json) || json.success !== true || !isStr(json.invoice_number) || !isNum(json.total_amount)) throw new Error("complete_failed");
  return json as unknown as CompleteResponse;
}
