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
import { Database, LeadStatus } from '../types/supabase';
import { formatLeadStatus } from '../types/leads';
import { AiActionType } from '../types/ai';
import { formatFollowUpDate, getDatePlusDays, getTomorrowDate, toIsoAtDefaultTime } from '../utils/follow-up';
import { getStatusStyle } from '../utils/status-colors';

type LeadRow = Database['public']['Tables']['leads']['Row'];

export function TodayScreen() {
  const { session } = useAuth();
  const { leads, loading, reload, updateLead } = useLeads(session?.user.id);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const overdue = leads.filter(l => l.follow_up_date && l.follow_up_date.slice(0, 10) < todayKey);
  const dueToday = leads.filter(l => l.follow_up_date && l.follow_up_date.slice(0, 10) === todayKey);
  const total = overdue.length + dueToday.length;

  async function markContacted(lead: LeadRow) {
    await updateLead(lead.id, { status: 'contacted', updated_at: new Date().toISOString() });
    setActionMessage(`${lead.name} als kontaktiert markiert.`);
    setTimeout(() => setActionMessage(null), 3000);
  }

  async function snooze(lead: LeadRow, days: number) {
    const d = days === 1 ? getTomorrowDate() : getDatePlusDays(days);
    await updateLead(lead.id, { follow_up_date: toIsoAtDefaultTime(d), updated_at: new Date().toISOString() });
    setActionMessage(`Follow-up auf ${d} verschoben.`);
    setTimeout(() => setActionMessage(null), 3000);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Today</Text>
          <Text style={styles.pageSubtitle}>
            {total === 0 ? 'Keine fälligen Leads — gut gemacht.' : `${total} Lead${total > 1 ? 's' : ''} braucht deine Aufmerksamkeit`}
          </Text>
        </View>
        <Pressable onPress={reload} style={styles.iconButton}>
          <Text style={{ fontSize: 18 }}>↻</Text>
        </Pressable>
      </View>

      {actionMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{actionMessage}</Text>
        </View>
      ) : null}

      {loading ? <ActivityIndicator style={{ marginTop: 24 }} color="#3B82F6" /> : null}

      {overdue.length > 0 && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.sectionLabel}>ÜBERFÄLLIG</Text>
          </View>
          {overdue.map(l => <TodayCard key={l.id} lead={l} onContacted={markContacted} onSnooze={snooze} />)}
        </View>
      )}

      {dueToday.length > 0 && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.sectionLabel}>HEUTE FÄLLIG</Text>
          </View>
          {dueToday.map(l => <TodayCard key={l.id} lead={l} onContacted={markContacted} onSnooze={snooze} />)}
        </View>
      )}

      {!loading && total === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>✅</Text>
          <Text style={styles.emptyTitle}>Alles erledigt</Text>
          <Text style={styles.emptyText}>Keine fälligen Follow-ups heute. Weiter so.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function TodayCard({ lead, onContacted, onSnooze }: {
  lead: LeadRow;
  onContacted: (l: LeadRow) => void;
  onSnooze: (l: LeadRow, days: number) => void;
}) {
  const s = getStatusStyle(lead.status);
  return (
    <View style={styles.todayCard}>
      <View style={styles.todayCardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.todayCardName}>{lead.name}</Text>
          <Text style={styles.todayCardCompany}>{lead.company || 'Kein Unternehmen'}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
          <Text style={[styles.statusPillText, { color: s.text }]}>{s.label}</Text>
        </View>
      </View>
      {lead.next_action ? (
        <View style={styles.nextActionRow}>
          <Text style={styles.nextActionIcon}>→</Text>
          <Text style={styles.nextActionText}>{lead.next_action}</Text>
        </View>
      ) : null}
      <View style={styles.quickActionRow}>
        <Pressable onPress={() => onContacted(lead)} style={[styles.qa, styles.qaPrimary]}>
          <Text style={styles.qaPrimaryText}>Kontaktiert</Text>
        </Pressable>
        <Pressable onPress={() => onSnooze(lead, 1)} style={[styles.qa, styles.qaSecondary]}>
          <Text style={styles.qaSecondaryText}>+1 Tag</Text>
        </Pressable>
        <Pressable onPress={() => onSnooze(lead, 3)} style={[styles.qa, styles.qaSecondary]}>
          <Text style={styles.qaSecondaryText}>+3 Tage</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function LeadsScreen() {
  const { session } = useAuth();
  const { leads, loading, error, reload, createLead, updateLead } = useLeads(session?.user.id);
  const { loading: aiLoading, error: aiError, runAction } = useAiActions(session?.user.id);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter(l => {
      const matchQ = !q || l.name.toLowerCase().includes(q) || (l.company ?? '').toLowerCase().includes(q) || (l.email ?? '').toLowerCase().includes(q);
      const matchS = statusFilter === 'all' || l.status === statusFilter;
      return matchQ && matchS;
    });
  }, [leads, query, statusFilter]);

  async function handleSubmit(values: LeadFormValues) {
    setFormError(null);
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
    if (!payload.name) { setFormError('Name ist Pflicht.'); return; }
    const result = selectedLead
      ? await updateLead(selectedLead.id, payload)
      : await createLead({ ...payload, status: payload.status ?? 'new' });
    if (result.error) { setFormError(result.error); return; }
    setFormVisible(false);
    setSuccessMsg(selectedLead ? 'Lead aktualisiert.' : 'Lead angelegt.');
    setSelectedLead(null);
    setDetailVisible(false);
    setAiOutput(null);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  async function handleAiAction(lead: LeadRow, type: AiActionType) {
    const r = await runAction(lead, type);
    if (!r.error) setAiOutput(r.output);
  }

  async function handleUseAiOutput(lead: LeadRow, target: AiActionType) {
    if (!aiOutput) return;
    const payload = target === 'next_action'
      ? { next_action: aiOutput }
      : { notes: lead.notes ? `${lead.notes}\n\n${aiOutput}` : aiOutput };
    const r = await updateLead(lead.id, payload);
    if (!r.error) setSelectedLead({ ...lead, ...payload });
  }

  const filterOptions: { label: string; value: 'all' | LeadStatus }[] = [
    { label: 'Alle', value: 'all' },
    { label: 'Neu', value: 'new' },
    { label: 'Kontaktiert', value: 'contacted' },
    { label: 'Gespräch', value: 'in_conversation' },
    { label: 'Angebot', value: 'proposal_sent' },
    { label: 'Gewonnen', value: 'won' },
    { label: 'Verloren', value: 'lost' },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Leads</Text>
          <Text style={styles.pageSubtitle}>{leads.length} Kontakte in deiner Pipeline</Text>
        </View>
        <Pressable
          onPress={() => { setSelectedLead(null); setFormError(null); setAiOutput(null); setFormVisible(true); }}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Neu</Text>
        </Pressable>
      </View>

      {successMsg ? <View style={styles.toast}><Text style={styles.toastText}>{successMsg}</Text></View> : null}
      {error ? <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{error}</Text></View> : null}

      <TextInput
        style={styles.searchInput}
        placeholder="Name, Firma oder E-Mail suchen…"
        placeholderTextColor="#64748B"
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.filterRow}>
        {filterOptions.map(opt => {
          const active = statusFilter === opt.value;
          const s = opt.value !== 'all' ? getStatusStyle(opt.value as LeadStatus) : null;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setStatusFilter(opt.value)}
              style={[styles.filterChip, active && (s ? { backgroundColor: s.bg, borderColor: s.dot } : styles.filterChipActive)]}
            >
              {s && active && <View style={[styles.filterDot, { backgroundColor: s.dot }]} />}
              <Text style={[styles.filterChipText, active && (s ? { color: s.text } : styles.filterChipActiveText)]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor="#3B82F6" />}
        contentContainerStyle={filtered.length === 0 ? styles.emptyList : styles.list}
        renderItem={({ item }) => {
          const s = getStatusStyle(item.status);
          return (
            <Pressable
              onPress={() => { setSelectedLead(item); setAiOutput(null); setDetailVisible(true); }}
              style={styles.leadCard}
            >
              <View style={styles.leadCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leadName}>{item.name}</Text>
                  <Text style={styles.leadCompany}>{item.company || 'Kein Unternehmen'}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
                  <Text style={[styles.statusPillText, { color: s.text }]}>{s.label}</Text>
                </View>
              </View>
              {item.next_action ? (
                <View style={styles.nextActionRow}>
                  <Text style={styles.nextActionIcon}>→</Text>
                  <Text style={styles.nextActionText} numberOfLines={1}>{item.next_action}</Text>
                </View>
              ) : null}
              {item.follow_up_date ? (
                <View style={styles.followUpRow}>
                  <Text style={styles.followUpIcon}>📅</Text>
                  <Text style={styles.followUpText}>{formatFollowUpDate(item.follow_up_date)}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          loading ? <ActivityIndicator color="#3B82F6" /> : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>Noch keine Leads</Text>
              <Text style={styles.emptyText}>Leg deinen ersten Lead an und starte deine Pipeline.</Text>
            </View>
          )
        }
      />

      <LeadDetailModal
        lead={selectedLead}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        onEdit={l => { setSelectedLead(l); setDetailVisible(false); setFormVisible(true); }}
        aiLoading={aiLoading}
        aiOutput={aiOutput}
        aiError={aiError}
        onRunAiAction={handleAiAction}
        onUseAiOutput={handleUseAiOutput}
      />

      <LeadForm
        visible={formVisible}
        initialLead={selectedLead}
        onClose={() => { setFormVisible(false); setSelectedLead(null); }}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

export function SettingsScreen() {
  const { session, signOut } = useAuth();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Settings</Text>
      </View>
      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>Eingeloggt als</Text>
        <Text style={styles.settingsEmail}>{session?.user.email ?? '—'}</Text>
      </View>
      <Pressable onPress={signOut} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function clean(v: string) {
  const t = v.trim();
  return t.length ? t : null;
}

const C = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  blue: '#3B82F6',
  blueDark: '#1D4ED8',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    color: C.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    color: C.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: C.text,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  toast: {
    backgroundColor: '#052E16',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  toastText: {
    color: '#86EFAC',
    fontSize: 13,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#450A0A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#FCA5A5',
    fontSize: 13,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  todayCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  todayCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  todayCardName: {
    color: C.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  todayCardCompany: {
    color: C.textMuted,
    fontSize: 13,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nextActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 12,
    paddingLeft: 2,
  },
  nextActionIcon: {
    color: C.blue,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  nextActionText: {
    color: C.textMuted,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  qa: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qaPrimary: { backgroundColor: C.text },
  qaPrimaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  qaSecondary: { backgroundColor: C.surfaceAlt },
  qaSecondaryText: { color: C.text, fontWeight: '700', fontSize: 13 },
  searchInput: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: {
    backgroundColor: C.text,
    borderColor: C.text,
  },
  filterChipText: {
    color: C.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipActiveText: {
    color: '#FFFFFF',
  },
  filterDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  leadCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  leadCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  leadName: {
    color: C.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  leadCompany: {
    color: C.textMuted,
    fontSize: 13,
  },
  followUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  followUpIcon: {
    fontSize: 12,
  },
  followUpText: {
    color: C.textLight,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },
  settingsCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  settingsLabel: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  settingsEmail: {
    color: C.text,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FFF1F2',
    borderRadius: 14,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  logoutText: {
    color: '#E11D48',
    fontWeight: '700',
    fontSize: 15,
  },
});
