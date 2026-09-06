# Lehrer-Profile anzeigen, sobald sie in YETY auf „Web aktiv" stehen

Heute wird ein Profil nur dann auf der Website gezeigt, wenn Anzeigename, Funktion, Kurztext **und** Bild ausgefüllt sind. Fehlt eines davon, verschwindet das Profil komplett. Das soll pragmatischer werden: Was in YETY für die Website freigegeben ist, wird angezeigt – auch wenn Felder leer sind.

## Was sich ändert

1. **Freigabe entscheidet, nicht die Vollständigkeit**
   - Ein Profil wird durchgereicht, sobald ein Name vorhanden ist (Anzeigename, sonst zusammengesetzt aus Vor-/Nachname).
   - Funktion, Kurztext und Bild sind optional. Fehlt eines, wird es einfach weggelassen.
   - Reihenfolge von YETY bleibt erhalten.

2. **Bilder toleranter behandeln**
   - Auch Bild-Links ohne vollständige Adresse (relative Pfade) werden akzeptiert und ergänzt.
   - Kein Bild oder Bild lädt nicht: Karte zeigt den Anfangsbuchstaben, wie bisher.

3. **Karten-Darstellung**
   - Ohne Funktion oder Kurztext fällt die jeweilige Zeile weg, die Karte bleibt sauber ausgerichtet.
   - Alles andere (Abschnitt „Über uns", Leitungstext, Teamfoto, „Unser Team", Karussell, Layout, 2 Karten mobil / 4 ab Tablet) bleibt unverändert.

4. **Sofort sichtbar**
   - Beim erneuten Laden wird der 5-Minuten-Zwischenspeicher übersprungen, damit die Änderung direkt geprüft werden kann; danach greift er wieder normal.

## Technische Details

- `supabase/functions/yeti-public-instructors/index.ts`: `sanitize()` verlangt nur noch einen Namen; alternative Feldnamen (`name`, `first_name`/`last_name`, `title`, `function`, `bio`/`description`, `photo_url`/`image_url`/`avatar_url`) werden mitgelesen; relative Bildpfade werden absolut gemacht; Cache, CORS, `callYeti` und das Fehlerverhalten (`{ team: [], error: "team_unavailable" }`, Status 200, Log ohne Personendaten) bleiben gleich.
- `src/hooks/useYetiPublicInstructors.ts`: `role_label`, `teaser`, `portrait_url` werden optional (`string | undefined`); die Client-Prüfung filtert nur noch Einträge ohne Namen aus.
- `src/components/Team.tsx`: `InstructorCard` rendert Funktion und Teaser nur, wenn vorhanden; Bildbereich zeigt bei fehlendem oder fehlerhaftem Bild den Anfangsbuchstaben.
- Buchung, Reservierung, Zahlung und alle anderen Bereiche bleiben unangetastet.

## Prüfung nach der Umsetzung

- Typprüfung, Funktion neu deployen, Schnittstelle mit Cache-Umgehung abrufen und Anzahl gelieferter Profile prüfen.
- Testprofil erscheint auch ohne Funktionstext/Kurztext; Darstellung bei 360 px und Desktop ohne Überlauf.
