export function formatRelativeDueDate(dueDateStr?: string): {
  text: string;
  className: string;
  isOverdue?: boolean;
  isDueSoon?: boolean;
} | null {
  if (!dueDateStr) return null;
  const parts = dueDateStr.split('-');
  if (parts.length !== 3) return null;
  const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      text: overdueDays === 1 ? '1 day overdue' : `${overdueDays}d overdue`,
      className: 'bg-red-50 text-red-600 border border-red-200 font-bold',
      isOverdue: true,
    };
  }
  if (diffDays === 0) {
    return {
      text: 'Due today',
      className: 'bg-red-50 text-red-600 border border-red-200 font-bold animate-pulse',
      isDueSoon: true,
    };
  }
  if (diffDays === 1) {
    return {
      text: 'Due tomorrow',
      className: 'bg-orange/15 text-orange border border-orange/30 font-semibold',
      isDueSoon: true,
    };
  }
  if (diffDays <= 2) {
    return {
      text: `${diffDays} days left`,
      className: 'bg-orange/15 text-orange border border-orange/30 font-semibold',
      isDueSoon: true,
    };
  }
  if (diffDays <= 7) {
    return {
      text: `${diffDays} days left`,
      className: 'bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium',
      isDueSoon: true,
    };
  }
  return {
    text: `${diffDays} days left`,
    className: 'bg-zinc-50 text-zinc-600 border border-zinc-200',
    isDueSoon: false,
  };
}
