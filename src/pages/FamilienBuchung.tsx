import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import FamilyPrivateSection from "@/components/booking/FamilyPrivateSection";
import {
  availabilityKey, parseAvailability, parsePrivateCatalog, type FamilyPrivateChoice, type PrivateContext,
} from "@/lib/courseBooking/private";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import Sponsoren from "@/components/Sponsoren";
import type { CourseOption, Discipline } from "@/lib/courseBooking/contract";
import { createCourseBookingClient, CourseBookingError, FAMILY_BOOKING_ENABLED } from "@/lib/courseBooking/client";
import { FamilyBookingFlow, sessionStore } from "@/lib/courseBooking/flow";
import {
  activeDates, blockIdsOnDate, eligibleOptions, includedParticipants, previewPrice, requiresBlock,
  type FamilyGroupChoice, type FamilyParticipant,
} from "@/lib/courseBooking/logic";

const STORE = "family-booking-draft-v1"; // form data (no token)
const SEASON = { from: "2026-12-01", to: "2027-04-30" };
const emptyCustomer = { email: "", first_name: "", last_name: "", phone: "", street: "", zip: "", city: "", country: "LI" };
type Customer = typeof emptyCustomer;
const CUSTOMER_LABELS: Record<keyof Customer, string> = { email: "E-Mail", first_name: "Vorname", last_name: "Nachname", phone: "Telefon", street: "Strasse & Nr.", zip: "PLZ", city: "Ort", country: "Land (z. B. LI, CH)" };
const newRef = () => `p${Math.random().toString(36).slice(2, 8)}`;
const newPerson = (): FamilyParticipant => ({ ref: newRef(), first_name: "", last_name: "", birth_date: "", discipline: "ski", skill_level: "" });
const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("de-CH", { weekday: "short", day: "2-digit", month: "2-digit" });
const blockLabel = (b: string) => b.replace("-", "–");
const cta = "bg-pastel-yellow text-pastel-yellow-foreground hover:bg-pastel-yellow/90";

export default function FamilienBuchung() {
  const navigate = useNavigate();
  if (!FAMILY_BOOKING_ENABLED) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md"><CardContent className="p-6 space-y-4 text-center">
          <p>Die Familienbuchung ist noch nicht freigeschaltet.</p>
          <Button onClick={() => navigate("/")}>Zur Startseite</Button>
        </CardContent></Card>
      </div>
    );
  }
  return <FamilyBookingInner />;
}

function errorText(e: unknown): string[] {
  if (e && typeof e === "object" && "errors" in e && Array.isArray((e as { errors: unknown }).errors)) return (e as { errors: string[] }).errors;
  if (e instanceof CourseBookingError) {
    if (e.message === "cancel_failed") return ["Die bisherige Reservierung konnte nicht aufgehoben werden. Bitte erneut versuchen."];
    if (e.unknownOutcome) return ["Keine Antwort vom Buchungssystem. Bitte mit derselben Auswahl erneut versuchen."];
    if (e.status === 409) return ["Mindestens eine Auswahl ist nicht mehr verfügbar. Bitte anpassen."];
  }
  if (e instanceof Error && e.message === "reserve_pending_retry") return ["Die letzte Reservierung ist noch unklar. Bitte zuerst mit unveränderter Auswahl erneut versuchen."];
  if (e instanceof Error && e.message === "completion_pending") return ["Der Abschluss läuft bereits. Bitte «Verbindlich buchen» erneut drücken, um den Status abzugleichen."];
  return ["Das hat gerade nicht funktioniert. Bitte später erneut versuchen."];
}

