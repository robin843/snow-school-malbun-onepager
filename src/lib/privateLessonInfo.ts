/**
 * General private-lesson schedule information (business rule from Ivo, 2026-10-18).
 * Display-only: never restricts booking, never carries prices; prices come from YETI Core.
 */
export const PRIVATE_LESSON_INFO = {
  heading: "Unterrichtszeiten & Hinweise",
  single: { label: "Einzellektionen (60 Min.)", windows: ["09:00–10:00", "12:00–13:00", "13:00–14:00"] },
  double: { label: "Doppellektionen (120 Min.)", windows: ["10:00–12:00", "12:00–14:00", "14:00–16:00"] },
  notes: [
    "Einzelstunden innerhalb der Doppelstundenblöcke sind auf Anfrage beim Skischulbüro möglich.",
    "Andere Zeiten für Doppellektionen nach Absprache mit dem Skischulbüro.",
    "Zusätzliche Personen und Rabatte gemäss gültiger Tarifübersicht.",
  ],
} as const;

export const showsPrivateLessonInfo = (p: { type: string }) => p.type === "private";
