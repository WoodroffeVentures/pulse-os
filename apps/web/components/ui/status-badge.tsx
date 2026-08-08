import { cn } from '@/lib/utils';

const variants: Record<string, string> = {
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  checked_in: 'bg-green-500/10 text-green-400 border-green-500/20',
  checked_out: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  tentative: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  urgent: 'bg-red-600/20 text-red-300 border-red-500/30',
  critical: 'bg-red-600/20 text-red-300 border-red-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  positive: 'bg-green-500/10 text-green-400 border-green-500/20',
  neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  negative: 'bg-red-500/10 text-red-400 border-red-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  syncing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  draft_ready: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  responded: 'bg-green-500/10 text-green-400 border-green-500/20',
  dismissed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  airbnb: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  booking_com: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  lekkeslaap: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  direct: 'bg-green-500/10 text-green-400 border-green-500/20',
  google: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  manual: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  cottage: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  studio: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  housekeeping: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  maintenance: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  guest_services: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  inspection: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  compliance: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  finance: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const labels: Record<string, string> = {
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  in_progress: 'In Progress',
  booking_com: 'Booking.com',
  lekkeslaap: 'LekkeSlaap',
  draft_ready: 'Draft Ready',
  guest_services: 'Guest Services',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = variants[status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  const label =
    labels[status] ??
    status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium tracking-wide whitespace-nowrap',
        variant,
        className
      )}
    >
      {label}
    </span>
  );
}
