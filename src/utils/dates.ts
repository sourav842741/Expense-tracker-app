export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function formatDateShort(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateFull(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function getDaysDifference(targetDateStr: string, fromDate = new Date()): number {
  const target = parseDate(targetDateStr);
  const now = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export interface DueStatusInfo {
  label: string;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean;
  daysRemaining: number;
}

export function getDueStatusInfo(dueDateStr: string, isPaid: boolean): DueStatusInfo {
  if (isPaid) {
    return {
      label: 'Paid',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: false,
      daysRemaining: 0,
    };
  }

  const days = getDaysDifference(dueDateStr);

  if (days < 0) {
    return {
      label: 'Overdue',
      isOverdue: true,
      isDueToday: false,
      isDueSoon: false,
      daysRemaining: days,
    };
  }

  if (days === 0) {
    return {
      label: 'Due today',
      isOverdue: false,
      isDueToday: true,
      isDueSoon: true,
      daysRemaining: 0,
    };
  }

  if (days === 1) {
    return {
      label: 'Due tomorrow',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
      daysRemaining: 1,
    };
  }

  if (days <= 7) {
    return {
      label: `Due in ${days} days`,
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
      daysRemaining: days,
    };
  }

  return {
    label: `${days} days remaining`,
    isOverdue: false,
    isDueToday: false,
    isDueSoon: false,
    daysRemaining: days,
  };
}
