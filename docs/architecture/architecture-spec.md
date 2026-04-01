# Architecture Spec — AI Sales Copilot

## Zielarchitektur
Eine Expo/React-Native-App mit Supabase für Auth und Datenhaltung sowie einer sicheren serverseitigen KI-Schicht für Textgenerierung.

## Hauptbausteine

### 1. Mobile App
- Auth Flow
- Today View
- Lead List
- Lead Detail
- Create/Edit Lead
- AI Actions

### 2. Supabase Auth
- Signup / Login
- Session Handling
- Nutzerbindung an Daten

### 3. Supabase Database
- leads
- ai_generations

### 4. AI Service Layer
- Follow-up-Text generieren
- Notizen zusammenfassen
- nächste Aktion vorschlagen
- keine Secret-Nutzung im Client

## Datenmodell

### leads
- id
- user_id
- name
- company
- email
- phone
- contact_channel
- status
- notes
- next_action
- follow_up_date
- created_at
- updated_at

### ai_generations
- id
- user_id
- lead_id
- type
- prompt_context
- output
- created_at

## Navigation
Bottom Tabs:
- Today
- Leads
- Settings

## Security-Annahmen
- jede Lead-Zeile gehört genau einem User
- RLS auf User-Ebene
- AI nur über sicheren Serverpfad
- keine sensiblen Secrets im App-Bundle
- Logging ohne sensible Klartextdaten

## Definition of Done
- Auth funktioniert
- Leads CRUD für MVP steht
- Today View zeigt fällige Leads
- AI Follow-up Generation funktioniert
- Daten pro User geschützt
- Grundlegende Fehler- und Ladezustände vorhanden
