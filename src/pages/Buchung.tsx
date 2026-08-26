import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Building2 } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AGB_VERSION, PRIVACY_VERSION } from "@/config/legal";
import twintLogo from "@/assets/twint-logo.png";
import visaLogo from "@/assets/visa-logo.svg";
import Sponsoren from "@/components/Sponsoren";
import { useYetiProducts, computeProductTotal, type YetiProduct } from "@/hooks/useYetiProducts";


type Discipline = "ski" | "snowboard";
type ProductType = "private" | "group";
type PaymentMethod = "twint" | "kreditkarte" | "ueberweisung" | "postfinance";

interface Participant {
  first_name: string;
  last_name: string;
  birth_date: string;
  discipline: Discipline;
  skill_level_num: number;
}

interface DateSlot {
  date: string;
  start_time: string;
  end_time: string;
}

const LEVEL_MAP: Record<number, string> = {
  1: "anfaenger", 2: "gruen", 3: "blau", 4: "rot", 5: "schwarz", 6: "experte",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "1 – Anfänger (noch nie auf Skiern/Board)",
  2: "2 – Grün (erste sichere Schwünge)",
  3: "3 – Blau (sicher auf blauen Pisten)",
  4: "4 – Rot (sicher auf roten Pisten)",
  5: "5 – Schwarz (schwarze Pisten, Tiefschnee)",
  6: "6 – Experte / Profi",
};

const PRODUCT_LABELS: Record<ProductType, string> = {
  private: "Privatkurs",
  group: "Gruppenkurs",
};

/** Kurs-ID aus der Kursübersicht -> Namens-Hinweis für das passende YETI-Produkt. */
const COURSE_PRODUCT_HINTS: Record<string, string[]> = {
  "windel-wedel": ["windel"],
  "samstagskurse": ["samstag"],
  "ganztages-kinder": ["gruppenkurs"],
  "carving-mittwoch": ["gruppenkurs"],
  "carving-ladies": ["gruppenkurs"],
  "snowboard-anfaenger": ["gruppenkurs"],
  "snowboard-fortgeschritten": ["gruppenkurs"],
  "privat-ski": ["privatstunde 75"],
  "privat-snowboard": ["privatstunde 75"],
};

const priceBasisLabel = (p: YetiProduct) => {
  if (p.pricing_type === "hourly") return `${p.currency} ${p.price}.– / Stunde`;
  if (p.pricing_type === "tiered") {
    const tiers = [...p.price_tiers].sort((a, b) => a.day_count - b.day_count);
    const first = tiers[0];
    return first ? `ab ${p.currency} ${first.cumulative_price}.– / Person` : "–";
  }
  return `${p.currency} ${p.price}.– / Person`;
};

const productFromPrice = (list: YetiProduct[]) => {
  const values = list.map((p) =>
    p.pricing_type === "tiered"
      ? Math.min(...p.price_tiers.map((t) => t.cumulative_price))
      : p.price,
  );
  return values.length ? Math.min(...values) : null;
};


const todayISO = () => new Date().toISOString().slice(0, 10);
const isISODate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface DateFieldProps {
  value: string;
  onChange: (v: string) => void;
  minDate?: Date;
  maxDate?: Date;
  fromYear?: number;
  toYear?: number;
  placeholder?: string;
}

