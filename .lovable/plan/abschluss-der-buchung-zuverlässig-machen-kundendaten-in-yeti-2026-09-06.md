# Abschluss der Buchung zuverlässig machen (Kundendaten in YETI)

## Was die Daten heute zeigen

- Die Tickets T-2026-998043 und T-2026-998044 sind abgelaufene, anonyme Platzhalter-Reservierungen. Sie stammen aus unserem eigenen Testlauf (zwei Holds am selben Tag, 10:00–12:00 und 14:00–16:00, ohne Abschluss) — nicht von echten Gästen.
- In unserer Datenbank existiert bisher **kein einziger Abschluss von einer echten Besucherin oder einem echten Besucher**. Alle abgeschlossenen Buchungen tragen unsere Testadresse.
- Ein Testabschluss (T-2026-998042) hat funktioniert: YETI hat Kundendaten übernommen, eine Kundennummer vergeben und Rechnung R-2026-00009 erzeugt. Der Vertrag funktioniert also grundsätzlich.
- Zwei andere Testtickets (T-2026-998038, T-2026-998040) antworteten mit „bereits bestätigt" **ohne** Kundennummer, Rechnungsnummer oder Betrag. Das ist der wichtigste Verdachtspunkt: YETI meldet Erfolg, ohne dass nachweislich Kunde, Teilnehmer und Rechnung vorhanden sind.

Daraus folgt: Bevor irgendetwas umgebaut wird, muss gemessen werden, an welcher Stelle der echte Ablauf abbricht.

## Phase 1 — Messen statt raten

1. Eine vollständige Testbuchung über die echte Website-Oberfläche durchführen (Kurs, Termin, Teilnehmer, Kontakt, Einwilligung, Rechnung, ein Klick auf den Abschluss-Knopf), mit einer eindeutigen Kennung.
2. Vorübergehende technische Protokolle an jeder Übergabestelle: Browser → Website-Abschlussfunktion → YETI. Protokolliert werden nur Kennungen, Zeitstempel, Statuscodes, Anzahl Teilnehmer, ob ein Kunde übermittelt wurde, ob eine Rechnung entstand — **keine Namen, Adressen, Telefonnummern, E-Mails, Geburtsdaten oder Reservierungstoken**.
3. Datenbankstand direkt nach dem Halten und direkt nach dem Abschluss prüfen (Status, Kundenkennung, Teilnehmer, Ablaufzeit, genau eine Rechnung).
4. Denselben Abschluss ein zweites Mal senden und prüfen, dass dieselben Referenzen zurückkommen und nichts doppelt entsteht.
5. Ergebnis: ein kurzer Befund, welche Übergabestelle als erste versagt (Knopf löst nicht aus / Formularprüfung blockiert / Reservierung abgelaufen / Abschlussfunktion lehnt ab / YETI nicht erreichbar / YETI lehnt ab / Speicherung scheitert / Rechnung scheitert / Antwort wird fälschlich als Fehler gewertet / Oberfläche bleibt stehen). Erst danach wird gezielt korrigiert.

## Phase 2 — Abschluss-Knopf und Ablaufzeit auf der Website

In `src/pages/Buchung.tsx`:

- Doppelklick-Schutz bleibt über eine synchrone Sperre; der Knopf bleibt bis zur Antwort im Ladezustand.
- Erfolg wird erst angezeigt, wenn die Antwort ausdrücklich erfolgreich ist; kein vorzeitiges Weiterleiten oder Leeren des Formulars.
- Fehler erscheinen als klarer Hinweis direkt im Schritt „Zahlung" samt „Erneut versuchen" — der Wiederholversuch nutzt dieselbe Reservierung und erzeugt weder ein zweites Ticket noch eine zweite Rechnung.
- Vor dem Senden wird geprüft, dass die aktive Reservierung noch zu Kurs, Teilnehmerzahl, Datum und Zeit passt.
- Sichtbarer Countdown ab der Reservierung, Warnung bei fünf Minuten Restzeit.
- Beim Übergang von „Kontakt" zu „Zahlung" wird die bestehende Reservierung **einmalig** um bis zu 15 Minuten verlängert (nur die Ablaufzeit, keine Personendaten, kein neues Ticket). Existiert dafür kein YETI-Endpunkt, entfällt die Verlängerung und es bleibt bei Countdown plus sauberer Wiederherstellung.
- Läuft die Zeit ab: eingegebene Daten bleiben erhalten, Schaltfläche „Verfügbarkeit erneut prüfen" legt eine neue Reservierung an und der Gast macht mit den bereits erfassten Angaben weiter.
- Erfolgsanzeige nennt Ticketnummer, Kundennummer und Rechnungsnummer. Bei unvollständiger Antwort wird zuerst der Buchungsstatus abgefragt, bevor ein Fehler gemeldet wird — nie eine zweite Buchung als Notlösung.

## Phase 3 — Abschlussfunktion und Fehlercodes

In `supabase/functions/yeti-confirm/index.ts`:

- Antwortet YETI mit „bereits bestätigt", wird der Buchungsstatus nachgeladen und geprüft, ob Kunde, Teilnehmer und Rechnung wirklich vorhanden sind. Fehlt etwas, wird das als eigener Fehlerfall gemeldet statt als Erfolg.
- Einheitliche interne Codes (Prüfung fehlgeschlagen, Reservierung abgelaufen, Zugang fehlgeschlagen, YETI nicht erreichbar, Abschluss fehlgeschlagen, Rechnung fehlgeschlagen, Antwort unbrauchbar). Nach aussen bleiben freundliche deutsche Meldungen.
- In `submitted_bookings` neu gespeichert: Anzahl Abschlussversuche, Zeitpunkt des letzten Versuchs, letzter Code, letzter Statuscode, Zeitpunkt der Bestätigung. Damit lassen sich abgebrochene Reservierung, abgelaufene Kasse, Prüffehler, YETI-Fehler und Erfolg unterscheiden. Keine Personendaten in Protokollen.

## Phase 4 — Tests von echten Daten trennen

- `supabase/functions/yeti-reserve/index.test.ts` verlangt künftig eine ausdrückliche Kennzeichnung als Nicht-Produktivumgebung und bricht sonst sofort ab.
- Jeder Testlauf erhält eine eigene Laufkennung; erzeugte Testreservierungen werden am Ende wieder freigegeben.
- Für die bekannten Testtickets (T-2026-998038 bis T-2026-998044) erstelle ich eine Liste zur Durchsicht — gelöscht wird nichts automatisch.

## Was ausserhalb dieses Projekts liegt

Die Punkte zum YETI-Backend (transaktionaler Abschluss mit genau einer Rechnung, feste Fehlercodes 410/422/409, sowie die Trennung von „Webreservierungen" in der Buchungsliste und den Kennzahlen) kann ich hier nicht umsetzen — dieses Projekt ist nur die Website. Ich liefere dafür eine präzise, direkt umsetzbare Anforderung an das YETI-Team, gestützt auf die Messergebnisse aus Phase 1.

## Technische Notizen

- Betroffene Dateien: `src/pages/Buchung.tsx`, `supabase/functions/yeti-confirm/index.ts`, `supabase/functions/yeti-booking-status/index.ts`, `supabase/functions/yeti-reserve/index.test.ts`
- Eine kleine Datenbankänderung an `submitted_bookings` für die Diagnosefelder
- Reserve-Pfad bleibt unverändert anonym; Zwei-Schritt-Architektur und die Regel „Onlinezahlung nur mit echter Zahlungsreferenz" bleiben bestehen
- `yeti-confirm` wird nach den Änderungen neu bereitgestellt
