# Integrationstests für den YETI-Reservierungsvertrag vervollständigen

Nur Tests — kein Produktivcode, keine Migration, kein Deployment von Funktionen.

## Ist-Stand

`supabase/functions/yeti-reserve/index.test.ts` deckt bereits ab:
1. Reservierung ohne Personendaten (+ Ablehnung von Kunden-/Teilnehmerdaten)
2.+3. Rechnungsabschluss mit genau einer Rechnung, Wiederholung keine zweite
4. Online-Abschluss ohne `payment_reference` wird abgelehnt
6. `payment_failed` hält die Reservierung offen (anschliessender Rechnungsabschluss klappt)
7. Ungültige/abgelaufene Reservierung kann nicht bestätigt werden

## Fehlend

**Test 5 — Online-Abschluss mit gültiger Referenz erzeugt genau eine Zahlung**
- Reservierung anlegen (Privatkurs, zukünftiges Datum)
- `yeti-confirm` mit `payment_method: "online"` und `payment_reference: "TEST-<zufällig>"` → `success: true`, `payment_status`/`status` bezahlt, `payment_reference` zurückgeliefert
- Erneuter Abschluss desselben Tickets → keine zweite Zahlung (gleiche Antwort, kein neuer `invoice_number`/zweiter Datensatz)
- Annahme: YETI akzeptiert die Test-Referenz (wie beim Rechnungsabschluss gegen die echte Schnittstelle getestet). Schlägt das fehl, breche ich ab und melde, was auf YETI-Seite fehlt.

**Test 8 — Änderung der Auswahl gibt die alte Reservierung frei**
- Reservierung anlegen
- `yeti-release` mit `ticket_id` + `reservation_token` aufrufen → Erfolg (YETI-Antwort 404 wird wie heute toleriert, lokale Freigabe zählt)
- `yeti-confirm` auf die freigegebene Reservierung → `success: false`
- Neue Reservierung auf demselben Slot klappt anschliessend

**Test 7 erweitern — abgelaufene Reservierung erzeugt keine Teil-Datensätze**
- Bestehender Test 7 bleibt; zusätzlich prüfen, dass die Antwort keine Rechnungs- oder Kundenkennungen enthält (`invoice_number`, `customer_number` fehlen) und ein anschliessender kompletter Ablauf (Reservierung + Rechnungsabschluss) sauber durchläuft — Beweis, dass kein halber Datensatz den Flow blockiert.

## Technische Details

- Alle Ergänzungen in `supabase/functions/yeti-reserve/index.test.ts` (bestehende Datei, gleiches Muster: `call`-Helper, `CONSENT`/`CUSTOMER`/`PARTICIPANTS`, zukünftige Daten per Offset).
- Für Test 8 `yeti-release` über denselben `call`-Helper ansprechen.
- Datums-Offsets so wählen, dass keine Kollision mit den bestehenden Tests entsteht (Offsets 26+ bzw. eigene Uhrzeiten).
- Ausführen mit den Umgebungsvariablen `VITE_SUPABASE_URL` und `VITE_SUPABASE_PUBLISHABLE_KEY` gegen die bereitgestellten Funktionen; Ergebnis pro Test melden.
- Kein Deployment nötig: `yeti-release` und beide Funktionen sind bereits deployed.
