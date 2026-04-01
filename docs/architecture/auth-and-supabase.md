# Auth and Supabase Wiring

## Stand dieser Phase
- Supabase Client vorbereitet
- Auth Provider mit Session-Handling angelegt
- Login/Signup Screen implementiert
- App entscheidet jetzt zwischen Auth Flow und Main Tabs
- initiales SQL-Schema für `leads` und `ai_generations` angelegt
- RLS-Basis definiert

## Nächster Schritt
- Supabase-Projekt anlegen oder anbinden
- Schema aus `supabase/schema.sql` ausrollen
- Env-Werte lokal setzen
- Auth Flow auf echtem Projekt testen

## Hinweise
- Für Mobile-Session-Persistenz kann später `@react-native-async-storage/async-storage` ergänzt werden
- Für MVP ist der aktuelle Einstieg okay, aber Persistenz sollten wir zeitnah härten
