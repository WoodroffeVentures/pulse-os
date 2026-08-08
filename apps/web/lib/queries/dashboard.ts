import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { mockBookings, mockTasks, farmsteadProperties, mockMetrics } from '@/lib/mock-data';

export type DashboardMetrics = {
  occupancyRate: number;
  activeBookings: number;
  openTasks: number;
  pendingReviews: number;
  revenue: number;
  currency: string;
};

export async function getDashboardMetrics(organizationId: string): Promise<{ metrics: DashboardMetrics; source: 'live' | 'demo' }> {
  if (!isSupabaseConfigured()) {
    return {
      metrics: {
        occupancyRate: mockMetrics.occupancy_rate,
        activeBookings: mockBookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length,
        openTasks: mockTasks.filter(t => t.status === 'open').length,
        pendingReviews: mockMetrics.pending_reviews,
        revenue: mockMetrics.revenue_this_month,
        currency: 'ZAR',
      },
      source: 'demo',
    };
  }

  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const [bookingsRes, tasksRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, status, total_amount, currency')
      .in('status', ['confirmed', 'checked_in'])
      .gte('check_out_date', today),
    supabase
      .from('tasks')
      .select('id, status')
      .eq('organization_id', organizationId)
      .eq('status', 'open'),
  ]);

  if (bookingsRes.error) throw new Error(bookingsRes.error.message);
  if (tasksRes.error) throw new Error(tasksRes.error.message);

  const revenue = (bookingsRes.data ?? []).reduce((sum, b) => sum + (b.total_amount ?? 0), 0);

  return {
    metrics: {
      occupancyRate: 0, // requires room_count per property — computed separately
      activeBookings: (bookingsRes.data ?? []).length,
      openTasks: (tasksRes.data ?? []).length,
      pendingReviews: 0,
      revenue,
      currency: 'ZAR',
    },
    source: 'live',
  };
}

export { mockBookings, mockTasks, farmsteadProperties };
