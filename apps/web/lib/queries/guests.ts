import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { mockGuests } from '@/lib/mock-data';

export async function listGuests(organizationId: string) {
  if (!isSupabaseConfigured()) {
    return { rows: mockGuests, source: 'demo' as const };
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return { rows: data ?? [], source: 'live' as const };
}
