# Kundendaten kommen in YETI nicht an — Analyse und Behebung

## Was die Daten zeigen

Die beiden Tickets im Screenshot (T-2026-998043, T-2026-998044) sind **reine Platzhalter-Reservierungen** — Status „Abgelaufen", Kunde „Provisorisch (Website)". Das ist genau das, was der aktuelle Ablauf vorsieht: beim Reservieren werden bewusst keine Personendaten mehr gesendet, erst beim Abschluss.

Die Datenbank bestätigt: seit dem Umbau gab es **keinen einzigen echten Abschluss von einer Kundin oder einem Kunden**. Alle abgeschlossenen Buchungen stammen aus unseren eigenen Tests. Bei einem dieser Tests (T-2026-998042) hat YETI die Kundendaten korrekt übernommen und eine Kundennummer sowie Rechnung R-2026-00009 erzeugt. Der Weg funktioniert also technisch — er wird bloss nie erreicht: die Reservierungen laufen nach 15 Minuten ab, bevor jemand den Abschluss auslöst.

Zwei weitere Testtickets (T-2026-998038, T-2026-998040) bekamen von YETI die Antwort „bereits bestätigt" ohne Kundendaten — dort könnte der Kunde tatsächlich fehlen. Das ist der einzige offene Verdachtspunkt und wird zuerst geprüft.

## Schritt 1: Gezielt nachmessen (vor jeder Änderung)

- Eine kontrollierte Testreservierung anlegen und sofort abschliessen; danach in YETI prüfen, ob Name, Adresse, Telefon und E-Mail am Ticket sichtbar sind.
- Denselben Abschluss ein zweites Mal senden und prüfen, ob YETI mit „bereits bestätigt" antwortet, obwohl nie Kundendaten gespeichert wurden.
- Ergebnis entscheidet, ob das Problem auf unserer Seite oder bei YETI liegt.

## Schritt 2: Kundendaten früher sichtbar machen

Damit im YETI-Stundenplan nicht mehr „Provisorisch (Website)" steht, sobald die Personalien im Formular erfasst sind:

- Beim Wechsel von „Kontakt" zu „Zahlung" die bereits erfassten Kundendaten an die bestehende Reservierung nachmelden (Name, E-Mail, Telefon, Adresse, Teilnehmer).
- Es werden weiterhin nie erfundene Daten gesendet — nur echte, vom Gast eingegebene Angaben.
- Voraussetzung: YETI bietet dafür einen Weg (Reservierung aktualisieren oder Kundendaten optional schon beim Reservieren). Fehlt dieser, formuliere ich stattdessen die konkrete Anforderung an das YETI-Team.

## Schritt 3: Abbrüche sichtbar machen

- Fehlgeschlagene oder abgelaufene Abschlüsse werden protokolliert (nur Ticketnummer und Statuscode, keine Personendaten), damit erkennbar wird, an welcher Stelle Gäste aussteigen.
- Läuft die Reservierungszeit während des Ausfüllens ab, wird der Gast klar darauf hingewiesen und die Reservierung automatisch erneuert, statt still zu scheitern.

## Technische Notizen

- Betroffen: `supabase/functions/yeti-reserve/index.ts`, `supabase/functions/yeti-confirm/index.ts`, `src/pages/Buchung.tsx`
- Bestätigt: `confirm-booking` überträgt `customer` und `participants` unverändert; YETI liefert dabei `customer_id` zurück (Ticket T-2026-998042)
- Offen: Verhalten von `confirm-booking` bei `already_confirmed: true` sowie Existenz eines Endpunkts zum Nachtragen von Kundendaten an eine bestehende Reservierung
- Keine Datenbankmigration nötig
