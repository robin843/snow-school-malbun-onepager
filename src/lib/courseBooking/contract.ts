// Typed mirror of the YETI `course-booking` API v1 (contract_version "bc-2627-website-v1", Core 58fd69b).
// Source evidence: Core supabase/functions/course-booking/fixtures, mirrored in ./fixtures/contract-v1.json.
// Options carry `dates` + per-block `block_dates` + `block_mode` (no instance ids). Group selections send
// `blocks: string[]` (choose_one: exactly one; all: every block). Released/expired holds -> 409 reservation_released.

export const CONTRACT_VERSION = "bc-2627-website-v1";
export type Discipline = "ski" | "snowboard";
export type BlockMode = "all" | "choose_one";

export interface CourseTier { day_count: number; price: number; source_tariff_id: string }

export interface CourseOption {
  period_key: string;
  course_id: string;
  course_name: string;
  course_type: string;
  discipline: Discipline;
  skill_level_id: string | null;
  age_min: number | null;
  age_max: number | null;
  dates: string[];
  cancelled_dates: string[];
  blocks: string[];
  block_dates: Record<string, string[]>;
  block_mode: BlockMode;
  product_id: string | null;
  product_name: string | null;
  duration_minutes: number;
  tiers: CourseTier[];
  bookable: boolean;
  lunch_included?: boolean;
  planning_threshold?: number | null;
}

export interface ReserveParticipant { ref: string; birth_date: string; discipline: Discipline; skill_level: string }
export interface GroupSelection { kind: "group"; participant_ref: string; period_key: string; product_id: string; dates: string[]; blocks: string[] }
export interface PrivateSelection { kind: "private"; participant_refs: string[]; product_id: string; items: { date: string; time_start: string; time_end: string }[] }
export type Selection = GroupSelection | PrivateSelection;

export interface ReserveRequest {
  reservation: { idempotency_key: string; source: "website"; participants: ReserveParticipant[]; selections: Selection[] };
}
export interface ReserveResponse {
  status: "held"; ticket_id: string; ticket_number: string; reservation_token: string;
  reservation_expires_at: string; total_amount: number; currency: string; replayed?: boolean;
}

export interface CompleteRequest {
  ticket_id: string; reservation_token: string; payment_method: "invoice";
  customer: { email: string; first_name: string; last_name: string; phone: string; street: string; zip: string; city: string; country: string };
  participants: (ReserveParticipant & { first_name: string; last_name: string })[];
}
export type DeliveryState = "sent" | "pending" | "failed" | "unknown";
export interface CompleteResponse {
  success: true; status: "confirmed"; invoice_number: string; total_amount: number; currency: string;
  ticket_number?: string; due_date?: string | null; already_confirmed?: boolean;
  delivery: { booking_confirmation: DeliveryState; invoice: DeliveryState };
}

export type CourseBookingAction =
  | { action: "options"; from: string; to: string }
  | ({ action: "reserve" } & ReserveRequest)
  | ({ action: "complete" } & CompleteRequest)
  | { action: "cancel"; ticket_id: string; reservation_token: string };
