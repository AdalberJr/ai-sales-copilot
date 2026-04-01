import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Database } from '../types/supabase';
import { formatContactChannel, formatLeadStatus } from '../types/leads';

type LeadRow = Database['public']['Tables']['leads']['Row'];

export function LeadDetailModal({
  lead,
  visible,
  onClose,
  onEdit,
}: {
  lead: LeadRow | null;
  visible: boolean;
  onClose: () => void;
  onEdit: (lead: LeadRow) => void;
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
