import type {
  CourseInstance, CourseOption, CourseTier, CompleteResponse, Discipline, GroupSelection, PrivateSelection, ReserveRequest, ReserveResponse,
} from "./contract.ts";
import { privateIntervals, validatePrivateChoice, type FamilyPrivateChoice, type PrivateContext } from "./private.ts";
export type { FamilyPrivateChoice, PrivateContext } from "./private.ts";

/** Group courses have NO capacity gate (owner decision); only source/active/date/age/level/price checks. Server is authority. */

export interface FamilyParticipant {
  ref: string; first_name: string; last_name: string; birth_date: string; discipline: Discipline; skill_level: string;
  /** Explicitly not booked this time; excluded from reserve AND complete. */
  excluded?: boolean;
}
export interface FamilyGroupChoice {
  kind?: "group";
  participant_ref: string; period_key: string; product_id: string; dates: string[]; block?: string;
}

export type FamilyChoice = FamilyGroupChoice | FamilyPrivateChoice;
export const isPrivate = (c: FamilyChoice): c is FamilyPrivateChoice => c.kind === "private";
export const choiceRefs = (c: FamilyChoice) => (isPrivate(c) ? c.participant_refs : [c.participant_ref]);

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isNullableNum = (v: unknown) => v === null || v === undefined || isNum(v);
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const BLOCK = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

/** Real calendar date (rejects 2027-02-31). */
export function isValidISODate(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}
const isTime = (v: unknown): v is string => typeof v === "string" && TIME.test(v);
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const blockId = (i: { time_start: string; time_end: string }) => `${i.time_start}-${i.time_end}`;

const validInstance = (i: unknown): i is CourseInstance =>
  isObj(i) && isStr(i.instance_id) && isValidISODate(i.date) && isTime(i.time_start) && isTime(i.time_end) &&
  toMin(i.time_end as string) > toMin(i.time_start as string);
const validTier = (t: unknown): t is CourseTier =>
  isObj(t) && Number.isInteger(t.day_count) && (t.day_count as number) >= 1 && isNum(t.price) && t.price > 0 && isStr(t.source_tariff_id);

function validOption(o: unknown): o is CourseOption {
  if (!isObj(o)) return false;
  return isStr(o.period_key) && isStr(o.course_id) && isStr(o.course_name) && typeof o.course_type === "string" &&
    (o.discipline === "ski" || o.discipline === "snowboard") &&
    (o.skill_level_id === null || isStr(o.skill_level_id)) && isNullableNum(o.age_min) && isNullableNum(o.age_max) &&
    Array.isArray(o.teaching_dates) && o.teaching_dates.every(isValidISODate) &&
    Array.isArray(o.cancelled_dates) && o.cancelled_dates.every(isValidISODate) &&
    Array.isArray(o.instances) && o.instances.every(validInstance) &&
    Array.isArray(o.tiers) && o.tiers.every(validTier) &&
    Array.isArray(o.blocks) && o.blocks.every((b) => typeof b === "string" && BLOCK.test(b)) &&
    (o.product_id === null || isStr(o.product_id)) && (o.product_name === null || typeof o.product_name === "string") &&
    isNum(o.duration_minutes) && o.duration_minutes > 0 && typeof o.bookable === "boolean";
}

/** Envelope must be exact; any malformed option is dropped (never shown as available). */
export function parseOptions(json: unknown): CourseOption[] {
  if (!isObj(json) || json.status !== "success" || !Array.isArray(json.options)) throw new Error("invalid_options");
  return json.options.filter(validOption);
}

/** Only real, linked, bookable, non-Carving options with tiers and dates are sellable. */
export function isSellable(o: CourseOption): boolean {
  return o.bookable === true && isStr(o.product_id) && !/carving/i.test(`${o.course_name} ${o.product_name ?? ""}`) &&
    o.tiers.length > 0 && o.blocks.length > 0 && activeDates(o).length > 0;
}

export function activeDates(o: CourseOption): string[] {
  const cancelled = new Set(o.cancelled_dates);
  return [...new Set(o.teaching_dates)].filter((d) => !cancelled.has(d)).sort();
}

export function ageOn(birth: string, on: string): number {
  const [by, bm, bd] = birth.split("-").map(Number);
  const [y, m, d] = on.split("-").map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}
const ageFits = (o: CourseOption, birth: string, date: string) => {
  const a = ageOn(birth, date);
  return (o.age_min == null || a >= o.age_min) && (o.age_max == null || a <= o.age_max);
};

