# Reservierung freigeben beim Abbruch + echte Skilehrer-Verfügbarkeit

## 1. Reservierung sofort zurücknehmen, wenn der Kunde aussteigt

Heute bleibt eine provisorische Reservierung 15 Minuten stehen, auch wenn der Kunde die Buchung abbricht, zurück auf Schritt 1 geht oder den Tab schliesst.

Geplantes Verhalten:
- Zurück von Schritt 2 auf Schritt 1, Kurs-/Datums-/Zeit-/Dauer-/Teilnehmerwechsel, Verlassen der Buchungsseite oder Schliessen des Tabs → Reservierung wird freigegeben, Countdown verschwindet, Kalender lädt neu.
- Beim erneuten „Weiter“ wird eine frische Reservierung erstellt.

Wichtig: YETI hat aktuell **keinen** Freigabe-Endpunkt. Geprüft: `cancel-reservation` und `release-reservation` antworten mit 404, nur `expire-reservations` existiert (löscht ausschliesslich bereits abgelaufene Holds).

Deshalb zweistufig:
- **Sofort umsetzbar:** neue Edge Function `yeti-release`, die den Hold in unserer Datenbank auf `cancelled` setzt, das Frontend-State zurücksetzt und — sobald verfügbar — den YETI-Endpunkt aufruft. Bis dahin fällt der Slot in YETI spätestens nach Ablauf der 15 Minuten zurück.
- **Anfrage an YETI:** Endpunkt `cancel-reservation` (Eingabe `reservation_token` bzw. `ticket_id`) bereitstellen, damit der Slot und der Skilehrer sofort wieder frei sind. Optional zusätzlich die Haltedauer von 15 auf z. B. 10 Minuten senken.

## 2. Skilehrer-Verfügbarkeit stimmt nicht

Der Kalender zeigt alle Zeiten als frei, obwohl der einzige Skilehrer 10–12 Uhr und 14–16 Uhr belegt ist.

Ursache ist gemessen und liegt in YETI, nicht auf der Website: `get-availability` liefert für **jeden** Slot an jedem Tag pauschal `free_instructors: 31` — unabhängig von Produkt, Datum und bestehenden Kursen. Beispielantwort für 01.–03.09.2026: alle Slots 09:00–15:55 mit 31 freien Lehrern, `fully_booked: false`. Die Website zeigt also korrekt an, was YETI meldet.

Zwei Teile:
- **YETI-seitig (nötig):** `get-availability` muss die tatsächlichen Lehrer-Belegungen (bestehende Tickets/Kurse, Arbeitszeiten, Abwesenheiten, aktive Reservierungen) abziehen und pro Slot die real freien Lehrer zurückgeben — überlappende Slots eines belegten Lehrers müssen `free_instructors: 0` liefern und ein Tag ohne freie Slots `fully_booked: true`.
- **Website-seitig (in dieser Etappe):** sobald YETI korrekte Zahlen liefert, greifen unsere Regeln automatisch. Zusätzlich bauen wir:
  - Zeit-Slots in Schritt 1 als wählbare Liste mit deaktivierten belegten Zeiten (statt nur „verfügbar“), damit Kunden Konflikte sofort sehen.
  - Einen Plausibilitäts-Hinweis, wenn YETI für alle Slots identische Zahlen liefert: Reservierung entscheidet, ein 409-Konflikt wird sauber angezeigt und der Kalender lädt neu.

## Technische Umsetzung

- Neue Edge Function `supabase/functions/yeti-release/index.ts`: Zod-validiertes `{ ticket_id, reservation_token }`, setzt `submitted_bookings.booking_status = 'cancelled'`, versucht `cancel-reservation` bei YETI und ignoriert 404 sauber.
- `src/pages/Buchung.tsx`: `releaseReservation()` bei Schritt-Zurück, bei Änderung der reservierungsrelevanten Felder, im Unmount-Cleanup und via `navigator.sendBeacon` auf `beforeunload`.
- Slot-Auswahl in Schritt 1: Buttons aus `useYetiAvailability`-Slots, `free_instructors === 0` deaktiviert; Anzeige in `Europe/Zurich`.
- Keine Änderung an Preisen oder am Bestätigungsweg.

## Offen für dich

Ich kann Teil 1 (Freigabe) und die Slot-Auswahl direkt bauen. Damit die Zeiten wirklich stimmen, muss YETI `get-availability` mit echten Lehrer-Belegungen liefern und idealerweise einen `cancel-reservation`-Endpunkt ergänzen — das kann die Website nicht ersetzen.
