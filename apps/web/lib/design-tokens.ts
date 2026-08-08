export const tokens = {
  colors: {
    bg: { primary: '#0a0b0d', surface: '#111318', elevated: '#161b22' },
    border: { subtle: '#1e2028', default: '#2d3142' },
    accent: { blue: '#3b82f6', green: '#22c55e', amber: '#f59e0b', red: '#ef4444' },
    text: { primary: '#f1f5f9', secondary: '#64748b', muted: '#374151' },
  },
  status: {
    active: '#22c55e',
    pending: '#f59e0b',
    critical: '#ef4444',
    neutral: '#64748b',
  },
} as const;

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
export type BookingStatus = 'confirmed' | 'tentative' | 'cancelled' | 'checked_in' | 'checked_out';
export type BookingSource = 'airbnb' | 'booking_com' | 'lekkeslaap' | 'direct' | 'other';
