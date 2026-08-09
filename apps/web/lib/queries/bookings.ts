import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { mockBookings, farmsteadProperties } from '@/lib/mock-data';

export async function listBookings(organizationId: string) {
  if (!isSupabaseConfigured()) {
    return { rows: mockBookings, properties: farmsteadProperties, source: 'demo' as const };
  }
  const supabase = createClient();
  const [bookRes, propRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, guests(first_name, last_name, email, phone, country)')
      .order('check_in_date', { ascending: false })
      .limit(100),
    supabase.from('properties').select('id, name').eq('organization_id', organizationId),
  ]);
  if (bookRes.error) throw new Error(bookRes.error.message);
  return { rows: bookRes.data ?? [], properties: propRes.data ?? [], source: 'live' as const };
}