function FamilyBookingInner() {
  const navigate = useNavigate();
  const client = useMemo(() => createCourseBookingClient(), []);
  const flowRef = useRef<FamilyBookingFlow | null>(null);
  if (!flowRef.current) flowRef.current = new FamilyBookingFlow(client, { store: sessionStore() });
  const flow = flowRef.current;
  const saved = useMemo(() => { try { return JSON.parse(sessionStorage.getItem(STORE) ?? "null"); } catch { return null; } }, []);

  const [step, setStep] = useState(flow.reservation || flow.invoice ? 3 : 1);
  const [options, setOptions] = useState<CourseOption[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [participants, setParticipants] = useState<FamilyParticipant[]>(saved?.participants ?? [newPerson()]);
  const [choices, setChoices] = useState<FamilyGroupChoice[]>(saved?.choices ?? []);
  const [privateChoices, setPrivateChoices] = useState<FamilyPrivateChoice[]>(saved?.privateChoices ?? []);
  const [privateCtx, setPrivateCtx] = useState<PrivateContext | null>(null);
  const [privateSourceError, setPrivateSourceError] = useState(false);
  const [failedKeys, setFailedKeys] = useState<Set<string>>(new Set());
  const requested = useRef(new Set<string>());
  const [customer, setCustomer] = useState<Customer>(saved?.customer ?? emptyCustomer);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  useEffect(() => { sessionStorage.setItem(STORE, JSON.stringify({ participants, choices, privateChoices, customer })); }, [participants, choices, privateChoices, customer]);
  useEffect(() => {
    supabase.functions.invoke("yeti-products", { method: "GET" })
      .then(({ data, error }) => { if (error) throw error; setPrivateCtx({ products: parsePrivateCatalog(data), availability: {} }); })
      .catch(() => setPrivateSourceError(true));
  }, []);
  const requestAvailability = useCallback((productId: string, persons: number, duration: number, date: string) => {
    const key = availabilityKey(productId, persons, duration);
    const reqKey = `${key}|${date}`;
    const product = privateCtx?.products.find((p) => p.id === productId);
    if (!product || requested.current.has(reqKey)) return;
    requested.current.add(reqKey);
    supabase.functions.invoke("yeti-availability", {
      body: { product_id: productId, product_type: "private", sport: product.discipline, from: date, to: date, duration_minutes: duration, participant_count: persons },
    }).then(({ data, error }) => {
      if (error) throw error;
      const days = parseAvailability(data).filter((d) => d.date === date);
      setPrivateCtx((c) => c && { ...c, availability: { ...c.availability, [key]: [...(c.availability[key] ?? []).filter((d) => d.date !== date), ...days] } });
    }).catch(() => {
      requested.current.delete(reqKey);
      setFailedKeys((f) => new Set(f).add(reqKey));
      setPrivateCtx((c) => c && { ...c, availability: { ...c.availability, [key]: (c.availability[key] ?? []).filter((d) => d.date !== date) } });
    });
  }, [privateCtx?.products]);
  useEffect(() => { client.options(SEASON.from, SEASON.to).then(setOptions).catch(() => setLoadError(true)); }, [client]);
  useEffect(() => {
    const leave = () => { void flow.abandon(true).catch(() => undefined); };
    window.addEventListener("pagehide", leave);
    return () => window.removeEventListener("pagehide", leave);
  }, [flow]);

  const levels = (d: Discipline) => [...new Set((options ?? []).filter((o) => o.discipline === d && o.skill_level_id).map((o) => o.skill_level_id as string))];
  const updP = (ref: string, patch: Partial<FamilyParticipant>) => {
    setParticipants((ps) => ps.map((p) => (p.ref === ref ? { ...p, ...patch } : p)));
    if (patch.birth_date !== undefined || patch.discipline || patch.skill_level !== undefined || patch.excluded) {
      setChoices((cs) => cs.filter((c) => c.participant_ref !== ref));
      setPrivateChoices((cs) => cs.map((c) => ({ ...c, participant_refs: c.participant_refs.filter((r) => r !== ref) })));
    }
  };
  const optOf = (c: FamilyGroupChoice) => options?.find((o) => o.period_key === c.period_key && o.product_id === c.product_id);
  const included = includedParticipants(participants);

  const run = async (fn: () => Promise<unknown>, onOk?: () => void) => {
    setErrors([]); setBusy(true);
    try { await fn(); onOk?.(); } catch (e) { setErrors(errorText(e)); } finally { setBusy(false); rerender(); }
  };
  const allChoices = [...choices, ...privateChoices];
  const reserve = () => run(() => flow.reserve(options ?? [], participants, allChoices, privateCtx ?? undefined), () => setStep(3));
  const backToEdit = () => run(() => flow.abandon(), () => setStep(2));
  const finish = () => run(() => flow.complete(customer, participants), () => sessionStorage.removeItem(STORE));

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="mr-2 h-4 w-4" />Zurück</Button>
        <h1 className="text-3xl font-bold">Familienbuchung</h1>
        {loadError && <p className="flex gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Kursangebot derzeit nicht verfügbar. Online-Buchung ist vorübergehend nicht möglich.</p>}
        {!options && !loadError && <Loader2 className="animate-spin" />}
        {errors.length > 0 && <ul className="rounded-md border border-destructive p-3 text-sm text-destructive">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}

        {options && step === 1 && (
          <Card><CardHeader><CardTitle>1. Teilnehmende</CardTitle></CardHeader><CardContent className="space-y-4">
            {participants.map((p) => (
              <div key={p.ref} className="space-y-2 border-b pb-4">
                <div className="grid gap-3 sm:grid-cols-4 items-end">
                  <div><Label>Vorname</Label><Input value={p.first_name} maxLength={100} onChange={(e) => updP(p.ref, { first_name: e.target.value })} /></div>
                  <div><Label>Nachname</Label><Input value={p.last_name} maxLength={100} onChange={(e) => updP(p.ref, { last_name: e.target.value })} /></div>
                  <div><Label>Geburtsdatum</Label><Input type="date" value={p.birth_date} onChange={(e) => updP(p.ref, { birth_date: e.target.value })} /></div>
                  <div><Label>Disziplin / Level</Label>
                    <div className="flex gap-1">
                      <select className="border rounded-md h-10 px-2 bg-background" value={p.discipline} onChange={(e) => updP(p.ref, { discipline: e.target.value as Discipline, skill_level: "" })}>
                        <option value="ski">Ski</option><option value="snowboard">Snowboard</option>
                      </select>
                      <select className="border rounded-md h-10 px-2 bg-background flex-1 min-w-0" value={p.skill_level} onChange={(e) => updP(p.ref, { skill_level: e.target.value })}>
                        <option value="">Level…</option>{levels(p.discipline).map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!p.excluded} onCheckedChange={(v) => updP(p.ref, { excluded: !!v })} />Diesmal nicht buchen</label>
                  <Button variant="ghost" size="sm" disabled={participants.length < 2} onClick={() => { setParticipants((ps) => ps.filter((x) => x.ref !== p.ref)); setChoices((cs) => cs.filter((c) => c.participant_ref !== p.ref)); setPrivateChoices((cs) => cs.map((c) => ({ ...c, participant_refs: c.participant_refs.filter((r) => r !== p.ref) }))); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={() => setParticipants((ps) => [...ps, newPerson()])}><Plus className="mr-2 h-4 w-4" />Person hinzufügen</Button>
            <div className="flex justify-end"><Button className={cta} disabled={!included.length || included.some((p) => !p.birth_date || !p.skill_level || !p.first_name.trim() || !p.last_name.trim())} onClick={() => setStep(2)}>Weiter zu den Kursen</Button></div>
          </CardContent></Card>
        )}

        {options && step === 2 && (
          <Card><CardHeader><CardTitle>2. Kurse & Tage wählen</CardTitle></CardHeader><CardContent className="space-y-6">
            {included.map((p) => {
              const elig = eligibleOptions(options, p);
              const mine = choices.map((c, i) => ({ c, i })).filter((x) => x.c.participant_ref === p.ref);
              return (
                <div key={p.ref} className="space-y-3 border-b pb-4">
                  <p className="font-semibold">{p.first_name} {p.last_name}</p>
                  {elig.length === 0 && <p className="text-sm text-muted-foreground">Für dieses Alter/Level ist aktuell kein Kurs online buchbar. Bitte zurück und «Diesmal nicht buchen» wählen.</p>}
                  {mine.map(({ c, i }) => {
                    const o = optOf(c);
                    const upd = (patch: Partial<FamilyGroupChoice>) => setChoices((cs) => cs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                    const price = o ? previewPrice(o, c.dates.length) : null;
                    return (
                      <div key={i} className="rounded-md bg-ice-blue/40 p-3 space-y-2">
                        <select className="border rounded-md h-10 px-2 bg-background w-full" value={`${c.period_key}|${c.product_id}`} onChange={(e) => { const [period_key, product_id] = e.target.value.split("|"); upd({ period_key, product_id, dates: [], block: undefined }); }}>
                          {elig.map((x) => <option key={x.period_key + x.product_id} value={`${x.period_key}|${x.product_id}`}>{x.course_name} – {x.product_name} ({x.duration_minutes / 60} h)</option>)}
                        </select>
                        {o && requiresBlock(o) && (
                          <select className="border rounded-md h-10 px-2 bg-background" value={c.block ?? ""} onChange={(e) => upd({ block: e.target.value || undefined, dates: [] })}>
                            <option value="">Zeitblock wählen…</option>
                            {o.blocks.map((b) => <option key={b} value={b}>{blockLabel(b)}</option>)}
                          </select>
                        )}
                        {o && !requiresBlock(o) && <p className="text-xs text-muted-foreground">Ganztags: umfasst {o.blocks.map(blockLabel).join(" und ")}.</p>}
                        {o && (!requiresBlock(o) || c.block) && <div className="flex flex-wrap gap-3">{activeDates(o).filter((d) => {
                          const ids = blockIdsOnDate(o, d);
                          return requiresBlock(o) ? ids.has(c.block as string) : o.blocks.every((b) => ids.has(b));
                        }).map((d) => (
                          <label key={d} className="flex items-center gap-1 text-sm"><Checkbox checked={c.dates.includes(d)} onCheckedChange={(v) => upd({ dates: v ? [...c.dates, d] : c.dates.filter((x) => x !== d) })} />{fmt(d)}</label>
                        ))}</div>}
                        <div className="flex justify-between text-sm"><span>{price != null ? `Richtpreis CHF ${price}` : c.dates.length ? "Kein Tarif für diese Anzahl Tage" : ""}</span>
                          <Button variant="ghost" size="sm" onClick={() => setChoices((cs) => cs.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button></div>
                      </div>
                    );
                  })}
                  {elig.length > 0 && <Button variant="outline" size="sm" onClick={() => setChoices((cs) => [...cs, { participant_ref: p.ref, period_key: elig[0].period_key, product_id: elig[0].product_id as string, dates: [] }])}><Plus className="mr-1 h-4 w-4" />Kurs hinzufügen</Button>}
                </div>
              );
            })}
            <FamilyPrivateSection ctx={privateCtx} sourceError={privateSourceError} participants={included} choices={privateChoices}
              onChange={setPrivateChoices} requestAvailability={requestAvailability} failedKeys={failedKeys} />
            <div className="flex justify-between"><Button variant="outline" onClick={() => setStep(1)}>Zurück</Button>
              <Button className={cta} disabled={busy || !allChoices.length} onClick={reserve}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Reservieren & prüfen</Button></div>
          </CardContent></Card>
        )}

        {step === 3 && flow.reservation && !flow.invoice && (
          <Card><CardHeader><CardTitle>3. Zusammenfassung & Abschluss</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="rounded-md bg-ice-blue/30 p-3 space-y-3 text-sm">
              {included.map((p) => (
                <div key={p.ref}>
                  <p className="font-semibold">{p.first_name} {p.last_name} · {new Date(`${p.birth_date}T00:00:00`).toLocaleDateString("de-CH")} · {p.discipline === "ski" ? "Ski" : "Snowboard"} · {p.skill_level}</p>
                  <ul className="ml-4 list-disc">{choices.filter((c) => c.participant_ref === p.ref).map((c, i) => {
                    const o = optOf(c);
                    return <li key={i}>{o?.course_name} – {o?.product_name}: {[...c.dates].sort().map(fmt).join(", ")} · {c.block ? blockLabel(c.block) : o?.blocks.map(blockLabel).join(" + ")}</li>;
                  })}</ul>
                </div>
              ))}
              {privateChoices.length > 0 && (
                <div>
                  <p className="font-semibold">Privatunterricht</p>
                  <ul className="ml-4 list-disc">{privateChoices.map((c, i) => (
                    <li key={i}>{privateCtx?.products.find((p) => p.id === c.product_id)?.name}: {c.participant_refs.map((r) => participants.find((p) => p.ref === r)?.first_name).join(", ")} · {[...c.items].sort((a, b) => (a.date + a.time_start).localeCompare(b.date + b.time_start)).map((it) => `${fmt(it.date)} ${it.time_start}–${it.time_end}`).join(", ")}</li>
                  ))}</ul>
                </div>
              )}
            </div>
            <p className="rounded-md bg-blush/40 p-3">Gesamtbetrag (verbindlich von YETI): <strong>{flow.reservation.currency} {flow.reservation.total_amount.toFixed(2)}</strong> · reserviert bis {new Date(flow.reservation.reservation_expires_at).toLocaleTimeString("de-CH")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(emptyCustomer) as (keyof Customer)[]).map((k) => (
                <div key={k}><Label>{CUSTOMER_LABELS[k]}</Label><Input value={customer[k]} maxLength={255} disabled={flow.completionPending} onChange={(e) => setCustomer({ ...customer, [k]: e.target.value })} /></div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Zahlung per Rechnung. Bestätigung und Rechnung erhältst du von der Skischule per E-Mail.</p>
            <div className="flex justify-between"><Button variant="outline" disabled={busy || flow.completionPending} onClick={backToEdit}>Auswahl ändern</Button>
              <Button className={cta} disabled={busy || Object.values(customer).some((v) => !v.trim())} onClick={finish}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{flow.completionPending ? "Status abgleichen" : "Verbindlich buchen"}</Button></div>
          </CardContent></Card>
        )}

        {flow.invoice && (
          <Card><CardContent className="p-6 space-y-2">
            <p className="text-xl font-semibold">Buchung abgeschlossen</p>
            <p>Rechnungsnummer: <strong>{flow.invoice.invoice_number}</strong> · Betrag CHF {flow.invoice.total_amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Bestätigung und Rechnung schickt dir die Skischule per E-Mail.</p>
            <Button onClick={() => { flow.reset(); navigate("/"); }}>Zur Startseite</Button>
          </CardContent></Card>
        )}
      </div>
      <Sponsoren />
    </div>
  );
}
