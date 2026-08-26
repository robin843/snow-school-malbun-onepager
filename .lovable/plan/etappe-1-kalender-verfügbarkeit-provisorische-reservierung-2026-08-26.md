# Etappe 1 — Kalender-Verfügbarkeit & provisorische Reservierung

Yeti stellt die sechs neuen Endpunkte bereit (`get-products`, `get-availability`, `create-reservation`, `confirm-booking`, `get-booking-status`, `expire-reservations`). Diese Etappe verbindet die Website damit — Design bleibt, bestehender 3-Schritt-Wizard und der heutige `submit-booking`-Weg bleiben als Fallback funktionsfähig.

## Was der Kunde erlebt

1. Kursübersicht → „Buchen“: Kurs (Produkt-ID), Kursart, Sportart, Dauer, Preis und Kursinfos werden in die Buchung übernommen und dort dauerhaft sichtbar angezeigt.
2. Schritt 1 zeigt einen echten Verfügbarkeitskalender aus Yeti: freie Tage/Slots, blockierte Zeiten, Anzahl freier Skilehrer. Volle oder gesperrte Tage sind nicht wählbar.
3. Kursregeln greifen im Kalender: Gruppenkurse nur Mo–Fr (ganze Kurswoche automatisch), Samstagskurse nur Samstage (alle zugehörigen Termine automatisch), Privatkurse nach gewählter Dauer mit zusammenhängenden freien Stunden.
4. Klick auf „Weiter“ nach Schritt 2 löst die provisorische Reservierung in Yeti aus: Skilehrer wird zugewiesen, Slot ist 15 Minuten gesperrt. Ein Countdown zeigt die Restzeit.
5. Schritt 3 zeigt eine transparente Preisübersicht (vom Server berechnet), Reservierungsstatus und die Wahl Onlinezahlung oder Rechnung.
6. Ist der Slot zwischenzeitlich weg, erscheint eine klare Meldung und der Kalender lädt neu — kein stiller Fehlschlag.

## Technische Umsetzung

**Neue Edge Functions (Proxy zu Yeti, API-Key bleibt serverseitig)**
- `yeti-products` → `get-products`, mit kurzem Cache; liefert Kurskatalog inkl. Preise/Preisart/Dauer/Teilnehmergrenzen.
- `yeti-availability` → `get-availability` für Zeitraum + Produkt.
- `yeti-reserve` → `create-reservation`; validiert Eingaben mit Zod (`.strict()`), schickt **nie** Preise aus dem Browser, gibt `ticket_id`, `reservation_token`, `reservation_expires_at`, Skilehrer und den serverseitig berechneten Preis zurück.
- `yeti-confirm` → `confirm-booking` (Online oder Rechnung).
- `yeti-booking-status` → `get-booking-status` per Token, für Countdown/Polling.
- Alle mit CORS, klaren Fehlercodes (409 = Slot vergeben) und Logging in `submitted_bookings` (bestehende Tabelle, um Status/Token erweitert).

**Migration (nicht destruktiv)**
- `submitted_bookings`: neue Felder `yeti_reservation_token`, `reservation_expires_at`, `booking_status`, `payment_status`, `total_price`, `product_id`, `instructor_id`, `invoice_number`, `customer_number`. Bestehende Spalten und Daten bleiben unverändert.

**Frontend**
- Neuer Hook `useYetiProducts` — Kursübersicht und Buchung lesen Preise/Kursdaten aus Yeti statt aus hartcodierten Listen (Fallback auf aktuelle Werte, falls Yeti nicht antwortet, damit die Seite nie leer ist).
- `Buchung.tsx`: Verfügbarkeitskalender statt freier Datumswahl, Kursregeln pro Kursart, Reservierungs-Countdown, Preisübersicht-Komponente, Doppelklick-Schutz bleibt.
- `Kursuebersicht.tsx`: übergibt zusätzlich `productId` und Kursdaten an die Buchung.

**Doppelbuchungen / Race Conditions**
- Reservierung passiert ausschliesslich in Yeti (Advisory Lock + Transaktion). Die Website prüft zusätzlich beim „Weiter“-Klick und erneut vor der Bestätigung; bei 409 wird der Kalender neu geladen.
- Zeiten werden mit Zeitzone gespeichert, Anzeige in `Europe/Zurich`.

## Nicht in dieser Etappe

- Stripe-Onlinezahlung (Etappe 2): Schritt 3 setzt vorerst „Rechnung“ bzw. `payment_pending` und ist so gebaut, dass Stripe-Checkout nur eingehängt werden muss.
- Adminbereich bleibt in Yeti; die Website liefert alle nötigen Felder mit.

## Tests

- Verfügbarkeit laden, Reservierung anlegen, Status abfragen, abgelaufene Reservierung, Konfliktfall (409) — per Aufruf der Functions und im Browser-Durchlauf der Buchung auf Mobile und Desktop.
