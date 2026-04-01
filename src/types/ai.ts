export type AiActionType = 'follow_up' | 'summary' | 'next_action';

export const aiActionOptions: { label: string; value: AiActionType; description: string }[] = [
  {
    label: 'Follow-up generieren',
    value: 'follow_up',
    description: 'Erstellt eine freundliche Nachricht für das nächste Nachfassen.',
  },
  {
    label: 'Notizen zusammenfassen',
    value: 'summary',
    description: 'Verdichtet verstreute Gesprächsnotizen in eine klare Kurzfassung.',
  },
  {
    label: 'Nächste Aktion vorschlagen',
    value: 'next_action',
    description: 'Gibt eine konkrete, knappe Empfehlung für den sinnvollsten nächsten Schritt.',
  },
];
