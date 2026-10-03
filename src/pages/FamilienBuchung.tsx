import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import Sponsoren from "@/components/Sponsoren";
import type { CourseOption } from "@/lib/courseBooking/contract";
import { createCourseBookingClient, FAMILY_BOOKING_ENABLED } from "@/lib/courseBooking/client";
import { FamilyBookingFlow } from "@/lib/courseBooking/flow";
import {
  activeDates, blocksForDate, eligibleOptions, previewPrice, requiresBlock,
  type FamilyGroupChoice, type FamilyParticipant,
} from "@/lib/courseBooking/logic";

const STORE = "family-booking-draft-v1"; // form data only — never the reservation token
const SEASON = { from: "2026-12-01", to: "2027-04-30" };
const emptyCustomer = { email: "", first_name: "", last_name: "", phone: "", street: "", zip: "", city: "", country: "LI" };
type Customer = typeof emptyCustomer;
const newRef = () => `p${Math.random().toString(36).slice(2, 8)}`;
const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("de-CH", { weekday: "short", day: "2-digit", month: "2-digit" });

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

function FamilyBookingInner() {
  const navigate = useNavigate();
  const client = useMemo(() => createCourseBookingClient(), []);
  const flowRef = useRef(new FamilyBookingFlow(client));
  const saved = useMemo(() => { try { return JSON.parse(sessionStorage.getItem(STORE) ?? "null"); } catch { return null; } }, []);

  const [step, setStep] = useState(1);
  const [options, setOptions] = useState<CourseOption[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [participants, setParticipants] = useState<FamilyParticipant[]>(saved?.participants ?? [
    { ref: newRef(), first_name: "", last_name: "", birth_date: "", discipline: "ski", skill_level: "" },
  ]);
  const [choices, setChoices] = useState<FamilyGroupChoice[]>(saved?.choices ?? []);
  const [customer, setCustomer] = useState<Customer>(saved?.customer ?? emptyCustomer);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0);
  const flow = flowRef.current;

  useEffect(() => { sessionStorage.setItem(STORE, JSON.stringify({ participants, choices, customer })); }, [participants, choices, customer]);
  useEffect(() => {
    client.options(SEASON.from, SEASON.to).then(setOptions).catch(() => setLoadError(true));
  }, [client]);
  useEffect(() => {
    const leave = () => void flow.abandon(true);
    window.addEventListener("pagehide", leave);
    return () => { window.removeEventListener("pagehide", leave); leave(); };
  }, [flow]);

  const levels = (d: string) => [...new Set((options ?? []).filter((o) => o.discipline === d && o.skill_level_id).map((o) => o.skill_level_id!))];
  const updP = (ref: string, patch: Partial<FamilyParticipant>) => {
    setParticipants((ps) => ps.map((p) => (p.ref === ref ? { ...p, ...patch } : p)));
    if (patch.birth_date !== undefined || patch.discipline || patch.skill_level !== undefined) setChoices((cs) => cs.filter((c) => c.participant_ref !== ref));
  };
  const optOf = (c: FamilyGroupChoice) => options?.find((o) => o.period_key === c.period_key && o.product_id === c.product_id);

  const goReview = async () => {
    setErrors([]); setBusy(true);
    try { await flow.reserve(options ?? [], participants, choices); setStep(3); }
    catch (e: any) {
      setErrors(e?.errors ?? [e?.status === 409 ? "Mindestens eine Auswahl ist nicht mehr verfügbar. Bitte anpassen." : "Reservierung fehlgeschlagen. Bitte später erneut versuchen."]);
    } finally { setBusy(false); force((n) => n + 1); }
  };
  const back = async (to: number) => { await flow.abandon(); force((n) => n + 1); setStep(to); };
  const finish = async () => {
    setErrors([]); setBusy(true);
    try { await flow.complete(customer, participants.filter((p) => choices.some((c) => c.participant_ref === p.ref))); sessionStorage.removeItem(STORE); }
    catch { setErrors(["Abschluss fehlgeschlagen. Deine Reservierung bleibt bis zum Ablauf bestehen — bitte erneut versuchen."]); }
    finally { setBusy(false); force((n) => n + 1); }
  };

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
              <div key={p.ref} className="grid gap-3 sm:grid-cols-5 items-end border-b pb-4">
                <div><Label>Vorname</Label><Input value={p.first_name} maxLength={100} onChange={(e) => updP(p.ref, { first_name: e.target.value })} /></div>
                <div><Label>Nachname</Label><Input value={p.last_name} maxLength={100} onChange={(e) => updP(p.ref, { last_name: e.target.value })} /></div>
                <div><Label>Geburtsdatum</Label><Input type="date" value={p.birth_date} onChange={(e) => updP(p.ref, { birth_date: e.target.value })} /></div>
                <div><Label>Disziplin / Level</Label>
                  <div className="flex gap-1">
                    <select className="border rounded-md h-10 px-2 bg-background" value={p.discipline} onChange={(e) => updP(p.ref, { discipline: e.target.value as any, skill_level: "" })}>
                      <option value="ski">Ski</option><option value="snowboard">Snowboard</option>
                    </select>
                    <select className="border rounded-md h-10 px-2 bg-background flex-1 min-w-0" value={p.skill_level} onChange={(e) => updP(p.ref, { skill_level: e.target.value })}>
                      <option value="">Level…</option>{levels(p.discipline).map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <Button variant="ghost" disabled={participants.length < 2} onClick={() => { setParticipants((ps) => ps.filter((x) => x.ref !== p.ref)); setChoices((cs) => cs.filter((c) => c.participant_ref !== p.ref)); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => setParticipants((ps) => [...ps, { ref: newRef(), first_name: "", last_name: "", birth_date: "", discipline: "ski", skill_level: "" }])}><Plus className="mr-2 h-4 w-4" />Person hinzufügen</Button>
            <div className="flex justify-end"><Button className="bg-pastel-yellow text-pastel-yellow-foreground hover:bg-pastel-yellow/90" disabled={participants.some((p) => !p.birth_date || !p.skill_level || !p.first_name)} onClick={() => setStep(2)}>Weiter zu den Kursen</Button></div>
          </CardContent></Card>
        )}

        {options && step === 2 && (
          <Card><CardHeader><CardTitle>2. Kurse & Tage wählen</CardTitle></CardHeader><CardContent className="space-y-6">
            {participants.map((p) => {
              const elig = eligibleOptions(options, p);
              const mine = choices.map((c, i) => ({ c, i })).filter((x) => x.c.participant_ref === p.ref);
              return (
                <div key={p.ref} className="space-y-3 border-b pb-4">
                  <p className="font-semibold">{p.first_name} {p.last_name}</p>
                  {elig.length === 0 && <p className="text-sm text-muted-foreground">Für dieses Alter/Level ist aktuell kein Kurs online buchbar.</p>}
                  {mine.map(({ c, i }) => {
                    const o = optOf(c);
                    const upd = (patch: Partial<FamilyGroupChoice>) => setChoices((cs) => cs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                    const price = o ? previewPrice(o, c.dates.length) : null;
                    return (
                      <div key={i} className="rounded-md bg-ice-blue/40 p-3 space-y-2">
                        <select className="border rounded-md h-10 px-2 bg-background w-full" value={`${c.period_key}|${c.product_id}`} onChange={(e) => { const [period_key, product_id] = e.target.value.split("|"); upd({ period_key, product_id, dates: [], block: undefined }); }}>
                          {elig.map((o) => <option key={o.period_key + o.product_id} value={`${o.period_key}|${o.product_id}`}>{o.course_name} – {o.product_name} ({o.duration_minutes / 60} h)</option>)}
                        </select>
                        {o && <div className="flex flex-wrap gap-3">{activeDates(o).map((d) => (
                          <label key={d} className="flex items-center gap-1 text-sm"><Checkbox checked={c.dates.includes(d)} onCheckedChange={(v) => upd({ dates: v ? [...c.dates, d] : c.dates.filter((x) => x !== d) })} />{fmt(d)}</label>
                        ))}</div>}
                        {o && requiresBlock(o) && (
                          <select className="border rounded-md h-10 px-2 bg-background" value={c.block ?? ""} onChange={(e) => upd({ block: e.target.value || undefined })}>
                            <option value="">Zeitblock wählen…</option>
                            {[...new Set(activeDates(o).flatMap((d) => blocksForDate(o, d).map((b) => `${b.time_start}|${b.time_end}`)))].map((b) => { const [s, e] = b.split("|"); return <option key={s} value={s}>{s}–{e}</option>; })}
                          </select>
                        )}
                        {o && !requiresBlock(o) && o.duration_minutes > 120 && <p className="text-xs text-muted-foreground">Umfasst alle Zeitblöcke des Tages.</p>}
                        <div className="flex justify-between text-sm"><span>{price != null ? `Richtpreis CHF ${price}` : c.dates.length ? "Kein Tarif für diese Anzahl Tage" : ""}</span>
                          <Button variant="ghost" size="sm" onClick={() => setChoices((cs) => cs.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button></div>
                      </div>
                    );
                  })}
                  {elig.length > 0 && <Button variant="outline" size="sm" onClick={() => setChoices((cs) => [...cs, { participant_ref: p.ref, period_key: elig[0].period_key, product_id: elig[0].product_id!, dates: [] }])}><Plus className="mr-1 h-4 w-4" />Kurs hinzufügen</Button>}
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">Privatunterricht ist in dieser Familienbuchung noch nicht verfügbar.</p>
            <div className="flex justify-between"><Button variant="outline" onClick={() => setStep(1)}>Zurück</Button>
              <Button className="bg-pastel-yellow text-pastel-yellow-foreground hover:bg-pastel-yellow/90" disabled={busy || !choices.length} onClick={goReview}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Reservieren & prüfen</Button></div>
          </CardContent></Card>
        )}

        {step === 3 && flow.reservation && !flow.invoice && (
          <Card><CardHeader><CardTitle>3. Rechnungsadresse & Abschluss</CardTitle></CardHeader><CardContent className="space-y-4">
            <p className="rounded-md bg-blush/40 p-3">Gesamtbetrag (verbindlich von YETI): <strong>{flow.reservation.currency} {flow.reservation.total_amount.toFixed(2)}</strong> · reserviert bis {new Date(flow.reservation.reservation_expires_at).toLocaleTimeString("de-CH")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(emptyCustomer) as (keyof Customer)[]).map((k) => (
                <div key={k}><Label className="capitalize">{k.replace("_", " ")}</Label><Input value={customer[k]} maxLength={255} onChange={(e) => setCustomer({ ...customer, [k]: e.target.value })} /></div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Zahlung per Rechnung. Bestätigung und Rechnung erhältst du von der Skischule per E-Mail.</p>
            <div className="flex justify-between"><Button variant="outline" disabled={busy} onClick={() => back(2)}>Auswahl ändern</Button>
              <Button className="bg-pastel-yellow text-pastel-yellow-foreground hover:bg-pastel-yellow/90" disabled={busy || Object.values(customer).some((v) => !v.trim())} onClick={finish}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Verbindlich buchen</Button></div>
          </CardContent></Card>
        )}

        {flow.invoice && (
          <Card><CardContent className="p-6 space-y-2">
            <p className="text-xl font-semibold">Buchung abgeschlossen</p>
            <p>Rechnungsnummer: <strong>{flow.invoice.invoice_number}</strong> · Betrag CHF {flow.invoice.total_amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Bestätigung und Rechnung schickt dir die Skischule per E-Mail.</p>
            <Button onClick={() => navigate("/")}>Zur Startseite</Button>
          </CardContent></Card>
        )}
      </div>
      <Sponsoren />
    </div>
  );
}
