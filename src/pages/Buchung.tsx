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
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Building2, Clock, AlertTriangle, Loader2 } from "lucide-react";
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
import { useYetiAvailability, dayHasCapacity, type YetiDay } from "@/hooks/useYetiAvailability";



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

/** Privatkurse: mögliche Startzeiten und die dazu wählbaren Endzeiten. */
const PRIVATE_TIME_MATRIX: Record<string, string[]> = {
  "09:00": ["10:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
  "10:00": ["12:00", "13:00", "14:00", "15:00", "16:00"],
  "12:00": ["13:00", "14:00", "15:00", "16:00"],
  "13:00": ["14:00", "16:00"],
  "14:00": ["16:00"],
};
const PRIVATE_START_TIMES = Object.keys(PRIVATE_TIME_MATRIX);

const LANGUAGES = ["Deutsch", "Englisch", "Französisch", "Italienisch"] as const;

const minutesBetweenTimes = (start: string, end: string) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
};

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


/** Kursregeln: Privatkurs (frei), Gruppenkurs Mo–Fr als Block, Samstagskurs nur Samstage. */
type CourseMode = "private" | "week" | "saturday";

const courseModeFor = (productType: ProductType, product?: YetiProduct): CourseMode => {
  if (productType === "private") return "private";
  if (product && /samstag/i.test(product.name)) return "saturday";
  return "week";
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const isISODate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const addDays = (iso: string, n: number) => {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

/** Montag der Woche, in welcher das Datum liegt. */
const mondayOf = (iso: string) => {
  const d = parseISO(iso);
  const dow = d.getDay(); // 0 = So
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return toISO(d);
};

const weekdayOf = (iso: string) => parseISO(iso).getDay();

const firstSlot = (day: YetiDay | undefined) =>
  day?.slots.find((s) => s.free_instructors > 0) ?? null;

const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const zurichLabel = (iso: string) =>
  isISODate(iso) ? format(parseISO(iso), "EEEE, dd.MM.yyyy", { locale: de }) : "–";


interface DateFieldProps {
  value: string;
  onChange: (v: string) => void;
  minDate?: Date;
  maxDate?: Date;
  fromYear?: number;
  toYear?: number;
  placeholder?: string;
  /** Zusätzliche Sperre (z.B. keine Verfügbarkeit in YETI). */
  isDisabledDay?: (iso: string) => boolean;
  onMonthChange?: (d: Date) => void;
  month?: Date;
  footer?: React.ReactNode;
}

const DateField = ({
  value,
  onChange,
  minDate,
  maxDate,
  fromYear,
  toYear,
  placeholder,
  isDisabledDay,
  onMonthChange,
  month,
  footer,
}: DateFieldProps) => {
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
          month={month}
          onMonthChange={onMonthChange}
          disabled={(d) =>
            (minDate ? d < minDate : false) ||
            (maxDate ? d > maxDate : false) ||
            (isDisabledDay ? isDisabledDay(toISO(d)) : false)
          }
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
        {footer && <div className="border-t px-3 py-2 text-xs text-muted-foreground">{footer}</div>}
      </PopoverContent>
    </Popover>
  );
};

type Step = 1 | 2 | 3 | 4;

interface Reservation {
  ticket_id: string | null;
  ticket_number: string | null;
  reservation_token: string | null;
  expires_at: string | null;
  instructor_name: string | null;
  total: number | null;
  currency: string;
}

const Buchung = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
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
  const [dates, setDates] = useState<DateSlot[]>([
    { date: "", start_time: "09:00", end_time: "12:00" },
  ]);
  const [language, setLanguage] = useState<string>("Deutsch");
  const [notes, setNotes] = useState("");

  const durationMinutes = useMemo(() => {
    const d = dates[0];
    if (!d) return 120;
    const mins = minutesBetweenTimes(d.start_time, d.end_time);
    return mins > 0 ? mins : 120;
  }, [dates]);



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

  const courseMode = courseModeFor(productType, selectedProduct);

  // Verfügbarkeitszeitraum: angezeigter Monat (+ Puffer für Kurswochen).
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const rangeFrom = useMemo(() => {
    const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const today = new Date();
    return toISO(d < today ? today : d);
  }, [calendarMonth]);
  const rangeTo = useMemo(
    () => {
      const endOfWindow = toISO(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 7));
      // Beim Zurücknavigieren im Kalender kann der ganze sichtbare Monat in
      // der Vergangenheit liegen. YETI verlangt trotzdem `to >= from`.
      return endOfWindow < rangeFrom ? rangeFrom : endOfWindow;
    },
    [calendarMonth, rangeFrom],
  );

  const {
    byDate: availability,
    loading: availabilityLoading,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useYetiAvailability({
    productId,
    productType,
    sport,
    durationMinutes: productType === "private" ? Number(duration) : undefined,
    participantCount,
    from: rangeFrom,
    to: rangeTo,
    enabled: Boolean(productId),
  });

  const hasAvailabilityData = Object.keys(availability).length > 0;

  /** Ist ein Tag nach Kursregeln + YETI-Verfügbarkeit buchbar? */
  const isDayBookable = (iso: string): boolean => {
    const dow = weekdayOf(iso);
    if (courseMode === "saturday" && dow !== 6) return false;
    if (courseMode === "week" && (dow === 0 || dow === 6)) return false;
    if (courseMode === "private" && dow === 0) return false;
    if (!hasAvailabilityData) return true; // YETI nicht erreichbar -> nicht blockieren
    if (courseMode === "week") {
      const monday = mondayOf(iso);
      if (iso !== monday) return false;
      return [0, 1, 2, 3, 4].every((i) => {
        const day = availability[addDays(monday, i)];
        return day ? dayHasCapacity(day) : true;
      });
    }
    const day = availability[iso];
    return day ? dayHasCapacity(day) : true;
  };

  const slotsFor = (iso: string) =>
    (availability[iso]?.slots ?? []).filter((s) => s.free_instructors > 0);

  // Reservierung
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [reserving, setReserving] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!reservation?.expires_at) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [reservation?.expires_at]);
  const remainingMs = reservation?.expires_at
    ? new Date(reservation.expires_at).getTime() - now
    : 0;
  const reservationExpired = Boolean(reservation?.expires_at) && remainingMs <= 0;

  /**
   * Provisorische Reservierung wieder freigeben, sobald der Kunde aussteigt
   * (Zurück, Kurswechsel, Seite verlassen). Läuft "fire and forget".
   */
  const reservationRef = useRef<Reservation | null>(null);
  const confirmedRef = useRef(false);
  useEffect(() => {
    reservationRef.current = reservation;
  }, [reservation]);

  const releaseReservation = (res?: Reservation | null, opts?: { keepAlive?: boolean }) => {
    const target = res ?? reservationRef.current;
    if (!target || confirmedRef.current) return;
    if (!target.ticket_id && !target.reservation_token) return;
    const body = JSON.stringify({
      ticket_id: target.ticket_id ?? undefined,
      reservation_token: target.reservation_token ?? undefined,
    });
    try {
      void fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yeti-release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body,
        keepalive: opts?.keepAlive ?? false,
      }).catch(() => undefined);
    } catch {
      /* Freigabe ist best effort – der Hold läuft sonst nach 15 Minuten ab. */
    }
    reservationRef.current = null;
  };

  /** Zurück zu "Kurs & Termin" oder Termin verwerfen: Slot sofort freigeben. */
  const cancelReservation = () => {
    releaseReservation();
    setReservation(null);
    refetchAvailability();
  };

  // Seite verlassen / Tab schliessen -> Reservierung freigeben.
  useEffect(() => {
    const onLeave = () => releaseReservation(reservationRef.current, { keepAlive: true });
    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("pagehide", onLeave);
      onLeave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);




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

  /** Erste erlaubte Endzeit zu einer Startzeit. */
  const firstEndFor = (start: string) => PRIVATE_TIME_MATRIX[start]?.[0] ?? "12:00";

  const updateDate = (idx: number, patch: Partial<DateSlot>) => {
    setDates((prev) => prev.map((d, i) => {
      if (i !== idx) return d;
      const merged = { ...d, ...patch };
      if (productType === "private" && patch.start_time !== undefined && patch.end_time === undefined) {
        const allowed = PRIVATE_TIME_MATRIX[merged.start_time] ?? [];
        merged.end_time = allowed.includes(merged.end_time) ? merged.end_time : firstEndFor(merged.start_time);
      }
      return merged;
    }));
  };

  /** Datumsauswahl inkl. Kursregeln (Gruppenkurs = ganze Woche Mo–Fr). */
  const pickDate = (idx: number, iso: string) => {
    if (courseMode === "week") {
      const monday = mondayOf(iso);
      const week: DateSlot[] = [0, 1, 2, 3, 4].map((i) => {
        const date = addDays(monday, i);
        const slot = firstSlot(availability[date]);
        return {
          date,
          start_time: slot?.start ?? "10:00",
          end_time: slot?.end ?? "12:00",
        };
      });
      setDates(week);
      return;
    }
    if (courseMode === "saturday") {
      const slot = firstSlot(availability[iso]);
      updateDate(idx, {
        date: iso,
        start_time: slot?.start ?? "10:00",
        end_time: slot?.end ?? "12:00",
      });
      return;
    }
    updateDate(idx, { date: iso });
  };

  const addDate = () => setDates([...dates, { date: "", start_time: "09:00", end_time: "12:00" }]);
  const removeDate = (idx: number) => setDates(dates.filter((_, i) => i !== idx));


  const hoursPerDay = productType === "private" ? Math.max(1, Math.round(durationMinutes / 60)) : 1;


  const total = useMemo(
    () =>
      computeProductTotal(selectedProduct, {
        days: dates.length,
        hoursPerDay,
        participants: participantCount,
      }),
    [selectedProduct, dates.length, hoursPerDay, participantCount],
  );

  // Produkt-/Kursartwechsel: Termine zurücksetzen, damit keine ungültigen Tage bleiben.
  useEffect(() => {
    setDates([{ date: "", start_time: "09:00", end_time: "12:00" }]);
    releaseReservation();
    setReservation(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseMode, productId]);

  // Termin-, Dauer-, Sport- oder Teilnehmerwechsel: bestehende Reservierung freigeben.
  const reservationKey = useMemo(
    () => JSON.stringify([dates, sport, participantCount]),
    [dates, sport, participantCount],

  );
  const lastReservationKey = useRef(reservationKey);
  useEffect(() => {
    if (lastReservationKey.current === reservationKey) return;
    lastReservationKey.current = reservationKey;
    if (reservationRef.current) {
      releaseReservation();
      setReservation(null);
      refetchAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationKey]);


  const validateStep1 = () => {
    if (!productId) {
      toast({ title: "Kurs wählen", description: "Bitte einen Kurs auswählen.", variant: "destructive" });
      return false;
    }
    if (dates.some((d) => !isISODate(d.date) || d.date < todayISO())) {
      toast({ title: "Ungültiges Datum", description: "Bitte ein gültiges, zukünftiges Datum wählen.", variant: "destructive" });
      return false;
    }
    if (courseMode === "saturday" && dates.some((d) => weekdayOf(d.date) !== 6)) {
      toast({ title: "Nur Samstage", description: "Samstagskurse sind ausschliesslich an Samstagen buchbar.", variant: "destructive" });
      return false;
    }
    if (courseMode === "week" && dates.some((d) => weekdayOf(d.date) === 0 || weekdayOf(d.date) === 6)) {
      toast({ title: "Nur Montag–Freitag", description: "Gruppenkurse finden von Montag bis Freitag statt.", variant: "destructive" });
      return false;
    }
    if (hasAvailabilityData && dates.some((d) => availability[d.date] && !dayHasCapacity(availability[d.date]))) {
      toast({ title: "Termin nicht verfügbar", description: "Für diesen Termin sind keine Skilehrer mehr frei.", variant: "destructive" });
      return false;
    }
    if (productType === "private") {
      if (dates.some((d) => d.start_time < "09:00" || d.end_time > "16:00" || d.end_time <= d.start_time)) {
        toast({ title: "Ungültige Zeit", description: "Zeiten zwischen 09:00 und 16:00, Ende nach Start.", variant: "destructive" });
        return false;
      }
    }
    const unique = new Set(dates.map((d) => d.date));
    if (unique.size !== dates.length) {
      toast({ title: "Doppelter Termin", description: "Bitte jeden Tag nur einmal wählen.", variant: "destructive" });
      return false;
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
    return true;
  };

  const validateStep4 = () => {
    if (!agb || !privacy) {
      toast({ title: "Einwilligung fehlt", description: "Bitte AGB und Datenschutz akzeptieren.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const holdEmail = useRef(`reservierung+${crypto.randomUUID()}@schneesportschule.li`);

  /**
   * Beim Wechsel von "Kurs & Termin" zu "Teilnehmer" sind Kunden-/Teilnehmerdaten
   * noch nicht erfasst. YETI verlangt sie trotzdem, deshalb wird die provisorische
   * Reservierung mit Platzhaltern erstellt und beim Abschluss mit den echten
   * Daten überschrieben.
   */
  const buildReservePayload = () => {
    const hasContact = Boolean(firstName.trim() && lastName.trim() && email.trim() && street.trim() && zip.trim() && city.trim());
    const customer = hasContact
      ? { salutation, first_name: firstName, last_name: lastName, email, phone: phone.trim().length >= 5 ? phone : "+423 263 97 70", street, zip, city, country }
      : {
          salutation: "Herr",
          first_name: "Web",
          last_name: "Reservierung",
          email: holdEmail.current,
          phone: "+423 263 97 70",
          street: "Malbun",
          zip: "9497",
          city: "Triesenberg",
          country: "LI",
        };

    const filled = participants.filter((p) => p.first_name.trim() && p.last_name.trim() && isISODate(p.birth_date));
    const list = filled.length === participantCount
      ? filled
      : Array.from({ length: participantCount }, (_, i) => ({
          first_name: "Teilnehmer",
          last_name: String(i + 1),
          birth_date: "2000-01-01",
          discipline: sport,
          skill_level_num: 1,
        }));

    return {
      submission_id: crypto.randomUUID(),
      customer,
      participants: list.map((p) => ({
        first_name: p.first_name, last_name: p.last_name, birth_date: p.birth_date,
        discipline: p.discipline, skill_level: LEVEL_MAP[p.skill_level_num],
      })),
      booking: {
        product_id: productId || undefined,
        product_type: productType,
        sport,
        dates,
        participant_count: participantCount,
        duration_minutes: productType === "private" ? Number(duration) : undefined,
        notes: notes || undefined,
      },
      consent: {
        agb_accepted: true as const, agb_version: AGB_VERSION,
        privacy_accepted: true as const, privacy_version: PRIVACY_VERSION,
      },
    };
  };


  /** Provisorische Reservierung in YETI (Skilehrer + Zeitfenster für 15 Min. gesperrt). */
  const reserve = async (): Promise<boolean> => {
    setReserving(true);
    try {
      const { data, error } = await supabase.functions.invoke("yeti-reserve", {
        body: buildReservePayload(),
      });
      if (error) throw error;
      if (!data?.success) {
        if (data?.conflict) refetchAvailability();
        toast({
          title: data?.conflict ? "Termin inzwischen vergeben" : "Reservierung fehlgeschlagen",
          description: data?.message ?? "Bitte versuche es in 1–2 Minuten erneut.",
          variant: "destructive",
        });
        if (data?.conflict) setStep(1);
        return false;
      }
      setReservation({
        ticket_id: data.ticket_id ?? null,
        ticket_number: data.ticket_number ?? null,
        reservation_token: data.reservation_token ?? null,
        expires_at: data.reservation_expires_at ?? null,
        instructor_name: data.instructor?.name ?? null,
        total: typeof data.price?.total === "number" ? data.price.total : null,
        currency: data.price?.currency ?? selectedProduct?.currency ?? "CHF",
      });
      setNow(Date.now());
      return true;
    } catch (err) {
      console.error("yeti-reserve failed:", err);
      toast({
        title: "Reservierung fehlgeschlagen",
        description: "Bitte versuche es in 1–2 Minuten erneut.",
        variant: "destructive",
      });
      return false;
    } finally {
      setReserving(false);
    }
  };

  const next = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      // Provisorische Reservierung direkt beim Wechsel zu "Teilnehmer".
      if (!reservation || reservationExpired) {
        const ok = await reserve();
        if (!ok) return;
      }
    }
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((s) => Math.min(4, s + 1) as Step);
  };



  const isInvoice = paymentMethod === "ueberweisung" || paymentMethod === "postfinance";

  /** Reservierung in eine Buchung umwandeln (Onlinezahlung oder Rechnung). */
  const submit = async () => {
    if (submittingRef.current) return;
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) return;
    if (!reservation?.ticket_id || !reservation.reservation_token) {
      toast({ title: "Keine Reservierung", description: "Bitte den Termin erneut reservieren.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (reservationExpired) {
      toast({ title: "Reservierung abgelaufen", description: "Bitte wähle den Termin erneut.", variant: "destructive" });
      setReservation(null);
      refetchAvailability();
      setStep(1);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    let submittedSuccessfully = false;
    try {
      const { data, error } = await supabase.functions.invoke("yeti-confirm", {
        body: {
          ticket_id: reservation.ticket_id,
          reservation_token: reservation.reservation_token,
          payment_method: isInvoice ? "invoice" : "online",
          customer: { salutation, first_name: firstName, last_name: lastName, email, phone, street, zip, city, country },
          participants: participants.map((pt) => ({
            first_name: pt.first_name, last_name: pt.last_name, birth_date: pt.birth_date,
            discipline: pt.discipline, skill_level: LEVEL_MAP[pt.skill_level_num],
          })),
          notes: notes || undefined,
        },
      });
      if (error) throw error;
      if (!data?.success) {
        if (data?.expired) {
          setReservation(null);
          refetchAvailability();
          setStep(1);
        }
        throw new Error(data?.message || "Booking confirmation failed");
      }

      toast({
        title: isInvoice ? "Buchung bestätigt – Rechnung folgt" : "Buchung bestätigt!",
        description: [
          data.ticket_number ? `Ticket-Nr. ${data.ticket_number}` : null,
          data.customer_number ? `Kundennummer ${data.customer_number}` : null,
          data.invoice_number ? `Rechnung ${data.invoice_number}` : null,
        ].filter(Boolean).join(" · ") || "Bestätigung folgt per E-Mail.",
      });
      submittedSuccessfully = true;
      confirmedRef.current = true;
      reservationRef.current = null;
      setTimeout(() => navigate("/"), 3500);
    } catch (err: any) {
      console.error("Booking confirm error:", err);
      toast({
        title: "Buchung fehlgeschlagen",
        description: err?.message?.startsWith("Die Reservierung")
          ? err.message
          : "Die Buchung konnte gerade nicht abgeschlossen werden. Bitte versuche es innerhalb der Reservierungszeit erneut.",
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
          <p className="text-white/90 text-base sm:text-lg">Schritt {step} von 4</p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8 max-w-2xl mx-auto">
            {[{ n: 1, label: "Kurs & Termin" }, { n: 2, label: "Teilnehmer" }, { n: 3, label: "Kontakt" }, { n: 4, label: "Zahlung" }].map((s, i) => (
              <div key={s.n} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-base shrink-0 ${step >= s.n ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {step > s.n ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s.n}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-semibold ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                </div>
                {i < 3 && <div className={`flex-1 h-0.5 mx-2 sm:mx-3 ${step > s.n ? "bg-primary" : "bg-muted"}`} />}
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
                      <div className="flex items-center justify-between gap-2">
                        <Label>
                          {courseMode === "week"
                            ? "Kurswoche (Montag wählen – Mo–Fr wird übernommen)"
                            : courseMode === "saturday"
                              ? "Samstage wählen"
                              : "Termine"}
                        </Label>
                        {courseMode !== "week" && (
                          <Button type="button" size="sm" variant="outline" onClick={addDate}>
                            <Plus className="w-4 h-4 mr-1" /> Termin hinzufügen
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {availabilityLoading ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verfügbarkeit wird geladen…</>
                        ) : availabilityError ? (
                          <><AlertTriangle className="w-3.5 h-3.5 text-destructive" /> {availabilityError}</>
                        ) : (
                          <><Check className="w-3.5 h-3.5 text-primary" /> Nur freie Tage sind auswählbar (Zeiten Europe/Zurich)</>
                        )}
                      </div>

                      {dates.map((d, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "grid grid-cols-1 gap-2 items-end p-3 border rounded-lg",
                            courseMode === "private" && "md:grid-cols-[1fr_1fr_auto]"
                          )}
                        >
                          <div className="space-y-1">
                            <Label className="text-xs">{courseMode === "week" ? (idx === 0 ? "Kursstart (Montag)" : "Kurstag") : "Datum"}</Label>
                            {courseMode === "week" && idx > 0 ? (
                              <div className="h-10 flex items-center px-3 rounded-md border bg-muted/40 text-sm">
                                {zurichLabel(d.date)}
                              </div>
                            ) : (
                              <DateField
                                value={d.date}
                                onChange={(v) => pickDate(idx, v)}
                                minDate={new Date()}
                                month={calendarMonth}
                                onMonthChange={setCalendarMonth}
                                isDisabledDay={(iso) => !isDayBookable(iso)}
                                fromYear={new Date().getFullYear()}
                                toYear={new Date().getFullYear() + 2}
                                placeholder={courseMode === "saturday" ? "Samstag wählen" : "Datum wählen"}
                                footer={
                                  availabilityLoading
                                    ? "Verfügbarkeit wird geladen…"
                                    : courseMode === "week"
                                      ? "Gruppenkurse starten montags und laufen bis Freitag."
                                      : courseMode === "saturday"
                                        ? "Nur Samstage sind buchbar."
                                        : "Ausgegraute Tage sind ausgebucht."
                                }
                              />
                            )}
                          </div>
                          {courseMode === "private" && (
                            <>
                              <div className="space-y-1">
                                <Label className="text-xs">Zeitfenster</Label>
                                <Select
                                  value={d.start_time}
                                  onValueChange={(v) => {
                                    const slot = slotsFor(d.date).find((s) => s.start === v);
                                    updateDate(idx, { start_time: v, end_time: slot?.end ?? computeEnd(v, duration) });
                                  }}
                                  disabled={!d.date || slotsFor(d.date).length === 0}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={d.date ? "Zeit wählen" : "Zuerst Datum wählen"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {slotsFor(d.date).map((s) => (
                                      <SelectItem key={s.start} value={s.start}>
                                        {s.start}–{s.end} · verfügbar
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {d.date && slotsFor(d.date).length === 0 && (
                                  <p className="text-xs text-muted-foreground">{d.start_time}–{d.end_time}</p>
                                )}
                              </div>
                              {dates.length > 1 && (
                                <Button type="button" size="icon" variant="ghost" onClick={() => removeDate(idx)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              )}
                            </>
                          )}
                          {courseMode === "saturday" && dates.length > 1 && (
                            <Button type="button" size="sm" variant="ghost" className="justify-self-start" onClick={() => removeDate(idx)}>
                              <Trash2 className="w-4 h-4 text-destructive mr-1" /> Entfernen
                            </Button>
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
                </>
              )}

              {step >= 2 && reservation && (
                <Card className={cn("border-2", reservationExpired ? "border-destructive/60" : "border-primary/40")}>
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      {reservationExpired ? "Reservierung abgelaufen" : "Termin provisorisch reserviert"}
                    </CardTitle>
                    <CardDescription>
                      {reservationExpired
                        ? "Bitte wähle den Termin erneut – Skilehrer und Zeiten sind wieder freigegeben."
                        : "Der Skilehrer und die Zeiten sind für dich gesperrt. Bitte schliesse die Buchung innerhalb der angezeigten Zeit ab."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-2 text-sm">
                    {reservation?.expires_at && !reservationExpired && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Reserviert noch:</span>
                        <span className="font-bold text-primary text-lg">{formatCountdown(remainingMs)}</span>
                      </div>
                    )}
                    {reservation?.ticket_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Ticket-Nr.:</span>
                        <span className="font-semibold">{reservation.ticket_number}</span>
                      </div>
                    )}
                    {reservation?.instructor_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Skilehrer:in:</span>
                        <span className="font-semibold">{reservation.instructor_name}</span>
                      </div>
                    )}
                    {reservationExpired && (
                      <Button type="button" variant="outline" onClick={() => { cancelReservation(); setStep(1); }}>
                        Termin neu wählen
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {step === 4 && (
                <>
                  <Card>

                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle>Zahlungsart</CardTitle>
                      <CardDescription>Onlinezahlung oder Zahlung auf Rechnung.</CardDescription>
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
                          <Label htmlFor="pm-bank" className="flex-1 cursor-pointer font-semibold">Rechnung (Banküberweisung)</Label>
                        </div>
                        <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${paymentMethod === "postfinance" ? "border-primary bg-primary/5" : "border-border"}`}>
                          <RadioGroupItem value="postfinance" id="pm-pf" />
                          <Building2 className="w-5 h-5 text-[#FFCC00]" />
                          <Label htmlFor="pm-pf" className="flex-1 cursor-pointer font-semibold">Rechnung (PostFinance)</Label>
                        </div>
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground">
                        {isInvoice
                          ? "Du erhältst Buchungsbestätigung und Rechnung mit Zahlungsfrist per E-Mail."
                          : "Die Onlinezahlung wird aktuell manuell abgewickelt – wir melden uns mit dem Zahlungslink. Die Buchung bleibt bis zur Zahlung als offen markiert."}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle>Einwilligungen</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox checked={agb} onCheckedChange={(c) => setAgb(c === true)} className="mt-1" />
                        <span className="text-sm">Ich akzeptiere die <a href="/agb" className="underline text-primary">AGB</a> (Version {AGB_VERSION}). *</span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox checked={privacy} onCheckedChange={(c) => setPrivacy(c === true)} className="mt-1" />
                        <span className="text-sm">Ich akzeptiere die <a href="/datenschutz" className="underline text-primary">Datenschutzerklärung</a> (Version {PRIVACY_VERSION}). *</span>
                      </label>
                    </CardContent>
                  </Card>
                </>
              )}

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Zurück zu "Kurs & Termin": Slot und Skilehrer:in sofort wieder freigeben.
                    if (step === 2) cancelReservation();
                    setStep((s) => Math.max(1, s - 1) as Step);
                  }}
                  disabled={step === 1 || reserving || submitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
                </Button>
                {step < 4 ? (
                  <Button type="button" onClick={next} disabled={reserving}>
                    {reserving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Termin wird reserviert…</>
                    ) : (
                      <>Weiter <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                ) : (
                  <Button type="button" onClick={submit} disabled={submitting || reservationExpired} size="lg">
                    {submitting ? "Wird gesendet..." : isInvoice ? "Buchen & Rechnung erhalten" : "Buchung abschliessen"}
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
                  {dates.filter((d) => d.date).length > 0 && (
                    <div className="rounded-lg border bg-muted/30 p-2 space-y-1">
                      {dates.filter((d) => d.date).map((d, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{zurichLabel(d.date)}</span>
                          <span className="font-medium">{d.start_time}–{d.end_time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {productType === "private" && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Dauer/Termin:</span><span className="font-semibold">{Math.round(durationMinutes / 60)} Std. ({durationMinutes} Min.)</span></div>
                  )}
                  {selectedProduct && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Preisbasis:</span><span className="font-semibold">{priceBasisLabel(selectedProduct)}</span></div>
                  )}
                  {reservation?.instructor_name && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Skilehrer:in:</span><span className="font-semibold">{reservation.instructor_name}</span></div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {productsLoading ? "…" : `${reservation?.currency ?? selectedProduct?.currency ?? "CHF"} ${reservation?.total ?? total}.–`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reservation?.total != null
                      ? "Verbindlicher Preis, serverseitig berechnet."
                      : "Preise gemäss aktuellem Kursangebot. Verbindlich bestätigt wird der Preis bei der Reservierung."}
                  </p>


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