# Feedback-Runde: Titel, Farben, Levels, Texte

## 1. Pinselstrich-Hintergrund für Titel
- Neuer Titel-Stil wie im Beispielbild: unregelmässiger, ausgefranster Farbstreifen hinter dem Text, darauf dunkelblaue Schrift (keine Verläufe mehr).
- Hero: "Die Faszination Wintersport" und "Ski- und Snowboardkurse in Malbun".
- Abschnitts-Titel abwechselnd: Kursübersicht (rot), Unsere Levels (blau), Skischulleitung (rot), Unser Team (blau), Werde Teil unseres Teams (rot), Kontakt & Standort (blau), Häufige Fragen (rot).
- "Rot" und "Blau" sind dabei die bestehenden Pastelltöne Rosé und Eisblau.

## 2. Aufräumen bei den Titeln
- Die kleinen Kästen "Kurse & Tarife", "Swiss Snow League" und "FAQ" werden entfernt.
- "Häufige Fragen" bekommt dieselbe Schrift, Grösse und Gestaltung wie die anderen Titel. Die abgeschnittenen "g" werden behoben.

## 3. Kurskarten
- Privatkurs Ski und Snowboard: Preise in zwei beschriftete Blöcke "Einzellektion (1 Std.)" und "Doppellektion (2 Std.)" aufteilen, mit Trennlinie dazwischen.
- Fehlende Preise (Windel-Wedel, Ganztageskurs, Samstagskurs, Carving CHF 99, Snowboard-Kurse inkl. CHF 90): **werden in YETI nachgetragen** und erscheinen danach automatisch. Auf der Website wird nichts fest eingetragen.

## 4. Farbregeln
- Gelb nur noch für Kontakt-Aktionen: Buchen, Fragen, Bewerben.
- "Werde Teil unseres Teams": Rosé statt Gelb.
- Stelleninserate: Skilehrer Eisblau; Kinderbetreuung und Büro Rosé.

## 5. Unsere Levels
- Ski, Swiss Snow Academy: ohne "Black", ohne Kasten und Pokal, geschrieben wie die Leagues:
  - Zeile 1: Academy Rookie
  - Zeile 2: Freestyle · Freeride · Race
- Snowboard: neue Zeile "Red Academy" (Freestyle · Turns) nach der Blue League, danach "Swiss Snow Academy" (Freestyle · Freeride · Turns), ohne Kasten und Pokal.
- Falls deine angekündigte Übersicht davon abweicht, passe ich das an.

## 6. Skischulleitung, Kontakt, Karte
- "Über uns" wird zu "Skischulleitung", mit deinem Text über Christoph Bühler (genau so, wie du ihn geschickt hast).
- Bürozeiten: Montag bis Sonntag, 09:00–12:00 und 13:00–16:00 Uhr.
- Standort: deine Google-Karte (My Maps) wird eingebettet. Wenn sie nicht öffentlich eingebettet werden kann, sage ich dir Bescheid und lasse die jetzige Karte stehen.

## Offen / wartet auf dich
- FAQ 1:1 von schneesportschule.li/faq: Ich übernehme den Text von der Seite. Wenn das PDF kommt, gleiche ich ihn damit ab.
- Texte der Skilehrer im Team kommen später über YETI. Hier ändert sich vorerst nichts.
- Preise in YETI nachtragen (siehe Punkt 3).

## Technische Details
- Neue wiederverwendbare `BrushHeading`-Komponente mit `tone="blush" | "ice"`. Der ausgefranste Rand entsteht über eine SVG-Maske bzw. einen SVG-Hintergrund, die Farben kommen aus den bestehenden Tokens. Der Header bleibt unverändert.
- Betroffene Dateien: Hero, Kursuebersicht (Titel, Badges, Levels-Daten, Gruppierung der Privat-Tarife nach `duration_minutes`), Team bzw. Über-uns-Abschnitt, Jobs, Kontakt, FAQ.
- Die Logik für YETI, Preise und Buchungssperre bleibt unverändert. Es wird nichts veröffentlicht.