/** 2h courses: choose exactly one real block id. Full (4h) courses: no block, every real block included. */
export const requiresBlock = (o: CourseOption) => o.duration_minutes <= 120;
export const blockIdsOnDate = (o: CourseOption, date: string) =>
  new Set(o.instances.filter((i) => i.date === date).map(blockId));

/** Base eligibility (discipline, level, at least one date the age fits). Each selected date is checked separately. */
export function eligibleOptions(options: CourseOption[], p: FamilyParticipant): CourseOption[] {
  if (!isValidISODate(p.birth_date)) return [];
  return options.filter((o) => isSellable(o) && o.discipline === p.discipline &&
    (!o.skill_level_id || o.skill_level_id === p.skill_level) &&
    activeDates(o).some((d) => ageFits(o, p.birth_date, d)));
}

/** Exact tier only; never extrapolate. Informational — the server quote is binding. */
export function previewPrice(o: CourseOption, days: number): number | null {
  return o.tiers.find((x) => x.day_count === days)?.price ?? null;
}

export function validateChoice(o: CourseOption | undefined, c: FamilyGroupChoice, p: FamilyParticipant | undefined): string | null {
  if (!p) return "Unbekannte Person";
  if (!o) return "Kurs nicht mehr verfügbar";
  if (!eligibleOptions([o], p).length) return "Kurs passt nicht zu Alter/Level/Disziplin";
  if (o.product_id !== c.product_id) return "Kurs nicht verknüpft";
  if (!c.dates.length) return "Bitte mindestens einen Tag wählen";
  if (new Set(c.dates).size !== c.dates.length) return "Doppelter Tag";
  const ok = new Set(activeDates(o));
  if (c.dates.some((d) => !isValidISODate(d) || !ok.has(d))) return "Ungültiges Datum";
  if (c.dates.some((d) => !ageFits(o, p.birth_date, d))) return "Alter passt an mindestens einem Tag nicht";
  if (previewPrice(o, c.dates.length) == null) return "Für diese Anzahl Tage gibt es keinen Tarif";
  if (requiresBlock(o)) {
    if (!c.block) return "Bitte Zeitblock wählen";
    if (!o.blocks.includes(c.block)) return "Ungültiger Zeitblock";
    if (c.dates.some((d) => !blockIdsOnDate(o, d).has(c.block!))) return "Zeitblock nicht an allen Tagen";
  } else {
    if (c.block) return "Zeitblock nicht zulässig";
    if (c.dates.some((d) => { const ids = blockIdsOnDate(o, d); return !o.blocks.every((b) => ids.has(b)); })) {
      return "Ganztageskurs: nicht an allen Tagen beide Zeitblöcke";
    }
  }
  return null;
}

/** Concrete time intervals occupied by a choice. */
function intervals(o: CourseOption, c: FamilyGroupChoice): { date: string; s: number; e: number }[] {
  const ids = requiresBlock(o) ? (c.block ? [c.block] : []) : o.blocks;
  return c.dates.flatMap((date) => ids.map((b) => { const [s, e] = b.split("-"); return { date, s: toMin(s), e: toMin(e) }; }));
}

const nameOk = (s: string) => s.trim().length >= 1 && s.trim().length <= 100;
export function validateParticipant(p: FamilyParticipant): string | null {
  if (!nameOk(p.first_name) || !nameOk(p.last_name)) return "Vor- und Nachname fehlen";
  if (!isValidISODate(p.birth_date) || p.birth_date > new Date().toISOString().slice(0, 10)) return "Geburtsdatum ungültig";
  if (!isStr(p.skill_level)) return "Level fehlt";
  return null;
}

