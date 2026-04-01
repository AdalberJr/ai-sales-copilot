# Post-Release Review — AI Sales Copilot v0.1

**Datum:** 2026-04-01  
**Scope:** Erster vollständiger MVP-Durchlauf von Idee bis laufendem Backend  
**Reviewer:** Lead / Orchestrator Agent

---

## Ergebnis

Was wir gebaut haben:
- Mobile App mit Expo + React Native
- Supabase Backend mit Auth, Datenbank, RLS
- Leads CRUD mit Status und Follow-up
- Today View mit Quick Actions
- AI Actions (lokaler Fallback + Server-Wrapper-Vorbereitung)
- GitHub-Repo mit Doku, Architektur und Tickets

Was wir nicht gebaut haben (bewusst):
- echten AI-Endpunkt
- Session-Persistenz
- Push-Notifications
- Team-Features

---

## Was gut funktioniert hat

### Planungsphase
- Brief, Research, Architektur und Tickets vor dem ersten Code
- klare Definition of Done verhinderte Scope-Creep
- Rollentrennung hat strukturiert, auch wenn nur ein Agent aktiv war

### Dokumentation
- Architecture Spec war nützliche Referenz beim Build
- Supabase Schema und Doku erleichterte Onboarding
- Templates haben die Übergaben schneller gemacht

### Build-Qualität
- TypeScript durchgängig
- `tsc --noEmit` vor jedem Commit
- RLS von Anfang an geplant und angelegt

### Infrastruktur
- Supabase-Projekt, Schema und Testdaten vollständig automatisiert
- GitHub-Repo von Anfang an klar strukturiert
- `.env`-Handling sauber von Start an

---

## Was schlecht gelaufen ist

### 1. Dependency-Chaos beim Setup
**Problem:** Expo/npm Paketversionen stimmten nicht. CRC-Fehler bei Assets. Mehrere Runden Fixes nötig.  
**Ursache:** Kein sauberes Template-Setup. Pakete manuell zusammengestellt statt `npx create-expo-app` korrekt zu nutzen.  
**Lösung beim nächsten Mal:** Immer mit `npx create-expo-app` starten. Nie manuell einen Expo-Stack zusammenbauen.

### 2. Research war zu dünn
**Problem:** Expo + Supabase wurde empfohlen ohne echten Vergleich.  
**Ursache:** Research-Phase zu schnell abgeschlossen. Keine echte Risikoabwägung gegen Alternativen.  
**Lösung beim nächsten Mal:** Research Memo muss mindestens 2 echte Optionen vergleichen mit klaren Tradeoffs.

### 3. Security Gate nicht wirklich ausgeführt
**Problem:** RLS wurde angelegt aber nie getestet. Kann User A auf Leads von User B zugreifen? Unbekannt.  
**Ursache:** Security Review war theoretisch, nicht operativ.  
**Lösung beim nächsten Mal:** Security Gate braucht einen echten Testschritt — mindestens 2 User anlegen und Cross-Access testen.

### 4. Build-Tickets zu grob
**Problem:** „Ticket 1 — Foundation" ist kein gutes Ticket. Keine messbaren Akzeptanzkriterien.  
**Ursache:** Tickets wurden als grobe Phasen statt als prüfbare Aufgaben angelegt.  
**Lösung beim nächsten Mal:** Jedes Ticket braucht: Ziel, Scope, Done-Kriterium, Risiken.

### 5. AI ist Fake
**Problem:** „AI Sales Copilot" hat keine echte AI. Der Copilot-Teil ist ein lokaler Template-Text.  
**Ursache:** AI-Endpunkt wurde bewusst als späteres Feature geparkt — aber nicht klar genug kommuniziert.  
**Lösung beim nächsten Mal:** AI-Integration gehört in den MVP-Scope wenn es der Produktname verspricht.

### 6. Session-Persistenz fehlt
**Problem:** Jeder App-Start erfordert neuen Login.  
**Ursache:** AsyncStorage wurde als nice-to-have eingestuft.  
**Lösung beim nächsten Mal:** Session-Persistenz ist kein Nice-to-have bei einer Mobile-App. Gehört in Ticket 2.

---

## Learnings für dev-agent-os

### System-Learnings

1. **Template zuerst, dann Struktur**  
   Nie einen Expo-Stack manuell zusammenbauen. Immer mit offiziellem Template starten und dann erweitern.

2. **Research braucht echte Alternativen**  
   Ein Research Memo ohne Vergleich ist kein Research, sondern eine Empfehlung ohne Begründung.

3. **Security Gate ist operativ, nicht theoretisch**  
   RLS anlegen reicht nicht. Security bedeutet testen, nicht dokumentieren.

4. **Tickets müssen prüfbar sein**  
   Ein Ticket ohne Akzeptanzkriterien ist eine Beschreibung, kein Arbeitsauftrag.

5. **AI-Claims müssen im MVP erfüllbar sein**  
   Wenn das Produkt „AI" im Namen hat, muss AI im ersten Release funktionieren.

6. **Session-Persistenz ist keine Option**  
   Bei Mobile-Apps gehört AsyncStorage-basierte Session-Persistenz in Phase 1.

### Prozess-Learnings

- Post-Release ist Pflicht, nicht Optional
- Gates müssen gegen echte Kriterien geprüft werden, nicht nur abgehakt
- Research → Architect Handoff braucht mehr Schärfe

---

## Offene Punkte für v0.2

### Kritisch
- [ ] Echter AI-Endpunkt anbinden
- [ ] Session-Persistenz mit AsyncStorage
- [ ] Security Test: Cross-User-Zugriff prüfen

### Wichtig
- [ ] Tab-Icons ergänzen
- [ ] Edge Case Handling verbessern
- [ ] Echter Testlauf mit Nutzer der App noch nicht kennt

### Nice-to-have
- [ ] Splash-Screen
- [ ] Bessere Error-States
- [ ] Pull-to-refresh überall konsistent

---

## Fazit

Guter erster Durchlauf. Das System hat funktioniert, aber noch nicht auf dem Niveau das wir wollen. Die Schwächen sind dokumentiert und bekannt — das ist der Unterschied zu einem schlechten Prozess.

**Gesamt-Bewertung: 6.5/10**  
Für einen ersten echten Testlauf solide. Für ein produktionsreifes System noch nicht.

Das nächste Projekt sollte mit den Learnings aus diesem Review starten.
