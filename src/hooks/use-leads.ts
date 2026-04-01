import { useCallback, useEffect, useState } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { Database } from '../types/supabase';

type LeadRow = Database['public']['Tables']['leads']['Row'];
type LeadInsert = Database['public']['Tables']['leads']['Insert'];
type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export function useLeads(userId?: string) {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    if (!userId) {
      setLeads([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('leads')
      .select('*')
      .order('updated_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setLeads([]);
    } else {
      setLeads(data ?? []);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  async function createLead(payload: Omit<LeadInsert, 'user_id'>) {
    if (!userId) return { error: 'Kein aktiver User vorhanden.' };

    const { error: insertError } = await supabase.from('leads').insert({
      ...payload,
      user_id: userId,
    });

    if (insertError) {
      return { error: mapSupabaseError(insertError) };
    }

    await loadLeads();
    return { error: null };
  }

  async function updateLead(id: string, payload: LeadUpdate) {
    const { error: updateError } = await supabase
      .from('leads')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return { error: mapSupabaseError(updateError) };
    }

    await loadLeads();
    return { error: null };
  }

  return {
    leads,
    loading,
    error,
    reload: loadLeads,
    createLead,
    updateLead,
  };
}

function mapSupabaseError(error: PostgrestError) {
  return error.message;
}