/** Full client-side gate before reserve. Returns human-readable errors (empty = ok). */
export function validateFamily(
  options: CourseOption[], participants: FamilyParticipant[], choices: FamilyChoice[], privateCtx?: PrivateContext,
): string[] {
  const errs: string[] = [];
  const refs = new Set<string>();
  for (const p of participants) {
    if (refs.has(p.ref)) errs.push(`${p.ref}: doppelte Person`);
    refs.add(p.ref);
  }
  const included = participants.filter((p) => !p.excluded);
  if (!included.length) errs.push("Bitte mindestens eine Person buchen");
  for (const p of included) {
    const label = `${p.first_name} ${p.last_name}`.trim() || p.ref;
    const e = validateParticipant(p); if (e) errs.push(`${label}: ${e}`);
    if (!choices.some((c) => choiceRefs(c).includes(p.ref))) errs.push(`${label}: kein Kurs gewählt (oder «nicht buchen» markieren)`);
  }
  const occupied = new Map<string, { date: string; s: number; e: number }[]>();
  const occupy = (ref: string, label: string, next: { date: string; s: number; e: number }[]) => {
    const mine = occupied.get(ref) ?? [];
    if (next.some((a) => mine.some((b) => a.date === b.date && a.s < b.e && b.s < a.e))) errs.push(`${label}: Kurse überschneiden sich`);
    occupied.set(ref, [...mine, ...next]);
  };
  for (const c of choices) {
    if (isPrivate(c)) {
      const e = validatePrivateChoice(c, participants, privateCtx);
      if (e) { errs.push(`Privatunterricht: ${e}`); continue; }
      for (const r of c.participant_refs) occupy(r, participants.find((p) => p.ref === r)!.first_name, privateIntervals(c));
      continue;
    }
    const p = participants.find((x) => x.ref === c.participant_ref);
    if (!p) { errs.push(`${c.participant_ref}: unbekannte Person`); continue; }
    if (p.excluded) { errs.push(`${p.first_name}: ist als «nicht buchen» markiert, hat aber einen Kurs`); continue; }
    const o = options.find((x) => x.period_key === c.period_key && x.product_id === c.product_id);
    const e = validateChoice(o, c, p);
    if (e) { errs.push(`${p.first_name}: ${e}`); continue; }
    occupy(p.ref, p.first_name, intervals(o!, c));
  }
  return errs;
}

export const includedParticipants = (ps: FamilyParticipant[]) => ps.filter((p) => !p.excluded);

/** Requires a valid family (see validateFamily); never silently drops a listed participant. */
export function buildReserveRequest(participants: FamilyParticipant[], choices: FamilyChoice[], idempotencyKey: string): ReserveRequest {
  const included = includedParticipants(participants);
  const missing = included.filter((p) => !choices.some((c) => choiceRefs(c).includes(p.ref)));
  if (missing.length) throw new Error("participant_without_selection");
  return {
    reservation: {
      idempotency_key: idempotencyKey,
      source: "website",
      participants: included.map(({ ref, birth_date, discipline, skill_level }) => ({ ref, birth_date, discipline, skill_level })),
      selections: choices.map((c): GroupSelection | PrivateSelection => isPrivate(c)
        ? {
          kind: "private", participant_refs: [...c.participant_refs], product_id: c.product_id,
          items: [...c.items].sort((a, b) => (a.date + a.time_start).localeCompare(b.date + b.time_start))
            .map(({ date, time_start, time_end }) => ({ date, time_start, time_end })),
        }
        : {
          kind: "group", participant_ref: c.participant_ref, period_key: c.period_key, product_id: c.product_id,
          dates: [...c.dates].sort(), ...(c.block ? { block: c.block } : {}),
        }),
    },
  };
}

/** Canonical fingerprint of the reservation payload without the key. */
export function fingerprint(req: ReserveRequest): string {
  const { idempotency_key: _k, ...rest } = req.reservation;
  return JSON.stringify(rest);
}

const isIsoTs = (v: unknown) => typeof v === "string" && !Number.isNaN(Date.parse(v)) && /^\d{4}-\d{2}-\d{2}T/.test(v);

export function parseReserve(json: unknown): ReserveResponse {
  if (!isObj(json) || !isStr(json.status) || /error|fail|cancel|expired/i.test(json.status) ||
      !isStr(json.ticket_id) || !isStr(json.reservation_token) || typeof json.ticket_number !== "string" ||
      !isNum(json.total_amount) || json.total_amount <= 0 ||
      typeof json.currency !== "string" || !/^[A-Z]{3}$/.test(json.currency) || !isIsoTs(json.reservation_expires_at)) {
    throw new Error("reserve_failed");
  }
  return json as unknown as ReserveResponse;
}
export function parseComplete(json: unknown): CompleteResponse {
  if (!isObj(json) || json.success !== true || !isStr(json.status) || !/^(confirmed|invoice_open|invoice_pending)$/.test(json.status) ||
      !isStr(json.invoice_number) || !isNum(json.total_amount) || json.total_amount <= 0) {
    throw new Error("complete_failed");
  }
  return json as unknown as CompleteResponse;
}
