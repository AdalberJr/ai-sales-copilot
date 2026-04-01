# Data Model

## leads

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | uuid | ja | Primärschlüssel |
| user_id | uuid | ja | Besitzer |
| name | text | ja | Lead-Name |
| company | text | nein | Firma |
| email | text | nein | E-Mail |
| phone | text | nein | Telefon |
| contact_channel | text | nein | Kanal |
| status | text | ja | Pipeline-Status |
| notes | text | nein | Notizen |
| next_action | text | nein | nächste Aufgabe |
| follow_up_date | timestamptz | nein | Wiedervorlage |
| created_at | timestamptz | ja | erstellt am |
| updated_at | timestamptz | ja | aktualisiert am |

## ai_generations

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | uuid | ja | Primärschlüssel |
| user_id | uuid | ja | Besitzer |
| lead_id | uuid | nein | Bezogener Lead |
| type | text | ja | follow_up / summary / next_action |
| prompt_context | text | nein | Eingabekontext |
| output | text | ja | AI-Ergebnis |
| created_at | timestamptz | ja | erstellt am |
