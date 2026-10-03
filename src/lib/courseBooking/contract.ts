// Typed mirror of the YETI `course-booking` action envelope (issue #36).
// ASSUMPTION: core commit 1073dc95 was not readable from this workspace; shapes follow the
// envelope supplied in the issue. Unknown/extra fields are ignored, missing required fields fail closed.

export type Discipline = "ski" | "snowboard";

export interface CourseInstance { instance_id: string; date: string; time_start: string; time_end: string }
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
  teaching_dates: string[];
  cancelled_dates: string[];
  instances: CourseInstance[];
  product_id: string | null;
  product_name: string | null;
  duration_minutes: number;
  blocks: number;
  tiers: CourseTier[];
  bookable: boolean;
}

export interface OptionsResponse { status: "success"; options: CourseOption[]; informational: unknown[] }

export interface ReserveParticipant { ref: string; birth_date: string; discipline: Discipline; skill_level: string }
export interface GroupSelection { kind: "group"; participant_ref: string; period_key: string; product_id: string; dates: string[]; block?: string }
export interface PrivateSelection { kind: "private"; participant_refs: string[]; product_id: string; items: { date: string; time_start: string; time_end: string }[] }
export type Selection = GroupSelection | PrivateSelection;

export interface ReserveRequest {
  reservation: { idempotency_key: string; source: "website"; participants: ReserveParticipant[]; selections: Selection[] };
}
export interface ReserveResponse {
  status: string; ticket_id: string; ticket_number: string; reservation_token: string;
  reservation_expires_at: string; total_amount: number; currency: string; quote?: unknown;
}

export interface CompleteRequest {
  ticket_id: string; reservation_token: string; payment_method: "invoice";
  customer: { email: string; first_name: string; last_name: string; phone: string; street: string; zip: string; city: string; country: string };
  participants: (ReserveParticipant & { first_name: string; last_name: string })[];
}
export interface CompleteResponse { success: boolean; status: string; invoice_number: string; total_amount: number; delivery?: unknown }

export type CourseBookingAction =
  | { action: "options"; from: string; to: string }
  | ({ action: "reserve" } & ReserveRequest)
  | ({ action: "complete" } & CompleteRequest)
  | { action: "cancel"; ticket_id: string; reservation_token: string };
