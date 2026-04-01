import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Database } from '../types/supabase';
import { formatContactChannel, formatLeadStatus } from '../types/leads';
import { AiActionType, aiActionOptions } from '../types/ai';

type LeadRow = Database['public']['Tables']['leads']['Row'];

export function LeadDetailModal({
  lead,
  visible,
  onClose,
  onEdit,
  aiLoading,
  aiOutput,
  aiError,
  onRunAiAction,
  onUseAiOutput,
}: {
  lead: LeadRow | null;
  visible: boolean;
  onClose: () => void;
  onEdit: (lead: LeadRow) => void;
  aiLoading: boolean;
  aiOutput: string | null;
  aiError: string | null;
  onRunAiAction: (lead: LeadRow, type: AiActionType) => void;
  onUseAiOutput: (lead: LeadRow, type: AiActionType) => void;
}) {
  if (!lead) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{lead.name}</Text>
        <Text style={styles.subtitle}>{lead.company || 'Keine Firma hinterlegt'}</Text>

        <Section label="Status" value={formatLeadStatus(lead.status)} />
        <Section label="Kontaktkanal" value={formatContactChannel(lead.contact_channel)} />
        <Section label="E-Mail" value={lead.email || '—'} />
        <Section label="Telefon" value={lead.phone || '—'} />
        <Section label="Nächste Aktion" value={lead.next_action || '—'} />
        <Section label="Follow-up" value={lead.follow_up_date ? lead.follow_up_date.slice(0, 10) : '—'} />
        <Section label="Notizen" value={lead.notes || '—'} multiline />

        <View style={styles.aiSection}>
          <Text style={styles.aiTitle}>AI Actions</Text>
          <Text style={styles.aiSubtitle}>Hier beginnt der eigentliche Copilot-Mehrwert: bessere nächste Schritte statt nur Datenspeicherung.</Text>

          <View style={styles.aiActionList}>
            {aiActionOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => onRunAiAction(lead, option.value)}
                style={[styles.aiButton, aiLoading && styles.aiButtonDisabled]}
                disabled={aiLoading}
              >
                <Text style={styles.aiButtonTitle}>{option.label}</Text>
                <Text style={styles.aiButtonDescription}>{option.description}</Text>
              </Pressable>
            ))}
          </View>

          {aiError ? <Text style={styles.aiError}>{aiError}</Text> : null}
          {aiLoading ? <Text style={styles.aiMeta}>AI generiert gerade einen Vorschlag…</Text> : null}

          {aiOutput ? (
            <View style={styles.aiOutputCard}>
              <Text style={styles.aiOutputLabel}>Ergebnis</Text>
              <Text style={styles.aiOutputText}>{aiOutput}</Text>
              <View style={styles.aiUseRow}>
                <Pressable onPress={() => onUseAiOutput(lead, 'summary')} style={[styles.miniButton, styles.secondaryMiniButton]}>
                  <Text style={styles.secondaryMiniButtonText}>Als Notiz nutzen</Text>
                </Pressable>
                <Pressable onPress={() => onUseAiOutput(lead, 'next_action')} style={[styles.miniButton, styles.primaryMiniButton]}>
                  <Text style={styles.primaryMiniButtonText}>Als nächste Aktion nutzen</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onClose} style={[styles.button, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Schließen</Text>
          </Pressable>
          <Pressable onPress={() => onEdit(lead)} style={[styles.button, styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>Bearbeiten</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
}

function Section({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, multiline && styles.multiline]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  value: {
    color: '#0F172A',
    fontSize: 16,
    lineHeight: 24,
  },
  multiline: {
    minHeight: 72,
  },
  aiSection: {
    marginTop: 8,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  aiSubtitle: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  aiActionList: {
    gap: 10,
  },
  aiButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
  },
  aiButtonDisabled: {
    opacity: 0.6,
  },
  aiButtonTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  aiButtonDescription: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  aiMeta: {
    color: '#2563EB',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  aiError: {
    color: '#B91C1C',
    marginTop: 12,
    fontSize: 13,
  },
  aiOutputCard: {
    marginTop: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  aiOutputLabel: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  aiOutputText: {
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 22,
  },
  aiUseRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  miniButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryMiniButton: {
    backgroundColor: '#0F172A',
  },
  primaryMiniButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryMiniButton: {
    backgroundColor: '#DBEAFE',
  },
  secondaryMiniButtonText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0F172A',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
});
