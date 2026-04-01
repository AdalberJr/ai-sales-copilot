# AI Actions Notes

## Stand dieser Phase
- AI-Actions im Produktmodell definiert
- vorbereiteter AI-Service mit sicherem Server-Wrapper-Endpunkt angelegt
- lokaler Fallback eingebaut, damit die App ohne AI-Backend trotzdem testbar bleibt
- Hook für AI-Generierung + Speicherung in `ai_generations` vorbereitet
- Ziel: Follow-up, Summary und Next Action direkt pro Lead starten

## Sicherheitsgedanke
- keine Secret-Nutzung im Client
- produktive AI-Calls sollen nur gegen einen serverseitigen Wrapper gehen
- lokaler Fallback dient nur als MVP-/UI-Testhilfe

## Nächster Schritt
- AI UI im Lead Detail einbauen
- Ergebnisse anzeigen
- Copy-/Übernehmen-Flow ergänzen
