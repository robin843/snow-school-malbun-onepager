## Ziele

1. Navigation auf reines Hamburger-Menü umstellen (auch auf Desktop), rechts neben „Jetzt buchen".
2. Neue FAQ-Sektion hinzufügen.
3. Preise-/Kursbereich um detaillierte Infos zu allen Kursarten erweitern (Ski Privat, Ski Gruppe, Ski Samstag, Windel-Wedel, Snowboard Privat, Snowboard Gruppe, Treffpunkte/Kurszeiten) inkl. aktualisierter Preise/Saison 2026/27.

## 1. Header / Navigation (`src/components/Navigation.tsx`)

- Desktop-Links (Preise, Über uns, Jobs, Kontakt) entfernen.
- Reihenfolge im Header (sowohl Desktop als auch Mobile):
  `Logo` … `Jetzt buchen` `Hamburger-Icon`
- Hamburger öffnet ein Slide-in-Panel (Shadcn `Sheet` von rechts) mit allen Links: Preise, Kurse, Über uns, Jobs, FAQ, Kontakt + zusätzlicher „Jetzt buchen"-Button.
- Bestehender Mobile-Dropdown-Block wird durch das Sheet ersetzt.
- `Menu`/`X`-Icon aus lucide-react bleibt.

## 2. Neue FAQ-Sektion

- Neue Datei `src/components/FAQ.tsx` mit Shadcn `Accordion`.
- In `src/pages/Index.tsx` zwischen `Kontakt` und `Footer` einfügen (`<FAQ />`), Section-id `faq` für Navigation.
- Inhalte (basierend auf den gelieferten Quellen), z. B.:
  - Wann ist Hoch-/Nebensaison 2026/27?
  - Wie lange dauert eine Einzel-/Doppellektion? (55 / 115 Min.)
  - Wie viele Personen pro Privatkurs? (max. 5)
  - Mindest-/Maximalgrösse Gruppenkurse? (5–13 Kinder Ski, 3–10 Snowboard)
  - Sind Liftkarte/Ausrüstung inklusive? (Nein)
  - Wo sind die Treffpunkte? (Hotel Gorfion, Malbipark, Kasse Sesselbahn Täli)
  - Ab welchem Alter ist der Windel-Wedel-Kurs? (2–4 J., ideal 3 J.)
  - Wann kann man bei Gruppenkursen einsteigen? (Anfänger nur montags, Fortgeschrittene jederzeit)
  - Gibt es Mittagsbetreuung? (12:00–14:00, CHF 30 / EUR 33 pro Tag/Kind)
  - Wie funktioniert der 10 %-Rabatt im Privatunterricht? (ab 4 Lektionen/Tag)

## 3. Erweiterte Kursinfos (`src/components/Preise.tsx`)

Aktuelle Karten „Privatkurse" und „Gruppenkurse" bleiben optisch als Top-Highlights, aber:

- Preise/Saison aktualisieren auf 2026/27 gemäss Quelle (z. B. EUR 83 statt 79, Saisonzeiten 19.12.2026–10.01.2027 usw.).
- Privatkurs-Doppellektionen ergänzen (10–12 CHF 190, 12–14 CHF 150, 14–16 CHF 170; Zusatzperson Doppel CHF 40).
- Hinweis „max. 5 Personen", „Lektion = 55 Min / Doppel = 115 Min" einfügen.

Darunter ein neuer Tab-/Karten-Block „Alle Kursangebote" mit Shadcn `Tabs` (Ski / Snowboard / Kinder) oder einfaches Grid mit 4 weiteren Karten:

1. **Ski-Samstagskurse** – 5 Samstage, Daten Kurs 1 (9.1.–6.2.2027) und Kurs 2 (20.2.–20.3.2027), Preise 150/200/245/285/320 CHF.
2. **Windel-Wedel-Kurs** – Alter 2–4, Mo–Mi 10–12, Preise 70/110/140 CHF, Treffpunkt Hotel Gorfion.
3. **Snowboard-Privatkurse** – identische Tarifstruktur wie Ski Privat, Hinweise wie oben.
4. **Snowboard-Gruppenkurse** – 14–16 Uhr, Preise 90/140/180/210/230 CHF, 3–10 Kinder, Treffpunkt Hotel Gorfion.

Zusätzlich neue Info-Box „Treffpunkte & Kurszeiten" mit:
- Windel-Wedel: Mo–Mi 10–12, Start Mo 10:00 Hotel Gorfion.
- Anfänger (Snow Kids Village, ab 4): Mo–Fr 10–12 & 14–16, nur ganze Tage, Start Mo 10:00 Hotel Gorfion.
- Fortgeschrittene (ab Blue Prince): Mo–Fr 10–12 & 14–16, Start Mo 10:00 Malbipark, Rückkehr 12:00 zum Hotel Gorfion.
- Privatunterricht: täglich 09–16, stündlicher Start, Empfehlung 12–14 Uhr.
- Allgemeiner Hinweis: Liftkarte und Ausrüstung nicht inklusive.

Jede Karte erhält dieselbe visuelle Sprache (Glow, Gradient-Header, Badge bei „Beliebt"), bleibt aber kompakter als die zwei Hauptkarten.

## Technische Hinweise

- Keine Backend-Änderungen.
- Verwendet bestehende UI-Komponenten: `Sheet`, `Accordion`, `Tabs`, `Card`, `Button`.
- Section-IDs: `preise`, `kurse` (neu für detaillierte Kursliste), `faq` (neu), bestehende bleiben.
- Hamburger-Menü-Links scrollen via `scrollIntoView` zu den jeweiligen Sections.
