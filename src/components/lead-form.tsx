import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Database, LeadStatus } from '../types/supabase';
import { contactChannelOptions, leadStatusOptions } from '../types/leads';

type LeadRow = Database['public']['Tables']['leads']['Row'];

type LeadFormProps = {
  visible: boolean;
  initialLead?: LeadRow | null;
  onClose: () => void;
  onSubmit: (values: LeadFormValues) => Promise<void>;
};

export type LeadFormValues = {
  name: string;
  company: string;
  email: string;
  phone: string;
  contact_channel: LeadRow['contact_channel'];
  status: LeadStatus;
  notes: string;
  next_action: string;
  follow_up_date: string;
};

const defaultValues: LeadFormValues = {
  name: '',
  company: '',
  email: '',
  phone: '',
  contact_channel: 'email',
  status: 'new',
  notes: '',
  next_action: '',
  follow_up_date: '',
};

export function LeadForm({ visible, initialLead, onClose, onSubmit }: LeadFormProps) {
  const initialValues = useMemo<LeadFormValues>(() => {
    if (!initialLead) return defaultValues;

    return {
      name: initialLead.name,
      company: initialLead.company ?? '',
      email: initialLead.email ?? '',
      phone: initialLead.phone ?? '',
      contact_channel: initialLead.contact_channel ?? 'email',
      status: initialLead.status,
      notes: initialLead.notes ?? '',
      next_action: initialLead.next_action ?? '',
      follow_up_date: initialLead.follow_up_date ? initialLead.follow_up_date.slice(0, 10) : '',
    };
  }, [initialLead]);

  const [values, setValues] = useState<LeadFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  async function handleSubmit() {
    setSubmitting(true);
    await onSubmit(values);
    setSubmitting(false);
  }

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={visible} onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{initialLead ? 'Lead bearbeiten' : 'Neuen Lead anlegen'}</Text>
        <Text style={styles.subtitle}>Saubere Stammdaten, klare Statuspflege und eine sinnvolle Wiedervorlage reichen für das MVP.</Text>

        <Field label="Name *">
          <TextInput style={styles.input} value={values.name} onChangeText={(value) => patch('name', value)} placeholder="Max Mustermann" />
        </Field>
        <Field label="Firma">
          <TextInput style={styles.input} value={values.company} onChangeText={(value) => patch('company', value)} placeholder="Muster GmbH" />
        </Field>
        <Field label="E-Mail">
          <TextInput style={styles.input} value={values.email} onChangeText={(value) => patch('email', value)} placeholder="max@firma.de" autoCapitalize="none" keyboardType="email-address" />
        </Field>
        <Field label="Telefon">
          <TextInput style={styles.input} value={values.phone} onChangeText={(value) => patch('phone', value)} placeholder="+49 ..." keyboardType="phone-pad" />
        </Field>
        <Field label="Kontaktkanal">
          <OptionRow
            options={contactChannelOptions}
            selectedValue={values.contact_channel ?? 'email'}
            onSelect={(value) => patch('contact_channel', value as LeadRow['contact_channel'])}
          />
        </Field>
        <Field label="Status">
          <OptionRow options={leadStatusOptions} selectedValue={values.status} onSelect={(value) => patch('status', value as LeadStatus)} />
        </Field>
        <Field label="Nächste Aktion">
          <TextInput style={styles.input} value={values.next_action} onChangeText={(value) => patch('next_action', value)} placeholder="Follow-up mit Preisangebot schicken" />
        </Field>
        <Field label="Follow-up Datum (YYYY-MM-DD)">
          <TextInput style={styles.input} value={values.follow_up_date} onChangeText={(value) => patch('follow_up_date', value)} placeholder="2026-04-05" autoCapitalize="none" />
        </Field>
        <Field label="Notizen">
          <TextInput
            style={[styles.input, styles.textArea]}
            value={values.notes}
            onChangeText={(value) => patch('notes', value)}
            placeholder="Kurz festhalten, was im Gespräch relevant war..."
            multiline
          />
        </Field>

        <View style={styles.actions}>
          <Pressable onPress={onClose} style={[styles.button, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Abbrechen</Text>
          </Pressable>
          <Pressable onPress={handleSubmit} style={[styles.button, styles.primaryButton]} disabled={submitting}>
            <Text style={styles.primaryButtonText}>{submitting ? 'Speichert…' : 'Speichern'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );

  function patch<Key extends keyof LeadFormValues>(key: Key, value: LeadFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function OptionRow({
  options,
  selectedValue,
  onSelect,
}: {
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.optionRow}>
      {options.map((option) => {
        const selected = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.optionChip, selected && styles.optionChipSelected]}
          >
            <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
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
    marginBottom: 8,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  optionChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  optionChipText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },
  optionChipTextSelected: {
    color: '#FFFFFF',
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
