import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const PRIVATE_PRODUCT_ID = "f32014c6-06ce-44b1-b862-11fa4e8dc1a1";

const CONSENT = {
  agb_accepted: true,
  agb_version: "1.0",
  privacy_accepted: true,
  privacy_version: "1.0",
};

const CUSTOMER = {
  salutation: "Herr",
  first_name: "Integration",
  last_name: "Test",
  email: "integration.test@example.com",
  phone: "+41791234567",
  street: "Teststrasse 1",
  zip: "9497",
  city: "Triesenberg",
  country: "LI",
};

const PARTICIPANTS = [
  { first_name: "Integration", last_name: "Test", birth_date: "2010-05-05", discipline: "ski", skill_level: "Blau" },
];

const call = async (fn: string, body: unknown) => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON}`, apikey: ANON },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  return { status: res.status, json };
};

/** Nächster Werktag in einigen Tagen — Privatkurs ist Mo–So möglich. */
const futureDate = (offsetDays: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const reserve = (offsetDays: number, start = "10:00", end = "12:00") =>
  call("yeti-reserve", {
    booking: {
      product_id: PRIVATE_PRODUCT_ID,
      product_type: "private",
      sport: "ski",
      dates: [{ date: futureDate(offsetDays), start_time: start, end_time: end }],
      participant_count: 1,
      duration_minutes: 120,
    },
    consent: CONSENT,
  });

Deno.test("1. Reservierung entsteht ohne Kunden- oder Teilnehmerdaten", async () => {
  const { status, json } = await reserve(20);
  assertEquals(status, 200);
  assert(json.success, JSON.stringify(json));
  assert(json.ticket_id && json.reservation_token);
  assert(json.reservation_expires_at);
});

Deno.test("1b. Kunden-/Teilnehmerdaten werden bei der Reservierung abgelehnt", async () => {
  const { status, json } = await call("yeti-reserve", {
    customer: CUSTOMER,
    participants: PARTICIPANTS,
    booking: {
      product_id: PRIVATE_PRODUCT_ID,
      product_type: "private",
      sport: "ski",
      dates: [{ date: futureDate(21), start_time: "10:00", end_time: "12:00" }],
      participant_count: 1,
    },
    consent: CONSENT,
  });
  assertEquals(status, 400);
  assertEquals(json.error, "Validation failed");
});

Deno.test("2.+3. Rechnungsabschluss erzeugt genau eine Rechnung, Wiederholung keine zweite", async () => {
  const r = await reserve(22);
  assert(r.json.success, JSON.stringify(r.json));
  const base = {
    ticket_id: r.json.ticket_id,
    reservation_token: r.json.reservation_token,
    payment_method: "invoice",
    customer: CUSTOMER,
    participants: PARTICIPANTS,
    notes: "Sprache: Deutsch | Integrationstest",
  };

  const first = await call("yeti-confirm", base);
  assert(first.json.success, JSON.stringify(first.json));
  assert(first.json.invoice_number, "erste Bestätigung muss eine Rechnung erzeugen");

  const second = await call("yeti-confirm", base);
  assert(second.json.success, JSON.stringify(second.json));
  assert(
    !second.json.invoice_number || second.json.invoice_number === first.json.invoice_number,
    "Wiederholung darf keine zweite Rechnung erzeugen",
  );
});

Deno.test("4. Onlineabschluss ohne payment_reference wird abgelehnt", async () => {
  const r = await reserve(23);
  assert(r.json.success, JSON.stringify(r.json));
  const { status, json } = await call("yeti-confirm", {
    ticket_id: r.json.ticket_id,
    reservation_token: r.json.reservation_token,
    payment_method: "online",
    customer: CUSTOMER,
    participants: PARTICIPANTS,
  });
  assertEquals(status, 400);
  assert(json.details?.payment_reference, JSON.stringify(json));
});

Deno.test("6. payment_failed hält die Reservierung für einen erneuten Versuch offen", async () => {
  const r = await reserve(24);
  assert(r.json.success, JSON.stringify(r.json));
  const failed = await call("yeti-confirm", {
    ticket_id: r.json.ticket_id,
    reservation_token: r.json.reservation_token,
    payment_method: "online",
    payment_failed: true,
    customer: CUSTOMER,
    participants: PARTICIPANTS,
  });
  assertEquals(failed.status, 200);
  assertEquals(failed.json.payment_failed, true);
  assertEquals(failed.json.success, false);

  // Reservierung ist weiterhin gültig: Rechnungsabschluss klappt anschliessend.
  const retry = await call("yeti-confirm", {
    ticket_id: r.json.ticket_id,
    reservation_token: r.json.reservation_token,
    payment_method: "invoice",
    customer: CUSTOMER,
    participants: PARTICIPANTS,
  });
  assert(retry.json.success, JSON.stringify(retry.json));
});

Deno.test("7. Ungültige/abgelaufene Reservierung kann nicht bestätigt werden", async () => {
  const { status, json } = await call("yeti-confirm", {
    ticket_id: "00000000-0000-4000-8000-000000000000",
    reservation_token: "abgelaufen-oder-unbekannt",
    payment_method: "invoice",
    customer: CUSTOMER,
    participants: PARTICIPANTS,
  });
  assertEquals(status, 200);
  assertEquals(json.success, false);
});

Deno.test("8. Neue Auswahl erzeugt eine eigene Reservierung", async () => {
  const first = await reserve(25, "10:00", "12:00");
  const second = await reserve(25, "14:00", "16:00");
  assert(first.json.success && second.json.success);
  assert(first.json.ticket_id !== second.json.ticket_id);
});
