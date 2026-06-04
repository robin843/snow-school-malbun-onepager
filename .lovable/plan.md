## Ziel

Vier konkrete Verbesserungen ohne Funktionsänderungen am Backend:

1. Alle Blöcke auf Mobile zentrieren
2. Christoph-Call-Button (VoiceBot) kleiner & enger in die Ecke
3. Einheitlicher Border-Radius überall – ausser Header & Hero
4. „Jetzt buchen" aus einer Kurs-Karte übernimmt Disziplin & Privat/Gruppe in die Buchungsseite

---

## 1. Mobile-Zentrierung

Betroffene Sections: `Kontakt.tsx`, `Jobs.tsx`, `Team.tsx`, `Kursuebersicht.tsx`, `FAQ.tsx`, `Footer.tsx`.

- Mobile (<sm): alle Karten/Texte in einer Single-Column-Grid mit `mx-auto`, `text-center sm:text-left` dort wo sinnvoll.
- `Kontakt.tsx`: Icon+Label-Zeilen unter `sm` als `flex-col items-center text-center`, ab `sm` zurück zu `flex-row items-start text-left`.
- Karten erhalten `max-w-md mx-auto sm:max-w-none` damit sie auf 390 px sauber zentriert wirken und keine Full-Bleed-Block-Optik haben.
- Section-Header-Chips (z. B. „Über uns", „Kontakt & Standort") bekommen `mx-auto` und werden auf Mobile mittig gesetzt.

## 2. VoiceBot kleiner & in die Ecke (`src/components/VoiceBot.tsx`)

- Bild von `w-32 h-32` → `w-16 h-16 sm:w-20 sm:h-20`.
- Border `border-4` → `border-2`, Phone-Badge `p-3` → `p-1.5`, Icon-Size 20 → 14.
- Position: `bottom-4 right-4 sm:bottom-6 sm:right-6` (statt `bottom-8 right-8` / `bottom-24 right-8`).
- „Sprich mit Christoph"-Bubble nur ab `sm` sichtbar (`hidden sm:block`), damit auf Mobile nur der kompakte runde Button in der Ecke sitzt.
- `ring-6` → `ring-2`, damit der Halo nicht riesig wirkt.

## 3. Einheitlicher Radius

- In `index.css` `--radius: 0.75rem` bleibt → entspricht Tailwind `rounded-lg`.
- Wir definieren als Projekt-Konvention: alle Cards, Buttons, Inputs, Badges (ausser `rounded-full`-Pills für Filter/Icons), Info-Boxen und Modale nutzen **`rounded-lg`** (= `var(--radius)`).
- Ausnahmen: `Hero` und `Navigation`/Header behalten ihre Original-Radii (inkl. der schrägen Secondary-Boxen mit `rotate-1`).
- Konkrete Stellen die angepasst werden:
  - `Kursuebersicht.tsx`: Card `rounded-2xl` → entfernen (Card-Default `rounded-lg` greift), innere `rounded-xl`/`rounded-2xl` Wrapper → `rounded-lg`, Info-Pillen `rounded-full` bleiben (Filter-Chips).
  - `Buchung.tsx`: alle `rounded-xl`/`rounded-2xl` → `rounded-lg`.
  - `Kontakt.tsx`: Icon-Boxen `rounded-lg` bleibt, Map-Container `rounded-lg` bleibt.
  - `Jobs.tsx`, `Team.tsx`, `FAQ.tsx`: alle Karten + Inner-Wrapper auf `rounded-lg` vereinheitlichen.
  - Buttons nutzen Shadcn-Default (`rounded-md` aus `button.tsx`) — bleibt, weil das aus der Komponente kommt; keine Custom-Override-Klassen mit anderem Radius mehr.

## 4. Kursauswahl in die Buchung übernehmen

Aktuell ruft `Kursuebersicht.handleBook` einfach `navigate("/buchung")` auf, Schritt 1 zeigt also immer den Default „Privatkurs".

Vorgehen:

- `Kursuebersicht.tsx`:
  - `handleBook(course)` bekommt das Kurs-Objekt. Mapping:
    - `productType = course.id.startsWith("privat") ? "private" : "group"`
    - `sport = course.discipline` (`ski` | `snowboard`)
    - `courseId = course.id` (für künftige Nutzung / Hinweistext)
  - Navigation: `navigate(\`/buchung?type=${productType}&sport=${sport}&course=${course.id}\`)`.
  - `CourseCardView` bekommt `onBook` weiterhin als Callback; Aufrufer übergibt `() => handleBook(course)`.

- `Buchung.tsx`:
  - `useSearchParams` aus `react-router-dom`.
  - Initial-State über Lazy-Init lesen:
    - `productType` → `searchParams.get("type")` validiert gegen `"private" | "group"`, sonst `"private"`.
    - `sport` → `searchParams.get("sport")` validiert gegen `"ski" | "snowboard"`, sonst aktueller Default.
  - Optional: ausgewählten Kursnamen (`course`) als kleine Info-Badge im Schritt 1 anzeigen („Vorausgewählt: Privatkurs Ski") — rein Anzeige, kein Backend.
  - URL bleibt unverändert nach Mount, kein Replace nötig.

Damit landet man aus jeder Karte direkt im richtigen Buchungsmodus.

## Technische Details

- Keine Backend-Änderungen, keine neuen Routen.
- Keine neuen Packages.
- `Hero.tsx`-Button auf „Kurs jetzt buchen" bleibt unverändert (führt weiter auf `/buchung` ohne Vorauswahl).
- Konsistenter Radius wird durch direktes Bearbeiten der Klassen erreicht, keine neue CSS-Variable nötig.
- Verifikation nach Implementierung: Preview im 390-px-Mobile-Viewport prüfen (Zentrierung, kompakter Call-Button, einheitliche Radii) und einmal aus Kursliste → Buchung navigieren und Schritt 1 kontrollieren.
