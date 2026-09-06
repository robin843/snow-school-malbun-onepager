# Veröffentlichte Skilehrer-Profile aus YETY auf der Website anzeigen

Die Team-Sektion zeigt heute eine fest im Code hinterlegte Namensliste mit Buchstaben-Platzhaltern. Künftig kommen nur die in YETY freigegebenen Profile (Foto, Anzeigename, Funktion, kurzer Text) direkt aus YETY.

Vorabprüfung: Die YETY-Schnittstelle `get-public-instructors` ist erreichbar und verlangt den Schlüssel (Antwort 401 ohne Schlüssel). Ob sie inhaltlich genau das vereinbarte Format liefert, wird als erster Umsetzungsschritt serverseitig mit dem vorhandenen Schlüssel geprüft. Passt das Format nicht, wird nichts ersetzt und ich melde die Abweichung.

## Was gebaut wird

1. **Sichere Server-Weiterleitung** (`yeti-public-instructors`)
   - Nur GET/OPTIONS, bestehendes CORS-Muster.
   - Ruft YETY über den vorhandenen gemeinsamen Helfer `callYeti` mit dem serverseitigen Schlüssel auf; der Schlüssel bleibt ausschließlich auf dem Server.
   - Prüft jeden Eintrag: nur Profile mit gefülltem Anzeigename, Funktion, Text und Bild-Link werden durchgereicht; Reihenfolge von YETY bleibt erhalten.
   - Zwischenspeicher für erfolgreiche Antworten: 5 Minuten. Fehler werden nicht zwischengespeichert.
   - Bei Fehler, Zeitüberschreitung oder fehlerhaften Daten: kurzer technischer Log-Eintrag ohne Personendaten und Antwort `{ team: [], error: "team_unavailable" }` mit Status 200.

2. **Datenanbindung im Frontend** (`src/hooks/useYetiPublicInstructors.ts`)
   - Gleiches Muster wie `useYetiProducts` über `supabase.functions.invoke`.
   - Liefert `team`, `isLoading`, `isUnavailable`; bei Störung eine leere Liste.
   - Keine direkten Zugriffe des Browsers auf YETY.

3. **Team-Sektion** (`src/components/Team.tsx`)
   - Unverändert: Abschnitt `id="team"`, Überschrift „Über uns", Einleitung, Leitungstext samt Zitat, Teamfoto, Überschrift „Unser Team", Karussell-Optik und Layout.
   - Ersetzt: die feste Namensliste. Karten in Achtergruppen, 2 Karten pro Reihe mobil, 4 ab mittlerer Breite, gleiche Karussell-Bedienung.
   - Jede Karte: Portrait im bisherigen Hochformat (`object-cover`), Bildbeschreibung „Portrait von {Name}", Anzeigename, darunter Funktion, darunter der Kurztext auf maximal drei Zeilen begrenzt.

4. **Zustände**
   - Laden: einige leichte Platzhalterkarten, keine alte Liste.
   - Keine freigegebenen Profile oder YETY gerade nicht erreichbar: nur der Karussell-Bereich verschwindet, alle redaktionellen Inhalte bleiben; keine Fehlermeldung für Gäste.
   - Bild lädt nicht: nur dieses Bild wird durch einen neutralen Anfangsbuchstaben ersetzt.
   - Lange Namen/Texte werden sauber abgeschnitten, kein seitliches Verschieben ab 360 px.

## Technische Details

- Neue Datei `supabase/functions/yeti-public-instructors/index.ts` nach dem Vorbild von `yeti-products` (In-Memory-Cache, `corsHeaders`, `callYeti`).
- Kein `VITE_`-Secret, kein direkter Datenbank- oder Storage-Zugriff auf YETY, keine internen Felder (IDs, E-Mails, Verfügbarkeiten etc.).
- Buchung, Reservierung, Zahlung, Rechtstexte und alle übrigen Komponenten bleiben unangetastet.

## Prüfung nach der Umsetzung

- Serverseitiger Aufruf der YETY-Schnittstelle erfolgreich, Antwortformat geprüft.
- Kein Schlüssel im Browser-Bundle.
- Anzeige eines Testprofils korrekt, Reihenfolge wie von YETY geliefert.
- Lade-, Leer-, Störungs- und Bildfehler-Zustand geprüft.
- Darstellung bei 360 px, 390 px, Tablet und Desktop ohne Überlauf; Kursladen und Buchungsstrecke unverändert.
