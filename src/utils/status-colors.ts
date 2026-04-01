import { LeadStatus } from '../types/supabase';

type StatusStyle = {
  bg: string;
  text: string;
  dot: string;
  label: string;
};

export const statusStyles: Record<LeadStatus, StatusStyle> = {
  new: {
    bg: '#EFF6FF',
    text: '#1D4ED8',
    dot: '#3B82F6',
    label: 'Neu',
  },
  contacted: {
    bg: '#F0FDF4',
    text: '#166534',
    dot: '#22C55E',
    label: 'Kontaktiert',
  },
  in_conversation: {
    bg: '#FFFBEB',
    text: '#92400E',
    dot: '#F59E0B',
    label: 'Im Gespräch',
  },
  proposal_sent: {
    bg: '#FAF5FF',
    text: '#6B21A8',
    dot: '#A855F7',
    label: 'Angebot',
  },
  won: {
    bg: '#F0FDF4',
    text: '#166534',
    dot: '#16A34A',
    label: 'Gewonnen ✓',
  },
  lost: {
    bg: '#FFF1F2',
    text: '#9F1239',
    dot: '#F43F5E',
    label: 'Verloren',
  },
};

export function getStatusStyle(status: LeadStatus): StatusStyle {
  return statusStyles[status] ?? statusStyles.new;
}
