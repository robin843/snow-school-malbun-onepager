# Buchung auf den neuen YETI-Reservierungsvertrag umstellen

Ziel: Beim Reservieren werden keine erfundenen Kunden- oder Teilnehmerdaten mehr erzeugt. Echte Daten gehen genau einmal beim Abschluss raus. Onlinezahlung gilt nur mit echter Zahlungsreferenz als bezahlt. Design, 4-Schritt-Ablauf, 15-Minuten-Countdown und Freigabe bleiben unverändert.

## Schritt 0: Vertrag prüfen (zuerst, vor jeder Änderung)

Gegen die YETI-Schnittstelle testen:
- anonyme provisorische Reservierung nur mit `participant_count`, ohne Kunde/Teilnehmer
- Abschluss mit echtem Kunden, Teilnehmern und optionaler Notiz
- Rechnungsabschluss ohne Zahlungsreferenz
- Online-Abschluss nur mit echter `payment_reference`
- Pfad `payment_failed: true`

Schlägt einer dieser Punkte fehl, wird nichts umgebaut — stattdessen melde ich, was auf YETI-Seite fehlt.

## Schritt 1: Reservierung ohne Personendaten (Website)

In `src/pages/Buchung.tsx`:
- `holdEmail`, den Platzhalterkunden „Web Reservierung" und die Platzhalter-Teilnehmer („Teilnehmer 1/2/…", erfundene Geburtsdaten, Telefon, Adresse) entfernen
- `buildReservePayload()` sendet nur noch `submission_id`, `booking` (Produkt, Typ, Sportart, Termine, Teilnehmerzahl, optional Dauer/Notiz) und `consent`
- Reservierung entsteht weiterhin beim Verlassen von Schritt 1; auch bereits ausgefüllte Kontaktdaten werden dabei nicht mitgeschickt

## Schritt 2: `yeti-reserve` anpassen

`supabase/functions/yeti-reserve/index.ts`:
- `customer` und `participants` aus dem Schema entfernen; `booking.participant_count` als Ganzzahl 1–20 prüfen
- YETI-Payload exakt nach neuem Vertrag: `source`, `product_id`, `participant_count`, `hold_minutes: 15`, `notes`, `items`, `consent` (mit `accepted_at`, `ip_address`, `user_agent`)
- veraltete Felder (`booking`, `metadata`, `payment_method`, `reservation_ttl_minutes`) entfallen
- API-Key, Idempotenz-Key, Wochentagsregeln für Gruppenkurse, lokale Sicherung und Rückgabe der YETI-Antwort bleiben; `customer_email` wird bei der Reservierung als leer gespeichert

## Schritt 3: Abschluss anpassen

`supabase/functions/yeti-confirm/index.ts`:
- Schema: `ticket_id`, `reservation_token`, `payment_method`, optional `payment_reference` und `payment_failed`, dazu Kunde, Teilnehmer, optional Notiz
- nur diese Felder an YETI weiterreichen; selbst erzeugte `payment_status` und `source` entfallen
- nach Erfolg lokal aktualisieren: Buchungs- und Zahlungsstatus, Zahlart, E-Mail, Kundennummer, Rechnungsnummer und Fälligkeit, Gesamtpreis, YETI-Antwort
- Protokolle enthalten nur IDs und Statuscodes, keine Personendaten

## Schritt 4: Zahlung ehrlich abbilden

- Überweisung und PostFinance laufen als Rechnung und dürfen direkt abschliessen
- TWINT und Kreditkarte schliessen nur nach echter Bestätigung eines Zahlungsanbieters mit Transaktionsnummer ab; es wird nie eine erfundene Referenz erzeugt
- Da derzeit kein Zahlungsanbieter angebunden ist: TWINT und Kreditkarte werden sichtbar deaktiviert, mit Hinweis „Onlinezahlung ist derzeit noch nicht verfügbar." und Rechnung als Vorauswahl; die Anbindung bleibt vorbereitet
- Scheitert eine Zahlung nach der Reservierung, wird der Fehlerpfad mit `payment_failed: true` genutzt, die Reservierung bleibt mit Restzeit bestehen

## Schritt 5: Reservierungs-Lebenszyklus unverändert

Halten beim Verlassen von Schritt 1, Freigabe und Neuanlage bei Änderung von Kurs, Sportart, Teilnehmerzahl, Datum oder Zeit, Freigabe beim Zurückgehen oder Verlassen der Seite, Rücksprung zur Terminwahl bei Ablauf, keine Freigabe nach erfolgreichem Abschluss.

## Schritt 6: Integrationstests

Ausführbare Prüfungen für: Reservierung ohne Personendaten, Rechnungsabschluss mit genau einer Rechnung, doppelter Abschluss ohne Dubletten, Online-Abschluss ohne Referenz wird abgelehnt, Online-Abschluss mit gültiger Referenz erzeugt genau eine Zahlung, `payment_failed` erhält die Reservierung, abgelaufene Reservierung erzeugt keine Teil-Datensätze, Änderung der Auswahl gibt die alte Reservierung frei.

## Technische Notizen

- Betroffene Dateien: `src/pages/Buchung.tsx`, `supabase/functions/yeti-reserve/index.ts`, `supabase/functions/yeti-confirm/index.ts`, neue Tests unter `supabase/functions/*/index.test.ts`
- Keine Datenbankmigration nötig: `customer_email` ist bereits optional
- Beide Edge Functions werden nach der Änderung neu bereitgestellt; keine neuen Zugangsdaten erforderlich
