import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { generateAiSuggestion } from '../services/ai-service';
import { Database } from '../types/supabase';
import { AiActionType } from '../types/ai';

type LeadRow = Database['public']['Tables']['leads']['Row'];

export function useAiActions(userId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAction(lead: LeadRow, type: AiActionType) {
    setLoading(true);
    setError(null);

    try {
      const result = await generateAiSuggestion(lead, type);

      if (userId) {
        await supabase.from('ai_generations').insert({
          user_id: userId,
          lead_id: lead.id,
          type,
          prompt_context: JSON.stringify({
            lead_id: lead.id,
            status: lead.status,
            next_action: lead.next_action,
          }),
          output: result.output,
        });
      }

      return { output: result.output, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter AI-Fehler';
      setError(message);
      return { output: null, error: message };
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    runAction,
  };
}
