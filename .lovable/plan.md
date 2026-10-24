# Kurskatalog lädt nicht — Befund (nur Untersuchung)

## Befund
- Das Backend dieses Projekts (Lovable Cloud) ist **pausiert**. Die Adresse des Backends wird gar nicht mehr aufgelöst, deshalb erreicht keine Anfrage die Katalog-Funktion `yeti-products`.
- Es gibt in den letzten 2 Tagen keine Protokolleinträge für Funktionsaufrufe: Die Anfragen kommen gar nicht erst an.
- YETI Core (`get-website-products`) ist erreichbar. Ohne Schlüssel antwortet es mit 401 Unauthorized, so wie es sein soll. Der Fehler liegt also nicht bei Core.
- Am Code liegt es nicht: Es wurde nichts geändert, und die Website ruft den Katalog wie bisher ab.

## Kleinste Lösung
1. Das Backend wieder einschalten (Cloud → Einstellungen → Fortsetzen). Code muss dafür nicht geändert werden.
2. Danach prüfen: `yeti-products` antwortet mit 200 und liefert Produkte, und die Kurskarten auf der veröffentlichten Seite laden wieder.

## Nicht geprüft
- Mit einem gültigen Schlüssel wurde Core nicht aufgerufen (nur ohne Schlüssel, daher 401).
- Warum das Backend pausiert wurde, ist nicht bekannt, z. B. wegen Inaktivität oder Abrechnung.