const DateField = ({ value, onChange, minDate, maxDate, fromYear, toYear, placeholder }: DateFieldProps) => {
  const selected = value && isISODate(value) ? parseISO(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-start text-left font-normal h-10", !value && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "dd.MM.yyyy") : <span>{placeholder ?? "Datum wählen"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={de}
          selected={selected}
          onSelect={(d) => d && onChange(toISO(d))}
          disabled={(d) => (minDate ? d < minDate : false) || (maxDate ? d > maxDate : false)}
          captionLayout="dropdown-buttons"
          fromYear={fromYear ?? 1920}
          toYear={toYear ?? new Date().getFullYear() + 2}
          defaultMonth={selected ?? maxDate ?? minDate ?? new Date()}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
          classNames={{
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "hidden",
            caption_dropdowns: "flex gap-2 items-center",
            dropdown:
              "bg-background border border-input rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
            dropdown_month: "relative",
            dropdown_year: "relative",
            vhidden: "sr-only",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

const Buchung = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const [productType, setProductType] = useState<ProductType>(() => {
    const t = searchParams.get("type");
    return t === "group" || t === "private" ? t : "private";
  });
  const [sport, setSport] = useState<Discipline>(() => {
    const s = searchParams.get("sport");
    return s === "snowboard" || s === "ski" ? s : "ski";
  });
  const courseTitles: Record<string, string> = {
    "privat-ski": "Privatkurs Ski",
    "privat-snowboard": "Privatkurs Snowboard",
    "windel-wedel": "Windel-Wedel-Kurs",
    "ganztages-kinder": "Ganztageskurs Kinder",
    "samstagskurse": "Samstagskurse Kinder",
    "carving-mittwoch": "Carvingkurs Erwachsene",
    "carving-ladies": "Carvingkurs Ladies Only",
    "snowboard-anfaenger": "Snowboard Anfängerkurs",
    "snowboard-fortgeschritten": "Snowboard Fortgeschrittenenkurs",
  };
  const courseKey = searchParams.get("course") ?? "";
  const selectedCourseTitle = courseTitles[courseKey];
  const [participantCount, setParticipantCount] = useState(1);
  const [duration, setDuration] = useState<"55" | "115">("115");
  const [dates, setDates] = useState<DateSlot[]>([
    { date: "", start_time: "10:00", end_time: "11:55" },
  ]);
  const [notes, setNotes] = useState("");

  const { privateProducts, groupProducts, loading: productsLoading, error: productsError } = useYetiProducts();
  const [productId, setProductId] = useState<string>("");

  const availableProducts: YetiProduct[] = productType === "private" ? privateProducts : groupProducts;
  const selectedProduct = availableProducts.find((p) => p.id === productId);

  // Passendes YETI-Produkt vorauswählen (Kurs aus der Kursübersicht bzw. erstes Produkt).
  useEffect(() => {
    if (availableProducts.length === 0) return;
    if (availableProducts.some((p) => p.id === productId)) return;
    const hints = COURSE_PRODUCT_HINTS[courseKey] ?? [];
    const hinted = availableProducts.find((p) =>
      hints.some((h) => p.name.toLowerCase().includes(h)),
    );
    setProductId((hinted ?? availableProducts[0]).id);
  }, [availableProducts, productId, courseKey]);


  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const [participants, setParticipants] = useState<Participant[]>([
    { first_name: "", last_name: "", birth_date: "", discipline: "ski", skill_level_num: 1 },
  ]);

  const [salutation, setSalutation] = useState("Herr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("CH");
  const [agb, setAgb] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("twint");

  const syncParticipants = (count: number) => {
    setParticipantCount(count);
    setParticipants((prev) => {
      const next = [...prev];
      while (next.length < count) {
        next.push({ first_name: "", last_name: "", birth_date: "", discipline: sport, skill_level_num: 1 });
      }
      return next.slice(0, count);
    });
  };

  const computeEnd = (start: string, dur: "55" | "115") => {
    const [h, m] = start.split(":").map(Number);
    const mins = h * 60 + m + (dur === "55" ? 55 : 115);
    return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  };

  const updateDate = (idx: number, patch: Partial<DateSlot>) => {
    setDates((prev) => prev.map((d, i) => {
      if (i !== idx) return d;
      const merged = { ...d, ...patch };
      if (productType === "private" && (patch.start_time !== undefined)) {
        merged.end_time = computeEnd(merged.start_time, duration);
      }
      return merged;
    }));
  };

  const addDate = () => setDates([...dates, { date: "", start_time: "10:00", end_time: computeEnd("10:00", duration) }]);
  const removeDate = (idx: number) => setDates(dates.filter((_, i) => i !== idx));

  const onDurationChange = (v: "55" | "115") => {
    setDuration(v);
    setDates((prev) => prev.map((d) => ({ ...d, end_time: computeEnd(d.start_time, v) })));
  };

  const hoursPerDay = productType === "private" ? (duration === "55" ? 1 : 2) : 1;

  const total = useMemo(
    () =>
      computeProductTotal(selectedProduct, {
        days: dates.length,
        hoursPerDay,
        participants: participantCount,
      }),
    [selectedProduct, dates.length, hoursPerDay, participantCount],
  );


  const validateStep1 = () => {
    if (dates.some((d) => !isISODate(d.date) || d.date < todayISO())) {
      toast({ title: "Ungültiges Datum", description: "Bitte ein gültiges, zukünftiges Datum wählen.", variant: "destructive" });
      return false;
    }
    if (productType === "private") {
      if (dates.some((d) => d.start_time < "09:00" || d.end_time > "16:00" || d.end_time <= d.start_time)) {
        toast({ title: "Ungültige Zeit", description: "Zeiten zwischen 09:00 und 16:00, Ende nach Start.", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const validateStep2 = () => {
    if (participantCount !== participants.length) {
      toast({ title: "Teilnehmerzahl stimmt nicht", description: "Bitte die Anzahl der Teilnehmer prüfen.", variant: "destructive" });
      return false;
    }
    for (const p of participants) {
      if (!p.first_name.trim() || !p.last_name.trim() || !isISODate(p.birth_date) || p.birth_date > todayISO()) {
        toast({ title: "Teilnehmer unvollständig", description: "Bitte alle Pflichtfelder ausfüllen.", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || phone.trim().length < 5 || !street.trim() || !zip.trim() || !city.trim()) {
      toast({ title: "Kontaktdaten unvollständig", description: "Bitte alle Pflichtfelder ausfüllen.", variant: "destructive" });
      return false;
    }
    if (!agb || !privacy) {
      toast({ title: "Einwilligung fehlt", description: "Bitte AGB und Datenschutz akzeptieren.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const submit = async () => {
    if (submittingRef.current) return;
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;
    submittingRef.current = true;
    setSubmitting(true);
    let submittedSuccessfully = false;
    try {
      const payload = {
        submission_id: crypto.randomUUID(),
        source: "website" as const,
        customer: { salutation, first_name: firstName, last_name: lastName, email, phone, street, zip, city, country },
        participants: participants.map((p) => ({
          first_name: p.first_name, last_name: p.last_name, birth_date: p.birth_date,
          discipline: p.discipline, skill_level: LEVEL_MAP[p.skill_level_num],
        })),
        booking: {
          product_type: productType, sport, dates,
          participant_count: participantCount,
          notes: notes || undefined,
          payment_method: paymentMethod,
        },
        consent: {
          agb_accepted: true as const, agb_version: AGB_VERSION,
          privacy_accepted: true as const, privacy_version: PRIVACY_VERSION,
        },
      };

      const { data, error } = await supabase.functions.invoke("submit-booking", { body: payload });
      if (error) throw error;
      if (data?.fallback || data?.success === false) {
        throw new Error(data?.message || "Booking submission failed");
      }

      toast({
        title: "Buchung erfolgreich!",
        description: data?.ticket_number
          ? `Ticket-Nr. ${data.ticket_number}. Bestätigung folgt per E-Mail.`
          : "Die Buchung wurde übertragen. Bestätigung folgt per E-Mail.",
      });
      submittedSuccessfully = true;
      setTimeout(() => navigate("/"), 2500);
    } catch (err: any) {
      console.error("Booking submit error:", err);
      toast({
        title: "Buchung fehlgeschlagen",
        description: "Die Buchung konnte gerade nicht übertragen werden. Bitte versuche es in 1–2 Minuten erneut.",
        variant: "destructive",
      });
    } finally {
      if (!submittedSuccessfully) {
        submittingRef.current = false;
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-6 sm:py-8 border-b">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10 mb-3 sm:mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
          </Button>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">Kurs buchen</h1>
          <p className="text-white/90 text-base sm:text-lg">Schritt {step} von 3</p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8 max-w-2xl mx-auto">
            {[{ n: 1, label: "Kurs" }, { n: 2, label: "Teilnehmer" }, { n: 3, label: "Kontakt & Zahlung" }].map((s, i) => (
              <div key={s.n} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-base shrink-0 ${step >= s.n ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {step > s.n ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s.n}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-semibold ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-2 sm:mx-3 ${step > s.n ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <Card>
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle>Kurs konfigurieren</CardTitle>
                    <CardDescription>Produkt, Sport, Termine, Teilnehmer</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {selectedCourseTitle && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                        <span className="text-muted-foreground">Vorausgewählt:</span>
                        <span className="font-semibold text-primary">{selectedCourseTitle}</span>
                      </div>
                    )}
                    <RadioGroup value={productType} onValueChange={(v) => setProductType(v as ProductType)} className="space-y-2">
                      <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer ${productType === "private" ? "border-primary bg-primary/5" : "border-border"}`}>
                        <RadioGroupItem value="private" id="p-private" />
                        <Label htmlFor="p-private" className="flex-1 cursor-pointer">
                          <span className="font-semibold block">Privatkurs</span>
                          <span className="text-sm text-muted-foreground">1–5 Personen, individuelle Termine</span>
                        </Label>
                        <span className="font-bold text-primary whitespace-nowrap">
                          {productFromPrice(privateProducts) !== null ? `ab CHF ${productFromPrice(privateProducts)}.–` : "–"}
                        </span>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer ${productType === "group" ? "border-primary bg-primary/5" : "border-border"}`}>
                        <RadioGroupItem value="group" id="p-group" />
                        <Label htmlFor="p-group" className="flex-1 cursor-pointer">
                          <span className="font-semibold block">Gruppenkurs</span>
                          <span className="text-sm text-muted-foreground">Kurstage Montag–Freitag oder Samstagskurs</span>
                        </Label>
                        <span className="font-bold text-primary whitespace-nowrap">
                          {productFromPrice(groupProducts) !== null ? `ab CHF ${productFromPrice(groupProducts)}.–` : "–"}
                        </span>
                      </div>
                    </RadioGroup>

                    <div className="space-y-2">
                      <Label>Kurs</Label>
                      <Select value={productId} onValueChange={setProductId} disabled={productsLoading || availableProducts.length === 0}>
                        <SelectTrigger>
                          <SelectValue placeholder={productsLoading ? "Kurse werden geladen…" : "Kurs wählen"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} — {priceBasisLabel(p)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {productsError && <p className="text-xs text-destructive">{productsError}</p>}
                      {selectedProduct?.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                      )}
                      {selectedProduct && (selectedProduct.min_age || selectedProduct.max_age) && (
                        <p className="text-xs text-muted-foreground">
                          Alter: {selectedProduct.min_age ?? "–"}
                          {selectedProduct.max_age ? `–${selectedProduct.max_age}` : "+"} Jahre
                        </p>
                      )}
                    </div>


                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sport</Label>
                        <Select value={sport} onValueChange={(v) => setSport(v as Discipline)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ski">Ski</SelectItem>
                            <SelectItem value="snowboard">Snowboard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Anzahl Teilnehmer</Label>
                        <Select value={String(participantCount)} onValueChange={(v) => syncParticipants(Number(v))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "Person" : "Personen"}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {productType === "private" && (
                      <div className="space-y-2">
                        <Label>Lektionsdauer</Label>
                        <RadioGroup value={duration} onValueChange={(v) => onDurationChange(v as "55" | "115")} className="flex gap-3">
                          <div className={`flex-1 flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${duration === "55" ? "border-primary bg-primary/5" : "border-border"}`}>
                            <RadioGroupItem value="55" id="d-55" />
                            <Label htmlFor="d-55" className="cursor-pointer flex-1">Einzellektion (55 min)</Label>
                          </div>
                          <div className={`flex-1 flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${duration === "115" ? "border-primary bg-primary/5" : "border-border"}`}>
                            <RadioGroupItem value="115" id="d-115" />
                            <Label htmlFor="d-115" className="cursor-pointer flex-1">Doppellektion (115 min)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>{productType === "group" ? "Startdatum (Mo der Kurswoche)" : "Termine"}</Label>
                        {productType === "private" && (
                          <Button type="button" size="sm" variant="outline" onClick={addDate}>
                            <Plus className="w-4 h-4 mr-1" /> Termin hinzufügen
                          </Button>
                        )}
                      </div>
                      {dates.map((d, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "grid grid-cols-1 gap-2 items-end p-3 border rounded-lg",
                            productType === "private" && "md:grid-cols-[1fr_auto_auto_auto]"
                          )}
                        >
                          <div className="space-y-1">
                            <Label className="text-xs">Datum</Label>
                            <DateField
                              value={d.date}
                              onChange={(v) => updateDate(idx, { date: v })}
                              minDate={new Date()}
                              fromYear={new Date().getFullYear()}
                              toYear={new Date().getFullYear() + 2}
                              placeholder="Datum wählen"
                            />
                          </div>
                          {productType === "private" && (
                            <>
                              <div className="space-y-1">
                                <Label className="text-xs">Start</Label>
                                <Input type="time" value={d.start_time} min="09:00" max="16:00" onChange={(e) => updateDate(idx, { start_time: e.target.value })} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Ende</Label>
                                <Input type="time" value={d.end_time} min="09:00" max="16:00" readOnly onChange={(e) => updateDate(idx, { end_time: e.target.value })} />
                              </div>
                              {dates.length > 1 && (
                                <Button type="button" size="icon" variant="ghost" onClick={() => removeDate(idx)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Bemerkungen (optional)</Label>
                      <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} placeholder="z.B. bevorzugter Treffpunkt, Sprache, besondere Wünsche" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle>Teilnehmer</CardTitle>
                    <CardDescription>Angaben zu jeder teilnehmenden Person</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {participants.map((p, idx) => (
                      <div key={idx} className="space-y-3 p-4 border rounded-lg">
                        <div className="font-semibold">Person {idx + 1}</div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Vorname *</Label>
                            <Input value={p.first_name} onChange={(e) => setParticipants(participants.map((x, i) => i === idx ? { ...x, first_name: e.target.value } : x))} />
                          </div>
                          <div className="space-y-1">
                            <Label>Nachname *</Label>
                            <Input value={p.last_name} onChange={(e) => setParticipants(participants.map((x, i) => i === idx ? { ...x, last_name: e.target.value } : x))} />
                          </div>
                          <div className="space-y-1">
                            <Label>Geburtsdatum *</Label>
                            <DateField
                              value={p.birth_date}
                              onChange={(v) => setParticipants(participants.map((x, i) => i === idx ? { ...x, birth_date: v } : x))}
                              maxDate={new Date()}
                              fromYear={1920}
                              toYear={new Date().getFullYear()}
                              placeholder="Geburtsdatum wählen"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Disziplin *</Label>
                            <Select value={p.discipline} onValueChange={(v) => setParticipants(participants.map((x, i) => i === idx ? { ...x, discipline: v as Discipline } : x))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ski">Ski</SelectItem>
                                <SelectItem value="snowboard">Snowboard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <Label>Niveau (Selbsteinschätzung)</Label>
                            <Select value={String(p.skill_level_num)} onValueChange={(v) => setParticipants(participants.map((x, i) => i === idx ? { ...x, skill_level_num: Number(v) } : x))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                  <SelectItem key={n} value={String(n)}>{LEVEL_LABELS[n]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <>
                  <Card>
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle>Rechnungsempfänger</CardTitle>
                      <CardDescription>Ihre Angaben für Bestätigung und Rechnung</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid md:grid-cols-[120px_1fr_1fr] gap-3">
                        <div className="space-y-1">
                          <Label>Anrede</Label>
                          <Select value={salutation} onValueChange={setSalutation}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Herr">Herr</SelectItem>
                              <SelectItem value="Frau">Frau</SelectItem>
                              <SelectItem value="Divers">Divers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Vorname *</Label>
                          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Nachname *</Label>
                          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>E-Mail *</Label>
                          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Telefon *</Label>
                          <Input type="tel" value={phone} placeholder="+41 79 123 45 67" onChange={(e) => setPhone(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Strasse & Nr. *</Label>
                        <Input value={street} onChange={(e) => setStreet(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-[100px_1fr_120px] gap-3">
                        <div className="space-y-1">
                          <Label>PLZ *</Label>
                          <Input value={zip} onChange={(e) => setZip(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Ort *</Label>
                          <Input value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                        <div className="space-y-1 col-span-2 sm:col-span-1">
                          <Label>Land *</Label>
                          <Select value={country} onValueChange={setCountry}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CH">CH</SelectItem>
                              <SelectItem value="LI">LI</SelectItem>
                              <SelectItem value="DE">DE</SelectItem>
                              <SelectItem value="AT">AT</SelectItem>
                              <SelectItem value="FR">FR</SelectItem>
                              <SelectItem value="IT">IT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle>Zahlungsmethode</CardTitle>
                      <CardDescription>Wir kontaktieren Sie zur Bezahlung – noch kein direkter Charge.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-3">
                      <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="space-y-2">
                        <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${paymentMethod === "twint" ? "border-[#FFED00] bg-[#FFED00]/5" : "border-border"}`}>
                          <RadioGroupItem value="twint" id="pm-twint" />
                          <img src={twintLogo} alt="TWINT" className="h-7" />
                          <Label htmlFor="pm-twint" className="flex-1 cursor-pointer font-semibold">TWINT</Label>
                        </div>
                        <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${paymentMethod === "kreditkarte" ? "border-primary bg-primary/5" : "border-border"}`}>
                          <RadioGroupItem value="kreditkarte" id="pm-card" />
                          <img src={visaLogo} alt="Visa" className="h-5" />
                          <Label htmlFor="pm-card" className="flex-1 cursor-pointer font-semibold">Kreditkarte</Label>
                        </div>
                        <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${paymentMethod === "ueberweisung" ? "border-primary bg-primary/5" : "border-border"}`}>
                          <RadioGroupItem value="ueberweisung" id="pm-bank" />
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <Label htmlFor="pm-bank" className="flex-1 cursor-pointer font-semibold">Banküberweisung (Rechnung)</Label>
                        </div>
                        <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${paymentMethod === "postfinance" ? "border-primary bg-primary/5" : "border-border"}`}>
                          <RadioGroupItem value="postfinance" id="pm-pf" />
                          <Building2 className="w-5 h-5 text-[#FFCC00]" />
                          <Label htmlFor="pm-pf" className="flex-1 cursor-pointer font-semibold">PostFinance</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle>Einwilligungen</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox checked={agb} onCheckedChange={(c) => setAgb(c === true)} className="mt-1" />
                        <span className="text-sm">Ich akzeptiere die <a href="#" className="underline text-primary">AGB</a> (Version {AGB_VERSION}). *</span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox checked={privacy} onCheckedChange={(c) => setPrivacy(c === true)} className="mt-1" />
                        <span className="text-sm">Ich akzeptiere die <a href="#" className="underline text-primary">Datenschutzerklärung</a> (Version {PRIVACY_VERSION}). *</span>
                      </label>
                    </CardContent>
                  </Card>
                </>
              )}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3)} disabled={step === 1}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
                </Button>
                {step < 3 ? (
                  <Button type="button" onClick={next}>Weiter <ArrowRight className="w-4 h-4 ml-2" /></Button>
                ) : (
                  <Button type="button" onClick={submit} disabled={submitting} size="lg">
                    {submitting ? "Wird gesendet..." : "Buchung absenden"}
                  </Button>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle>Zusammenfassung</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between text-sm gap-3"><span className="text-muted-foreground">Produkt:</span><span className="font-semibold text-right">{selectedProduct?.name ?? PRODUCT_LABELS[productType]}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sport:</span><span className="font-semibold capitalize">{sport}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Teilnehmer:</span><span className="font-semibold">{participantCount}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Termine:</span><span className="font-semibold">{dates.length}</span></div>
                  {productType === "private" && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Dauer/Termin:</span><span className="font-semibold">{duration === "55" ? "55 Min." : "115 Min."}</span></div>
                  )}
                  {selectedProduct && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Preisbasis:</span><span className="font-semibold">{priceBasisLabel(selectedProduct)}</span></div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {productsLoading ? "…" : `${selectedProduct?.currency ?? "CHF"} ${total}.–`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Preise gemäss aktuellem Kursangebot. Verbindlich bestätigt wird der Preis bei der Buchung.</p>

                  <div className="space-y-2 pt-2 text-xs text-muted-foreground">
                    <p className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Sofortige Bestätigung per E-Mail</p>
                    <p className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Kostenlose Stornierung bis 24h vorher</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Sponsoren />
    </div>
  );
};

export default Buchung;