# Supabase Setup

## Ziel
Die App lokal mit echtem Backend verbinden, ohne unsichere Abkürzungen.

## 1. Supabase Projekt anlegen
- neues Projekt in Supabase erstellen
- Region passend wählen
- Datenbankpasswort sicher speichern

## 2. Env-Werte in der App setzen
Lokale `.env` anlegen auf Basis von `.env.example`.

Benötigt:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `AI_SERVER_URL` (optional für produktive AI-Calls)

## 3. SQL Schema ausrollen
Datei:
- `supabase/schema.sql`

Dieses SQL im Supabase SQL Editor ausführen.

## 4. Auth prüfen
- E-Mail Signup erlauben
- Login testen
- falls Mail-Bestätigung aktiv ist: Verhalten bewusst einplanen

## 5. RLS prüfen
- Testuser A erstellt Leads
- Testuser B darf sie nicht sehen

## 6. Lokaler Testlauf
Im Projekt:
- `npm start`

Dann testen:
- Signup / Login
- Lead anlegen
- Lead bearbeiten
- Today View
- AI Action lokal fallback oder echter AI-Server

## 7. Spätere Härtung
- Async Storage für Session-Persistenz ergänzen
- AI-Server absichern
- Error Monitoring ergänzen
