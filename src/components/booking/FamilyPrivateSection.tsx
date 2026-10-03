import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import type { FamilyParticipant } from "@/lib/courseBooking/logic";
import {
  availabilityKey, durationsFor, endFor, rateFor, slotAvailable, timeOptions, toMin,
  type FamilyPrivateChoice, type PrivateContext, type PrivateItem,
} from "@/lib/courseBooking/private";

interface Props {
  ctx: PrivateContext | null;
  sourceError: boolean;
  participants: FamilyParticipant[];
  choices: FamilyPrivateChoice[];
  onChange: (next: FamilyPrivateChoice[]) => void;
  /** Ask the parent to load availability for this product/persons/duration on this date. */
  requestAvailability: (productId: string, persons: number, duration: number, date: string) => void;
  failedKeys: Set<string>;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function FamilyPrivateSection({ ctx, sourceError, participants, choices, onChange, requestAvailability, failedKeys }: Props) {
  useEffect(() => {
    for (const c of choices) for (const it of c.items) {
      if (it.date && it.time_start && it.time_end) requestAvailability(c.product_id, c.participant_refs.length, toMin(it.time_end) - toMin(it.time_start), it.date);
    }
  }, [choices, requestAvailability]);

  if (sourceError) return <p className="text-sm text-destructive">Privatunterricht kann gerade nicht geladen werden und ist daher nicht buchbar.</p>;
  if (!ctx) return <p className="text-sm text-muted-foreground">Privatunterricht wird geladen…</p>;
  if (!ctx.products.length) return <p className="text-sm text-muted-foreground">Privatunterricht ist derzeit nicht online buchbar.</p>;

  const upd = (i: number, patch: Partial<FamilyPrivateChoice>) => onChange(choices.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const updItem = (i: number, k: number, patch: Partial<PrivateItem>) =>
    upd(i, { items: choices[i].items.map((it, j) => (j === k ? { ...it, ...patch } : it)) });

  return (
    <div className="space-y-4">
      <p className="font-semibold">Privatunterricht</p>
      {choices.map((c, i) => {
        const product = ctx.products.find((p) => p.id === c.product_id);
        const eligible = participants.filter((p) => product && p.discipline === product.discipline);
        const persons = c.participant_refs.length;
        return (
          <div key={i} className="rounded-md bg-blush/30 p-3 space-y-3">
            <select className="border rounded-md h-10 px-2 bg-background w-full" value={c.product_id} onChange={(e) => upd(i, { product_id: e.target.value, participant_refs: [], items: [] })}>
              {ctx.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="flex flex-wrap gap-3">
              {eligible.map((p) => (
                <label key={p.ref} className="flex items-center gap-1 text-sm">
                  <Checkbox checked={c.participant_refs.includes(p.ref)} onCheckedChange={(v) => upd(i, { participant_refs: v ? [...c.participant_refs, p.ref] : c.participant_refs.filter((r) => r !== p.ref) })} />
                  {p.first_name} {p.last_name}
                </label>
              ))}
              {!eligible.length && <span className="text-sm text-muted-foreground">Keine passende Person für diese Disziplin.</span>}
            </div>
            {product && persons > 0 && !durationsFor(product, persons).length && <p className="text-sm text-destructive">Für {persons} Personen gibt es keinen Tarif.</p>}
            {product && persons > 0 && c.items.map((it, k) => {
              const durs = durationsFor(product, persons);
              const dur = it.time_start && it.time_end ? toMin(it.time_end) - toMin(it.time_start) : (it.duration_minutes && durs.includes(it.duration_minutes) ? it.duration_minutes : durs[0]);
              const key = availabilityKey(product.id, persons, dur);
              const days = ctx.availability[key];
              const complete = it.date && it.time_start && it.time_end;
              const status = !complete ? "" : failedKeys.has(`${key}|${it.date}`) ? "Verfügbarkeit nicht ladbar – nicht buchbar"
                : !days?.some((d) => d.date === it.date) ? "Verfügbarkeit wird geprüft…"
                : slotAvailable(days, it) ? "verfügbar" : "nicht verfügbar";
              const rate = rateFor(product, dur, persons);
              return (
                <div key={k} className="grid gap-2 sm:grid-cols-5 items-center">
                  <Input type="date" min={today()} value={it.date} onChange={(e) => updItem(i, k, { date: e.target.value })} />
                  <select className="border rounded-md h-10 px-2 bg-background" value={dur} onChange={(e) => updItem(i, k, { duration_minutes: Number(e.target.value), time_start: "", time_end: "" })}>
                    {durs.map((d) => <option key={d} value={d}>{d / 60} Std.</option>)}
                  </select>
                  <select className="border rounded-md h-10 px-2 bg-background" value={it.time_start} onChange={(e) => updItem(i, k, { time_start: e.target.value, time_end: e.target.value ? endFor(e.target.value, dur) : "" })}>
                    <option value="">Startzeit…</option>
                    {timeOptions(product, persons, dur).map((s) => <option key={s} value={s}>{s}–{endFor(s, dur)}</option>)}
                  </select>
                  <span className={status === "verfügbar" ? "text-sm" : "text-sm text-destructive"}>{status}{rate && complete ? ` · Richtpreis CHF ${rate.price}` : ""}</span>
                  <Button variant="ghost" size="sm" onClick={() => upd(i, { items: c.items.filter((_, j) => j !== k) })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              );
            })}
            <div className="flex justify-between">
              <Button variant="outline" size="sm" disabled={!product || !persons || !durationsFor(product, persons).length} onClick={() => upd(i, { items: [...c.items, { date: "", time_start: "", time_end: "" }] })}><Plus className="mr-1 h-4 w-4" />Termin hinzufügen</Button>
              <Button variant="ghost" size="sm" onClick={() => onChange(choices.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={() => onChange([...choices, { kind: "private", participant_refs: [], product_id: ctx.products[0].id, items: [] }])}><Plus className="mr-1 h-4 w-4" />Privatstunde hinzufügen</Button>
      <p className="text-xs text-muted-foreground">Mehrere Personen können dieselbe Privatstunde teilen. Der verbindliche Preis kommt nach der Reservierung von der Skischule.</p>
    </div>
  );
}
