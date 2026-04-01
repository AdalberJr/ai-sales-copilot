# Security Notes

## Pflichtannahmen
- jede Datenzeile gehört zu genau einem User
- kein Zugriff auf fremde Leads
- AI-Requests laufen nicht direkt mit geheimen API-Keys aus der App
- Logs dürfen keine unnötigen sensiblen Inhalte enthalten

## MVP-Risiken
- schwache Trennung zwischen Client und AI-Service wäre gefährlich
- fehlende RLS würde das Produkt sofort disqualifizieren
- unklare Behandlung sensibler Notizen kann Datenschutzprobleme erzeugen

## Mindestmaßnahmen
- RLS aktivieren
- User-gebundene Select/Insert/Update Policies definieren
- Secret Handling dokumentieren
- AI-Nutzung über Server-Wrapper führen
