import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../providers/auth-provider';
import { useLeads } from '../hooks/use-leads';
import { useAiActions } from '../hooks/use-ai-actions';
import { LeadDetailModal } from '../components/lead-detail-modal';
import { LeadForm, LeadFormValues } from '../components/lead-form';
import { Database } from '../types/supabase';
import { formatLeadStatus } from '../types/leads';
import { AiActionType } from '../types/ai';
import { formatFollowUpDate, getDatePlusDays, getTomorrowDate, toIsoAtDefaultTime } from '../utils/follow-up';

type LeadRow = Database['public']['Tables']['leads']['Row'];

export function TodayScreen() {
  const { session } = useAuth();
  const { leads, loading, reload, updateLead } = useLeads(session?.user.id);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const overdue = leads.filter((lead) => lead.follow_up_date && lead.follow_up_date.slice(0, 10) < todayKey);
  const dueToday = leads.filter((lead) => lead.follow_up_date && lead.follow_up_date.slice(0, 10) === todayKey);

  async function markAsContacted(lead: LeadRow) {
    const result = await updateLead(lead.id, {
      status: 'contacted',
      updated_at: new Date().toISOString(),
    });

    if (!result.error) {
      setActionMessage(`${lead.name} wurde als kontaktiert markiert.`);
    }
  }

  async function snoozeLead(lead: LeadRow, days: number) {
    const nextDate = days === 1 ? getTomorrowDate() : getDatePlusDays(days);
    const result = await updateLead(lead.id, {
      follow_up_date: toIsoAtDefaultTime(nextDate),
      updated_at: new Date().toISOString(),
    });

    if (!result.error) {
      setActionMessage(`Follow-up für ${lead.name} auf ${nextDate} verschoben.`);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.subtitle}>Deine wichtigsten Follow-ups zuerst. Überfällige Leads müssen sofort sichtbar sein.</Text>
      {actionMessage ? <Text style={styles.successText}>{actionMessage}</Text> : null}

      {loading ? <ActivityIndicator style={styles.loader} size="large" color="#0F172A" /> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Überfällig</Text>
        {overdue.length === 0 ? (
          <Text style={styles.emptyText}>Keine überfälligen Leads. Gut.</Text>
        ) : (
          overdue.map((lead) => renderTodayCard(lead, markAsContacted, snoozeLead))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Heute fällig</Text>
        {dueToday.length === 0 ? (
          <Text style={styles.emptyText}>Heute ist aktuell nichts fällig.</Text>
        ) : (
          dueToday.map((lead) => renderTodayCard(lead, markAsContacted, snoozeLead))
        )}
      </View>

      <Pressable onPress={reload} style={styles.inlineButton}>
        <Text style={styles.inlineButtonText}>Aktualisieren</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export function LeadsScreen() {
  const { session } = useAuth();
  const { leads, loading, error, reload, createLead, updateLead } = useLeads(session?.user.id);
  const { loading: aiLoading, error: aiError, runAction } = useAiActions(session?.user.id);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadRow['status']>('all');
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        lead.name.toLowerCase().includes(normalizedQuery) ||
        (lead.company ?? '').toLowerCase().includes(normalizedQuery) ||
        (lead.email ?? '').toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [leads, query, statusFilter]);

  async function handleSubmit(values: LeadFormValues) {
    setFormError(null);
    setSuccessMessage(null);

    const payload = {
      name: values.name.trim(),
      company: clean(values.company),
      email: clean(values.email),
      phone: clean(values.phone),
      contact_channel: values.contact_channel,
      status: values.status,
      notes: clean(values.notes),
      next_action: clean(values.next_action),
      follow_up_date: values.follow_up_date ? toIsoAtDefaultTime(values.follow_up_date) : null,
      updated_at: new Date().toISOString(),
    };

    if (!payload.name) {
      setFormError('Name ist Pflicht.');
      return;
    }

    const result = selectedLead
      ? await updateLead(selectedLead.id, payload)
      : await createLead({ ...payload, status: payload.status ?? 'new' });

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setFormVisible(false);
    setSuccessMessage(selectedLead ? 'Lead erfolgreich aktualisiert.' : 'Lead erfolgreich angelegt.');
    setSelectedLead(null);
    setDetailVisible(false);
    setAiOutput(null);
  }

  async function handleRunAiAction(lead: LeadRow, type: AiActionType) {
    setSuccessMessage(null);
    const result = await runAction(lead, type);
    if (!result.error) {
      setAiOutput(result.output);
    }
  }

  async function handleUseAiOutput(lead: LeadRow, target: AiActionType) {
    if (!aiOutput) return;

    const payload =
      target === 'next_action'
        ? { next_action: aiOutput }
        : { notes: lead.notes ? `${lead.notes}\n\n${aiOutput}` : aiOutput };

    const result = await updateLead(lead.id, payload);

    if (!result.error) {
      const updatedLead = {
        ...lead,
        ...payload,
      };
      setSelectedLead(updatedLead);
      setSuccessMessage(target === 'next_action' ? 'AI-Vorschlag als nächste Aktion übernommen.' : 'AI-Vorschlag in Notizen übernommen.');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Leads</Text>
          <Text style={styles.subtitle}>Dein CRM-Light. Schnell sehen, was offen ist und wo der nächste Umsatz steckt.</Text>
        </View>
        <Pressable
          onPress={() => {
            setSelectedLead(null);
            setFormError(null);
            setAiOutput(null);
            setFormVisible(true);
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>+ Lead</Text>
        </Pressable>
      </View>

      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <TextInput
        style={styles.searchInput}
        placeholder="Suche nach Name, Firma oder E-Mail"
        placeholderTextColor="#94A3B8"
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.filterRow}>
        {['all', 'new', 'contacted', 'in_conversation', 'proposal_sent', 'won', 'lost'].map((value) => {
          const selected = statusFilter === value;
          return (
            <Pressable
              key={value}
              onPress={() => setStatusFilter(value as typeof statusFilter)}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
            >
              <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                {value === 'all' ? 'Alle' : formatLeadStatus(value as LeadRow['status'])}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
        contentContainerStyle={filteredLeads.length === 0 ? styles.emptyListContainer : styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setSelectedLead(item);
              setAiOutput(null);
              setDetailVisible(true);
            }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{formatLeadStatus(item.status)}</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>{item.company || 'Keine Firma hinterlegt'}</Text>
            <Text style={styles.cardMeta}>Nächste Aktion: {item.next_action || '—'}</Text>
            <Text style={styles.cardMeta}>Follow-up: {formatFollowUpDate(item.follow_up_date)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#0F172A" />
          ) : (
            <Text style={styles.emptyText}>Noch keine Leads vorhanden. Leg den ersten an.</Text>
          )
        }
      />

      <LeadDetailModal
        lead={selectedLead}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        onEdit={(lead) => {
          setSelectedLead(lead);
          setDetailVisible(false);
          setFormVisible(true);
        }}
        aiLoading={aiLoading}
        aiOutput={aiOutput}
        aiError={aiError}
        onRunAiAction={handleRunAiAction}
        onUseAiOutput={handleUseAiOutput}
      />

      <LeadForm
        visible={formVisible}
        initialLead={selectedLead}
        onClose={() => {
          setFormVisible(false);
          setSelectedLead(null);
        }}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

export function SettingsScreen() {
  const { session, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Angemeldet als {session?.user.email ?? 'unbekannt'}.</Text>
      <Pressable onPress={signOut} style={styles.inlineButton}>
        <Text style={styles.inlineButtonText}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function renderTodayCard(
  lead: LeadRow,
  onMarkContacted: (lead: LeadRow) => void,
  onSnooze: (lead: LeadRow, days: number) => void
) {
  return (
    <View key={lead.id} style={styles.todayCard}>
      <Text style={styles.todayCardTitle}>{lead.name}</Text>
      <Text style={styles.todayCardMeta}>{lead.company || 'Keine Firma'}</Text>
      <Text style={styles.todayCardMeta}>Status: {formatLeadStatus(lead.status)}</Text>
      <Text style={styles.todayCardMeta}>Nächste Aktion: {lead.next_action || '—'}</Text>
      <Text style={styles.todayCardMeta}>Follow-up: {formatFollowUpDate(lead.follow_up_date)}</Text>

      <View style={styles.quickActionRow}>
        <Pressable onPress={() => onMarkContacted(lead)} style={[styles.quickActionButton, styles.quickActionPrimary]}>
          <Text style={styles.quickActionPrimaryText}>Kontaktiert</Text>
        </Pressable>
        <Pressable onPress={() => onSnooze(lead, 1)} style={[styles.quickActionButton, styles.quickActionSecondary]}>
          <Text style={styles.quickActionSecondaryText}>+1 Tag</Text>
        </Pressable>
        <Pressable onPress={() => onSnooze(lead, 3)} style={[styles.quickActionButton, styles.quickActionSecondary]}>
          <Text style={styles.quickActionSecondaryText}>+3 Tage</Text>
        </Pressable>
      </View>
    </View>
  );
}

function clean(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loader: {
    marginVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  successText: {
    color: '#166534',
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 22,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  filterChipSelected: {
    backgroundColor: '#0F172A',
  },
  filterChipText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#0F172A',
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  inlineButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F172A',
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 120,
    gap: 12,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  cardSubtitle: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 8,
  },
  cardMeta: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 2,
  },
  statusBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#B91C1C',
    marginBottom: 12,
    fontSize: 14,
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  todayCardTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  todayCardMeta: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 2,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  quickActionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  quickActionPrimary: {
    backgroundColor: '#0F172A',
  },
  quickActionPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  quickActionSecondary: {
    backgroundColor: '#E2E8F0',
  },
  quickActionSecondaryText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
});
