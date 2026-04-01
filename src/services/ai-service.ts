import { Database } from '../types/supabase';
import { AiActionType } from '../types/ai';

type LeadRow = Database['public']['Tables']['leads']['Row'];

type GenerateAiResult = {
  output: string;
};

const aiServerUrl = process.env.AI_SERVER_URL;

export async function generateAiSuggestion(lead: LeadRow, type: AiActionType): Promise<GenerateAiResult> {
  if (!aiServerUrl) {
    return {
      output: buildLocalFallback(lead, type),
    };
  }

  const response = await fetch(`${aiServerUrl}/ai/sales-copilot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      lead: {
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        contact_channel: lead.contact_channel,
        status: lead.status,
        notes: lead.notes,
        next_action: lead.next_action,
        follow_up_date: lead.follow_up_date,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('AI-Service antwortet gerade nicht stabil.');
  }

  return response.json();
}

function buildLocalFallback(lead: LeadRow, type: AiActionType) {
  const name = lead.name;
  const company = lead.company ? ` von ${lead.company}` : '';
  const note = lead.notes ? ` Kontext: ${lead.notes}` : '';
  const nextAction = lead.next_action ? ` Nächste bekannte Aktion: ${lead.next_action}.` : '';

  if (type === 'follow_up') {
    return `Hi ${name}, ich wollte mich noch einmal kurz melden${company}. Ich wollte nachhaken, ob du schon Zeit hattest, auf unser letztes Gespräch zu schauen. Wenn du magst, können wir die nächsten Schritte direkt abstimmen.${note}`;
  }

  if (type === 'summary') {
    return `${name}${company} befindet sich aktuell im Status "${lead.status}". Wichtige Notizen: ${lead.notes || 'Noch keine Notizen erfasst.'}${nextAction}`;
  }

  return `Sinnvoller nächster Schritt für ${name}${company}: ${lead.next_action || 'kurzes Follow-up senden und konkreten nächsten Termin oder Entscheidungspunkt abfragen'}.`;
}
