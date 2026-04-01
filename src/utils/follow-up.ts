export function toIsoAtDefaultTime(dateString: string) {
  return `${dateString}T09:00:00.000Z`;
}

export function formatFollowUpDate(date: string | null) {
  return date ? date.slice(0, 10) : '—';
}

export function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export function getDatePlusDays(days: number) {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
}
