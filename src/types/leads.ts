import { ContactChannel, LeadStatus } from './supabase';

export const leadStatusOptions: { label: string; value: LeadStatus }[] = [
  { label: 'Neu', value: 'new' },
  { label: 'Kontaktiert', value: 'contacted' },
  { label: 'Im Gespräch', value: 'in_conversation' },
  { label: 'Angebot gesendet', value: 'proposal_sent' },
  { label: 'Gewonnen', value: 'won' },
  { label: 'Verloren', value: 'lost' },
];

export const contactChannelOptions: { label: string; value: ContactChannel }[] = [
  { label: 'E-Mail', value: 'email' },
  { label: 'Telefon', value: 'phone' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Andere', value: 'other' },
];

export function formatLeadStatus(status: LeadStatus) {
  return leadStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function formatContactChannel(channel: ContactChannel | null) {
  if (!channel) return '—';
  return contactChannelOptions.find((option) => option.value === channel)?.label ?? channel;
}
